"use client";

import type { TOrder } from "@/types";
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_LABELS } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Printer,
  Check,
  ChefHat,
  ShoppingBag,
  X,
  MessageCircle,
  Camera,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CHANNEL_ICON: Record<string, typeof MessageCircle> = {
  whatsapp: MessageCircle,
  instagram: Camera,
  widget: Globe,
};

type OrderCardProps = {
  order: TOrder;
  onStatusChange: (id: string, status: TOrder["status"]) => void;
  onPrint: (order: TOrder) => void;
};

export function OrderCard({ order, onStatusChange, onPrint }: OrderCardProps) {
  const config = ORDER_STATUS_CONFIG[order.status];
  const ChannelIcon = CHANNEL_ICON[order.customer_channel] || Globe;
  const isPaid = order.payment_status === "paid";
  const time = new Date(order.created_at).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Next status action
  const nextAction = {
    pending: { label: "Preparer", status: "preparing" as const, icon: ChefHat },
    preparing: { label: "Prete !", status: "ready" as const, icon: Check },
    ready: {
      label: "Recuperee",
      status: "picked_up" as const,
      icon: ShoppingBag,
    },
    picked_up: null,
    cancelled: null,
  }[order.status];

  return (
    <Card
      className={cn(
        "p-4 border-2 transition-all",
        config.bgClass,
        order.status === "pending" && "animate-pulse-once"
      )}
    >
      {/* Header: order number + customer + time */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={cn("text-2xl font-black", config.color)}>
            #{order.order_number}
          </span>
          <Badge
            variant="outline"
            className={cn("text-xs font-bold uppercase", config.color)}
          >
            {config.label}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          <ChannelIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{time}</span>
        </div>
      </div>

      {/* Customer name */}
      {order.customer_name && (
        <p className="text-base font-medium text-gray-700 mb-2">
          {order.customer_name}
        </p>
      )}

      <Separator className="my-2" />

      {/* Items */}
      <div className="space-y-1 my-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-base">
            <span>
              <strong>{item.qty}x</strong> {item.name}
            </span>
            <span className="font-medium">{item.subtotal.toFixed(2)}€</span>
          </div>
        ))}
      </div>

      <Separator className="my-2" />

      {/* Total + payment */}
      <div className="flex items-center justify-between my-3">
        <span className="text-xl font-black">
          {order.total.toFixed(2)}€
        </span>
        <Badge
          variant={isPaid ? "default" : "secondary"}
          className={cn(
            "text-sm px-3 py-1",
            isPaid && "bg-green-500 hover:bg-green-600"
          )}
        >
          {isPaid ? "Paye" : PAYMENT_STATUS_LABELS[order.payment_status]}
        </Badge>
      </div>

      {/* Notes */}
      {order.notes && (
        <p className="text-sm text-gray-500 italic bg-yellow-50 rounded-lg p-2 mb-3">
          {order.notes}
        </p>
      )}

      {/* Actions — gros boutons */}
      {(nextAction || order.status !== "picked_up") && (
        <div className="flex gap-2 mt-2">
          {/* Print */}
          <Button
            variant="outline"
            size="lg"
            className="h-14 flex-1 text-base font-semibold gap-2"
            onClick={() => onPrint(order)}
          >
            <Printer className="h-5 w-5" />
            Imprimer
          </Button>

          {/* Next status */}
          {nextAction && (
            <Button
              size="lg"
              className={cn(
                "h-14 flex-1 text-base font-semibold gap-2",
                order.status === "pending" &&
                  "bg-amber-500 hover:bg-amber-600",
                order.status === "preparing" &&
                  "bg-green-500 hover:bg-green-600",
                order.status === "ready" &&
                  "bg-gray-600 hover:bg-gray-700"
              )}
              onClick={() => onStatusChange(order.id, nextAction.status)}
            >
              <nextAction.icon className="h-5 w-5" />
              {nextAction.label}
            </Button>
          )}

          {/* Cancel (only for pending/preparing) */}
          {(order.status === "pending" || order.status === "preparing") && (
            <Button
              variant="ghost"
              size="lg"
              className="h-14 w-14 text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
              onClick={() => onStatusChange(order.id, "cancelled")}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
