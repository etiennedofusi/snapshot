import { WidgetClient } from "./widget-client";
import { DEMO_SHOP } from "@/lib/demo/data";

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default async function WidgetPage({
  params,
}: {
  params: { shopId: string };
}) {
  // Demo mode — use mock shop
  if (isDemo) {
    return (
      <WidgetClient
        shopId={DEMO_SHOP.id}
        shopName={DEMO_SHOP.name}
        welcomeMessage={DEMO_SHOP.welcome_message}
      />
    );
  }

  const { createServiceClient } = await import("@/lib/supabase/server");
  const supabase = await createServiceClient();

  const { data: shop } = await supabase
    .from("shops")
    .select("id, name, welcome_message, logo_url, is_active")
    .eq("id", params.shopId)
    .eq("is_active", true)
    .single();

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-6">
          <p className="text-4xl mb-3">🔒</p>
          <h1 className="text-lg font-semibold text-gray-700">
            Boutique indisponible
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Cette boutique n&apos;existe pas ou n&apos;est plus active.
          </p>
        </div>
      </div>
    );
  }

  return (
    <WidgetClient
      shopId={shop.id}
      shopName={shop.name}
      welcomeMessage={
        shop.welcome_message || "Bonjour ! Que souhaitez-vous commander ?"
      }
    />
  );
}
