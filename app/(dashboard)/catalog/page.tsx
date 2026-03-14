"use client";

import { useEffect, useState, useCallback } from "react";
import type { TProduct } from "@/types";
import { DEMO_PRODUCTS } from "@/lib/demo/data";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductForm, type ProductFormData } from "@/components/catalog/ProductForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function CatalogPage() {
  const [products, setProducts] = useState<TProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<TProduct | null>(null);

  const fetchProducts = useCallback(async () => {
    if (isDemo) {
      setProducts(DEMO_PRODUCTS);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
      }
    } catch {
      toast.error("Erreur chargement produits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreate = async (formData: ProductFormData) => {
    if (isDemo) {
      const newProduct: TProduct = {
        id: `prod-${Date.now()}`,
        shop_id: "demo-shop-001",
        name: formData.name,
        description: formData.description || null,
        price: formData.price,
        photo_url: null,
        category: formData.category || null,
        is_available: true,
        sort_order: products.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProducts((prev) => [...prev, newProduct]);
      toast.success("Produit ajoute");
      return;
    }

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erreur creation");
    }
    toast.success("Produit ajoute");
    fetchProducts();
  };

  const handleEdit = async (formData: ProductFormData) => {
    if (!editingProduct) return;

    if (isDemo) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, ...formData, updated_at: new Date().toISOString() }
            : p
        )
      );
      toast.success("Produit modifie");
      setEditingProduct(null);
      return;
    }

    const res = await fetch(`/api/products/${editingProduct.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erreur modification");
    }
    toast.success("Produit modifie");
    setEditingProduct(null);
    fetchProducts();
  };

  const handleToggleAvailable = async (id: string, available: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_available: available } : p))
    );

    if (isDemo) return;

    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: available }),
    });

    if (!res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_available: !available } : p))
      );
      toast.error("Erreur mise a jour");
    }
  };

  const handleDelete = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!confirm(`Supprimer "${product?.name}" ?`)) return;

    if (isDemo) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Produit supprime");
      return;
    }

    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Produit supprime");
    } else {
      toast.error("Erreur suppression");
    }
  };

  const openEdit = (product: TProduct) => {
    setEditingProduct(product);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const categories = new Map<string, TProduct[]>();
  filtered.forEach((p) => {
    const cat = p.category || "Sans categorie";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(p);
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header sticky */}
      <div className="sticky top-0 bg-gray-50 z-10 px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Produits</h1>
            <p className="text-sm text-muted-foreground">
              {products.length} produit{products.length > 1 ? "s" : ""}
            </p>
          </div>
          <Button
            onClick={openCreate}
            size="lg"
            className="h-12 px-5 text-base font-semibold gap-2"
          >
            <Plus className="h-5 w-5" />
            Ajouter
          </Button>
        </div>

        {products.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="pl-9 h-11 text-base"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="h-16 w-16 text-gray-200 mb-4" />
            <h2 className="text-lg font-semibold text-gray-500">
              Aucun produit
            </h2>
            <p className="text-sm text-gray-400 mt-1 max-w-[250px]">
              Ajoutez vos produits pour que vos clients puissent commander.
            </p>
            <Button onClick={openCreate} className="mt-6 h-12 px-6 text-base">
              <Plus className="h-5 w-5 mr-2" />
              Ajouter un produit
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Aucun resultat</p>
        ) : (
          <div className="space-y-5">
            {Array.from(categories.entries()).map(([cat, prods]) => (
              <div key={cat}>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {cat}
                </h2>
                <div className="space-y-2">
                  {prods.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onToggleAvailable={handleToggleAvailable}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create form */}
      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
      />

      {/* Edit form */}
      <ProductForm
        open={!!editingProduct}
        onOpenChange={(open) => {
          if (!open) setEditingProduct(null);
        }}
        product={editingProduct}
        onSubmit={handleEdit}
      />
    </div>
  );
}
