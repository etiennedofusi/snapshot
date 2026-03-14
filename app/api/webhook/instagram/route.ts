import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { chat } from "@/lib/ai/bot";
import { sendInstagramDM, verifyMetaSignature } from "@/lib/instagram/client";
import type { TShop, TProduct, TConversationMessage } from "@/types";

// Meta webhook verification (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// Meta webhook events (POST)
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  // Verify signature
  if (!(await verifyMetaSignature(rawBody, signature))) {
    console.error("Invalid Meta webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const body = JSON.parse(rawBody);

  // Instagram messaging events
  if (body.object !== "instagram") {
    return NextResponse.json({ received: true });
  }

  for (const entry of body.entry || []) {
    for (const messaging of entry.messaging || []) {
      if (messaging.message?.text) {
        await handleInstagramMessage(
          messaging.sender.id,
          messaging.recipient.id,
          messaging.message.text
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}

async function handleInstagramMessage(
  senderId: string,
  recipientId: string,
  messageText: string
) {
  const supabase = await createServiceClient();

  // Find shop by Instagram account ID
  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("instagram_account_id", recipientId)
    .eq("is_active", true)
    .single();

  if (!shop) {
    console.warn(`No shop found for Instagram account ${recipientId}`);
    return;
  }

  const typedShop = shop as TShop;

  // Fetch products
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("shop_id", typedShop.id)
    .eq("is_available", true)
    .order("sort_order");

  // Get or create conversation
  let conversation;
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("shop_id", typedShop.id)
    .eq("customer_instagram_id", senderId)
    .eq("channel", "instagram")
    .single();

  if (existing) {
    conversation = existing;
  } else {
    const { data: created } = await supabase
      .from("conversations")
      .insert({
        shop_id: typedShop.id,
        customer_instagram_id: senderId,
        channel: "instagram",
        messages: [],
      })
      .select()
      .single();
    conversation = created;
  }

  if (!conversation) return;

  const history: TConversationMessage[] = conversation.messages || [];

  // Call Claude AI
  let botResponse;
  try {
    botResponse = await chat(
      typedShop,
      (products || []) as TProduct[],
      history,
      messageText
    );
  } catch (err) {
    console.error("Instagram AI error:", err);
    await sendReply(senderId, typedShop, "Desole, une erreur est survenue.");
    return;
  }

  // Update conversation
  const now = new Date().toISOString();
  const updatedMessages: TConversationMessage[] = [
    ...history,
    { role: "user", content: messageText, timestamp: now },
    { role: "assistant", content: JSON.stringify(botResponse), timestamp: now },
  ];

  // Handle create_order
  let orderId: string | null = conversation.order_id;
  if (botResponse.action === "create_order" && botResponse.order) {
    const { items, total } = botResponse.order;
    const commissionAmount =
      Math.round(total * (typedShop.commission_rate || 0.015) * 100) / 100;

    const { data: nextNum } = await supabase.rpc("get_next_order_number", {
      p_shop_id: typedShop.id,
    });

    const { data: order } = await supabase
      .from("orders")
      .insert({
        shop_id: typedShop.id,
        order_number: nextNum || 1,
        customer_channel: "instagram",
        items,
        subtotal: total,
        commission_amount: commissionAmount,
        total,
        status: "pending",
        payment_status: "pending",
      })
      .select("id")
      .single();

    if (order) orderId = order.id;
  }

  // Handle payment link
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

  // Reply via Instagram DM
  await sendReply(senderId, typedShop, replyText);
}

async function sendReply(recipientId: string, shop: TShop, message: string) {
  const token = shop.instagram_page_access_token || process.env.META_PAGE_ACCESS_TOKEN;
  if (!token) {
    console.error("No Instagram page access token");
    return;
  }

  try {
    await sendInstagramDM(recipientId, message, token);
  } catch (err) {
    console.error("Instagram reply error:", err);
  }
}
