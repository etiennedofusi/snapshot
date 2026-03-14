"use client";

import { ChatWidget } from "@/components/widget/ChatWidget";

type WidgetClientProps = {
  shopId: string;
  shopName: string;
  welcomeMessage: string;
};

export function WidgetClient({
  shopId,
  shopName,
  welcomeMessage,
}: WidgetClientProps) {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <ChatWidget
        shopId={shopId}
        shopName={shopName}
        welcomeMessage={welcomeMessage}
      />
    </div>
  );
}
