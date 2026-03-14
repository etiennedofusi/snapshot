# CLAUDE.md — SnapShop Click & Collect SaaS

> Ce fichier est le contexte principal pour Claude Code.
> Lis-le entièrement avant de commencer à coder.

---

## 🎯 Ce qu'on construit

**SnapShop** est un SaaS de click & collect pour commerces locaux.

- **Client final** : commande via WhatsApp, Instagram DM, ou widget web en langage naturel (comme sur WhatsApp)
- **Commerçant** : reçoit les commandes sur un dashboard ultra-simple, imprime le ticket, valide
- **Nous** : on prend une commission sur les paiements + un abonnement mensuel

---

## 🚀 Stack

| Couche | Techno |
|--------|--------|
| Frontend + API | Next.js 14 (App Router) |
| Base de données | Supabase (PostgreSQL + Realtime + Auth + Storage) |
| IA | Claude API (claude-sonnet-4-20250514) |
| Paiement | Stripe (Payment Links + Billing) |
| WhatsApp | Twilio WhatsApp Business API |
| Instagram | Meta Graph API |
| Styles | Tailwind CSS + shadcn/ui |
| State | Zustand + Supabase Realtime |
| Deploy | Vercel |

---

## 📁 Structure du projet

```
snapshop/
├── app/
│   ├── (auth)/login/          ← Magic link auth
│   ├── (auth)/onboarding/     ← Setup boutique (< 10 min)
│   ├── (dashboard)/orders/    ← PAGE PRINCIPALE : commandes temps réel
│   ├── (dashboard)/catalog/   ← Gestion produits
│   ├── (dashboard)/analytics/ ← KPIs
│   ├── (dashboard)/settings/  ← Config + canaux
│   ├── widget/[shopId]/       ← Widget embeddable iframe
│   └── api/
│       ├── webhook/whatsapp/  ← Twilio webhook
│       ├── webhook/instagram/ ← Meta webhook
│       ├── chat/              ← Widget web → Claude AI
│       ├── orders/            ← CRUD orders
│       └── stripe/            ← Webhooks + checkout
├── components/
│   ├── dashboard/OrderCard.tsx    ← COMPOSANT CLEF (carte commande)
│   ├── dashboard/OrderBoard.tsx   ← Board realtime
│   ├── dashboard/KPIWidget.tsx
│   └── widget/ChatWidget.tsx
└── lib/
    ├── ai/bot.ts              ← Logique Claude AI
    ├── supabase/
    ├── stripe/
    └── twilio/
```

---

## 🎨 Principes UX — NON-NÉGOCIABLES

### Dashboard commerçant
- **Enfantin** : un commerçant de 55 ans doit comprendre sans formation
- **Mobile-first** : tablette posée en caisse (landscape 768px+)
- **Gros boutons** : les doigts touchent, pas de petits éléments
- **Couleurs claires** : vert = prêt, orange = en attente, rouge = urgent
- **Son + vibration** à chaque nouvelle commande
- **Pas de jargon** : "Nouvelle commande" pas "Incoming order"

### Carte de commande (OrderCard)
```
┌────────────────────────────────┐
│  🔴 #42 — Lucas M.      14:32  │
│  ─────────────────────────── │
│  2× Croissant            3.00€ │
│  1× Pain au chocolat     1.20€ │
│  ─────────────────────────── │
│  TOTAL : 4.20€    ✅ PAYÉ      │
│                                │
│  [🖨 Imprimer]  [✓ Prête]      │
└────────────────────────────────┘
```

### Widget client (style WhatsApp)
- Interface chat simple, bulles vertes
- Réponses courtes et naturelles
- Clavier numérique pour quantités

---

## 🤖 IA Conversationnelle

### Principe
Claude prend la commande en langage naturel. Le bot répond TOUJOURS en JSON :

```typescript
type BotResponse = {
  message: string;          // Message visible par le client
  action: 
    | null 
    | 'show_menu'
    | 'create_order'        // → créer en DB
    | 'request_payment'     // → générer Stripe link
    | 'confirm_ready';      // → notifier client
  order?: {
    items: OrderItem[];
    total: number;
  };
}
```

