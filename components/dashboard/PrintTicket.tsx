"use client";

import type { TOrder } from "@/types";

export function printTicket(order: TOrder, shopName: string) {
  const time = new Date(order.created_at).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = new Date(order.created_at).toLocaleDateString("fr-FR");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Commande #${order.order_number}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      width: 80mm;
      padding: 4mm;
      font-size: 12px;
      line-height: 1.4;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .big { font-size: 18px; }
    .huge { font-size: 24px; }
    .sep {
      border-top: 1px dashed #000;
      margin: 3mm 0;
    }
    .row {
      display: flex;
      justify-content: space-between;
    }
    .footer { margin-top: 4mm; font-size: 10px; }
  </style>
</head>
<body>
  <div class="center bold big">${shopName}</div>
  <div class="sep"></div>
  <div class="center bold huge">#${order.order_number}</div>
  <div class="center">${date} ${time}</div>
  ${order.customer_name ? `<div class="center bold">${order.customer_name}</div>` : ""}
  <div class="sep"></div>
  ${order.items
    .map(
      (item) => `
  <div class="row">
    <span>${item.qty}x ${item.name}</span>
    <span>${item.subtotal.toFixed(2)}€</span>
  </div>`
    )
    .join("")}
  <div class="sep"></div>
  <div class="row bold big">
    <span>TOTAL</span>
    <span>${order.total.toFixed(2)}€</span>
  </div>
  <div class="center" style="margin-top:2mm">
    ${order.payment_status === "paid" ? "*** PAYE EN LIGNE ***" : "A REGLER EN BOUTIQUE"}
  </div>
  <div class="sep"></div>
  <div class="center bold">CLICK & COLLECT</div>
  <div class="footer center">Merci et a bientot !</div>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=320,height=600");
  if (!printWindow) return;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}
