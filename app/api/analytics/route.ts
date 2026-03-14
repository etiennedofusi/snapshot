import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { TOrder, TOrderItem } from "@/types";

export async function GET() {
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

  const now = new Date();

  // Start of today, this week (Monday), this month, 30 days ago
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Previous week for comparison
  const startOfPrevWeek = new Date(startOfWeek);
  startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);

  // Fetch all orders from the last 30 days (non-cancelled)
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("shop_id", shop.id)
    .neq("status", "cancelled")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  const allOrders = (orders || []) as TOrder[];

  // --- Today ---
  const todayOrders = allOrders.filter(
    (o) => new Date(o.created_at) >= startOfDay
  );
  const todayRevenue = sum(todayOrders);
  const todayCount = todayOrders.length;

  // --- This week ---
  const weekOrders = allOrders.filter(
    (o) => new Date(o.created_at) >= startOfWeek
  );
  const weekRevenue = sum(weekOrders);

  // --- Previous week ---
  const prevWeekOrders = allOrders.filter((o) => {
    const d = new Date(o.created_at);
    return d >= startOfPrevWeek && d < startOfWeek;
  });
  const prevWeekRevenue = sum(prevWeekOrders);
  const weekGrowth =
    prevWeekRevenue > 0
      ? Math.round(((weekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100)
      : null;

  // --- This month ---
  const monthOrders = allOrders.filter(
    (o) => new Date(o.created_at) >= startOfMonth
  );
  const monthRevenue = sum(monthOrders);

  // --- Top product today ---
  const productCounts = new Map<string, { name: string; qty: number }>();
  todayOrders.forEach((o) => {
    (o.items as TOrderItem[]).forEach((item) => {
      const existing = productCounts.get(item.name);
      if (existing) {
        existing.qty += item.qty;
      } else {
        productCounts.set(item.name, { name: item.name, qty: item.qty });
      }
    });
  });
  const topProduct = Array.from(productCounts.values()).sort(
    (a, b) => b.qty - a.qty
  )[0] || null;

  // --- Hourly distribution (today) ---
  const hourly = new Array(24).fill(0);
  todayOrders.forEach((o) => {
    const hour = new Date(o.created_at).getHours();
    hourly[hour]++;
  });

  // --- Payment split (today) ---
  const paidOnline = todayOrders.filter(
    (o) => o.payment_status === "paid"
  ).length;
  const paidInStore = todayCount - paidOnline;

  // --- Daily revenue (last 30 days) ---
  const dailyMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, 0);
  }
  allOrders.forEach((o) => {
    const key = o.created_at.slice(0, 10);
    if (dailyMap.has(key)) {
      dailyMap.set(key, (dailyMap.get(key) || 0) + o.total);
    }
  });
  const dailyRevenue = Array.from(dailyMap.entries()).map(([date, total]) => ({
    date,
    total: Math.round(total * 100) / 100,
  }));

  return NextResponse.json({
    today: { revenue: todayRevenue, count: todayCount },
    week: { revenue: weekRevenue, growth: weekGrowth },
    month: { revenue: monthRevenue },
    topProduct,
    hourly,
    paymentSplit: { online: paidOnline, inStore: paidInStore },
    dailyRevenue,
  });
}

function sum(orders: TOrder[]): number {
  return Math.round(orders.reduce((acc, o) => acc + o.total, 0) * 100) / 100;
}
