"use client";

import { useEffect, useState, useCallback } from "react";
import { DEMO_ANALYTICS } from "@/lib/demo/data";
import { KPIWidget } from "@/components/dashboard/KPIWidget";
import { HourlyChart } from "@/components/dashboard/HourlyChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  Euro,
  ShoppingBag,
  CalendarDays,
  Star,
  CreditCard,
  Banknote,
} from "lucide-react";

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

type AnalyticsData = {
  today: { revenue: number; count: number };
  week: { revenue: number; growth: number | null };
  month: { revenue: number };
  topProduct: { name: string; qty: number } | null;
  hourly: number[];
  paymentSplit: { online: number; inStore: number };
  dailyRevenue: { date: string; total: number }[];
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (isDemo) {
      setData({
        today: { revenue: DEMO_ANALYTICS.today.revenue, count: DEMO_ANALYTICS.today.orders },
        week: { revenue: DEMO_ANALYTICS.week.revenue, growth: DEMO_ANALYTICS.week.growth },
        month: { revenue: DEMO_ANALYTICS.month.revenue },
        topProduct: DEMO_ANALYTICS.topProduct,
        hourly: DEMO_ANALYTICS.hourly.map((h) => h.count),
        paymentSplit: { online: DEMO_ANALYTICS.paymentSplit.online, inStore: DEMO_ANALYTICS.paymentSplit.on_pickup },
        dailyRevenue: DEMO_ANALYTICS.dailyRevenue.map((d) => ({ date: d.date, total: d.revenue })),
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-center text-gray-400 py-20">
        Impossible de charger les statistiques.
      </div>
    );
  }

  const totalPayments =
    data.paymentSplit.online + data.paymentSplit.inStore;
  const onlinePct =
    totalPayments > 0
      ? Math.round((data.paymentSplit.online / totalPayments) * 100)
      : 0;

  return (
    <div className="p-4 space-y-4 pb-20">
      <h1 className="text-2xl font-bold">Statistiques</h1>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <KPIWidget
          label="CA du jour"
          value={`${data.today.revenue.toFixed(2)}€`}
          subtitle={`${data.today.count} commande${data.today.count > 1 ? "s" : ""}`}
          icon={<Euro className="h-5 w-5" />}
        />
        <KPIWidget
          label="CA semaine"
          value={`${data.week.revenue.toFixed(2)}€`}
          trend={data.week.growth}
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <KPIWidget
          label="CA du mois"
          value={`${data.month.revenue.toFixed(2)}€`}
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <KPIWidget
          label="Produit star"
          value={data.topProduct ? data.topProduct.name : "—"}
          subtitle={
            data.topProduct
              ? `${data.topProduct.qty} vendu${data.topProduct.qty > 1 ? "s" : ""} aujourd'hui`
              : "Aucune vente"
          }
          icon={<Star className="h-5 w-5" />}
        />
      </div>

      {/* Payment split */}
      <Card className="p-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Paiements du jour
        </h3>
        {totalPayments === 0 ? (
          <p className="text-sm text-gray-400">Aucune commande</p>
        ) : (
          <div className="space-y-3">
            {/* Bar */}
            <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
              {onlinePct > 0 && (
                <div
                  className="bg-green-500 transition-all"
                  style={{ width: `${onlinePct}%` }}
                />
              )}
              {100 - onlinePct > 0 && (
                <div
                  className="bg-amber-400 transition-all"
                  style={{ width: `${100 - onlinePct}%` }}
                />
              )}
            </div>
            {/* Legend */}
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-green-500" />
                <span>
                  En ligne ({data.paymentSplit.online}) — {onlinePct}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Banknote className="h-4 w-4 text-amber-500" />
                <span>
                  Boutique ({data.paymentSplit.inStore}) —{" "}
                  {100 - onlinePct}%
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Hourly chart */}
      <Card className="p-4">
        <HourlyChart data={data.hourly} />
      </Card>

      {/* 30-day revenue chart */}
      <Card className="p-4">
        <RevenueChart data={data.dailyRevenue} />
      </Card>
    </div>
  );
}
