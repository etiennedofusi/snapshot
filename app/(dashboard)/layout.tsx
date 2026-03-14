"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Globe,
  UserPlus,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const NAV_ITEMS = [
  { href: "/orders", label: "Commandes", icon: ClipboardList, demoOnly: false },
  { href: "/catalog", label: "Produits", icon: Package, demoOnly: false },
  { href: "/analytics", label: "Stats", icon: BarChart3, demoOnly: false },
  { href: "/settings", label: "Config", icon: Settings, demoOnly: false },
  { href: "/landing", label: "Landing", icon: Globe, demoOnly: true },
  { href: "/setup", label: "Onboarding", icon: UserPlus, demoOnly: true },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    if (isDemo) {
      toast.info("Mode demo — deconnexion desactivee");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const visibleItems = NAV_ITEMS.filter((item) => !item.demoOnly || isDemo);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Demo banner */}
      {isDemo && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-1.5 text-xs font-medium flex items-center justify-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          Mode Demo — Boulangerie Marie
        </div>
      )}

      {/* Content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
        <div className="flex items-stretch h-16 max-w-2xl mx-auto">
          {visibleItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-black"
                    : "text-gray-400 active:text-gray-600"
                )}
              >
                <Icon
                  className={cn("h-5 w-5", isActive && "stroke-[2.5]")}
                />
                <span>{label}</span>
              </Link>
            );
          })}
          {!isDemo && (
            <button
              onClick={handleLogout}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-gray-400 active:text-red-500 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sortir</span>
            </button>
          )}
        </div>
      </nav>
      <Toaster position="top-center" richColors />
    </div>
  );
}
