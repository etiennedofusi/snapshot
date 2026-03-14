"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useOrderSound } from "@/lib/hooks/useOrderSound";
import { OrderCard } from "./OrderCard";
import { printTicket } from "./PrintTicket";
import type { TOrder, TOrderStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bell, BellOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FILTERS: { value: TOrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "pending", label: "Nouvelles" },
  { value: "preparing", label: "En cours" },
  { value: "ready", label: "Pretes" },
];

type OrderBoardProps = {
  shopName: string;
};

export function OrderBoard({ shopName }: OrderBoardProps) {
  const [orders, setOrders] = useState<TOrder[]>([]);
  const [shopId, setShopId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TOrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const { play: playSound } = useOrderSound();
  const orderIdsRef = useRef<Set<string>>(new Set());

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders?today=true");
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders as TOrder[]);
        setShopId(data.shopId);
        // Track current order IDs
        orderIdsRef.current = new Set(
          (data.orders as TOrder[]).map((o) => o.id)
        );
      }
    } catch {
      toast.error("Erreur chargement commandes");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!shopId) return;

    const supabase = createClient();
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `shop_id=eq.${shopId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newOrder = payload.new as TOrder;
            setOrders((prev) => [newOrder, ...prev]);

            // Sound + notification for new orders
            if (soundOn && !orderIdsRef.current.has(newOrder.id)) {
              playSound();
              toast.success(
                `Nouvelle commande #${newOrder.order_number}`,
                { duration: 5000 }
              );
            }
            orderIdsRef.current.add(newOrder.id);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as TOrder;
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? updated : o))
            );
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as { id: string };
            setOrders((prev) => prev.filter((o) => o.id !== deleted.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, soundOn, playSound]);

  // Update page title with pending count
  useEffect(() => {
    const pending = orders.filter((o) => o.status === "pending").length;
    document.title = pending > 0
      ? `(${pending}) Commandes — SnapShop`
      : "Commandes — SnapShop";
  }, [orders]);

  const handleStatusChange = async (id: string, status: TOrderStatus) => {
    if (status === "cancelled" && !confirm("Annuler cette commande ?")) return;

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );

    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      fetchOrders(); // Revert
      toast.error("Erreur mise a jour");
    }
  };

  const handlePrint = (order: TOrder) => {
    printTicket(order, shopName);
  };

  // Filtered orders
  const filtered =
    filter === "all"
      ? orders.filter((o) => o.status !== "picked_up" && o.status !== "cancelled")
      : orders.filter((o) => o.status === filter);

  // Counts for badges
  const counts = {
    all: orders.filter(
      (o) => o.status !== "picked_up" && o.status !== "cancelled"
    ).length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="sticky top-0 bg-gray-50 z-10 px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Commandes</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundOn(!soundOn)}
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                soundOn
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-400"
              )}
            >
              {soundOn ? (
                <Bell className="h-5 w-5" />
              ) : (
                <BellOff className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={fetchOrders}
              className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 active:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors",
                filter === f.value
                  ? "bg-black text-white"
                  : "bg-white text-gray-500 border border-gray-200 active:bg-gray-100"
              )}
            >
              {f.label}
              {counts[f.value as keyof typeof counts] > 0 && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "h-5 min-w-5 text-[10px] px-1.5 rounded-full",
                    filter === f.value
                      ? "bg-white/20 text-white"
                      : f.value === "pending"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                  )}
                >
                  {counts[f.value as keyof typeof counts]}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-5xl mb-4">☕</p>
            <h2 className="text-lg font-semibold text-gray-400">
              {filter === "all"
                ? "Aucune commande aujourd'hui"
                : "Aucune commande dans cette categorie"}
            </h2>
            <p className="text-sm text-gray-300 mt-1">
              Les nouvelles commandes apparaitront ici en temps reel.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                onPrint={handlePrint}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
