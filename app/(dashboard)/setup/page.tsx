"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Store,
  MapPin,
  Phone,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  MessageCircle,
  Camera,
  Globe,
  Copy,
  Loader2,
  ShoppingBag,
  QrCode,
  ExternalLink,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Votre boutique", subtitle: "Infos de base", icon: Store },
  { title: "WhatsApp", subtitle: "Connectez votre numero", icon: MessageCircle },
  { title: "Instagram", subtitle: "Connectez votre compte", icon: Camera },
  { title: "Widget Web", subtitle: "Integrez sur votre site", icon: Globe },
  { title: "C'est pret !", subtitle: "Commencez a recevoir", icon: Sparkles },
] as const;

export default function OnboardingDemoPage() {
  const [step, setStep] = useState(0);
  const [connecting, setConnecting] = useState(false);

  // Step states
  const [name, setName] = useState("Boulangerie Marie");
  const [phone, setPhone] = useState("06 12 34 56 78");
  const [address, setAddress] = useState("12 rue de la Paix, 75002 Paris");
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [instaConnected, setInstaConnected] = useState(false);
  const [widgetCopied, setWidgetCopied] = useState(false);

  const simulateConnect = (callback: () => void) => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      callback();
      toast.success("Connexion reussie !");
    }, 1500);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleCopyWidget = () => {
    navigator.clipboard.writeText(
      '<script src="https://snapshop.app/widget.js" data-shop-id="demo-shop-001"></script>'
    );
    setWidgetCopied(true);
    toast.success("Code copie !");
    setTimeout(() => setWidgetCopied(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold">Onboarding</h1>
        <p className="text-sm text-muted-foreground">Configurez votre boutique en 5 minutes</p>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex items-center gap-1">
              <div
                className={cn(
                  "h-1.5 rounded-full flex-1 transition-colors",
                  i <= step ? "bg-green-500" : "bg-gray-200"
                )}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center",
            step === STEPS.length - 1 ? "bg-green-500 text-white" : "bg-gray-100"
          )}>
            {(() => {
              const StepIcon = STEPS[step].icon;
              return <StepIcon className="h-5 w-5" />;
            })()}
          </div>
          <div>
            <p className="font-bold text-sm">{STEPS[step].title}</p>
            <p className="text-xs text-muted-foreground">{STEPS[step].subtitle}</p>
          </div>
          <span className="ml-auto text-xs text-muted-foreground font-medium">
            {step + 1}/{STEPS.length}
          </span>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-4 pb-4">
        {/* Step 0: Boutique info */}
        {step === 0 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ob-name" className="flex items-center gap-1.5">
                    <Store className="h-3.5 w-3.5" /> Nom de la boutique
                  </Label>
                  <Input
                    id="ob-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ob-phone" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Telephone
                  </Label>
                  <Input
                    id="ob-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ob-address" className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Adresse
                  </Label>
                  <Input
                    id="ob-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground text-center">
              Ces informations seront visibles par vos clients
            </p>
          </div>
        )}

        {/* Step 1: WhatsApp */}
        {step === 1 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">WhatsApp Business</h3>
                    <p className="text-xs text-muted-foreground">
                      Recevez les commandes par WhatsApp
                    </p>
                  </div>
                  {whatsappConnected && (
                    <CheckCircle2 className="h-6 w-6 text-green-500 ml-auto" />
                  )}
                </div>

                {whatsappConnected ? (
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
                    <p className="font-bold text-green-700">WhatsApp connecte !</p>
                    <p className="text-sm text-green-600 mt-1">+33 6 12 34 56 78</p>
                    <p className="text-xs text-green-500 mt-2">
                      Vos clients peuvent commander par WhatsApp des maintenant
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* QR Code mockup */}
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <div className="w-40 h-40 mx-auto bg-white rounded-xl border-2 border-gray-200 flex items-center justify-center mb-3">
                        <QrCode className="h-24 w-24 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Scannez avec WhatsApp Business</p>
                      <p className="text-xs text-gray-400 mt-1">Ou connectez manuellement</p>
                    </div>

                    <div className="text-center text-xs text-gray-400 font-medium">— ou —</div>

                    <div className="space-y-2">
                      <Input
                        value="+33 6 12 34 56 78"
                        readOnly
                        className="h-12 text-base text-center font-mono"
                      />
                      <Button
                        className="w-full h-12 text-base font-semibold gap-2 bg-green-500 hover:bg-green-600"
                        onClick={() => simulateConnect(() => setWhatsappConnected(true))}
                        disabled={connecting}
                      >
                        {connecting ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <MessageCircle className="h-5 w-5" />
                            Connecter WhatsApp
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <button
              onClick={handleNext}
              className="text-sm text-muted-foreground text-center w-full hover:text-gray-600"
            >
              Passer cette etape →
            </button>
          </div>
        )}

        {/* Step 2: Instagram */}
        {step === 2 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <Camera className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">Instagram</h3>
                    <p className="text-xs text-muted-foreground">
                      Commandes via DM Instagram
                    </p>
                  </div>
                  {instaConnected && (
                    <CheckCircle2 className="h-6 w-6 text-green-500 ml-auto" />
                  )}
                </div>

                {instaConnected ? (
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <CheckCircle2 className="h-10 w-10 text-purple-500 mx-auto mb-2" />
                    <p className="font-bold text-purple-700">Instagram connecte !</p>
                    <p className="text-sm text-purple-600 mt-1">@boulangerie.marie</p>
                    <p className="text-xs text-purple-400 mt-2">
                      L&apos;IA repondra automatiquement aux DM de commande
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Instagram OAuth mockup */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 text-center">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-200">
                        <Camera className="h-10 w-10 text-white" />
                      </div>
                      <p className="text-sm text-gray-700 font-medium">
                        Connectez votre compte Instagram Business
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Via Meta Business Suite
                      </p>
                    </div>

                    <Button
                      className="w-full h-12 text-base font-semibold gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      onClick={() => simulateConnect(() => setInstaConnected(true))}
                      disabled={connecting}
                    >
                      {connecting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Camera className="h-5 w-5" />
                          Se connecter avec Instagram
                        </>
                      )}
                    </Button>

                    <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3">
                      <Smartphone className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-600">
                        Vous devez avoir un compte Instagram Business lie a une page Facebook
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <button
              onClick={handleNext}
              className="text-sm text-muted-foreground text-center w-full hover:text-gray-600"
            >
              Passer cette etape →
            </button>
          </div>
        )}

        {/* Step 3: Widget Web */}
        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">Widget Web</h3>
                    <p className="text-xs text-muted-foreground">
                      Integrez le chat sur votre site
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Code snippet */}
                  <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-green-400 overflow-x-auto">
                    <span className="text-gray-500">&lt;!-- Ajoutez avant &lt;/body&gt; --&gt;</span>
                    <br />
                    <span className="text-blue-400">&lt;script</span>
                    <br />
                    <span className="text-purple-400 pl-4">src</span>
                    <span className="text-white">=</span>
                    <span className="text-green-400">&quot;https://snapshop.app/widget.js&quot;</span>
                    <br />
                    <span className="text-purple-400 pl-4">data-shop-id</span>
                    <span className="text-white">=</span>
                    <span className="text-green-400">&quot;demo-shop-001&quot;</span>
                    <br />
                    <span className="text-blue-400">&gt;&lt;/script&gt;</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 text-base gap-2"
                      onClick={handleCopyWidget}
                    >
                      {widgetCopied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {widgetCopied ? "Copie !" : "Copier le code"}
                    </Button>
                    <Button
                      className="flex-1 h-12 text-base gap-2"
                      onClick={() => window.open("/widget/demo-shop-001", "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Tester le widget
                    </Button>
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Apercu sur votre site
                    </p>
                    <div className="bg-white rounded-lg border border-gray-200 h-48 relative overflow-hidden">
                      <div className="p-4">
                        <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-48 bg-gray-100 rounded mb-2" />
                        <div className="h-3 w-40 bg-gray-100 rounded" />
                      </div>
                      {/* Chat bubble floating */}
                      <div className="absolute bottom-3 right-3">
                        <div className="h-14 w-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                          <MessageCircle className="h-7 w-7 text-white" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Le bouton de chat apparait en bas a droite de votre site
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <button
              onClick={handleNext}
              className="text-sm text-muted-foreground text-center w-full hover:text-gray-600"
            >
              Passer cette etape →
            </button>
          </div>
        )}

        {/* Step 4: Done! */}
        {step === 4 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-black mb-2">Votre boutique est prete !</h2>
                <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                  Vos clients peuvent maintenant commander par message. L&apos;IA s&apos;occupe de tout.
                </p>

                {/* Status recap */}
                <div className="space-y-2 text-left max-w-xs mx-auto mb-6">
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">WhatsApp</span>
                    </div>
                    {whatsappConnected ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <span className="text-xs text-gray-400">Non connecte</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Instagram</span>
                    </div>
                    {instaConnected ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <span className="text-xs text-gray-400">Non connecte</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Widget Web</span>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                </div>

                <Button
                  className="w-full h-14 text-base font-bold gap-2 bg-green-500 hover:bg-green-600"
                  onClick={() => {
                    toast.success("Bienvenue sur SnapShop !");
                    window.location.href = "/orders";
                  }}
                >
                  <ShoppingBag className="h-5 w-5" />
                  Acceder a mon dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom nav buttons */}
      {step < STEPS.length - 1 && (
        <div className="px-4 pb-24 flex gap-2">
          {step > 0 && (
            <Button
              variant="outline"
              className="h-14 flex-1 text-base font-semibold gap-2"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
              Retour
            </Button>
          )}
          <Button
            className="h-14 flex-1 text-base font-semibold gap-2"
            onClick={handleNext}
          >
            {step === 0 ? "C'est parti" : "Suivant"}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
