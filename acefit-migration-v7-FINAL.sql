-- ============================================================
--  AceFit migration v7  (supersedes v6 — safe to run instead of it)
--  Adds:
--   1) products.color_images   — per-color preview images
--   2) banners                 — optional promo banners (below products)
--   3) site_categories         — the "FIND YOUR FIT" category cards, editable in admin
--  Fully idempotent. Run once in Supabase → SQL Editor.
-- ============================================================

-- 1) Per-color preview images ---------------------------------
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS color_images JSONB DEFAULT '{}'::jsonb;

-- 2) Promo banners (optional) ---------------------------------
CREATE TABLE IF NOT EXISTS banners (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT,
  subtitle    TEXT,
  image_url   TEXT    NOT NULL,
  link        TEXT    DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "banners_public_read" ON banners;
DROP POLICY IF EXISTS "banners_anon_all"    ON banners;
CREATE POLICY "banners_public_read" ON banners FOR SELECT USING (is_active = true);
CREATE POLICY "banners_anon_all"    ON banners FOR ALL   USING (true) WITH CHECK (true);

-- 3) Category cards ("FIND YOUR FIT") -------------------------
CREATE TABLE IF NOT EXISTS site_categories (
  id          TEXT    PRIMARY KEY,          -- 'men' | 'women' | 'tracksuits' | 'accessories'
  label       TEXT    NOT NULL,
  sub         TEXT    DEFAULT '',
  image_url   TEXT,
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE site_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_categories_public_read" ON site_categories;
DROP POLICY IF EXISTS "site_categories_anon_all"    ON site_categories;
CREATE POLICY "site_categories_public_read" ON site_categories FOR SELECT USING (is_active = true);
CREATE POLICY "site_categories_anon_all"    ON site_categories FOR ALL   USING (true) WITH CHECK (true);

-- Seed the four default cards (only if the table is empty)
INSERT INTO site_categories (id, label, sub, image_url, sort_order)
SELECT * FROM (VALUES
  ('men',         'Men''s Wear',   'Tees, Joggers, Hoodies',    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=85', 0),
  ('women',       'Women''s Wear', 'Leggings, Sports Bra, Tops', 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=85', 1),
  ('tracksuits',  'Tracksuits',    'Full Sets & Matching',       'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=85', 2),
  ('accessories', 'Accessories',   'Bands, Gear & More',         'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=85', 3)
) AS v(id, label, sub, image_url, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM site_categories);
