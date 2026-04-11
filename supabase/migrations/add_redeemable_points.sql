-- ============================================================
-- Migration: Add redeemable_points column to profiles
-- 
-- This supports the dual-balance points system:
--   total_points      = lifetime earn total (determines tier, never decreases)
--   redeemable_points = spendable balance (decreases on redeem)
--
-- Run this in Supabase SQL Editor.
-- ============================================================

-- Add the column with a default of 0
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS redeemable_points INTEGER NOT NULL DEFAULT 0;

-- Backfill: set redeemable_points = total_points for all existing users
-- so their current balance is fully spendable
UPDATE profiles
SET redeemable_points = COALESCE(total_points, 0)
WHERE redeemable_points = 0 AND COALESCE(total_points, 0) > 0;

-- Allow RLS read access (profiles policies already cover this)
-- No additional policies needed since redeemable_points is on the same table.
