"use client";

import { useEffect, useState } from "react";
import { useShop } from "@/lib/hooks/useShop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Save,
  Store,
  CreditCard,
  MessageCircle,
  Camera,
  Globe,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { shop, loading } = useShop();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (shop) {
      setName(shop.name);
      setPhone(shop.phone || "");
      setAddress(shop.address || "");
      setWelcomeMessage(shop.welcome_message || "");
    }
  }, [shop]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/shops", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone || null,
          address: address || null,
          welcome_message: welcomeMessage || null,
        }),
      });
      if (res.ok) {
        toast.success("Parametres sauvegardes");
      } else {
        toast.error("Erreur sauvegarde");
      }
    } catch {
      toast.error("Erreur sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleStripeConnect = async () => {
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Erreur Stripe");
      }
    } catch {
      toast.error("Erreur connexion Stripe");
    }
  };

  const copyWidgetCode = () => {
    if (!shop) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://snapshop.app";
    const code = `<script src="${appUrl}/widget.js" data-shop-id="${shop.id}"></script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Code copie !");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="p-4 text-center text-gray-400 py-20">
        Aucune boutique configuree.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <h1 className="text-2xl font-bold">Configuration</h1>

      {/* Shop info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold text-lg">Ma boutique</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="s-name">Nom</Label>
            <Input
              id="s-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-phone">Telephone</Label>
            <Input
              id="s-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-address">Adresse</Label>
            <Input
              id="s-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-11 text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-welcome">Message de bienvenue</Label>
            <Textarea
              id="s-welcome"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={2}
              className="text-base"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 text-base font-semibold gap-2"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="h-5 w-5" />
                Enregistrer
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Abonnement</p>
              <p className="text-sm text-muted-foreground">
                Plan actuel
              </p>
            </div>
            <Badge className="text-sm px-3 py-1 uppercase">
              {shop.plan}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Channels */}
      <h2 className="text-lg font-bold pt-2">Canaux de vente</h2>

      {/* Stripe */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">Paiement Stripe</p>
                <p className="text-xs text-muted-foreground">
                  {shop.stripe_account_id
                    ? "Compte connecte"
                    : "Non configure"}
                </p>
              </div>
            </div>
            {shop.stripe_account_id ? (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Actif
              </Badge>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleStripeConnect}
              >
                Connecter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Widget */}
      <Card>
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-semibold">Widget web</p>
              <p className="text-xs text-muted-foreground">
                Integrez sur votre site en 1 ligne
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full h-11 text-sm gap-2"
            onClick={copyWidgetCode}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copie !" : "Copier le code d'integration"}
          </Button>
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">WhatsApp</p>
                <p className="text-xs text-muted-foreground">
                  {shop.whatsapp_number || "Non configure"}
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={
                shop.whatsapp_number
                  ? "bg-green-100 text-green-700"
                  : ""
              }
            >
              {shop.whatsapp_number ? "Actif" : "Bientot"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Instagram */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">Instagram</p>
                <p className="text-xs text-muted-foreground">
                  {shop.instagram_account_id || "Non configure"}
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={
                shop.instagram_account_id
                  ? "bg-green-100 text-green-700"
                  : ""
              }
            >
              {shop.instagram_account_id ? "Actif" : "Bientot"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Shop ID for debug */}
      <p className="text-[10px] text-gray-300 text-center pt-4">
        ID: {shop.id}
      </p>
    </div>
  );
}
