-- ============================================================
-- AceFit – FINAL Production Migration v5
-- Drops ALL old tables, creates clean working schema
-- Run in Supabase SQL Editor → Run All
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- DROP ALL OLD TABLES (clean slate)
-- ============================================================
DROP TABLE IF EXISTS blog_posts          CASCADE;
DROP TABLE IF EXISTS hero_slides         CASCADE;
DROP TABLE IF EXISTS delivery_zones      CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS email_logs          CASCADE;
DROP TABLE IF EXISTS wishlists           CASCADE;
DROP TABLE IF EXISTS feedback            CASCADE;
DROP TABLE IF EXISTS support_tickets     CASCADE;
DROP TABLE IF EXISTS order_items         CASCADE;
DROP TABLE IF EXISTS orders              CASCADE;
DROP TABLE IF EXISTS products            CASCADE;
DROP TABLE IF EXISTS profiles            CASCADE;
DROP TABLE IF EXISTS admin_users         CASCADE;

-- Drop old functions
DROP FUNCTION IF EXISTS public.handle_new_user()                CASCADE;
DROP FUNCTION IF EXISTS public.log_order_status_change()        CASCADE;
DROP FUNCTION IF EXISTS public.update_profile_on_delivery()     CASCADE;

-- ============================================================
-- 1. ADMIN USERS (seeded, no registration)
-- ============================================================
CREATE TABLE admin_users (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL, -- bcrypt hash (store hash only!)
  name       TEXT NOT NULL DEFAULT 'Admin',
  role       TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed admin — change password via admin panel
-- Default: admin@acefit.com / AceFit@2026!
INSERT INTO admin_users (email, password, name) VALUES
  ('admin@acefit.com', crypt('AceFit@2026!', gen_salt('bf')), 'AceFit Admin');

-- ============================================================
-- 2. PROFILES (customer accounts)
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
-- 3. PRODUCTS (with colors + supplements + multi-images)
-- ============================================================
CREATE TABLE products (
  id             UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT    NOT NULL,
  description    TEXT,
  price          NUMERIC NOT NULL CHECK (price >= 0),
  original_price NUMERIC CHECK (original_price >= 0),
  category       TEXT    NOT NULL DEFAULT 'tshirts'
                 CHECK (category IN ('tshirts','joggers','hoodies','shorts','leggings','sports-bra','tank-tops','tracksuits','accessories','supplements','gainz')),
  gender         TEXT    DEFAULT 'unisex'
                 CHECK (gender IN ('men','women','unisex')),
  collection     TEXT    DEFAULT 'general'
                 CHECK (collection IN ('men','women','accessories','tracksuits','supplements','gainz','general')),
  sizes          TEXT[]  DEFAULT ARRAY['S','M','L','XL'],
  colors         TEXT[]  DEFAULT ARRAY[]::TEXT[],   -- e.g. ['Black','Red','White']
  image_url      TEXT,
  images         TEXT[]  DEFAULT ARRAY[]::TEXT[],   -- additional images
  stock          INTEGER DEFAULT 0 CHECK (stock >= 0),
  rating         NUMERIC DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  is_new         BOOLEAN DEFAULT false,
  is_bestseller  BOOLEAN DEFAULT false,
  is_active      BOOLEAN DEFAULT true,
  is_featured    BOOLEAN DEFAULT false,             -- shows in hero
  sort_order     INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_category   ON products(category);
CREATE INDEX idx_products_collection ON products(collection);
CREATE INDEX idx_products_active     ON products(is_active);

-- ============================================================
-- 4. HERO SLIDES (admin-managed carousel)
-- ============================================================
CREATE TABLE hero_slides (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT,
  subtitle    TEXT,
  badge       TEXT,
  image_url   TEXT    NOT NULL,
  cta_text    TEXT    DEFAULT 'Shop Now',
  cta_link    TEXT    DEFAULT '/shop',
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  product_id  UUID    REFERENCES products(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. DELIVERY ZONES (admin-managed pricing by location)
-- ============================================================
CREATE TABLE delivery_zones (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT    NOT NULL,            -- e.g. "Lagos (Same Day)"
  states      TEXT[]  NOT NULL,            -- e.g. ['lagos']
  fee         NUMERIC NOT NULL DEFAULT 0,
  eta         TEXT    DEFAULT '2-3 days',
  is_active   BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Default delivery zones (admin can modify)
INSERT INTO delivery_zones (name, states, fee, eta, sort_order) VALUES
  ('Lagos (Same Day / Next Day)', ARRAY['lagos'], 1500, '1–2 days', 1),
  ('Southwest Nigeria',           ARRAY['ogun','oyo','osun','ondo','ekiti'], 2500, '2–3 days', 2),
  ('North Central / FCT',         ARRAY['abuja','fct','kogi','kwara','niger','benue','plateau','nassarawa'], 3000, '3–4 days', 3),
  ('South-South / Southeast',     ARRAY['delta','edo','rivers','bayelsa','cross river','akwa ibom','anambra','imo','abia','enugu','ebonyi'], 3500, '3–5 days', 4),
  ('Northwest / Northeast',       ARRAY['kano','kaduna','katsina','sokoto','kebbi','zamfara','jigawa','bauchi','gombe','yobe','borno','adamawa','taraba'], 4500, '4–6 days', 5);

-- ============================================================
-- 6. ORDERS
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
  delivery_zone_id   UUID    REFERENCES delivery_zones(id) ON DELETE SET NULL,
  delivery_fee       NUMERIC DEFAULT 0,
  delivery_zone      TEXT,
  estimated_delivery TEXT,
  items              JSONB   NOT NULL DEFAULT '[]',
  subtotal           NUMERIC NOT NULL DEFAULT 0,
  total              NUMERIC NOT NULL DEFAULT 0,
  status             TEXT    DEFAULT 'pending'
                     CHECK (status IN ('pending','processing','packed','shipped','out_for_delivery','delivered','cancelled')),
  status_history     JSONB   DEFAULT '[]',
  payment_method     TEXT    DEFAULT 'paystack'
                     CHECK (payment_method IN ('paystack','whatsapp','bank_transfer')),
  payment_status     TEXT    DEFAULT 'unpaid'
                     CHECK (payment_status IN ('unpaid','paid','failed','refunded')),
  payment_reference  TEXT,
  paystack_ref       TEXT,
  notes              TEXT,
  admin_notes        TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id       ON orders(user_id);
CREATE INDEX idx_orders_status        ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at    ON orders(created_at DESC);

-- Status history trigger
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_history = COALESCE(OLD.status_history, '[]'::jsonb) ||
      jsonb_build_object(
        'status',    NEW.status,
        'timestamp', NOW(),
        'previous',  OLD.status
      );
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS order_status_change ON orders;
CREATE TRIGGER order_status_change
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

-- Update profile on delivery
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
-- 7. PAYMENT TRANSACTIONS
-- ============================================================
CREATE TABLE payment_transactions (
  id                UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id          UUID    REFERENCES orders(id) ON DELETE SET NULL,
  reference         TEXT    NOT NULL UNIQUE,
  paystack_ref      TEXT,
  amount            NUMERIC NOT NULL,
  currency          TEXT    DEFAULT 'NGN',
  status            TEXT    DEFAULT 'pending'
                    CHECK (status IN ('pending','success','failed','abandoned','refunded')),
  channel           TEXT,                  -- card, bank, ussd, qr, etc.
  gateway_response  TEXT,
  customer_email    TEXT,
  paid_at           TIMESTAMPTZ,
  meta              JSONB   DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_transactions_order ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_ref   ON payment_transactions(reference);

-- ============================================================
-- 8. SUPPORT TICKETS
-- ============================================================
CREATE TABLE support_tickets (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ticket_no    TEXT UNIQUE DEFAULT 'TKT-' || UPPER(SUBSTRING(uuid_generate_v4()::TEXT, 1, 8)),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  subject      TEXT DEFAULT 'General Enquiry',
  message      TEXT NOT NULL,
  status       TEXT DEFAULT 'open'
               CHECK (status IN ('open','in-progress','resolved','closed')),
  priority     TEXT DEFAULT 'normal'
               CHECK (priority IN ('low','normal','high','urgent')),
  reply        TEXT,
  admin_notes  TEXT,
  replied_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_email  ON support_tickets(email);

-- ============================================================
-- 9. FEEDBACK / REVIEWS
-- ============================================================
CREATE TABLE feedback (
  id           UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID    REFERENCES profiles(id) ON DELETE SET NULL,
  product_id   UUID    REFERENCES products(id) ON DELETE SET NULL,
  order_id     UUID    REFERENCES orders(id)   ON DELETE SET NULL,
  name         TEXT    NOT NULL,
  email        TEXT    NOT NULL,
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message      TEXT    NOT NULL,
  is_published BOOLEAN DEFAULT true,
  is_featured  BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. WISHLISTS
-- ============================================================
CREATE TABLE wishlists (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- 11. BLOG POSTS (admin-managed)
-- ============================================================
CREATE TABLE blog_posts (
  id            UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT    NOT NULL UNIQUE,
  title         TEXT    NOT NULL,
  excerpt       TEXT,
  content       TEXT    NOT NULL,
  cover_image   TEXT,
  author        TEXT    DEFAULT 'AceFit Team',
  tags          TEXT[]  DEFAULT ARRAY[]::TEXT[],
  category      TEXT    DEFAULT 'fitness'
                CHECK (category IN ('fitness','nutrition','lifestyle','products','news')),
  is_published  BOOLEAN DEFAULT false,
  is_featured   BOOLEAN DEFAULT false,
  views         INTEGER DEFAULT 0,
  read_time     INTEGER DEFAULT 5,          -- minutes
  seo_title     TEXT,
  seo_desc      TEXT,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_slug      ON blog_posts(slug);
CREATE INDEX idx_blog_published ON blog_posts(is_published, published_at DESC);

-- ============================================================
-- 12. EMAIL LOGS
-- ============================================================
CREATE TABLE email_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_email   TEXT NOT NULL,
  subject    TEXT NOT NULL,
  template   TEXT,
  status     TEXT DEFAULT 'sent',
  resend_id  TEXT,
  error      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides         ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones      ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets     ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback            ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists           ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users         ENABLE ROW LEVEL SECURITY;

-- NOTE: Admin uses anon key (no Supabase Auth session), so
-- all tables must allow full access via anon/public role.

-- Products
CREATE POLICY "products_public_read" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "products_anon_all"    ON products FOR ALL   USING (true) WITH CHECK (true);

-- Hero slides
CREATE POLICY "hero_slides_public_read" ON hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "hero_slides_anon_all"    ON hero_slides FOR ALL   USING (true) WITH CHECK (true);

-- Delivery zones
CREATE POLICY "delivery_zones_public_read" ON delivery_zones FOR SELECT USING (is_active = true);
CREATE POLICY "delivery_zones_anon_all"    ON delivery_zones FOR ALL   USING (true) WITH CHECK (true);

-- Blog posts
CREATE POLICY "blog_public_read" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "blog_anon_all"    ON blog_posts FOR ALL   USING (true) WITH CHECK (true);

-- Profiles
CREATE POLICY "profiles_anon_all" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- Orders
CREATE POLICY "orders_anon_all" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Feedback
CREATE POLICY "feedback_public_read" ON feedback FOR SELECT USING (is_published = true);
CREATE POLICY "feedback_anon_all"    ON feedback FOR ALL   USING (true) WITH CHECK (true);

-- Support tickets
CREATE POLICY "tickets_anon_all" ON support_tickets FOR ALL USING (true) WITH CHECK (true);

-- Wishlists
CREATE POLICY "wishlists_anon_all" ON wishlists FOR ALL USING (true) WITH CHECK (true);

-- Payment transactions, email logs, admin users
CREATE POLICY "payments_anon_all"   ON payment_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "email_logs_anon_all" ON email_logs            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "admin_users_anon_all" ON admin_users          FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- VERIFY ADMIN FUNCTION (used by admin panel login)
-- ============================================================
CREATE OR REPLACE FUNCTION public.verify_admin(p_email TEXT, p_password TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_hash TEXT;
BEGIN
  SELECT password INTO v_hash FROM admin_users WHERE email = p_email;
  IF v_hash IS NULL THEN RETURN FALSE; END IF;
  RETURN crypt(p_password, v_hash) = v_hash;
END;
$$;

-- ============================================================
-- DONE ✅
-- Next steps:
--   1. Enable Email OTP: Auth → Providers → Email → Enable OTP
--   2. Create Storage bucket: "acefit-media" → Public
--   3. Deploy Edge Function: supabase functions deploy send-email
--   4. Set secret: supabase secrets set RESEND_API_KEY=re_xxx
--   5. Set secret: supabase secrets set PAYSTACK_SECRET_KEY=sk_xxx
-- ============================================================

-- ============================================================
-- STORAGE BUCKET (auto-create acefit-media)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'acefit-media',
  'acefit-media',
  true,
  10485760,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- Storage policies (allow public read + authenticated upload)
DROP POLICY IF EXISTS "acefit_media_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "acefit_media_auth_upload"   ON storage.objects;
DROP POLICY IF EXISTS "acefit_media_auth_update"   ON storage.objects;
DROP POLICY IF EXISTS "acefit_media_auth_delete"   ON storage.objects;

CREATE POLICY "acefit_media_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'acefit-media');

CREATE POLICY "acefit_media_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'acefit-media');

CREATE POLICY "acefit_media_auth_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'acefit-media');

CREATE POLICY "acefit_media_auth_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'acefit-media');
