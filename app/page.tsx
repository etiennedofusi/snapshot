import { redirect } from "next/navigation";
import Link from "next/link";
import {
  MessageCircle,
  ShoppingBag,
  CreditCard,
  Bell,
  BarChart3,
  Smartphone,
  ArrowRight,
  Zap,
  Store,
  Camera,
} from "lucide-react";

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function HomePage() {
  if (!isDemo) {
    redirect("/orders");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50" />
        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-20">
          {/* Nav */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-green-500 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight">
                Snap<span className="text-green-500">Shop</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/widget/demo-shop-001"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Widget Demo
              </Link>
              <Link
                href="/orders"
                className="bg-green-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-green-600 transition-colors"
              >
                Dashboard Demo
              </Link>
            </div>
          </nav>

          {/* Hero content */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
              <Zap className="h-4 w-4" />
              Click & Collect intelligent pour commerces locaux
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-gray-900 leading-[1.1] mb-6">
              Vos clients commandent par{" "}
              <span className="text-green-500">WhatsApp</span>,{" "}
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Instagram
              </span>{" "}
              ou{" "}
              <span className="text-blue-500">Web</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              SnapShop transforme les conversations en commandes. Votre IA personnelle prend les commandes, propose le paiement en ligne ou en boutique, et previent le client quand c&apos;est pret.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/widget/demo-shop-001"
                className="group flex items-center gap-2 bg-green-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/25"
              >
                <MessageCircle className="h-5 w-5" />
                Tester une commande
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/orders"
                className="flex items-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-2xl text-lg font-bold border-2 border-gray-200 hover:border-green-300 transition-all"
              >
                <Store className="h-5 w-5" />
                Voir le Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-4">
            Comment ca marche ?
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">
            3 etapes, zero formation necessaire
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: MessageCircle,
                title: "Le client ecrit",
                desc: "Sur WhatsApp, Instagram ou votre site. Il commande en langage naturel : \"2 croissants et un cafe\"",
                color: "bg-green-500",
              },
              {
                step: "2",
                icon: CreditCard,
                title: "IA + Paiement",
                desc: "L'IA comprend la commande, propose le paiement en ligne ou en boutique, et confirme le retrait",
                color: "bg-blue-500",
              },
              {
                step: "3",
                icon: Bell,
                title: "Vous preparez",
                desc: "La commande arrive sur votre tableau de bord. Un clic : en preparation. Un clic : prete !",
                color: "bg-amber-500",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div
                  className={`${item.color} h-12 w-12 rounded-xl flex items-center justify-center text-white mb-4`}
                >
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-14">
            Tout ce qu&apos;il faut
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: MessageCircle,
                title: "WhatsApp Business",
                desc: "Recevez les commandes directement sur WhatsApp",
                color: "text-green-500 bg-green-50",
              },
              {
                icon: Camera,
                title: "Instagram DM",
                desc: "Vos followers commandent par message prive",
                color: "text-purple-500 bg-purple-50",
              },
              {
                icon: Smartphone,
                title: "Widget Web",
                desc: "Un chat integrable sur votre site en 1 ligne de code",
                color: "text-blue-500 bg-blue-50",
              },
              {
                icon: CreditCard,
                title: "Paiement flexible",
                desc: "En ligne (Stripe) ou en boutique a la recuperation",
                color: "text-emerald-500 bg-emerald-50",
              },
              {
                icon: Bell,
                title: "Notifications temps reel",
                desc: "Son + alerte a chaque nouvelle commande",
                color: "text-amber-500 bg-amber-50",
              },
              {
                icon: BarChart3,
                title: "Analytics",
                desc: "CA, produit star, heures de pointe, tout en un coup d'oeil",
                color: "text-indigo-500 bg-indigo-50",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${feature.color}`}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-emerald-600">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Pret a transformer vos messages en commandes ?
          </h2>
          <p className="text-green-100 text-lg mb-8">
            Testez la demo maintenant — aucune inscription requise
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/widget/demo-shop-001"
              className="group flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-green-50 transition-all"
            >
              <MessageCircle className="h-5 w-5" />
              Passer une commande demo
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/orders"
              className="flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-2xl text-lg font-bold border-2 border-green-400 hover:bg-green-700 transition-all"
            >
              <Store className="h-5 w-5" />
              Voir le Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShoppingBag className="h-4 w-4 text-green-400" />
          <span className="font-bold text-white">SnapShop</span>
        </div>
        <p>Click & Collect SaaS — Projet de demonstration</p>
      </footer>
    </div>
  );
}
