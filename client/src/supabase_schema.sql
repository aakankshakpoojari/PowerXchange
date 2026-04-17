-- PowerXchange Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database tables

-- ============================================
-- 1. PROFILES TABLE (extends Supabase auth)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  college TEXT,
  location TEXT,
  bio TEXT,
  phone TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_college ON profiles(college);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(is_verified);

-- ============================================
-- 2. BOOKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_name TEXT,
  seller_phone TEXT,
  seller_email TEXT,
  seller_address TEXT,
  seller_city TEXT,
  seller_pincode TEXT,
  seller_college TEXT,
  seller_location TEXT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  category TEXT,
  condition TEXT,
  image_url TEXT,
  quantity INTEGER DEFAULT 1,
  is_approved BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update is_available based on quantity
CREATE OR REPLACE FUNCTION update_book_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity IS NOT NULL AND NEW.quantity = 0 THEN
    NEW.is_available = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Indexes for books
CREATE INDEX IF NOT EXISTS idx_books_seller ON books(seller_id);
CREATE INDEX IF NOT EXISTS idx_books_approved ON books(is_approved);
CREATE INDEX IF NOT EXISTS idx_books_available ON books(is_available);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_quantity ON books(quantity);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at);

-- Trigger to auto-set is_available = false when quantity = 0
DROP TRIGGER IF EXISTS trg_book_availability ON books;
CREATE TRIGGER trg_book_availability
  BEFORE INSERT OR UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_book_availability();

-- ============================================
-- 2b. BOOK_STATISTICS TABLE (for trending calculation)
-- ============================================
CREATE TABLE IF NOT EXISTS book_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE UNIQUE,
  views_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  trending_score NUMERIC DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Index for statistics
CREATE INDEX IF NOT EXISTS idx_book_stats_book ON book_statistics(book_id);
CREATE INDEX IF NOT EXISTS idx_book_stats_trending ON book_statistics(trending_score DESC);

-- Function to calculate trending score
-- Formula: (sales_count * 10) + (views_count * 0.5) + (avg_rating * sales_count) + (recent_sales_bonus)
CREATE OR REPLACE FUNCTION calculate_trending_score(
  p_sales_count INTEGER,
  p_views_count INTEGER,
  p_avg_rating NUMERIC,
  p_reviews_count INTEGER
) RETURNS NUMERIC AS $$
BEGIN
  RETURN (p_sales_count * 10) +
         (p_views_count * 0.5) +
         (p_avg_rating * p_sales_count * 2) +
         (p_reviews_count * 3);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update trending score automatically
CREATE OR REPLACE FUNCTION update_book_statistics_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.trending_score := calculate_trending_score(
    NEW.sales_count,
    NEW.views_count,
    NEW.avg_rating,
    NEW.reviews_count
  );
  NEW.last_updated := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_trending_score ON book_statistics;
CREATE TRIGGER trg_update_trending_score
  BEFORE INSERT OR UPDATE ON book_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_book_statistics_score();

-- ============================================
-- 3. TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_book ON transactions(book_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- ============================================
-- 4. ADMIN_ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  permissions JSONB DEFAULT '{"users": true, "books": true, "transactions": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for admin lookup
CREATE INDEX IF NOT EXISTS idx_admin_user_id ON admin_roles(user_id);

-- ============================================
-- 5. WISHLIST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Index for wishlist
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);

-- ============================================
-- 6. REPORTS TABLE (user reports for books/sellers)
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id UUID NOT NULL,
  report_type TEXT CHECK (report_type IN ('book', 'seller')) NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')) DEFAULT 'pending',
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for reports
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_id, report_type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported_by ON reports(reported_by);

-- ============================================
-- 7. BOOK_REVIEWS TABLE (user reviews for books)
-- ============================================
CREATE TABLE IF NOT EXISTS book_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, user_id)
);

-- Index for book reviews
CREATE INDEX IF NOT EXISTS idx_book_reviews_book ON book_reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_book_reviews_user ON book_reviews(user_id);

-- ============================================
-- 7. REVIEWS TABLE (user reviews - optional)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_book ON reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(target_user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to books
DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to transactions
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to book_reviews
DROP TRIGGER IF EXISTS update_book_reviews_updated_at ON book_reviews;
CREATE TRIGGER update_book_reviews_updated_at
  BEFORE UPDATE ON book_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to reports
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on book_statistics
ALTER TABLE book_statistics ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Books policies
CREATE POLICY "Approved books are viewable by everyone"
  ON books FOR SELECT
  USING (is_approved = true OR auth.uid() = seller_id);

CREATE POLICY "Users can insert own books"
  ON books FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own books"
  ON books FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete own books"
  ON books FOR DELETE
  USING (auth.uid() = seller_id);

-- Admin policies - allow admins full access
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all books"
  ON books FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all transactions"
  ON transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
    )
  );

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Wishlist policies
CREATE POLICY "Users can view own wishlist"
  ON wishlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wishlist"
  ON wishlist FOR ALL
  USING (auth.uid() = user_id);

