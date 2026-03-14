import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { chat } from "@/lib/ai/bot";
import type { TShop, TProduct, TConversationMessage } from "@/types";

const chatSchema = z.object({
  shopId: z.string().uuid(),
  message: z.string().min(1).max(2000),
  conversationId: z.string().uuid().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = chatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { shopId, message, conversationId, customerName, customerPhone } =
    parsed.data;

  const supabase = await createServiceClient();

  // Fetch shop
  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("id", shopId)
    .eq("is_active", true)
    .single();

  if (!shop) {
    return NextResponse.json(
      { error: "Boutique introuvable" },
      { status: 404 }
    );
  }

  // Fetch products
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("shop_id", shopId)
    .eq("is_available", true)
    .order("sort_order");

  // Get or create conversation
  let conversation;
  if (conversationId) {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();
    conversation = data;
  }

  if (!conversation) {
    const { data } = await supabase
      .from("conversations")
      .insert({
        shop_id: shopId,
        channel: "widget",
        messages: [],
      })
      .select()
      .single();
    conversation = data;
  }

  if (!conversation) {
    return NextResponse.json(
      { error: "Erreur conversation" },
      { status: 500 }
    );
  }

  const history: TConversationMessage[] = conversation.messages || [];

  // Call Claude AI
  let botResponse;
  try {
    botResponse = await chat(
      shop as TShop,
      (products || []) as TProduct[],
      history,
      message
    );
  } catch (err) {
    console.error("AI error:", err);
    return NextResponse.json(
      { error: "Erreur IA, reessayez" },
      { status: 500 }
    );
  }

  // Update conversation history
  const now = new Date().toISOString();
  const updatedMessages: TConversationMessage[] = [
    ...history,
    { role: "user", content: message, timestamp: now },
    {
      role: "assistant",
      content: JSON.stringify(botResponse),
      timestamp: now,
    },
  ];

  // If action is create_order, create the order in DB
  let orderId: string | null = null;
  let paymentUrl: string | null = null;

  if (botResponse.action === "create_order" && botResponse.order) {
    const { items, total } = botResponse.order;
    const subtotal = total;
    const commissionRate = (shop as TShop).commission_rate || 0.015;
    const commissionAmount = Math.round(subtotal * commissionRate * 100) / 100;

    // Get next order number
    const { data: nextNum } = await supabase.rpc("get_next_order_number", {
      p_shop_id: shopId,
    });

    const { data: order } = await supabase
      .from("orders")
      .insert({
        shop_id: shopId,
        order_number: nextNum || 1,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        customer_channel: "widget",
        items,
        subtotal,
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

  // If action is request_payment and we have an order, generate Stripe link
  if (botResponse.action === "request_payment") {
    const targetOrderId = orderId || conversation.order_id;
    if (targetOrderId) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const checkoutRes = await fetch(`${appUrl}/api/stripe/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: targetOrderId }),
        });
        const checkoutData = await checkoutRes.json();
        if (checkoutRes.ok && checkoutData.url) {
          paymentUrl = checkoutData.url;
        }
      } catch (err) {
        console.error("Payment link generation error:", err);
      }
    }
  }

  // Save conversation
  await supabase
    .from("conversations")
    .update({
      messages: updatedMessages,
      current_order_draft: botResponse.order || null,
      order_id: orderId || conversation.order_id,
      last_activity: now,
    })
    .eq("id", conversation.id);

  return NextResponse.json({
    message: botResponse.message,
    action: botResponse.action,
    order: botResponse.order || null,
    conversationId: conversation.id,
    orderId,
    paymentUrl,
  });
}
