import { createServiceClient } from "@/lib/supabase/server";
import { chat } from "@/lib/ai/bot";
import { sendWhatsAppMessage } from "@/lib/twilio/client";
import type { TShop, TProduct, TConversationMessage } from "@/types";

export async function POST(request: Request) {
  // Twilio sends form-urlencoded
  const formData = await request.formData();
  const from = formData.get("From") as string; // whatsapp:+33612345678
  const body = formData.get("Body") as string;
  const to = formData.get("To") as string; // whatsapp:+1415... (our number)

  if (!from || !body) {
    return new Response("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  }

  const supabase = await createServiceClient();

  // Find shop by WhatsApp number
  const whatsappNumber = to?.replace("whatsapp:", "") || "";
  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("whatsapp_number", whatsappNumber)
    .eq("is_active", true)
    .single();

  if (!shop) {
    // If no shop found, try to match any active shop (single-tenant mode)
    const { data: fallbackShop } = await supabase
      .from("shops")
      .select("*")
      .eq("is_active", true)
      .not("whatsapp_number", "is", null)
      .limit(1)
      .single();

    if (!fallbackShop) {
      return twimlResponse("Desole, cette boutique n'est pas disponible.");
    }

    return handleMessage(supabase, fallbackShop as TShop, from, body);
  }

  return handleMessage(supabase, shop as TShop, from, body);
}

async function handleMessage(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  shop: TShop,
  from: string,
  message: string
) {
  // Fetch products
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("shop_id", shop.id)
    .eq("is_available", true)
    .order("sort_order");

  // Get or create conversation
  const customerPhone = from.replace("whatsapp:", "");
  let conversation;

  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("shop_id", shop.id)
    .eq("customer_phone", customerPhone)
    .eq("channel", "whatsapp")
    .single();

  if (existing) {
    conversation = existing;
  } else {
    const { data: created } = await supabase
      .from("conversations")
      .insert({
        shop_id: shop.id,
        customer_phone: customerPhone,
        channel: "whatsapp",
        messages: [],
      })
      .select()
      .single();
    conversation = created;
  }

  if (!conversation) {
    return twimlResponse("Desole, une erreur est survenue.");
  }

  const history: TConversationMessage[] = conversation.messages || [];

  // Call Claude AI
  let botResponse;
  try {
    botResponse = await chat(
      shop,
      (products || []) as TProduct[],
      history,
      message
    );
  } catch (err) {
    console.error("WhatsApp AI error:", err);
    return twimlResponse("Desole, une erreur est survenue. Reessayez.");
  }

  // Update conversation
  const now = new Date().toISOString();
  const updatedMessages: TConversationMessage[] = [
    ...history,
    { role: "user", content: message, timestamp: now },
    { role: "assistant", content: JSON.stringify(botResponse), timestamp: now },
  ];

  // Handle create_order action
  let orderId: string | null = conversation.order_id;
  if (botResponse.action === "create_order" && botResponse.order) {
    const { items, total } = botResponse.order;
    const commissionAmount =
      Math.round(total * (shop.commission_rate || 0.015) * 100) / 100;

    const { data: nextNum } = await supabase.rpc("get_next_order_number", {
      p_shop_id: shop.id,
    });

    const { data: order } = await supabase
      .from("orders")
      .insert({
        shop_id: shop.id,
        order_number: nextNum || 1,
        customer_phone: customerPhone,
        customer_channel: "whatsapp",
        items,
        subtotal: total,
        commission_amount: commissionAmount,
        total,
        status: "pending",
        payment_status: "pending",
      })
      .select("id")
      .single();

    if (order) {
      orderId = order.id;
    }
  }

  // Handle request_payment: generate Stripe link
  let replyText = botResponse.message;
  if (botResponse.action === "request_payment" && orderId) {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const checkoutRes = await fetch(`${appUrl}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const checkoutData = await checkoutRes.json();
      if (checkoutRes.ok && checkoutData.url) {
        replyText += `\n\nPayer en ligne : ${checkoutData.url}`;
      }
    } catch (err) {
      console.error("Payment link error:", err);
    }
  }

  // Save conversation
  await supabase
    .from("conversations")
    .update({
      messages: updatedMessages,
      current_order_draft: botResponse.order || null,
      order_id: orderId,
      last_activity: now,
    })
    .eq("id", conversation.id);

  // Reply via Twilio
  try {
    await sendWhatsAppMessage(from, replyText);
  } catch (err) {
    console.error("Twilio send error:", err);
  }

  // Return empty TwiML (we already sent via API)
  return twimlResponse("");
}

function twimlResponse(message: string) {
  const xml = message
    ? `<Response><Message>${escapeXml(message)}</Message></Response>`
    : "<Response></Response>";

  return new Response(xml, {
    headers: { "Content-Type": "text/xml" },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
