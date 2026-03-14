"use client";

import type { TProduct } from "@/types";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: TProduct;
  onToggleAvailable: (id: string, available: boolean) => void;
  onEdit: (product: TProduct) => void;
  onDelete: (id: string) => void;
};

export function ProductCard({
  product,
  onToggleAvailable,
  onEdit,
  onDelete,
}: ProductCardProps) {
  return (
    <Card
      className={cn(
        "flex items-center gap-3 p-3 transition-opacity",
        !product.is_available && "opacity-50"
      )}
    >
      {/* Photo */}
      <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
        {product.photo_url ? (
          <img
            src={product.photo_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageIcon className="h-6 w-6 text-gray-300" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base truncate">
            {product.name}
          </span>
          {product.category && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {product.category}
            </Badge>
          )}
        </div>
        <span className="text-lg font-bold">{product.price.toFixed(2)}€</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Switch
          checked={product.is_available}
          onCheckedChange={(checked) =>
            onToggleAvailable(product.id, checked)
          }
          className="data-[state=checked]:bg-green-500"
        />
        <button
          onClick={() => onEdit(product)}
          className="h-10 w-10 flex items-center justify-center rounded-lg text-gray-400 active:bg-gray-100 transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="h-10 w-10 flex items-center justify-center rounded-lg text-gray-400 active:bg-red-50 active:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
