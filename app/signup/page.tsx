"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Mascot } from "@/components/ui/mascot";
import { cn } from "@/lib/utils";
import {
  Store,
  ArrowRight,
  Check,
  CheckCircle2,
  MessageCircle,
  Camera,
  Globe,
  Package,
  Plus,
  ShoppingBag,
  CreditCard,
  Lock,
  Sparkles,
  Crown,
  Rocket,
  Euro,
  Trash2,
} from "lucide-react";

/* ─── types ─── */
type QuickProduct = { id: string; name: string; price: string; category: string };

const CATEGORIES = [
  { emoji: "🥐", label: "Boulangerie", value: "boulangerie" },
  { emoji: "🍕", label: "Restaurant", value: "restaurant" },
  { emoji: "🧀", label: "Fromagerie", value: "fromagerie" },
  { emoji: "🌸", label: "Fleuriste", value: "fleuriste" },
  { emoji: "🥩", label: "Boucherie", value: "boucherie" },
  { emoji: "🍷", label: "Caviste", value: "caviste" },
  { emoji: "🍰", label: "Patisserie", value: "patisserie" },
  { emoji: "🛒", label: "Epicerie", value: "epicerie" },
  { emoji: "💇", label: "Salon", value: "salon" },
  { emoji: "📦", label: "Autre", value: "autre" },
];

const SUGGESTED: Record<string, { name: string; price: string; cat: string }[]> = {
  boulangerie: [
    { name: "Croissant beurre", price: "1.30", cat: "Viennoiseries" },
    { name: "Pain au chocolat", price: "1.40", cat: "Viennoiseries" },
    { name: "Baguette tradition", price: "1.50", cat: "Pains" },
    { name: "Cafe expresso", price: "1.50", cat: "Boissons" },
    { name: "Sandwich jambon-beurre", price: "4.50", cat: "Snacking" },
  ],
  restaurant: [
    { name: "Plat du jour", price: "12.90", cat: "Plats" },
    { name: "Entree du jour", price: "6.50", cat: "Entrees" },
    { name: "Dessert maison", price: "5.90", cat: "Desserts" },
    { name: "Formule midi", price: "15.90", cat: "Formules" },
  ],
  patisserie: [
    { name: "Eclair au chocolat", price: "4.00", cat: "Eclairs" },
    { name: "Tarte aux fruits", price: "4.50", cat: "Tartes" },
    { name: "Macaron", price: "2.20", cat: "Macarons" },
    { name: "Mille-feuille", price: "5.00", cat: "Classiques" },
  ],
  default: [
    { name: "Produit 1", price: "5.00", cat: "General" },
    { name: "Produit 2", price: "10.00", cat: "General" },
    { name: "Produit 3", price: "15.00", cat: "General" },
  ],
};

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    desc: "Pour demarrer",
    features: ["1 canal", "100 commandes/mois", "IA conversationnelle"],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 59,
    desc: "Le plus populaire",
    features: ["3 canaux", "Commandes illimitees", "Paiement en ligne", "Analytics", "Support prioritaire"],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 149,
    desc: "Multi-boutiques",
    features: ["Tout le Pro", "Multi-sites", "API", "Marque blanche", "Account manager"],
    popular: false,
  },
];

const ENCOURAGEMENTS = [
  "Super debut !",
  "Excellent choix !",
  "Ca prend forme !",
  "Presque fini !",
  "Derniere ligne droite !",
  "Plus qu'une etape !",
  "Vous y etes !",
];

