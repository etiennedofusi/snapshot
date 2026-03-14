"use client";

import { OrderBoard } from "@/components/dashboard/OrderBoard";
import { useShop } from "@/lib/hooks/useShop";
import { Loader2 } from "lucide-react";

export default function OrdersPage() {
  const { shop, loading } = useShop();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-6">
        <p className="text-5xl mb-4">🏪</p>
        <h2 className="text-xl font-bold text-gray-700">
          Configurez votre boutique
        </h2>
        <p className="text-sm text-gray-400 mt-2">
          Rendez-vous dans Configuration pour creer votre boutique.
        </p>
      </div>
    );
  }

  return <OrderBoard shopName={shop.name} />;
}
