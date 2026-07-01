-- ============================================
-- ChineseMaster Storefront - Supabase Setup
-- Run this in your Supabase SQL Editor
-- ============================================

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price_cents INT NOT NULL,
  currency TEXT DEFAULT 'usd',
  cover_image_url TEXT,
  thumbnail_url TEXT,
  sample_url TEXT,
  download_url TEXT,
  category TEXT,
  level TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  creem_payment_id TEXT,
  creem_checkout_id TEXT,
  amount_cents INT NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Download access table
CREATE TABLE IF NOT EXISTS download_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_download_access_user_id ON download_access(user_id);
CREATE INDEX IF NOT EXISTS idx_download_access_product_id ON download_access(product_id);

-- Function: check if user has purchased a product
CREATE OR REPLACE FUNCTION has_purchased(p_user_id UUID, p_product_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM download_access
    WHERE user_id = p_user_id AND product_id = p_product_id
  );
END;
$$;

-- Function: get user's purchases with product details
CREATE OR REPLACE FUNCTION get_user_purchases(p_user_id UUID)
RETURNS TABLE (
  product_id UUID,
  title TEXT,
  slug TEXT,
  cover_image_url TEXT,
  category TEXT,
  level TEXT,
  purchased_at TIMESTAMPTZ,
  download_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.slug,
    p.cover_image_url,
    p.category,
    p.level,
    da.created_at,
    p.download_url
  FROM download_access da
  JOIN products p ON p.id = da.product_id
  WHERE da.user_id = p_user_id
  ORDER BY da.created_at DESC;
END;
$$;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_access ENABLE ROW LEVEL SECURITY;

-- Public read for active products
CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Authenticated users can read all products
CREATE POLICY "Authenticated can read all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- Users can only read their own orders
CREATE POLICY "Users read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow order insertion for authenticated users
CREATE POLICY "Allow order insertion"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only read their own download access
CREATE POLICY "Users read own download access"
  ON download_access FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow download access insertion
CREATE POLICY "Allow download access insertion"
  ON download_access FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own profile
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================
-- Seed sample products (optional)
-- ============================================
INSERT INTO products (title, slug, short_description, description, price_cents, category, level, sort_order) VALUES
('HSK 1-2 Beginner Chinese', 'hsk-1-2-beginner',
 'Perfect starting point for beginners. Covers HSK 1-2 vocabulary and grammar.',
 'Complete beginner course covering the first 300 Chinese words, pinyin, tones, and basic sentence patterns aligned with HSK 1-2 standards.',
 2999, 'HSK Prep', 'Beginner', 1),
('Business Chinese', 'business-chinese',
 'Essential Chinese for professional settings.',
 'Learn formal Chinese for business contexts: greetings, email etiquette, meeting phrases, and negotiation vocabulary.',
 4999, 'Business', 'Intermediate', 2),
('Chinese Calligraphy Basics', 'calligraphy-basics',
 'Master the art of Chinese handwriting with brush and pen.',
 'Step-by-step calligraphy course from basic strokes to full characters. Includes printable practice sheets.',
 1999, 'Culture', 'Beginner', 3),
('Daily Conversation Chinese', 'daily-conversation',
 'Speak naturally in everyday situations.',
 'Practical Chinese for real-life situations: restaurants, markets, taxis, hotels, and social interactions.',
 3499, 'Conversation', 'Beginner-Intermediate', 4);