### System Prompt Pattern
```typescript
// lib/ai/prompts.ts
export const buildSystemPrompt = (shop: Shop, products: Product[]) => `
Tu es l'assistant de ${shop.name}. Aide les clients à commander en click & collect.
Réponds TOUJOURS en JSON valide avec { message, action, order }.
Sois bref et chaleureux. Adapte-toi à la langue du client.
Catalogue : ${JSON.stringify(products.filter(p => p.is_available))}
`;
```

---

## 💳 Stripe

- **Paiement commande** : Stripe Payment Links (pas de redirect, link dans WhatsApp)
- **Abonnement boutique** : Stripe Billing (plans starter/pro)
- **Commission** : via Stripe Connect (transfert automatique)
- **Webhook** : `/api/stripe/webhook` → met à jour `payment_status` en DB

---

## 🗄️ Base de données — Tables clés

```sql
shops       → boutiques (owner_id, plan, stripe_*, settings JSONB)
products    → catalogue (shop_id, name, price, is_available)
orders      → commandes (status: pending→preparing→ready→picked_up)
conversations → contexte IA (messages JSONB pour Claude)
```

**Realtime activé sur `orders`** → le dashboard se met à jour instantanément.

---

## 📋 Règles de code

### Always
- TypeScript strict (`strict: true`)
- Zod pour la validation de toutes les entrées API
- `use server` / `use client` correctement positionné
- Variables d'env via `@/lib/env.ts` (valider avec Zod au démarrage)
- Gestion d'erreur systématique (try/catch + logs)

### Never
- `any` en TypeScript
- Appels directs à Supabase depuis les composants client (passer par les API routes)
- Stocker des données de carte bancaire (tout via Stripe)
- Secrets dans le code

### Conventions
- Composants : PascalCase
- Fonctions/hooks : camelCase
- Types/interfaces : PascalCase avec prefix `T` pour types (ex: `TOrder`)
- Constantes : UPPER_SNAKE_CASE
- Commits : conventional commits (`feat:`, `fix:`, `chore:`)

---

## 🔐 Sécurité

- Auth Supabase (magic link email pour commerçants)
- RLS Supabase : chaque boutique ne voit que ses données
- Webhooks validés (signature Twilio + Meta + Stripe)
- Rate limiting sur `/api/chat` (10 req/min par IP)
- CORS strict sur le widget (whitelist domaines boutique)

---

## 🖨️ Impression Ticket

```typescript
// Format ticket 80mm ESC/POS
// Utiliser la Web Print API ou window.print() avec CSS @media print
// Ticket contient : #commande, heure, items + qtés + prix, total, "CLICK & COLLECT"
```

---

## 🏁 Ordre de développement recommandé

1. **Setup** : Next.js + Supabase + Auth magic link
2. **Catalogue** : CRUD produits (simple, avec photos)
3. **Widget Web** : Chat IA (Claude) → créer commande
4. **Dashboard** : OrderBoard temps réel + OrderCard + actions
5. **Stripe** : Payment link + webhook + abonnement
6. **WhatsApp** : Twilio webhook + même logique IA
7. **Instagram** : Meta Graph API
8. **Impression** : ticket thermique
9. **KPIs** : analytics page
10. **Onboarding** : flow inscription commerçant

---

## 🧪 Testing

- Jest + React Testing Library pour composants critiques
- Tests E2E Playwright pour le flow commande complet
- Mocks pour Claude AI et Stripe en test

---

## 📦 Commandes utiles

```bash
npm run dev          # Dev local
npm run build        # Build prod
npm run test         # Tests
npm run db:migrate   # Appliquer migrations Supabase
npm run db:seed      # Données de test
npm run stripe:listen # Écouter webhooks Stripe en local
```

---

## 🌍 i18n

MVP en **français** uniquement pour le dashboard.
Le bot IA s'adapte automatiquement à la langue du client (multilingue natif via Claude).

---

## ❓ Questions fréquentes pour Claude Code

**Q : Comment tester les webhooks WhatsApp en local ?**
→ Utiliser ngrok + `twilio phone-numbers:update --sms-url=https://xxx.ngrok.io/api/webhook/whatsapp`

**Q : Comment gérer le realtime des commandes ?**
→ `supabase.channel('orders').on('postgres_changes', ...).subscribe()` dans OrderBoard.tsx

**Q : Comment le widget est-il intégré chez le commerçant ?**
→ `<iframe src="https://snapshop.app/widget/[shopId]" />` ou un script JS vanilla
