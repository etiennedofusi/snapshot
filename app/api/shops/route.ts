import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const createShopSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  phone: z.string().optional(),
  address: z.string().optional(),
  welcome_message: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  // Check if user already has a shop
  const { data: existing } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "Vous avez deja une boutique" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const parsed = createShopSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Generate slug from name
  const slug = parsed.data.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + "-" + Date.now().toString(36);

  const { data: shop, error } = await supabase
    .from("shops")
    .insert({
      owner_id: user.id,
      name: parsed.data.name,
      slug,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      welcome_message:
        parsed.data.welcome_message ||
        "Bonjour ! Que souhaitez-vous commander ?",
      plan: "starter",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ shop }, { status: 201 });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await request.json();

  const { data: shop, error } = await supabase
    .from("shops")
    .update(body)
    .eq("owner_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ shop });
}
