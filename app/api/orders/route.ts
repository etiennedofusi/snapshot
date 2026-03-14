import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) {
    return NextResponse.json({ error: "Boutique introuvable" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const today = searchParams.get("today");

  let query = supabase
    .from("orders")
    .select("*")
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (today === "true") {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    query = query.gte("created_at", startOfDay.toISOString());
  }

  const { data: orders, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders, shopId: shop.id });
}
