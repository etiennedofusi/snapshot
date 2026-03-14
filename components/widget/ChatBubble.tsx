"use client";

import { cn } from "@/lib/utils";
import { CreditCard } from "lucide-react";
import type { TOrderItem } from "@/types";

type ProductImage = {
  url: string;
  name: string;
  price: number;
};

type ChatBubbleProps = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  order?: { items: TOrderItem[]; total: number } | null;
  paymentUrl?: string | null;
  images?: ProductImage[] | null;
};

export function ChatBubble({ role, content, timestamp, order, paymentUrl, images }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn("flex mb-2", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl text-[15px] leading-relaxed overflow-hidden",
          isUser
            ? "bg-green-500 text-white rounded-br-md"
            : "bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100"
        )}
      >
        {/* Product images grid */}
        {images && images.length > 0 && (
          <div className={cn(
            "grid gap-1.5 p-2",
            images.length === 1 ? "grid-cols-1" : "grid-cols-2"
          )}>
            {images.map((img, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden">
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-28 object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                  <p className="text-white text-xs font-semibold truncate">{img.name}</p>
                  <p className="text-white/90 text-[11px]">{img.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Text content */}
        <div className="px-4 py-2.5">
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
                    {item.subtotal.toFixed(2)}
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
                <span>{order.total.toFixed(2)}</span>
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
    </div>
  );
}