-- Book Statistics policies
CREATE POLICY "Book statistics are viewable by everyone"
  ON book_statistics FOR SELECT
  USING (true);

CREATE POLICY "System can update book statistics"
  ON book_statistics FOR ALL
  USING (true);

-- Reports policies
CREATE POLICY "Reports are viewable by admins only"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete reports"
  ON reports FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
    )
  );

-- Book Reviews policies
CREATE POLICY "Book reviews are viewable by everyone"
  ON book_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own book reviews"
  ON book_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own book reviews"
  ON book_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own book reviews"
  ON book_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS FOR STATISTICS
-- ============================================

-- Function to increment book view count
CREATE OR REPLACE FUNCTION increment_book_view(p_book_id UUID)
RETURNS void AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM book_statistics WHERE book_id = p_book_id) INTO v_exists;

  IF v_exists THEN
    UPDATE book_statistics
    SET views_count = views_count + 1
    WHERE book_id = p_book_id;
  ELSE
    INSERT INTO book_statistics (book_id, views_count, sales_count, avg_rating, reviews_count)
    VALUES (p_book_id, 1, 0, 0, 0);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment book sales count
CREATE OR REPLACE FUNCTION increment_book_sales(p_book_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO book_statistics (book_id, sales_count, views_count, avg_rating, reviews_count)
  VALUES (p_book_id, 1, 0, 0, 0)
  ON CONFLICT (book_id) DO UPDATE
  SET sales_count = book_statistics.sales_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync avg_rating and reviews_count into book_statistics
-- Called from the app after any review insert/update/delete
CREATE OR REPLACE FUNCTION sync_book_rating(p_book_id UUID)
RETURNS void AS $$
DECLARE
  v_avg_rating NUMERIC(3,2);
  v_reviews_count INTEGER;
BEGIN
  SELECT
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO v_avg_rating, v_reviews_count
  FROM book_reviews
  WHERE book_id = p_book_id;

  INSERT INTO book_statistics (book_id, avg_rating, reviews_count, views_count, sales_count)
  VALUES (p_book_id, v_avg_rating, v_reviews_count, 0, 0)
  ON CONFLICT (book_id) DO UPDATE
  SET avg_rating     = v_avg_rating,
      reviews_count  = v_reviews_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INSERT ADMIN USER
-- ============================================
-- IMPORTANT: After creating a user account via signup,
-- run this command to make them an admin:
--
-- INSERT INTO admin_roles (user_id, name, email)
-- SELECT id, name, email FROM profiles
-- WHERE email = 'your-admin-email@college.edu';
--
-- Or directly with the user's UUID:
-- INSERT INTO admin_roles (user_id, name, email)
-- VALUES ('user-uuid-here', 'Admin Name', 'admin@college.edu');

-- ============================================
-- HELPER FUNCTION: Create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, college)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'college', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();




  -- ============================================
  -- 3. RECREATE YOUR ORIGINAL PROFILES TABLE
  -- ============================================
  CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    usn TEXT,
    college TEXT,
    id_card_url TEXT,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP
  );

  -- ============================================
  -- 4. DISABLE RLS (like your original working setup)
  -- ============================================
  ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

  -- ============================================
  -- 5. RECREATE BOOKS TABLE (your original structure)
  -- ============================================
  CREATE TABLE IF NOT EXISTS books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre TEXT,
    description TEXT,
    cover_url TEXT,
    price_per_day NUMERIC DEFAULT 10,
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    times_rented INT DEFAULT 0,
    condition TEXT DEFAULT 'Good',
    created_at TIMESTAMP DEFAULT NOW()
  );

  ALTER TABLE books DISABLE ROW LEVEL SECURITY;

  -- ============================================
  -- 6. RECREATE RENTALS TABLE
  -- ============================================
  CREATE TABLE IF NOT EXISTS rentals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    book_id UUID REFERENCES books(id),
    rented_at TIMESTAMP DEFAULT NOW(),
    due_date TIMESTAMP,
    returned_at TIMESTAMP,
    status TEXT DEFAULT 'active',
    total_cost NUMERIC
  );

  ALTER TABLE rentals DISABLE ROW LEVEL SECURITY;

  -- ============================================
  -- 7. RE-APPLY YOUR ADMIN USERS
  -- ============================================
  UPDATE profiles SET role = 'admin', status = 'approved'
  WHERE email IN (
    'jatharva1701@gmail.com'
  );

select role,email, full_name from profiles  







  -- First drop the foreign key constraint
  ALTER TABLE books                                                                                                                              DROP CONSTRAINT IF EXISTS books_seller_id_fkey;
                                                                                                                                               
  -- Find and fix books with invalid seller_id (set to NULL)
  UPDATE books
  SET seller_id = NULL
  WHERE seller_id NOT IN (SELECT id FROM profiles);

  -- Verify the fix
  SELECT id, title, seller_id, seller_name FROM books;

  -- Now the delete user will work
  -- The foreign key is removed so there's no constraint violation