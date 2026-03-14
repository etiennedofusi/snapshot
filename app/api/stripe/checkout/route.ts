import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";

const checkoutSchema = z.object({
  orderId: z.string().uuid(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const supabase = await createServiceClient();

  // Fetch order + shop
  const { data: order } = await supabase
    .from("orders")
    .select("*, shops!inner(name, stripe_account_id, commission_rate)")
    .eq("id", parsed.data.orderId)
    .single();

  if (!order) {
    return NextResponse.json(
      { error: "Commande introuvable" },
      { status: 404 }
    );
  }

  if (order.payment_status === "paid") {
    return NextResponse.json(
      { error: "Commande deja payee" },
      { status: 400 }
    );
  }

  const shop = order.shops as { name: string; stripe_account_id: string | null; commission_rate: number };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Build line items from order items
  const lineItems = (order.items as Array<{ name: string; qty: number; unit_price: number }>).map(
    (item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.unit_price * 100),
      },
      quantity: item.qty,
    })
  );

  // Create Checkout Session
  const sessionParams: Record<string, unknown> = {
    mode: "payment",
    line_items: lineItems,
    metadata: {
      order_id: order.id,
      shop_id: order.shop_id,
    },
    success_url: `${appUrl}/widget/${order.shop_id}?paid=true&order=${order.order_number}`,
    cancel_url: `${appUrl}/widget/${order.shop_id}?cancelled=true`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min
  };

  // If shop has Stripe Connect, add application fee
  if (shop.stripe_account_id) {
    const commissionAmount = Math.round(order.total * shop.commission_rate * 100);
    Object.assign(sessionParams, {
      payment_intent_data: {
        application_fee_amount: commissionAmount,
        transfer_data: {
          destination: shop.stripe_account_id,
        },
      },
    });
  }

  try {
    const session = await stripe.checkout.sessions.create(
      sessionParams as Stripe.Checkout.SessionCreateParams
    );

    // Save payment link URL to order
    await supabase
      .from("orders")
      .update({
        stripe_payment_link_url: session.url,
        stripe_payment_link_id: session.id,
      })
      .eq("id", order.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Erreur creation paiement" },
      { status: 500 }
    );
  }
}

// TypeScript needs the Stripe namespace for the cast
import type Stripe from "stripe";
