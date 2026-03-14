import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { notifyOrderReady } from "@/lib/notifications/orderReady";
import type { TOrder, TShop } from "@/types";

const updateOrderSchema = z.object({
  status: z
    .enum(["pending", "preparing", "ready", "picked_up", "cancelled"])
    .optional(),
  payment_status: z
    .enum(["pending", "paid", "pay_on_pickup", "refunded"])
    .optional(),
  notes: z.string().nullable().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = { ...parsed.data };

  // Set timestamps based on status
  if (parsed.data.status === "ready") {
    updates.ready_at = new Date().toISOString();
  } else if (parsed.data.status === "picked_up") {
    updates.picked_up_at = new Date().toISOString();
  } else if (parsed.data.status === "cancelled") {
    updates.cancelled_at = new Date().toISOString();
  }

  const { data: order, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify customer when order is ready
  if (parsed.data.status === "ready" && order) {
    const { data: shop } = await supabase
      .from("shops")
      .select("*")
      .eq("id", (order as TOrder).shop_id)
      .single();

    if (shop) {
      // Fire and forget — don't block the response
      notifyOrderReady(order as TOrder, shop as TShop).catch((err) =>
        console.error("Notification error:", err)
      );
    }
  }

  return NextResponse.json({ order });
}
