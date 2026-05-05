-- ============================================================
-- AceFit Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================== PROFILES =====================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  total_spent NUMERIC DEFAULT 0,
  orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===================== PRODUCTS =====================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  category TEXT NOT NULL DEFAULT 'tshirts',
  gender TEXT DEFAULT 'unisex' CHECK (gender IN ('men','women','unisex')),
  sizes TEXT[] DEFAULT ARRAY['S','M','L','XL'],
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 4.5,
  is_new BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== ORDERS =====================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  payment_method TEXT DEFAULT 'whatsapp' CHECK (payment_method IN ('whatsapp','opay','bank_transfer')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','failed','refunded')),
  payment_reference TEXT,
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== SUPPORT TICKETS =====================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in-progress','resolved','closed')),
  reply TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== FEEDBACK =====================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message TEXT NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== WISHLIST =====================
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ===================== ROW LEVEL SECURITY =====================

-- Profiles: users see/edit own profile, admin sees all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Products: public read, admin write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly readable" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage products" ON products FOR ALL USING (auth.role() = 'service_role');

-- Orders: users see own, admin sees all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manages orders" ON orders FOR ALL USING (auth.role() = 'service_role');

-- Support tickets: public insert, own read
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create tickets" ON support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Feedback: public insert and read
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit feedback" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Published feedback is public" ON feedback FOR SELECT USING (is_published = true);

-- Wishlists: user-owned
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wishlist" ON wishlists FOR ALL USING (auth.uid() = user_id);

-- ===================== STORAGE =====================
-- Run in Storage settings or via this SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
-- CREATE POLICY "Public product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
-- CREATE POLICY "Admin can upload images" ON storage.objects FOR INSERT USING (bucket_id = 'product-images');

-- ===================== SEED DEMO PRODUCTS =====================
INSERT INTO products (name, description, price, original_price, category, gender, sizes, image_url, stock, rating, is_new, is_bestseller)
VALUES
  ('AceFit Pro Performance Tee', 'Moisture-wicking performance tee engineered for intense workouts. Ultra-breathable fabric with 4-way stretch.', 8500, 12000, 'tshirts', 'men', ARRAY['S','M','L','XL','XXL'], 'https://i.imgur.com/YmQ8fjQ.png', 15, 4.9, true, true),
  ('AceFit Power Joggers', 'Lightweight tapered joggers with zip pockets and elastic waistband. Perfect for training or casual wear.', 15000, NULL, 'joggers', 'men', ARRAY['S','M','L','XL'], 'https://i.imgur.com/ZuwUZkF.png', 8, 4.7, false, false),
  ('AceFit Women''s Sculpt Leggings', 'High-waist sculpting leggings with compression fit and sweat-wicking technology. Squat-proof.', 12500, 16000, 'leggings', 'women', ARRAY['XS','S','M','L','XL'], 'https://i.imgur.com/ZuwUZkF.png', 20, 5.0, true, false),
  ('AceFit Flex Hoodie', 'Premium cotton-blend hoodie with kangaroo pocket. Great for pre and post workout sessions.', 18000, NULL, 'hoodies', 'unisex', ARRAY['S','M','L','XL','XXL'], 'https://i.imgur.com/YmQ8fjQ.png', 12, 4.8, false, true),
  ('AceFit Sports Bra Pro', 'High-impact sports bra with maximum support and moisture-wicking lining. Built for all workout types.', 7500, NULL, 'sports-bra', 'women', ARRAY['XS','S','M','L','XL'], 'https://i.imgur.com/ZuwUZkF.png', 25, 4.8, false, false),
  ('AceFit Gym Shorts', '4-way stretch shorts for full range of motion. Lightweight with built-in liner.', 9000, 11000, 'shorts', 'men', ARRAY['S','M','L','XL','XXL'], 'https://i.imgur.com/YmQ8fjQ.png', 0, 4.6, false, false),
  ('AceFit Tank Top', 'Ultra-breathable mesh-panel tank top for maximum airflow during high-intensity sessions.', 6500, NULL, 'tank-tops', 'unisex', ARRAY['S','M','L','XL'], 'https://i.imgur.com/YmQ8fjQ.png', 30, 4.5, false, false),
  ('AceFit Tracksuit Set', 'Complete 2-piece training set for the serious athlete. Premium stretch fabric with tapered fit.', 28000, 35000, 'tracksuits', 'men', ARRAY['S','M','L','XL','XXL'], 'https://i.imgur.com/ZuwUZkF.png', 6, 4.9, false, true)
ON CONFLICT DO NOTHING;
