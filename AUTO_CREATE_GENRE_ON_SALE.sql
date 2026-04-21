-- ============================================
-- AUTO-CREATE GENRE AND CONDITION ON BOOK SALE
-- Run this in Supabase SQL Editor to enable
-- automatic genre/condition updates when books are sold
--
-- Features:
-- 1. Creates genres table with auto-create trigger
-- 2. Creates conditions table with auto-create trigger
-- 3. Backfills existing genres/conditions from books
-- ============================================

-- ============================================
-- 1. GENRES TABLE (for dynamic genre management)
-- ============================================
CREATE TABLE IF NOT EXISTS genres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_genres_name ON genres(name);

-- ============================================
-- 2. FUNCTION: Auto-create genre when book is added/sold
-- ============================================
CREATE OR REPLACE FUNCTION auto_create_genre()
RETURNS TRIGGER AS $$
DECLARE
  v_genre_name TEXT;
BEGIN
  -- Get the genre from the new book
  v_genre_name := NEW.genre;

  -- If genre is provided and not empty
  IF v_genre_name IS NOT NULL AND v_genre_name != '' THEN
    -- Try to insert the genre if it doesn't exist
    INSERT INTO genres (name, image_url, description)
    VALUES (
      v_genre_name,
      -- Generate avatar URL with genre name
      'https://ui-avatars.com/api/?name=' || replace(encode(convert_to(v_genre_name, 'UTF8'), 'base64'), '+', '-') || '&size=200&background=dbeafe&color=1d4ed8&bold=true',
      'Books in the ' || v_genre_name || ' category'
    )
    ON CONFLICT (name) DO NOTHING; -- Genre already exists, skip
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. TRIGGER: Auto-create genre on book insert
-- ============================================
DROP TRIGGER IF EXISTS trg_auto_create_genre ON books;
CREATE TRIGGER trg_auto_create_genre
  AFTER INSERT ON books
  FOR EACH ROW
  WHEN (NEW.genre IS NOT NULL AND NEW.genre != '')
  EXECUTE FUNCTION auto_create_genre();

-- ============================================
-- 4. Backfill: Create genres from existing books
-- ============================================
INSERT INTO genres (name, image_url, description)
SELECT DISTINCT
  genre,
  'https://ui-avatars.com/api/?name=' || replace(encode(convert_to(genre, 'UTF8'), 'base64'), '+', '-') || '&size=200&background=dbeafe&color=1d4ed8&bold=true',
  'Books in the ' || genre || ' category'
FROM books
WHERE genre IS NOT NULL AND genre != ''
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 5. RLS Policies (drop existing first for idempotency)
-- ============================================
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Genres are viewable by everyone" ON genres;
DROP POLICY IF EXISTS "Admins can insert genres" ON genres;
DROP POLICY IF EXISTS "Admins can update genres" ON genres;
DROP POLICY IF EXISTS "Admins can delete genres" ON genres;

-- Recreate policies
CREATE POLICY "Genres are viewable by everyone"
  ON genres FOR SELECT
  USING (true);

-- Admins can manage genres
CREATE POLICY "Admins can insert genres"
  ON genres FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update genres"
  ON genres FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete genres"
  ON genres FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
    )
  );

-- ============================================
-- 6. CONDITIONS TABLE (for dynamic condition management)
-- ============================================
CREATE TABLE IF NOT EXISTS conditions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  image_url TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_conditions_name ON conditions(name);

-- ============================================
-- 7. FUNCTION: Auto-create condition when book is added/sold
-- ============================================
CREATE OR REPLACE FUNCTION auto_create_condition()
RETURNS TRIGGER AS $$
DECLARE
  v_condition_name TEXT;
BEGIN
  -- Get the condition from the new book
  v_condition_name := NEW.condition;

  -- If condition is provided and not empty
  IF v_condition_name IS NOT NULL AND v_condition_name != '' THEN
    -- Try to insert the condition if it doesn't exist
    INSERT INTO conditions (name, image_url, description, sort_order)
    VALUES (
      v_condition_name,
      -- Generate placeholder image URL
      'https://placehold.co/210x128/1d4ed8/ffffff?text=' || replace(v_condition_name, ' ', '+'),
      'Books in ' || v_condition_name || ' condition',
      0
    )
    ON CONFLICT (name) DO NOTHING; -- Condition already exists, skip
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. TRIGGER: Auto-create condition on book insert
-- ============================================
DROP TRIGGER IF EXISTS trg_auto_create_condition ON books;
CREATE TRIGGER trg_auto_create_condition
  AFTER INSERT ON books
  FOR EACH ROW
  WHEN (NEW.condition IS NOT NULL AND NEW.condition != '')
  EXECUTE FUNCTION auto_create_condition();

-- ============================================
-- 9. Backfill: Create conditions from existing books
-- ============================================
INSERT INTO conditions (name, image_url, description, sort_order)
SELECT DISTINCT
  condition,
  'https://placehold.co/210x128/1d4ed8/ffffff?text=' || replace(condition, ' ', '+'),
  'Books in ' || condition || ' condition',
  0
FROM books
WHERE condition IS NOT NULL AND condition != ''
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 10. RLS Policies for conditions
-- ============================================
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Conditions are viewable by everyone" ON conditions;
DROP POLICY IF EXISTS "Admins can insert conditions" ON conditions;
DROP POLICY IF EXISTS "Admins can update conditions" ON conditions;
DROP POLICY IF EXISTS "Admins can delete conditions" ON conditions;

-- Recreate policies
CREATE POLICY "Conditions are viewable by everyone"
  ON conditions FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert conditions"
  ON conditions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update conditions"
  ON conditions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete conditions"
  ON conditions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
    )
  );

-- ============================================
-- VERIFICATION QUERIES
-- Run these to check if triggers are set up:
-- SELECT tgname, tgrelid::regclass, proname
-- FROM pg_trigger t
-- JOIN pg_proc p ON p.oid = t.tgfoid
-- WHERE tgname IN ('trg_auto_create_genre', 'trg_auto_create_condition');
--
-- Check existing genres:
-- SELECT * FROM genres ORDER BY created_at DESC;
--
-- Check existing conditions:
-- SELECT * FROM conditions ORDER BY created_at DESC;
-- ============================================
