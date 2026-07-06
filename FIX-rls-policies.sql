-- ============================================================
-- AceFit — RLS Policy Fix
-- Run this in Supabase SQL Editor to fix all admin write errors
-- ============================================================

-- ── PRODUCTS ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "products_public_read"  ON products;
DROP POLICY IF EXISTS "products_service_all"  ON products;
DROP POLICY IF EXISTS "products_anon_all"     ON products;

-- Public can read active products
CREATE POLICY "products_public_read"
  ON products FOR SELECT
  USING (is_active = true);

-- Anyone (admin uses anon key) can do full CRUD
CREATE POLICY "products_anon_all"
  ON products FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── HERO SLIDES ───────────────────────────────────────────────
DROP POLICY IF EXISTS "hero_slides_public_read" ON hero_slides;
DROP POLICY IF EXISTS "hero_slides_service_all" ON hero_slides;
DROP POLICY IF EXISTS "hero_slides_anon_all"    ON hero_slides;

CREATE POLICY "hero_slides_public_read"
  ON hero_slides FOR SELECT
  USING (is_active = true);

CREATE POLICY "hero_slides_anon_all"
  ON hero_slides FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── DELIVERY ZONES ────────────────────────────────────────────
DROP POLICY IF EXISTS "delivery_zones_public_read" ON delivery_zones;
DROP POLICY IF EXISTS "delivery_zones_service_all" ON delivery_zones;
DROP POLICY IF EXISTS "delivery_zones_anon_all"    ON delivery_zones;

CREATE POLICY "delivery_zones_public_read"
  ON delivery_zones FOR SELECT
  USING (is_active = true);

CREATE POLICY "delivery_zones_anon_all"
  ON delivery_zones FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── BLOG POSTS ────────────────────────────────────────────────
DROP POLICY IF EXISTS "blog_public_read"   ON blog_posts;
DROP POLICY IF EXISTS "blog_service_all"   ON blog_posts;
DROP POLICY IF EXISTS "blog_anon_all"      ON blog_posts;

CREATE POLICY "blog_public_read"
  ON blog_posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "blog_anon_all"
  ON blog_posts FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── ORDERS ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "orders_own_read"    ON orders;
DROP POLICY IF EXISTS "orders_insert_any"  ON orders;
DROP POLICY IF EXISTS "orders_service_all" ON orders;
DROP POLICY IF EXISTS "orders_anon_all"    ON orders;

CREATE POLICY "orders_anon_all"
  ON orders FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── SUPPORT TICKETS ───────────────────────────────────────────
DROP POLICY IF EXISTS "tickets_insert_any"  ON support_tickets;
DROP POLICY IF EXISTS "tickets_own_read"    ON support_tickets;
DROP POLICY IF EXISTS "tickets_service_all" ON support_tickets;
DROP POLICY IF EXISTS "tickets_anon_all"    ON support_tickets;

CREATE POLICY "tickets_anon_all"
  ON support_tickets FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── FEEDBACK ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "feedback_public_read" ON feedback;
DROP POLICY IF EXISTS "feedback_insert_any"  ON feedback;
DROP POLICY IF EXISTS "feedback_service_all" ON feedback;
DROP POLICY IF EXISTS "feedback_anon_all"    ON feedback;

CREATE POLICY "feedback_public_read"
  ON feedback FOR SELECT
  USING (is_published = true);

CREATE POLICY "feedback_anon_all"
  ON feedback FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── PAYMENT TRANSACTIONS ──────────────────────────────────────
DROP POLICY IF EXISTS "payments_service_all" ON payment_transactions;
DROP POLICY IF EXISTS "payments_anon_all"    ON payment_transactions;

CREATE POLICY "payments_anon_all"
  ON payment_transactions FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── EMAIL LOGS ────────────────────────────────────────────────
DROP POLICY IF EXISTS "email_logs_service_all" ON email_logs;
DROP POLICY IF EXISTS "email_logs_anon_all"    ON email_logs;

CREATE POLICY "email_logs_anon_all"
  ON email_logs FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── ADMIN USERS ───────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_users_service_all" ON admin_users;
DROP POLICY IF EXISTS "admin_users_anon_all"    ON admin_users;

CREATE POLICY "admin_users_anon_all"
  ON admin_users FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── PROFILES ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_own"         ON profiles;
DROP POLICY IF EXISTS "profiles_service_all" ON profiles;
DROP POLICY IF EXISTS "profiles_anon_all"    ON profiles;

CREATE POLICY "profiles_anon_all"
  ON profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── WISHLISTS ────────────────────────────────────────────────
DROP POLICY IF EXISTS "wishlists_own"         ON wishlists;
DROP POLICY IF EXISTS "wishlists_service_all" ON wishlists;
DROP POLICY IF EXISTS "wishlists_anon_all"    ON wishlists;

CREATE POLICY "wishlists_anon_all"
  ON wishlists FOR ALL
  USING (true)
  WITH CHECK (true);

-- ── STORAGE POLICIES (if not already done) ───────────────────
DROP POLICY IF EXISTS "acefit_media_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "acefit_media_auth_upload"  ON storage.objects;
DROP POLICY IF EXISTS "acefit_media_auth_update"  ON storage.objects;
DROP POLICY IF EXISTS "acefit_media_auth_delete"  ON storage.objects;
DROP POLICY IF EXISTS "acefit_media_anon_all"     ON storage.objects;

CREATE POLICY "acefit_media_anon_all"
  ON storage.objects FOR ALL
  USING (bucket_id = 'acefit-media')
  WITH CHECK (bucket_id = 'acefit-media');

-- ============================================================
-- DONE ✅  All tables now allow full access via anon key
-- ============================================================
