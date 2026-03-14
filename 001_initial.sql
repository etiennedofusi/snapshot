-- SnapShop — Migration Supabase initiale
-- Exécuter dans l'éditeur SQL Supabase

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- SHOPS
-- =====================
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  phone TEXT,
  address TEXT,
  welcome_message TEXT DEFAULT 'Bonjour ! Que souhaitez-vous commander ?',
  opening_hours JSONB DEFAULT '{}',
  instagram_account_id TEXT,
  instagram_page_access_token TEXT,
  whatsapp_number TEXT,
  stripe_account_id TEXT,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  commission_rate DECIMAL(5,4) DEFAULT 0.015,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- PRODUCTS
-- =====================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  photo_url TEXT,
  category TEXT,
  is_available BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- ORDERS
-- =====================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  order_number INT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  customer_channel TEXT NOT NULL CHECK (customer_channel IN ('whatsapp', 'instagram', 'widget')),
  items JSONB NOT NULL DEFAULT '[]',
  -- items format: [{ "product_id": "uuid", "name": "Croissant", "qty": 2, "unit_price": 1.00, "subtotal": 2.00 }]
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'picked_up', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'pay_on_pickup', 'refunded')),
  stripe_payment_intent_id TEXT,
  stripe_payment_link_id TEXT,
  stripe_payment_link_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  ready_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  UNIQUE(shop_id, order_number, created_at::date)
);

-- Séquence numéro de commande par boutique par jour
CREATE OR REPLACE FUNCTION get_next_order_number(p_shop_id UUID)
RETURNS INT AS $$
DECLARE
  next_num INT;
BEGIN
  SELECT COALESCE(MAX(order_number), 0) + 1
  INTO next_num
  FROM orders
  WHERE shop_id = p_shop_id
    AND created_at::date = CURRENT_DATE;
  RETURN next_num;
END;
$$ LANGUAGE plpgsql;

-- =====================
-- CONVERSATIONS (contexte IA)
-- =====================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  customer_phone TEXT,
  customer_instagram_id TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'instagram', 'widget')),
  messages JSONB DEFAULT '[]',
  -- messages format: [{ "role": "user"|"assistant", "content": "...", "timestamp": "..." }]
  current_order_draft JSONB,
  order_id UUID REFERENCES orders(id),
  last_activity TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shop_id, customer_phone, channel)
);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX idx_orders_shop_id ON orders(shop_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_shop_date ON orders(shop_id, created_at::date);
CREATE INDEX idx_products_shop_id ON products(shop_id);
CREATE INDEX idx_conversations_shop_phone ON conversations(shop_id, customer_phone);

-- =====================
-- REALTIME
-- =====================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Shops : le propriétaire voit uniquement sa boutique
CREATE POLICY "shop_owner_access" ON shops
  FOR ALL USING (owner_id = auth.uid());

-- Products : visibles par le propriétaire de la boutique
CREATE POLICY "products_owner_access" ON products
  FOR ALL USING (
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

-- Orders : visibles par le propriétaire de la boutique
CREATE POLICY "orders_owner_access" ON orders
  FOR ALL USING (
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

-- Service role peut tout faire (pour les webhooks API)
-- (Le service role bypass RLS par défaut dans Supabase)

-- =====================
-- TRIGGERS (updated_at)
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shops_updated_at BEFORE UPDATE ON shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- SEED DATA (dev only)
-- =====================
-- À exécuter uniquement en développement
-- INSERT INTO shops (owner_id, name, slug, ...) VALUES (...);
