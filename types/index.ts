// =====================
// Database types
// =====================

export type TShop = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  phone: string | null;
  address: string | null;
  welcome_message: string;
  opening_hours: Record<string, { open: string; close: string }>;
  instagram_account_id: string | null;
  instagram_page_access_token: string | null;
  whatsapp_number: string | null;
  stripe_account_id: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  plan: "starter" | "pro" | "enterprise";
  commission_rate: number;
  is_active: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type TProduct = {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  category: string | null;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type TOrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "picked_up"
  | "cancelled";

export type TPaymentStatus = "pending" | "paid" | "pay_on_pickup" | "refunded";

export type TCustomerChannel = "whatsapp" | "instagram" | "widget";

export type TOrderItem = {
  product_id: string;
  name: string;
  qty: number;
  unit_price: number;
  subtotal: number;
};

export type TOrder = {
  id: string;
  shop_id: string;
  order_number: number;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  customer_channel: TCustomerChannel;
  items: TOrderItem[];
  subtotal: number;
  commission_amount: number;
  total: number;
  status: TOrderStatus;
  payment_status: TPaymentStatus;
  stripe_payment_intent_id: string | null;
  stripe_payment_link_id: string | null;
  stripe_payment_link_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  ready_at: string | null;
  picked_up_at: string | null;
  cancelled_at: string | null;
};

export type TConversationMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export type TConversation = {
  id: string;
  shop_id: string;
  customer_phone: string | null;
  customer_instagram_id: string | null;
  channel: TCustomerChannel;
  messages: TConversationMessage[];
  current_order_draft: { items: TOrderItem[]; total: number } | null;
  order_id: string | null;
  last_activity: string;
  created_at: string;
};

// =====================
// AI Bot types
// =====================

export type TBotAction =
  | null
  | "show_menu"
  | "create_order"
  | "request_payment"
  | "confirm_ready";

export type TBotResponse = {
  message: string;
  action: TBotAction;
  order?: {
    items: TOrderItem[];
    total: number;
  };
};

// =====================
// UI types
// =====================

export const ORDER_STATUS_CONFIG: Record<
  TOrderStatus,
  { label: string; color: string; bgClass: string }
> = {
  pending: {
    label: "NOUVELLE",
    color: "text-red-700",
    bgClass: "bg-red-50 border-red-200",
  },
  preparing: {
    label: "EN PREPARATION",
    color: "text-amber-700",
    bgClass: "bg-amber-50 border-amber-200",
  },
  ready: {
    label: "PRETE",
    color: "text-green-700",
    bgClass: "bg-green-50 border-green-200",
  },
  picked_up: {
    label: "RECUPEREE",
    color: "text-gray-500",
    bgClass: "bg-gray-50 border-gray-200",
  },
  cancelled: {
    label: "ANNULEE",
    color: "text-gray-400",
    bgClass: "bg-gray-50 border-gray-200",
  },
};

export const PAYMENT_STATUS_LABELS: Record<TPaymentStatus, string> = {
  pending: "En attente",
  paid: "Paye en ligne",
  pay_on_pickup: "Reglement en boutique",
  refunded: "Rembourse",
};

export const CHANNEL_ICONS: Record<TCustomerChannel, string> = {
  whatsapp: "MessageCircle",
  instagram: "Camera",
  widget: "Globe",
};
