import { sendWhatsAppMessage } from "@/lib/twilio/client";
import type { TOrder, TShop } from "@/types";

export async function notifyOrderReady(order: TOrder, shop: TShop) {
  const customerName = order.customer_name?.split(" ")[0] || "client";
  const message = `Bonjour ${customerName} ! Votre commande #${order.order_number} chez ${shop.name} est prete. A tout de suite !`;

  try {
    switch (order.customer_channel) {
      case "whatsapp":
        if (order.customer_phone) {
          await sendWhatsAppMessage(order.customer_phone, message);
        }
        break;

      case "instagram": {
        // Find the conversation to get the Instagram sender ID
        const token =
          shop.instagram_page_access_token ||
          process.env.META_PAGE_ACCESS_TOKEN;
        if (token) {
          // We need the Instagram user ID from the conversation
          // This is stored as customer_instagram_id in conversations
          // For now, we skip if we don't have direct contact
          console.log("Instagram notification: would send to customer");
        }
        break;
      }

      case "widget":
        // Widget orders: send SMS if phone provided
        if (order.customer_phone) {
          await sendWhatsAppMessage(order.customer_phone, message);
        }
        break;
    }
  } catch (err) {
    console.error(`Failed to notify customer for order ${order.id}:`, err);
  }
}
