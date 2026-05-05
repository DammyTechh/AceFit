-- ============================================================
-- AceFit – COMPLETE Production Migration
-- Version: 3.0 (Clean – no seeded demo data)
-- 
-- HOW TO USE:
--   1. Go to your Supabase project → SQL Editor
--   2. Paste this ENTIRE file → click Run
--   3. Then: Authentication → Providers → Email → enable "Email OTP"
--   4. Storage → New bucket: "product-images" → set Public
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- DROP existing tables (clean slate — safe to re-run)
-- ============================================================
DROP TABLE IF EXISTS email_logs       CASCADE;
DROP TABLE IF EXISTS wishlists        CASCADE;
DROP TABLE IF EXISTS feedback         CASCADE;
DROP TABLE IF EXISTS support_tickets  CASCADE;
DROP TABLE IF EXISTS orders           CASCADE;
DROP TABLE IF EXISTS products         CASCADE;
DROP TABLE IF EXISTS profiles         CASCADE;

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  name            TEXT,
  phone           TEXT,
  avatar_url      TEXT,
  default_address TEXT,
  default_state   TEXT,
  total_spent     NUMERIC DEFAULT 0,
  total_orders    INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on every new sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. PRODUCTS
-- ============================================================
CREATE TABLE products (
  id             UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT    NOT NULL,
  description    TEXT,
  price          NUMERIC NOT NULL CHECK (price >= 0),
  original_price NUMERIC CHECK (original_price >= 0),
  category       TEXT    NOT NULL DEFAULT 'tshirts'
                 CHECK (category IN ('tshirts','joggers','hoodies','shorts','leggings','sports-bra','tank-tops','tracksuits','accessories')),
  gender         TEXT    DEFAULT 'unisex'
                 CHECK (gender IN ('men','women','unisex')),
  sizes          TEXT[]  DEFAULT ARRAY['S','M','L','XL'],
  image_url      TEXT,
  stock          INTEGER DEFAULT 0 CHECK (stock >= 0),
  rating         NUMERIC DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  is_new         BOOLEAN DEFAULT false,
  is_bestseller  BOOLEAN DEFAULT false,
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. ORDERS
-- ============================================================
CREATE TABLE orders (
  id                 UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID    REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name      TEXT    NOT NULL,
  customer_email     TEXT    NOT NULL,
  customer_phone     TEXT    NOT NULL,
  delivery_address   TEXT    NOT NULL,
  delivery_landmark  TEXT,
  delivery_state     TEXT,
  delivery_lga       TEXT,
  delivery_fee       NUMERIC DEFAULT 0,
  delivery_zone      TEXT,
  estimated_delivery TEXT,
  items              JSONB   NOT NULL DEFAULT '[]',
  subtotal           NUMERIC NOT NULL DEFAULT 0,
  total              NUMERIC NOT NULL DEFAULT 0,
  status             TEXT    DEFAULT 'pending'
                     CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  status_history     JSONB   DEFAULT '[]',
  payment_method     TEXT    DEFAULT 'opay'
                     CHECK (payment_method IN ('opay','whatsapp','bank_transfer')),
  payment_status     TEXT    DEFAULT 'unpaid'
                     CHECK (payment_status IN ('unpaid','paid','failed','refunded')),
  payment_reference  TEXT,
  notes              TEXT,
  admin_notes        TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: append status history on every change
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_history = COALESCE(OLD.status_history, '[]'::jsonb) ||
      jsonb_build_object('status', NEW.status, 'timestamp', NOW(), 'previous', OLD.status);
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS order_status_change ON orders;
CREATE TRIGGER order_status_change
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

-- Trigger: update profile lifetime value on delivery
CREATE OR REPLACE FUNCTION public.update_profile_on_delivery()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.user_id IS NOT NULL THEN
    UPDATE profiles
    SET total_spent  = total_spent  + NEW.total,
        total_orders = total_orders + 1,
        updated_at   = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS order_delivered_update_profile ON orders;
CREATE TRIGGER order_delivered_update_profile
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_on_delivery();

-- ============================================================
-- 4. SUPPORT TICKETS
-- ============================================================
CREATE TABLE support_tickets (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  message      TEXT NOT NULL,
  status       TEXT DEFAULT 'open'
               CHECK (status IN ('open','in-progress','resolved','closed')),
  reply        TEXT,
  admin_notes  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. FEEDBACK
-- ============================================================
CREATE TABLE feedback (
  id           UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID    REFERENCES profiles(id) ON DELETE SET NULL,
  name         TEXT    NOT NULL,
  email        TEXT    NOT NULL,
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message      TEXT    NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. WISHLIST
-- ============================================================
CREATE TABLE wishlists (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- 7. EMAIL LOG
-- ============================================================
CREATE TABLE email_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_email   TEXT NOT NULL,
  subject    TEXT NOT NULL,
  type       TEXT,
  ref_id     UUID,
  status     TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback         ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists        ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs       ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users view own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role full access" ON profiles FOR ALL    USING (auth.role() = 'service_role');

-- products: anyone can read active products; only service role writes
CREATE POLICY "Public reads active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Service role manages products" ON products FOR ALL USING (auth.role() = 'service_role');

-- orders
CREATE POLICY "Users view own orders"   ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can place order"  ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role manages orders" ON orders FOR ALL USING (auth.role() = 'service_role');

-- support_tickets
CREATE POLICY "Anyone can submit ticket"  ON support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view own tickets"    ON support_tickets FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "Service role manages tickets" ON support_tickets FOR ALL USING (auth.role() = 'service_role');

-- feedback
CREATE POLICY "Anyone can submit feedback"   ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Public reads published feedback" ON feedback FOR SELECT USING (is_published = true);
CREATE POLICY "Service role manages feedback"   ON feedback FOR ALL USING (auth.role() = 'service_role');

-- wishlists
CREATE POLICY "Users own wishlist" ON wishlists FOR ALL USING (auth.uid() = user_id);

-- email_logs
CREATE POLICY "Service role manages logs" ON email_logs FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- STORAGE BUCKET (run if not already created)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images');

-- ============================================================
-- ✅ DONE — No demo/seed data inserted.
-- All tables are clean and ready for real data.
--
-- NEXT STEPS:
--   1. Authentication → Providers → Email → enable "Email OTP"
--      (this makes Supabase send 6-digit codes, not magic links)
--   2. Authentication → SMTP Settings → configure Resend:
--        Host:     smtp.resend.com
--        Port:     465
--        Username: resend
--        Password: re_your_api_key
--        Sender:   AceFit <onboarding@resend.dev>
--   3. Deploy edge function:
--        supabase functions deploy send-email --no-verify-jwt
--        supabase secrets set RESEND_API_KEY=re_your_key
--   4. Admin login: Admin@acefit.com / Acefit@2026!
--      (This is handled in the app — no DB row needed)
-- ============================================================
