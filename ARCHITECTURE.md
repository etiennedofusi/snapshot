# Architecture Technique — SnapShop

**Stack** : Next.js 14 (App Router) + Supabase + Stripe + Twilio + Claude AI

---

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTS FINAUX                       │
│  WhatsApp  │  Instagram DM  │  Widget Web (iframe)       │
└─────┬──────┴───────┬────────┴──────────┬─────────────────┘
      │              │                   │
      ▼              ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                   API LAYER (Next.js)                    │
│  /api/webhook/whatsapp                                   │
│  /api/webhook/instagram                                  │
│  /api/widget/chat                                        │
│  /api/orders/*                                           │
│  /api/stripe/*                                           │
└─────────────────────┬───────────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐
    │ Claude  │  │ Supabase│  │ Stripe  │
    │   AI    │  │  (DB +  │  │(Payment │
    │(Sonnet) │  │Realtime)│  │Billing) │
    └─────────┘  └─────────┘  └─────────┘
                      │
                      ▼
              ┌───────────────┐
              │  DASHBOARD    │
              │  Commerçant   │
              │  (Next.js)    │
              └───────────────┘
```

---

## Stack Technique

### Frontend
- **Framework** : Next.js 14 (App Router)
- **UI** : Tailwind CSS + shadcn/ui (composants)
- **State** : Zustand (état local) + Supabase Realtime (temps réel)
- **Animations** : Framer Motion
- **Formulaires** : React Hook Form + Zod

### Backend
- **Runtime** : Next.js API Routes (Edge Functions pour les webhooks)
- **Base de données** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth (magic link pour commerçants)
- **Realtime** : Supabase Realtime (commandes temps réel)
- **File storage** : Supabase Storage (photos produits)

### Services Tiers
- **IA conversationnelle** : Claude API (claude-sonnet-4)
- **WhatsApp** : Twilio WhatsApp Business API
- **Instagram** : Meta Graph API (Instagram Messaging)
- **Paiement** : Stripe (Payment Links + Billing pour abonnements)
- **Notifications** : Twilio SMS + WhatsApp
- **Impression** : API Web Print (80mm thermique, compatible ESC/POS)

### Infrastructure
- **Hébergement** : Vercel (Next.js) + Supabase Cloud (eu-west)
- **CDN** : Vercel Edge Network
- **Monitoring** : Sentry + Vercel Analytics

---

## Structure du Projet

```
snapshop/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── onboarding/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── orders/page.tsx          ← Page principale commandes
│   │   ├── catalog/page.tsx         ← Gestion produits
│   │   ├── analytics/page.tsx       ← KPIs
│   │   └── settings/page.tsx        ← Config boutique + canaux
│   ├── widget/
│   │   └── [shopId]/page.tsx        ← Widget embeddable (iframe)
│   └── api/
│       ├── webhook/
│       │   ├── whatsapp/route.ts
│       │   └── instagram/route.ts
│       ├── chat/route.ts            ← Conversation IA
│       ├── orders/
│       │   ├── route.ts             ← GET/POST orders
│       │   └── [id]/route.ts        ← PATCH order status
│       └── stripe/
│           ├── webhook/route.ts
│           └── checkout/route.ts
├── components/
│   ├── dashboard/
│   │   ├── OrderCard.tsx            ← Carte commande (UI principale)
│   │   ├── OrderBoard.tsx           ← Board temps réel
│   │   ├── KPIWidget.tsx
│   │   └── PrintTicket.tsx
│   ├── catalog/
│   │   ├── ProductCard.tsx
│   │   └── ProductForm.tsx
│   └── widget/
│       └── ChatWidget.tsx           ← Widget client
├── lib/
│   ├── ai/
│   │   ├── bot.ts                   ← Logique Claude AI
│   │   └── prompts.ts               ← System prompts par boutique
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── stripe/
│   │   └── client.ts
│   └── twilio/
│       └── client.ts
├── types/
│   └── index.ts
└── supabase/
    └── migrations/
        └── 001_initial.sql
```

---

## Schéma Base de Données

```sql
-- Boutiques
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,          -- ex: boulangerie-marie
  owner_id UUID REFERENCES auth.users,
  phone TEXT,
  address TEXT,
  instagram_account_id TEXT,
  whatsapp_number TEXT,
  stripe_account_id TEXT,             -- Stripe Connect
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'starter',        -- starter | pro | enterprise
  commission_rate DECIMAL DEFAULT 0.015,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',        -- welcome_msg, opening_hours, etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Produits
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  photo_url TEXT,
  is_available BOOLEAN DEFAULT true,
  category TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Commandes
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops ON DELETE CASCADE,
  order_number SERIAL,                -- Numéro lisible : #42
  customer_name TEXT,
  customer_phone TEXT,
  customer_channel TEXT,              -- whatsapp | instagram | widget
  items JSONB NOT NULL,               -- [{product_id, name, qty, price}]
  subtotal DECIMAL(10,2),
  total DECIMAL(10,2),
  status TEXT DEFAULT 'pending',      -- pending | preparing | ready | picked_up | cancelled
  payment_status TEXT DEFAULT 'pending', -- pending | paid | pay_on_pickup
  stripe_payment_intent_id TEXT,
  stripe_payment_link_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  ready_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ
);

-- Sessions de conversation IA (contexte)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops,
  customer_phone TEXT,
  channel TEXT,
  messages JSONB DEFAULT '[]',        -- Historique pour Claude
  order_id UUID REFERENCES orders,
  last_activity TIMESTAMPTZ DEFAULT now()
);

-- Activer Realtime sur orders
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

---

## Logique IA Conversationnelle

### System Prompt (par boutique)
```typescript
const systemPrompt = (shop: Shop, products: Product[]) => `
Tu es l'assistant de commande de ${shop.name}.
Tu aides les clients à passer leur commande en click & collect.

CATALOGUE DISPONIBLE :
${products.filter(p => p.is_available).map(p => 
  `- ${p.name} : ${p.price}€`
).join('\n')}

RÈGLES :
1. Sois chaleureux et bref (c'est WhatsApp, pas un email)
2. Confirme toujours la commande avant de finaliser
3. Propose le paiement en ligne quand la commande est confirmée
4. Si le client demande quelque chose hors catalogue, excuse-toi poliment
5. Réponds TOUJOURS en JSON structuré avec ce format :
{
  "message": "ton message pour le client",
  "action": null | "create_order" | "request_payment" | "confirm_pickup",
  "order": null | { items: [...], total: number }
}

Langue : adapte-toi à la langue du client.
`;
```

---

## API Clés

### POST /api/webhook/whatsapp
```typescript
// Reçoit les messages WhatsApp Twilio
// → Récupère la conversation existante
// → Appelle Claude avec l'historique
// → Parse la réponse JSON
// → Si action = "create_order" → crée en DB
// → Si action = "request_payment" → génère Stripe Payment Link
// → Répond au client via Twilio
```

### PATCH /api/orders/[id]
```typescript
// { status: "ready" }
// → Met à jour en DB
// → Envoie notification WhatsApp/SMS au client
// → Supabase Realtime notifie le dashboard
```

---

## Variables d'Environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Claude AI
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=

# Meta (Instagram)
META_APP_SECRET=
META_VERIFY_TOKEN=
META_PAGE_ACCESS_TOKEN=
```

---

## Plan de Déploiement

### Phase 1 — MVP (6 semaines)
- [ ] Auth + Onboarding commerçant
- [ ] Catalogue produits (CRUD)
- [ ] Widget Web + Chat IA
- [ ] Dashboard commandes (temps réel)
- [ ] Stripe paiement + abonnement

### Phase 2 — Canaux (4 semaines)
- [ ] WhatsApp Bot (Twilio)
- [ ] Instagram DM Bot
- [ ] Impression ticket thermique
- [ ] Notifications client "prêt"

### Phase 3 — Growth (ongoing)
- [ ] Dashboard KPIs avancés
- [ ] Multi-boutiques
- [ ] App mobile PWA
- [ ] Intégration caisse (optionnelle)
