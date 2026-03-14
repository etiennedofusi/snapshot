"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Store, MapPin, Phone, MessageSquare, ArrowRight, Check } from "lucide-react";

const STEPS = [
  { title: "Votre boutique", icon: Store },
  { title: "Coordonnees", icon: MapPin },
  { title: "Message d'accueil", icon: MessageSquare },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Bonjour ! Que souhaitez-vous commander ?"
  );

  const canNext =
    step === 0 ? name.trim().length > 0 : true;

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          welcome_message: welcomeMessage.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          typeof data.error === "string" ? data.error : "Erreur creation"
        );
      }

      router.push("/orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
      setSaving(false);
    }
  };

  const CurrentIcon = STEPS[step].icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3 pb-2">
          <h1 className="text-2xl font-bold">SnapShop</h1>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    i < step
                      ? "bg-green-500 text-white"
                      : i === step
                        ? "bg-black text-white"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 ${
                      i < step ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <CurrentIcon className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">{STEPS[step].title}</h2>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Step 1: Shop name */}
          {step === 0 && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nom de votre boutique *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Boulangerie Marie"
                  className="h-12 text-base"
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                C&apos;est le nom que verront vos clients.
              </p>
            </div>
          )}

          {/* Step 2: Contact */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Telephone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="h-12 text-base"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Adresse
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="12 rue de la Paix, 75002 Paris"
                  className="h-12 text-base"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Optionnel. Aide vos clients a vous trouver.
              </p>
            </div>
          )}

          {/* Step 3: Welcome message */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="welcome">Message de bienvenue</Label>
                <Textarea
                  id="welcome"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  rows={3}
                  className="text-base"
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Premier message envoye a vos clients quand ils commencent une
                conversation.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          {/* Navigation */}
          <div className="flex gap-2 pt-2">
            {step > 0 && (
              <Button
                variant="outline"
                className="h-12 flex-1 text-base"
                onClick={() => setStep(step - 1)}
                disabled={saving}
              >
                Retour
              </Button>
            )}
            <Button
              className="h-12 flex-1 text-base font-semibold gap-2"
              onClick={handleNext}
              disabled={!canNext || saving}
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : step === STEPS.length - 1 ? (
                <>
                  Creer ma boutique
                  <Check className="h-5 w-5" />
                </>
              ) : (
                <>
                  Suivant
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
