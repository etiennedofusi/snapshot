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
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

const NAV_ITEMS = [
  { href: "/orders", label: "Commandes", icon: ClipboardList },
  { href: "/catalog", label: "Produits", icon: Package },
  { href: "/analytics", label: "Stats", icon: BarChart3 },
  { href: "/settings", label: "Config", icon: Settings },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom nav — fixed, gros boutons pour écran de caisse */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
        <div className="flex items-stretch h-16 max-w-lg mx-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
                  isActive
                    ? "text-black"
                    : "text-gray-400 active:text-gray-600"
                )}
              >
                <Icon
                  className={cn("h-6 w-6", isActive && "stroke-[2.5]")}
                />
                <span>{label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium text-gray-400 active:text-red-500 transition-colors"
          >
            <LogOut className="h-6 w-6" />
            <span>Sortir</span>
          </button>
        </div>
      </nav>
      <Toaster position="top-center" richColors />
    </div>
  );
}
