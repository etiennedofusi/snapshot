"use client";

import { cn } from "@/lib/utils";
import { CreditCard } from "lucide-react";
import type { TOrderItem } from "@/types";

type ChatBubbleProps = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  order?: { items: TOrderItem[]; total: number } | null;
  paymentUrl?: string | null;
};

export function ChatBubble({ role, content, timestamp, order, paymentUrl }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn("flex mb-2", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
          isUser
            ? "bg-green-500 text-white rounded-br-md"
            : "bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100"
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>

        {/* Order summary */}
        {order && order.items.length > 0 && (
          <div
            className={cn(
              "mt-2 pt-2 border-t text-sm space-y-1",
              isUser ? "border-green-400" : "border-gray-200"
            )}
          >
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between gap-3">
                <span>
                  {item.qty}x {item.name}
                </span>
                <span className="font-medium">
                  {item.subtotal.toFixed(2)}€
                </span>
              </div>
            ))}
            <div
              className={cn(
                "flex justify-between font-bold pt-1 border-t",
                isUser ? "border-green-400" : "border-gray-200"
              )}
            >
              <span>Total</span>
              <span>{order.total.toFixed(2)}€</span>
            </div>
          </div>
        )}

        {/* Payment button */}
        {paymentUrl && (
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-3 bg-green-500 text-white font-semibold py-3 px-4 rounded-xl text-sm active:bg-green-600 transition-colors"
          >
            <CreditCard className="h-4 w-4" />
            Payer en ligne
          </a>
        )}

        {/* Timestamp */}
        {timestamp && (
          <p
            className={cn(
              "text-[10px] mt-1",
              isUser ? "text-green-100" : "text-gray-400"
            )}
          >
            {new Date(timestamp).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  );
}
