import { redirect } from "next/navigation";
import Link from "next/link";
import {
  MessageCircle,
  ShoppingBag,
  CreditCard,
  Bell,
  BarChart3,
  ArrowRight,
  Zap,
  Store,
  Clock,
  Shield,
  CheckCircle2,
  Star,
  Receipt,
  Printer,
} from "lucide-react";

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function HomePage() {
  if (!isDemo) {
    redirect("/orders");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ==================== NAV ==================== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-green-500 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">
              Snap<span className="text-green-500">Shop</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-500">
            <a href="#fonctionnalites" className="hover:text-gray-900 transition-colors">Fonctionnalites</a>
            <a href="#comment-ca-marche" className="hover:text-gray-900 transition-colors">Comment ca marche</a>
            <a href="#tarifs" className="hover:text-gray-900 transition-colors">Tarifs</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="bg-green-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-green-600 transition-colors"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50" />
        <div className="absolute top-20 -right-40 w-[500px] h-[500px] bg-green-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-20 -left-40 w-[400px] h-[400px] bg-emerald-100 rounded-full blur-3xl opacity-30" />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Zap className="h-3.5 w-3.5" />
                +35% de commandes en moyenne
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight text-gray-900 leading-[1.1] mb-6">
                Transformez vos{" "}
                <span className="text-green-500">messages</span>{" "}
                en{" "}
                <span className="relative">
                  commandes
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                    <path d="M1 5.5C47 2 153 2 199 5.5" stroke="#22c55e" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-lg">
                Vos clients commandent sur <strong className="text-gray-700">WhatsApp</strong>, <strong className="text-gray-700">Instagram</strong> ou <strong className="text-gray-700">votre site</strong>. L&apos;IA prend la commande, propose le paiement, et vous previent. Simple comme bonjour.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="group flex items-center justify-center gap-2 bg-green-500 text-white px-7 py-4 rounded-2xl text-base font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/25"
                >
                  Essai gratuit 14 jours
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/widget/demo-shop-001"
                  className="flex items-center justify-center gap-2 bg-white text-gray-700 px-7 py-4 rounded-2xl text-base font-bold border-2 border-gray-200 hover:border-green-300 transition-all"
                >
                  <MessageCircle className="h-5 w-5" />
                  Voir la demo
                </Link>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Sans engagement, sans carte bancaire. Pret en 5 minutes.
              </p>
            </div>

            {/* Right: phone mockup with chat */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Phone frame */}
                <div className="w-[300px] h-[580px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-gray-900/30">
                  <div className="w-full h-full bg-[#e5ddd5] rounded-[2.3rem] overflow-hidden flex flex-col">
                    {/* WhatsApp header */}
                    <div className="bg-green-600 text-white px-4 py-3 flex items-center gap-3 pt-8">
                      <div className="h-9 w-9 rounded-full bg-green-700 flex items-center justify-center text-sm font-bold">B</div>
                      <div>
                        <p className="font-semibold text-sm">Boulangerie Marie</p>
                        <p className="text-green-200 text-[10px]">Click & Collect</p>
                      </div>
                    </div>
                    {/* Messages */}
                    <div className="flex-1 px-3 py-3 space-y-2 overflow-hidden">
                      <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-bl-md px-3 py-2 max-w-[80%] text-sm shadow-sm">
                          <p>Bonjour ! Que souhaitez-vous commander ?</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">14:30</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-green-500 text-white rounded-2xl rounded-br-md px-3 py-2 max-w-[80%] text-sm">
                          <p>2 croissants et un cafe svp</p>
                          <p className="text-[9px] text-green-100 mt-0.5">14:31</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-bl-md px-3 py-2 max-w-[85%] text-sm shadow-sm">
                          <p>Parfait !</p>
                          <div className="text-xs mt-1.5 pt-1.5 border-t border-gray-100 space-y-0.5">
                            <div className="flex justify-between"><span>2x Croissant</span><span className="font-medium">2.60€</span></div>
                            <div className="flex justify-between"><span>1x Cafe</span><span className="font-medium">1.50€</span></div>
                            <div className="flex justify-between font-bold border-t border-gray-100 pt-1 mt-1"><span>Total</span><span>4.10€</span></div>
                          </div>
                          <p className="mt-2 text-xs">Payer en ligne ou en boutique ?</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">14:31</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-green-500 text-white rounded-2xl rounded-br-md px-3 py-2 text-sm">
                          <p>En boutique</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-bl-md px-3 py-2 max-w-[85%] text-sm shadow-sm">
                          <p>Commande #42 confirmee ! On vous previent quand c&apos;est pret.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute -left-16 top-20 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2 border border-gray-100 animate-bounce [animation-duration:3s]">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Nouvelle commande !</p>
                    <p className="text-[10px] text-gray-400">#42 — Lucas M.</p>
                  </div>
                </div>
                <div className="absolute -right-12 bottom-32 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2 border border-gray-100">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-600">+4.10€</p>
                    <p className="text-[10px] text-gray-400">Paiement recu</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SOCIAL PROOF ==================== */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "150+", label: "Commerces actifs" },
              { value: "12 000", label: "Commandes / mois" },
              { value: "4.8/5", label: "Note commercants" },
              { value: "< 5 min", label: "Temps de setup" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PAIN POINTS ==================== */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-4">Vous reconnaissez ca ?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Les problemes que rencontrent 9 commerces sur 10
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                emoji: "📱",
                problem: "\"J'ai 30 messages WhatsApp non lus\"",
                solution: "L'IA repond a tous vos clients instantanement, 24h/24",
              },
              {
                emoji: "📝",
                problem: "\"Je note les commandes sur un carnet\"",
                solution: "Tout est numerique, organise, avec historique et statistiques",
              },
              {
                emoji: "💸",
                problem: "\"Les clients oublient de venir chercher\"",
                solution: "Notification automatique + paiement en ligne en amont",
              },
            ].map((item) => (
              <div
                key={item.problem}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{item.emoji}</div>
                <p className="font-bold text-red-500 text-base mb-3">{item.problem}</p>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 leading-relaxed">{item.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="comment-ca-marche" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-4">Pret en 5 minutes</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Zero formation necessaire. Si vous savez utiliser WhatsApp, vous savez utiliser SnapShop.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                icon: Store,
                title: "Creez votre boutique",
                desc: "Nom, adresse, horaires. C'est tout.",
                color: "bg-green-500",
              },
              {
                step: "2",
                icon: MessageCircle,
                title: "Connectez vos canaux",
                desc: "WhatsApp, Instagram, et/ou widget web. En 2 clics.",
                color: "bg-blue-500",
              },
              {
                step: "3",
                icon: ShoppingBag,
                title: "Ajoutez vos produits",
                desc: "Nom, prix, photo. L'IA fait le reste.",
                color: "bg-purple-500",
              },
              {
                step: "4",
                icon: Receipt,
                title: "Recevez des commandes",
                desc: "Les clients ecrivent, l'IA commande, vous preparez.",
                color: "bg-amber-500",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`${item.color} h-14 w-14 rounded-2xl flex items-center justify-center text-white mx-auto mb-4`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-xs font-bold text-gray-500 mb-3">
                  {item.step}
                </div>
                <h3 className="text-base font-bold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 bg-green-500 text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/25"
            >
              Commencer maintenant
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section id="fonctionnalites" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Un outil complet, concu pour les commerces de proximite
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MessageCircle,
                title: "3 canaux en 1",
                desc: "WhatsApp, Instagram DM et widget web. Toutes les commandes au meme endroit.",
                color: "text-green-600 bg-green-50",
              },
              {
                icon: Zap,
                title: "IA conversationnelle",
                desc: "L'IA comprend les commandes en langage naturel et repond comme un humain.",
                color: "text-amber-600 bg-amber-50",
              },
              {
                icon: CreditCard,
                title: "Paiement flexible",
                desc: "En ligne par carte ou en boutique a la recuperation. Le client choisit.",
                color: "text-blue-600 bg-blue-50",
              },
              {
                icon: Bell,
                title: "Alertes temps reel",
                desc: "Son et notification a chaque commande. Impossible d'en rater une.",
                color: "text-red-600 bg-red-50",
              },
              {
                icon: Printer,
                title: "Impression ticket",
                desc: "Imprimez le ticket de commande en 1 clic depuis votre tablette.",
                color: "text-purple-600 bg-purple-50",
              },
              {
                icon: BarChart3,
                title: "Tableau de bord",
                desc: "CA du jour, produit star, heures de pointe. En un coup d'oeil.",
                color: "text-indigo-600 bg-indigo-50",
              },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-14">
            Ils utilisent SnapShop au quotidien
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Marie D.",
                role: "Boulangerie Marie, Paris 2e",
                quote: "Mes clients commandent sur WhatsApp en 30 secondes. J'ai augmente mon CA de 40% en click & collect.",
                stars: 5,
              },
              {
                name: "Karim B.",
                role: "Traiteur Le Cedre, Lyon",
                quote: "Avant je perdais 1h par jour a repondre aux messages. Maintenant l'IA gere tout et je me concentre sur la cuisine.",
                stars: 5,
              },
              {
                name: "Sophie L.",
                role: "Fromagerie Sophie, Bordeaux",
                quote: "L'onboarding a pris 5 minutes. Mes clients adorent commander par Instagram DM. C'est magique.",
                stars: 5,
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PRICING ==================== */}
      <section id="tarifs" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-4">Tarifs simples et transparents</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              14 jours d&apos;essai gratuit sur tous les plans. Sans carte bancaire.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Starter */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col">
              <h3 className="text-lg font-bold mb-1">Starter</h3>
              <p className="text-sm text-gray-400 mb-4">Pour demarrer</p>
              <div className="mb-6">
                <span className="text-4xl font-black">29€</span>
                <span className="text-gray-400 text-sm">/mois</span>
              </div>
              <ul className="space-y-2.5 text-sm mb-8 flex-1">
                {[
                  "1 canal (WhatsApp ou Web)",
                  "100 commandes / mois",
                  "IA conversationnelle",
                  "Paiement en boutique",
                  "Dashboard basique",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors">
                Essai gratuit
              </Link>
            </div>

            {/* Pro — recommended */}
            <div className="bg-green-500 rounded-2xl p-6 text-white flex flex-col relative shadow-xl shadow-green-500/20 scale-[1.03]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                Populaire
              </div>
              <h3 className="text-lg font-bold mb-1">Pro</h3>
              <p className="text-green-100 text-sm mb-4">Pour grandir</p>
              <div className="mb-6">
                <span className="text-4xl font-black">59€</span>
                <span className="text-green-100 text-sm">/mois</span>
              </div>
              <ul className="space-y-2.5 text-sm mb-8 flex-1">
                {[
                  "3 canaux (WhatsApp + Insta + Web)",
                  "Commandes illimitees",
                  "IA conversationnelle avancee",
                  "Paiement en ligne + boutique",
                  "Analytics complets",
                  "Impression tickets",
                  "Support prioritaire",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-200 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center bg-white text-green-600 font-bold py-3 rounded-xl hover:bg-green-50 transition-colors">
                Essai gratuit 14 jours
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col">
              <h3 className="text-lg font-bold mb-1">Enterprise</h3>
              <p className="text-sm text-gray-400 mb-4">Multi-points de vente</p>
              <div className="mb-6">
                <span className="text-4xl font-black">149€</span>
                <span className="text-gray-400 text-sm">/mois</span>
              </div>
              <ul className="space-y-2.5 text-sm mb-8 flex-1">
                {[
                  "Tout le plan Pro",
                  "Multi-boutiques",
                  "API personnalisee",
                  "Marque blanche",
                  "Account manager dedie",
                  "SLA garanti",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors">
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-14">Questions frequentes</h2>
          <div className="space-y-4">
            {[
              {
                q: "Est-ce que mes clients doivent installer une app ?",
                a: "Non ! Vos clients utilisent WhatsApp, Instagram ou votre site web. Rien a installer.",
              },
              {
                q: "Combien de temps prend la mise en place ?",
                a: "5 minutes. Vous creez votre boutique, ajoutez vos produits, connectez WhatsApp ou Instagram, et c'est parti.",
              },
              {
                q: "L'IA va-t-elle faire des erreurs de commande ?",
                a: "L'IA est entrainee specifiquement pour la prise de commande. Elle recapitule toujours avant de valider. En cas de doute, elle demande confirmation au client.",
              },
              {
                q: "Comment fonctionne le paiement ?",
                a: "Vos clients peuvent payer en ligne par carte (Stripe) ou en boutique a la recuperation. Vous choisissez les options que vous proposez.",
              },
              {
                q: "Puis-je essayer gratuitement ?",
                a: "Oui ! 14 jours d'essai gratuit sur tous les plans, sans carte bancaire. Vous pouvez annuler a tout moment.",
              },
              {
                q: "Et si j'ai besoin d'aide ?",
                a: "Notre equipe est disponible par chat, email et telephone. Les plans Pro et Enterprise beneficient d'un support prioritaire.",
              },
            ].map((faq) => (
              <details key={faq.q} className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 font-semibold text-sm hover:bg-gray-50 transition-colors list-none">
                  {faq.q}
                  <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl font-light">+</span>
                </summary>
                <div className="px-6 pb-4 text-sm text-gray-500 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="py-24 bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-green-400 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-emerald-400 rounded-full blur-3xl opacity-20" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Pret a transformer vos messages en commandes ?
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            Rejoignez les 150+ commercants qui utilisent SnapShop pour augmenter leur CA en click & collect.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-green-50 transition-all shadow-lg"
            >
              Demarrer gratuitement
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/widget/demo-shop-001"
              className="flex items-center gap-2 text-white px-8 py-4 rounded-2xl text-lg font-bold border-2 border-white/30 hover:bg-white/10 transition-all"
            >
              <MessageCircle className="h-5 w-5" />
              Tester la demo
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-green-100 text-sm">
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> Sans engagement</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Pret en 5 min</span>
            <span className="flex items-center gap-1.5"><CreditCard className="h-4 w-4" /> Sans CB</span>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="py-10 bg-gray-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-green-400" />
              <span className="font-bold text-white">SnapShop</span>
              <span className="text-gray-500 text-sm">— Click & Collect SaaS</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">CGV</a>
              <a href="#" className="hover:text-white transition-colors">Confidentialite</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
