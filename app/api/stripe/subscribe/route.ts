import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

const subscribeSchema = z.object({
  plan: z.enum(["starter", "pro"]),
});

const PLAN_PRICES: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || "",
  pro: process.env.STRIPE_PRICE_PRO || "",
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = subscribeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("id, stripe_customer_id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) {
    return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 });
  }

  const priceId = PLAN_PRICES[parsed.data.plan];
  if (!priceId) {
    return NextResponse.json(
      { error: "Plan non configure" },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    // Create or reuse Stripe customer
    let customerId = shop.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { shop_id: shop.id },
      });
      customerId = customer.id;

      await supabase
        .from("shops")
        .update({ stripe_customer_id: customerId })
        .eq("id", shop.id);
    }

    // Create checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/settings?subscription=success`,
      cancel_url: `${appUrl}/settings?subscription=cancelled`,
      metadata: { shop_id: shop.id },
      subscription_data: {
        metadata: { shop_id: shop.id },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe subscribe error:", err);
    return NextResponse.json(
      { error: "Erreur abonnement" },
      { status: 500 }
    );
  }
}
