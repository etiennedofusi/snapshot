import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

// Create Stripe Connect onboarding link for merchant
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("id, stripe_account_id, name")
    .eq("owner_id", user.id)
    .single();

  if (!shop) {
    return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    let accountId = shop.stripe_account_id;

    // Create Connect account if not exists
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "FR",
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: shop.name,
        },
      });

      accountId = account.id;

      await supabase
        .from("shops")
        .update({ stripe_account_id: accountId })
        .eq("id", shop.id);
    }

    // Create onboarding link
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/settings?stripe=refresh`,
      return_url: `${appUrl}/settings?stripe=success`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: link.url });
  } catch (err) {
    console.error("Stripe Connect error:", err);
    return NextResponse.json(
      { error: "Erreur connexion Stripe" },
      { status: 500 }
    );
  }
}
