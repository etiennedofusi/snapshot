import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  switch (event.type) {
    // ===== Payment completed =====
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      if (orderId) {
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id || null,
          })
          .eq("id", orderId);
      }
      break;
    }

    // ===== Payment expired =====
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      if (orderId) {
        // Fallback to pay on pickup
        await supabase
          .from("orders")
          .update({ payment_status: "pay_on_pickup" })
          .eq("id", orderId)
          .eq("payment_status", "pending");
      }
      break;
    }

    // ===== Refund =====
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      if (charge.payment_intent) {
        const intentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent.id;

        await supabase
          .from("orders")
          .update({ payment_status: "refunded" })
          .eq("stripe_payment_intent_id", intentId);
      }
      break;
    }

    // ===== Subscription events (merchant billing) =====
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const isActive =
        subscription.status === "active" ||
        subscription.status === "trialing";

      await supabase
        .from("shops")
        .update({
          is_active: isActive,
          plan: isActive ? getPlanFromSubscription(subscription) : "starter",
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = (invoice as unknown as { subscription: string | null }).subscription;

      if (subId) {
        console.warn(`Payment failed for subscription ${subId}`);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

function getPlanFromSubscription(subscription: Stripe.Subscription): string {
  const priceId = subscription.items.data[0]?.price?.id;
  // Map price IDs to plan names (configure in env or constants)
  const PRICE_TO_PLAN: Record<string, string> = {
    [process.env.STRIPE_PRICE_STARTER || ""]: "starter",
    [process.env.STRIPE_PRICE_PRO || ""]: "pro",
    [process.env.STRIPE_PRICE_ENTERPRISE || ""]: "enterprise",
  };
  return PRICE_TO_PLAN[priceId || ""] || "starter";
}
