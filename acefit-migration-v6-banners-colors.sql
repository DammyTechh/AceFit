-- ============================================================
--  AceFit migration v6
--  Adds:  1) banners table (admin-managed promo banners)
--         2) products.color_images (per-color preview images)
--  Safe to run on an existing v5 database — all statements are idempotent.
-- ============================================================

-- 1) Per-color preview images ---------------------------------
--    Shape: { "Blue": "https://.../blue.jpg", "Red": "https://.../red.jpg" }
--    Keys are the exact color names already stored in products.colors[].
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS color_images JSONB DEFAULT '{}'::jsonb;

-- 2) Banners --------------------------------------------------
CREATE TABLE IF NOT EXISTS banners (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT,
  subtitle    TEXT,
  image_url   TEXT    NOT NULL,
  link        TEXT    DEFAULT '',        -- optional click-through URL
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Mirror the hero_slides policy pattern
DROP POLICY IF EXISTS "banners_public_read" ON banners;
DROP POLICY IF EXISTS "banners_anon_all"    ON banners;
CREATE POLICY "banners_public_read" ON banners FOR SELECT USING (is_active = true);
CREATE POLICY "banners_anon_all"    ON banners FOR ALL   USING (true) WITH CHECK (true);

-- Optional starter row (comment out if you don't want a demo banner)
INSERT INTO banners (title, subtitle, image_url, sort_order, is_active)
SELECT 'Free delivery over ₦50,000', 'Shop the new drop and get it delivered nationwide',
       'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80', 0, true
WHERE NOT EXISTS (SELECT 1 FROM banners);