/* ─── Confetti component ─── */
function Confetti() {
  const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444"];
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-10px",
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animationDelay: `${Math.random() * 0.8}s`,
            animationDuration: `${1 + Math.random() * 1.5}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── StepCheck ─── */
function StepCheck({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="animate-scale-in">
      <CheckCircle2 className="h-6 w-6 text-green-500" />
    </div>
  );
}

/* ─── Main ─── */
export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const TOTAL_STEPS = 7;

  // Data
  const [shopName, setShopName] = useState("");
  const [category, setCategory] = useState("");
  const [channels, setChannels] = useState({ whatsapp: true, instagram: false, widget: true });
  const [products, setProducts] = useState<QuickProduct[]>([]);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const progress = ((step + 1) / TOTAL_STEPS) * 100;
  const progressColor = step < 3
    ? "from-green-400 to-green-500"
    : step < 5
      ? "from-green-400 via-teal-400 to-teal-500"
      : "from-green-400 via-teal-400 to-blue-500";

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  }, []);

  const goNext = useCallback(() => {
    if (step >= TOTAL_STEPS - 1) return;
    setStep((s) => s + 1);
  }, [step]);

  const goBack = useCallback(() => {
    if (step <= 0) return;
    setStep((s) => s - 1);
  }, [step]);

  const canProceed = () => {
    switch (step) {
      case 0: return shopName.trim().length > 1;
      case 1: return category !== "";
      case 2: return channels.whatsapp || channels.instagram || channels.widget;
      case 3: return true; // products optional
      case 4: return true; // preview
      case 5: return selectedPlan !== "";
      case 6: return cardNumber.length >= 16 && cardExpiry.length >= 4 && cardCvc.length >= 3;
      default: return false;
    }
  };

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
      triggerConfetti();
    }, 2500);
  };

  const toggleChannel = (ch: keyof typeof channels) => {
    setChannels((prev) => ({ ...prev, [ch]: !prev[ch] }));
  };

  const addSuggested = (s: { name: string; price: string; cat: string }) => {
    if (products.some((p) => p.name === s.name)) return;
    setProducts((prev) => [...prev, { id: Date.now().toString(), name: s.name, price: s.price, category: s.cat }]);
  };

  const suggestions = SUGGESTED[category] || SUGGESTED.default;
  const channelCount = Object.values(channels).filter(Boolean).length;

  // Format card number with spaces
  const formatCard = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 16);
    return clean.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    if (clean.length >= 3) return clean.slice(0, 2) + "/" + clean.slice(2);
    return clean;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-blue-50/30 flex flex-col">
      {showConfetti && <Confetti />}

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-lg">Snap<span className="text-green-500">Shop</span></span>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {step < TOTAL_STEPS - 1 ? ENCOURAGEMENTS[Math.min(step, ENCOURAGEMENTS.length - 1)] : ""}
          </span>
        </div>
        {/* Progress bar */}
        <div className="max-w-lg mx-auto mt-2">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-700 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 pt-8 pb-32">
        <div className="w-full max-w-lg">

          {/* ─── STEP 0: Shop name ─── */}
          {step === 0 && (
            <div key="step0" className="animate-slide-in space-y-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Mascot size="lg" mood="happy" />
                </div>
                <h1 className="text-3xl font-black mb-2">Comment s&apos;appelle votre commerce ?</h1>
                <p className="text-gray-500">C&apos;est le nom que verront vos clients</p>
              </div>
              <Input
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="ex: Boulangerie Marie"
                className="h-16 text-xl text-center font-medium border-2 border-gray-200 focus:border-green-400 rounded-2xl"
                autoFocus
              />
              {shopName.trim().length > 1 && (
                <div className="animate-scale-in text-center">
                  <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                    <Check className="h-4 w-4" />
                    Parfait, &ldquo;{shopName.trim()}&rdquo; !
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 1: Category ─── */}
          {step === 1 && (
            <div key="step1" className="animate-slide-in space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-black mb-2">Quelle est votre activite ?</h1>
                <p className="text-gray-500">On adapte tout pour votre metier</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200",
                      category === cat.value
                        ? "border-green-500 bg-green-50 shadow-lg shadow-green-500/10 scale-[1.02]"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                    )}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="font-semibold text-sm">{cat.label}</span>
                    {category === cat.value && <StepCheck show />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── STEP 2: Channels ─── */}
          {step === 2 && (
            <div key="step2" className="animate-slide-in space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-black mb-2">Ou sont vos clients ?</h1>
                <p className="text-gray-500">Choisissez vos canaux de commande</p>
              </div>
              <div className="space-y-3">
                {[
                  { key: "whatsapp" as const, icon: MessageCircle, label: "WhatsApp", desc: "Le plus utilise en France", color: "green", emoji: "💬" },
                  { key: "instagram" as const, icon: Camera, label: "Instagram DM", desc: "Ideal si vous avez des followers", color: "purple", emoji: "📸" },
                  { key: "widget" as const, icon: Globe, label: "Widget sur votre site", desc: "1 ligne de code a copier", color: "blue", emoji: "🌐" },
                ].map((ch) => (
                  <button
                    key={ch.key}
                    onClick={() => toggleChannel(ch.key)}
                    className={cn(
                      "w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200",
                      channels[ch.key]
                        ? `border-${ch.color}-500 bg-${ch.color}-50 shadow-lg scale-[1.01]`
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                    style={channels[ch.key] ? {
                      borderColor: ch.color === "green" ? "#22c55e" : ch.color === "purple" ? "#a855f7" : "#3b82f6",
                      backgroundColor: ch.color === "green" ? "#f0fdf4" : ch.color === "purple" ? "#faf5ff" : "#eff6ff",
                    } : {}}
                  >
                    <span className="text-3xl">{ch.emoji}</span>
                    <div className="flex-1">
                      <p className="font-bold">{ch.label}</p>
                      <p className="text-xs text-gray-500">{ch.desc}</p>
                    </div>
                    <div className={cn(
                      "h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all",
                      channels[ch.key]
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300"
                    )}>
                      {channels[ch.key] && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-400">
                {channelCount} canal{channelCount > 1 ? "x" : ""} selectionne{channelCount > 1 ? "s" : ""} — vous pourrez en ajouter plus tard
              </p>
            </div>
          )}

          {/* ─── STEP 3: Products ─── */}
          {step === 3 && (
            <div key="step3" className="animate-slide-in space-y-6">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Mascot size="md" mood="wink" />
                </div>
                <h1 className="text-3xl font-black mb-2">Votre catalogue</h1>
                <p className="text-gray-500">Ajoutez quelques produits ou faites-le plus tard</p>
              </div>

              {/* Primary CTA: Skip */}
              <button
                onClick={goNext}
                className="w-full flex items-center justify-between bg-white border-2 border-gray-200 hover:border-green-400 rounded-2xl px-5 py-4 transition-all group"
              >
                <div className="text-left">
                  <p className="font-bold text-base">Je configurerai mon catalogue plus tard</p>
                  <p className="text-xs text-gray-400 mt-0.5">Vous pourrez le faire depuis l&apos;onglet Produits</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">ou ajoutez-en maintenant</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Quick add */}
              <div className="flex gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nom du produit"
                  className="h-12 text-base flex-[2] rounded-xl"
                />
                <div className="relative flex-1">
                  <Input
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="Prix"
                    type="number"
                    step="0.01"
                    className="h-12 text-base pr-7 rounded-xl"
                  />
                  <Euro className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                </div>
                <button
                  onClick={() => {
                    if (!newName.trim() || !newPrice.trim()) return;
                    setProducts((p) => [...p, { id: Date.now().toString(), name: newName.trim(), price: newPrice, category: "Autres" }]);
                    setNewName(""); setNewPrice("");
                  }}
                  disabled={!newName.trim() || !newPrice.trim()}
                  className="h-12 w-12 rounded-xl bg-green-500 text-white flex items-center justify-center disabled:opacity-30 hover:bg-green-600 transition-colors flex-shrink-0"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* Suggestions */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Ajout rapide</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.filter((s) => !products.some((p) => p.name === s.name)).map((s) => (
                    <button
                      key={s.name}
                      onClick={() => addSuggested(s)}
                      className="inline-flex items-center gap-1 bg-white border border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-600 text-xs font-medium px-3 py-2 rounded-full transition-all"
                    >
                      <Plus className="h-3 w-3" /> {s.name} ({s.price}€)
                    </button>
                  ))}
                </div>
              </div>

              {/* Product list */}
              {products.length > 0 && (
                <div className="space-y-1.5">
                  {products.map((p, i) => (
                    <div key={p.id} className="animate-scale-in flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3" style={{ animationDelay: `${i * 50}ms` }}>
                      <Package className="h-4 w-4 text-gray-300" />
                      <span className="flex-1 text-sm font-medium">{p.name}</span>
                      <span className="text-sm font-bold">{p.price}€</span>
                      <button onClick={() => setProducts((prev) => prev.filter((x) => x.id !== p.id))} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="text-center pt-2 animate-scale-in">
                    <span className="inline-flex items-center gap-1.5 text-green-600 text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      {products.length} produit{products.length > 1 ? "s" : ""} ajoute{products.length > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 4: Preview ─── */}
          {step === 4 && (
            <div key="step4" className="animate-slide-in space-y-6">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Mascot size="md" mood="excited" />
                </div>
                <h1 className="text-3xl font-black mb-2">Voici votre boutique !</h1>
                <p className="text-gray-500">Tout est pret pour recevoir des commandes</p>
              </div>

              {/* Phone mockup */}
              <div className="flex justify-center">
                <div className="w-[280px] bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl shadow-gray-900/30 animate-scale-in">
                  <div className="bg-[#e5ddd5] rounded-[2rem] overflow-hidden">
                    {/* WhatsApp header */}
                    <div className="bg-green-600 text-white px-4 py-3 pt-7 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-700 flex items-center justify-center text-sm font-bold">
                        {shopName.charAt(0).toUpperCase() || "B"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{shopName || "Ma Boutique"}</p>
                        <p className="text-green-200 text-[10px]">Click & Collect</p>
                      </div>
                    </div>
                    {/* Chat */}
                    <div className="px-3 py-3 space-y-2 min-h-[280px]">
                      <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-bl-md px-3 py-2 max-w-[85%] text-xs shadow-sm">
                          Bonjour ! Que souhaitez-vous commander ?
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-green-500 text-white rounded-2xl rounded-br-md px-3 py-2 max-w-[80%] text-xs">
                          {products.length > 0 ? `1 ${products[0].name} svp` : "1 croissant svp"}
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-bl-md px-3 py-2 max-w-[85%] text-xs shadow-sm">
                          <p>Parfait !</p>
                          <div className="mt-1 pt-1 border-t border-gray-100 text-[10px]">
                            <div className="flex justify-between font-bold">
                              <span>Total</span>
                              <span>{products.length > 0 ? products[0].price : "1.30"}€</span>
                            </div>
                          </div>
                          <p className="mt-1.5 font-medium">Payer en ligne ou en boutique ?</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recap badges */}
              <div className="flex flex-wrap justify-center gap-2">
                {channels.whatsapp && (
                  <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium animate-scale-in">
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </span>
                )}
                {channels.instagram && (
                  <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-xs font-medium animate-scale-in" style={{ animationDelay: "100ms" }}>
                    <Camera className="h-3.5 w-3.5" /> Instagram
                  </span>
                )}
                {channels.widget && (
                  <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium animate-scale-in" style={{ animationDelay: "200ms" }}>
                    <Globe className="h-3.5 w-3.5" /> Widget Web
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-xs font-medium animate-scale-in" style={{ animationDelay: "300ms" }}>
                  <Package className="h-3.5 w-3.5" /> {products.length} produit{products.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}

          {/* ─── STEP 5: Plan ─── */}
          {step === 5 && (
            <div key="step5" className="animate-slide-in space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4 animate-float">
                  <Crown className="h-4 w-4" /> 14 jours gratuits sur tous les plans
                </div>
                <h1 className="text-3xl font-black mb-2">Choisissez votre plan</h1>
                <p className="text-gray-500">Vous pouvez changer a tout moment</p>
              </div>

              <div className="space-y-3">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={cn(
                      "w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 relative",
                      selectedPlan === plan.id
                        ? "border-green-500 bg-green-50 shadow-lg shadow-green-500/10 scale-[1.02]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2.5 right-4 bg-green-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                        RECOMMANDE
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-bold text-lg">{plan.name}</span>
                        <span className="text-gray-400 text-sm ml-2">{plan.desc}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black">{plan.price}€</span>
                        <span className="text-gray-400 text-xs">/mois</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.features.map((f) => (
                        <span key={f} className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <Check className="h-3 w-3 text-green-500" /> {f}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── STEP 6: Payment (THE TRAP) ─── */}
          {step === 6 && !done && (
            <div key="step6" className="animate-slide-in space-y-6">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 animate-float shadow-lg shadow-green-500/30">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-black mb-2">Plus qu&apos;une etape !</h1>
                <p className="text-gray-500">14 jours gratuits, sans engagement</p>
              </div>

              {/* Plan recap */}
              <div className="bg-green-50 rounded-2xl p-4 flex items-center justify-between border border-green-200">
                <div>
                  <p className="font-bold">Plan {PLANS.find((p) => p.id === selectedPlan)?.name}</p>
                  <p className="text-xs text-green-600">14 jours d&apos;essai gratuit</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-green-600">0€</p>
                  <p className="text-[10px] text-gray-400">puis {PLANS.find((p) => p.id === selectedPlan)?.price}€/mois</p>
                </div>
              </div>

              {/* Card form */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <span className="font-bold text-sm">Informations de paiement</span>
                  <Lock className="h-3.5 w-3.5 text-gray-300 ml-auto" />
                </div>

                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Numero de carte</label>
                  <Input
                    value={formatCard(cardNumber)}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="4242 4242 4242 4242"
                    className="h-12 text-base font-mono tracking-wider rounded-xl"
                    maxLength={19}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Expiration</label>
                    <Input
                      value={formatExpiry(cardExpiry)}
                      onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, ""))}
                      placeholder="MM/AA"
                      className="h-12 text-base font-mono text-center rounded-xl"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">CVC</label>
                    <Input
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="123"
                      className="h-12 text-base font-mono text-center rounded-xl"
                      maxLength={4}
                      type="password"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1">
                  <Lock className="h-3 w-3" />
                  <span>Paiement securise par Stripe. Annulable a tout moment.</span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handlePay}
                disabled={!canProceed() || processing}
                className={cn(
                  "w-full h-16 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden",
                  canProceed() && !processing
                    ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-gray-200 text-gray-400"
                )}
              >
                {processing ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Activation en cours...
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5" />
                    Demarrer mon essai gratuit
                  </>
                )}
                {canProceed() && !processing && (
                  <div className="absolute inset-0 animate-shimmer" />
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                Vous ne serez debite qu&apos;apres les 14 jours d&apos;essai gratuit.
                <br />Annulable en 1 clic depuis votre dashboard.
              </p>
            </div>
          )}

          {/* ─── DONE ─── */}
          {done && (
            <div key="done" className="animate-scale-in text-center space-y-6 pt-8">
              <div className="flex justify-center">
                <Mascot size="lg" mood="excited" />
              </div>
              <div>
                <h1 className="text-3xl font-black mb-2">Bienvenue sur SnapShop !</h1>
                <p className="text-gray-500">
                  <strong>{shopName}</strong> est prete a recevoir des commandes
                </p>
              </div>
              <div className="space-y-2 max-w-xs mx-auto text-left">
                {[
                  { label: shopName || "Ma boutique", icon: Store },
                  { label: `${channelCount} canal${channelCount > 1 ? "x" : ""} actif${channelCount > 1 ? "s" : ""}`, icon: MessageCircle },
                  { label: `${products.length} produit${products.length > 1 ? "s" : ""}`, icon: Package },
                  { label: `Plan ${PLANS.find((p) => p.id === selectedPlan)?.name}`, icon: Crown },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 animate-scale-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <item.icon className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                ))}
              </div>
              <button
                onClick={() => window.location.href = "/orders"}
                className="w-full max-w-xs mx-auto h-14 rounded-2xl bg-green-500 text-white text-base font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/25"
              >
                <Sparkles className="h-5 w-5" />
                Acceder a mon dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA bar (not on payment or done) */}
      {step < 6 && !done && (
        <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-6 py-4 z-40">
          <div className="max-w-lg mx-auto flex gap-3">
            {step > 0 && (
              <button
                onClick={goBack}
                className="h-14 px-6 rounded-2xl border-2 border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition-colors"
              >
                Retour
              </button>
            )}
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className={cn(
                "h-14 flex-1 rounded-2xl text-base font-bold flex items-center justify-center gap-2 transition-all duration-300",
                canProceed()
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/25 hover:bg-green-600 hover:shadow-xl active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400"
              )}
            >
              {step === 5 ? "Derniere etape" : step === 3 && products.length === 0 ? "Passer" : "Continuer"}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          {step === 3 && products.length === 0 && (
            <p className="text-center text-xs text-gray-400 mt-2 max-w-lg mx-auto">
              Vous pourrez ajouter vos produits plus tard
            </p>
          )}
        </div>
      )}
    </div>
  );
}
