"use client";

import { useState, useRef } from "react";
import type { TProduct } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Camera, Loader2, X } from "lucide-react";

type ProductFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: TProduct | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
};

export type ProductFormData = {
  name: string;
  price: number;
  description?: string;
  photo_url?: string;
  category?: string;
  is_available: boolean;
};

export function ProductForm({
  open,
  onOpenChange,
  product,
  onSubmit,
}: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [description, setDescription] = useState(
    product?.description ?? ""
  );
  const [category, setCategory] = useState(product?.category ?? "");
  const [photoUrl, setPhotoUrl] = useState(product?.photo_url ?? "");
  const [isAvailable, setIsAvailable] = useState(
    product?.is_available ?? true
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!product;

  const resetForm = () => {
    setName(product?.name ?? "");
    setPrice(product?.price?.toString() ?? "");
    setDescription(product?.description ?? "");
    setCategory(product?.category ?? "");
    setPhotoUrl(product?.photo_url ?? "");
    setIsAvailable(product?.is_available ?? true);
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPhotoUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(price);
    if (!name.trim()) {
      setError("Le nom est obligatoire");
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Prix invalide");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        price: priceNum,
        description: description.trim() || undefined,
        photo_url: photoUrl || undefined,
        category: category.trim() || undefined,
        is_available: isAvailable,
      });
      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl px-4 pb-8">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-xl">
            {isEdit ? "Modifier le produit" : "Nouveau produit"}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto">
          {/* Photo */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-28 w-28 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden active:bg-gray-200 transition-colors"
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              ) : photoUrl ? (
                <div className="relative h-full w-full">
                  <img
                    src={photoUrl}
                    alt="Produit"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoUrl("");
                    }}
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ) : (
                <>
                  <Camera className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">Photo</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {/* Nom */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium">
              Nom du produit *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Croissant, Baguette..."
              className="h-12 text-base"
              autoFocus
            />
          </div>

          {/* Prix */}
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-sm font-medium">
              Prix (€) *
            </Label>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1.20"
              className="h-12 text-base"
            />
          </div>

          {/* Catégorie */}
          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-sm font-medium">
              Categorie
            </Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Viennoiseries, Boissons..."
              className="h-12 text-base"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beurre AOP, fait maison..."
              rows={2}
              className="text-base"
            />
          </div>

          {/* Dispo */}
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="available" className="text-base">
              Disponible a la vente
            </Label>
            <Switch
              id="available"
              checked={isAvailable}
              onCheckedChange={setIsAvailable}
              className="data-[state=checked]:bg-green-500"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-14 text-lg font-semibold"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isEdit ? (
              "Enregistrer"
            ) : (
              "Ajouter le produit"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
