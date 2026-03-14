import { DEMO_PRODUCTS } from "./data";
import type { TOrderItem } from "@/types";

type ProductImage = {
  url: string;
  name: string;
  price: number;
};

type DemoState = {
  step: "welcome" | "browsing" | "ordering" | "confirm" | "payment" | "done";
  items: TOrderItem[];
};

const state: DemoState = {
  step: "welcome",
  items: [],
};

const available = DEMO_PRODUCTS.filter((p) => p.is_available);

function formatMenu(): string {
  const cats = new Map<string, typeof available>();
  available.forEach((p) => {
    const cat = p.category || "Autres";
    if (!cats.has(cat)) cats.set(cat, []);
    cats.get(cat)!.push(p);
  });

  let menu = "";
  cats.forEach((prods, cat) => {
    menu += `\n*${cat}*\n`;
    prods.forEach((p) => {
      menu += `  ${p.name} — ${p.price.toFixed(2)}€\n`;
    });
  });
  return menu.trim();
}

function getMenuImages(): ProductImage[] {
  // Show a selection of hero products with images
  return available
    .filter((p) => p.photo_url)
    .slice(0, 4)
    .map((p) => ({
      url: p.photo_url!,
      name: p.name,
      price: p.price,
    }));
}

function getProductImage(productId: string): ProductImage | null {
  const p = DEMO_PRODUCTS.find((prod) => prod.id === productId);
  if (!p || !p.photo_url) return null;
  return { url: p.photo_url, name: p.name, price: p.price };
}

function findProduct(text: string) {
  const lower = text.toLowerCase();
  return available.find(
    (p) =>
      lower.includes(p.name.toLowerCase()) ||
      p.name
        .toLowerCase()
        .split(" ")
        .some((word) => word.length > 3 && lower.includes(word))
  );
}

function parseQty(text: string): number {
  const match = text.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

function orderTotal(items: TOrderItem[]): number {
  return items.reduce((sum, i) => sum + i.subtotal, 0);
}

function formatOrderSummary(items: TOrderItem[]): string {
  let summary = "";
  items.forEach((i) => {
    summary += `${i.qty}x ${i.name} — ${i.subtotal.toFixed(2)}€\n`;
  });
  summary += `\nTotal : ${orderTotal(items).toFixed(2)}€`;
  return summary;
}

type DemoChatResponse = {
  message: string;
  order?: { items: TOrderItem[]; total: number } | null;
  paymentUrl?: string | null;
  action?: string | null;
  images?: ProductImage[] | null;
};

export function demoChatReply(userMessage: string): DemoChatResponse {
  const text = userMessage.toLowerCase().trim();

  // Greetings
  if (
    state.step === "welcome" &&
    (text.includes("bonjour") ||
      text.includes("salut") ||
      text.includes("hello") ||
      text.includes("hey") ||
      text.includes("coucou") ||
      text.length < 15)
  ) {
    state.step = "browsing";
    return {
      message:
        'Bonjour ! Bienvenue a la Boulangerie Marie 🥐\n\nQue souhaitez-vous commander ?\nTapez "menu" pour voir nos produits.',
      images: getMenuImages(),
    };
  }

  // Show menu
  if (text.includes("menu") || text.includes("carte") || text.includes("produit") || text.includes("quoi") || text.includes("proposez")) {
    state.step = "browsing";
    // Show all products with images
    const allImages = available
      .filter((p) => p.photo_url)
      .map((p) => ({
        url: p.photo_url!,
        name: p.name,
        price: p.price,
      }));
    return {
      message: `Voici notre carte :\n\n${formatMenu()}\n\nDites-moi ce qui vous fait envie !`,
      action: "show_menu",
      images: allImages.slice(0, 6),
    };
  }

  // Add to order
  const product = findProduct(text);
  if (product) {
    const qty = parseQty(text);
    const existing = state.items.find((i) => i.product_id === product.id);

    if (existing) {
      existing.qty += qty;
      existing.subtotal = existing.qty * existing.unit_price;
    } else {
      state.items.push({
        product_id: product.id,
        name: product.name,
        qty,
        unit_price: product.price,
        subtotal: qty * product.price,
      });
    }

    state.step = "ordering";
    const total = orderTotal(state.items);
    const productImg = getProductImage(product.id);

    return {
      message: `${qty}x ${product.name} ajoute ! (${(qty * product.price).toFixed(2)}€)\n\nVotre commande :\n${formatOrderSummary(state.items)}\n\nAutre chose, ou je valide la commande ?`,
      order: { items: [...state.items], total },
      images: productImg ? [productImg] : null,
    };
  }

  // Validate order
  if (
    state.items.length > 0 &&
    (text.includes("valide") ||
      text.includes("confirme") ||
      text.includes("ok") ||
      text.includes("c'est tout") ||
      text.includes("c est tout") ||
      text.includes("rien d'autre") ||
      text.includes("non merci") ||
      text.includes("commander") ||
      text.includes("fini") ||
      text.includes("terminer"))
  ) {
    state.step = "payment";
    const total = orderTotal(state.items);
    return {
      message: `Parfait ! Votre commande de ${total.toFixed(2)}€ :\n\n${formatOrderSummary(state.items)}\n\nComment souhaitez-vous payer ?\n\n1️⃣  Payer en ligne (carte bancaire)\n2️⃣  Payer en boutique (a la recuperation)`,
      order: { items: [...state.items], total },
      action: "create_order",
    };
  }

  // Payment choice — online
  if (
    state.step === "payment" &&
    (text.includes("en ligne") || text.includes("carte") || text.includes("1") || text.includes("cb"))
  ) {
    state.step = "done";
    const total = orderTotal(state.items);
    const items = [...state.items];
    state.items = [];

    return {
      message: `Commande #42 confirmee !\n\nCliquez ci-dessous pour payer ${total.toFixed(2)}€ par carte.\n\nVous recevrez une notification WhatsApp des que votre commande sera prete. A tout de suite ! 🙌`,
      order: { items, total },
      paymentUrl: "#demo-payment",
      action: "request_payment",
    };
  }

  // Payment choice — on pickup
  if (
    state.step === "payment" &&
    (text.includes("boutique") || text.includes("place") || text.includes("2") || text.includes("recup") || text.includes("sur place"))
  ) {
    state.step = "done";
    const total = orderTotal(state.items);
    const items = [...state.items];
    state.items = [];

    return {
      message: `Commande #42 confirmee !\n\nVous reglerez ${total.toFixed(2)}€ directement en boutique a la recuperation.\n\nNous vous prevenons sur WhatsApp des que c'est pret. A tout de suite ! 🙌`,
      order: { items, total },
    };
  }

  // Reset after done
  if (state.step === "done") {
    state.step = "welcome";
    state.items = [];
    return {
      message:
        "Merci pour votre commande ! Si vous souhaitez passer une nouvelle commande, je suis la. 😊",
    };
  }

  // Fallback
  if (state.items.length > 0) {
    return {
      message: `Je n'ai pas compris. Votre commande en cours :\n${formatOrderSummary(state.items)}\n\nVous pouvez ajouter un produit, ou taper "valider" pour confirmer.`,
      order: { items: [...state.items], total: orderTotal(state.items) },
    };
  }

  state.step = "browsing";
  return {
    message:
      'Je n\'ai pas bien compris. Tapez "menu" pour voir nos produits, ou dites-moi directement ce que vous souhaitez (ex: "2 croissants et un cafe"). 😊',
  };
}
