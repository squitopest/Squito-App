-- ============================================================
-- Squito App — Full Database Schema
-- 
-- Run this in the Supabase SQL Editor to create all tables
-- needed by the app. Safe to run multiple times (IF NOT EXISTS).
-- ============================================================

-- ── 1. PROFILES ─────────────────────────────────────────────
-- Extends Supabase auth.users with app-specific fields.
-- Created automatically when a user signs up (via trigger below).
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  service_address TEXT,
  avatar_url TEXT,
  tier TEXT NOT NULL DEFAULT 'Starter',
  total_points INTEGER NOT NULL DEFAULT 0,
  redeemable_points INTEGER NOT NULL DEFAULT 0,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: users can read/update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile') THEN
    CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  referer_id UUID;
BEGIN
  -- 1. Create the profile
  INSERT INTO public.profiles (id, display_name, email, total_points, redeemable_points, tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    50,   -- welcome bonus
    50,   -- welcome bonus (spendable)
    'Starter'
  );

  -- 2. Log the transaction so they see it in their history
  INSERT INTO public.points_transactions (user_id, amount, type, reason, metadata)
  VALUES (
    NEW.id,
    50,
    'earn',
    'Welcome Bonus',
    '{"source": "signup", "base_amount": 50, "multiplier": 1}'::jsonb
  );

  -- 3. Check for Referrer
  IF NEW.raw_user_meta_data->>'referer_email' IS NOT NULL THEN
     SELECT id INTO referer_id 
     FROM public.profiles 
     WHERE email = NEW.raw_user_meta_data->>'referer_email';

     IF referer_id IS NOT NULL THEN
        -- Award Referrer 300 points
        UPDATE public.profiles
        SET total_points = total_points + 300,
            redeemable_points = redeemable_points + 300
        WHERE id = referer_id;
        
        INSERT INTO public.points_transactions (user_id, amount, type, reason, metadata)
        VALUES (
          referer_id, 
          300, 
          'earn', 
          'Successful Referral', 
          jsonb_build_object('referred_email', NEW.email)
        );
     END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ── 2. POINTS TRANSACTIONS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'redeem')),
  reason TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'points_transactions' AND policyname = 'Users can view own transactions') THEN
    CREATE POLICY "Users can view own transactions" ON points_transactions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'points_transactions' AND policyname = 'Users can insert own transactions') THEN
    CREATE POLICY "Users can insert own transactions" ON points_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_points_tx_user ON points_transactions(user_id, created_at DESC);


-- ── 3. REWARDS CATALOG ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🎁',
  cost_points INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rewards' AND policyname = 'Anyone can view active rewards') THEN
    CREATE POLICY "Anyone can view active rewards" ON rewards FOR SELECT USING (active = true);
  END IF;
END $$;

INSERT INTO rewards (name, description, icon, cost_points) VALUES
  ('10 Dollars Off Next Invoice', 'Instantly applied to your next Squito bill', '💵', 250),
  ('Rodent Assessment', 'Complimentary tech inspection for entry points', '🐀', 350),
  ('Garage / Shed Sweep', 'Exterior web and pest sweep of outer structure', '🧹', 450),
  ('Free Callback Visit', 'Complimentary spot-treatment between scheduled visits', '🏠', 500),
  ('Squito VIP Yeti Tumbler', 'Premium branded 20oz tumbler, delivered to you', '🥤', 750),
  ('Tick Treatment', 'Full property tick treatment', '🕷️', 1000),
  ('Organic Treatment', 'Organic Mosquito & Tick Treatment', '🌿', 1000),
  ('Mosquito Barrier Spray', 'Standard yard mosquito barrier', '🦟', 1250),
  ('Termite Inspection', 'Full property termite assessment', '🔍', 2000),
  ('General Pest Control', 'General & Full Property Pest Control', '🐜', 3000),
  ('Hornet & Wasp Removal', 'Safe extraction of hornet and wasp nests', '🐝', 3500)
ON CONFLICT DO NOTHING;


-- ── 4. REDEMPTIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id),
  points_spent INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'redemptions' AND policyname = 'Users can view own redemptions') THEN
    CREATE POLICY "Users can view own redemptions" ON redemptions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'redemptions' AND policyname = 'Users can insert own redemptions') THEN
    CREATE POLICY "Users can insert own redemptions" ON redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- ── 5. SERVICE BOOKINGS (for history display) ───────────────
CREATE TABLE IF NOT EXISTS service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'complete', 'cancelled')),
  scheduled_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_bookings' AND policyname = 'Users can view own bookings') THEN
    CREATE POLICY "Users can view own bookings" ON service_bookings FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_bookings' AND policyname = 'Users can insert own bookings') THEN
    CREATE POLICY "Users can insert own bookings" ON service_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookings_user ON service_bookings(user_id, scheduled_date DESC);
