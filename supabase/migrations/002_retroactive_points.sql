-- ============================================================
-- Squito App — Migration 002
-- Backfill Welcome Bonus points_transactions for older accounts
-- Updates Rewards table text
-- ============================================================

-- 1. Insert Welcome Bonus transaction for ANY profile that doesn't have one
INSERT INTO public.points_transactions (user_id, amount, type, reason, metadata)
SELECT 
  p.id, 
  50, 
  'earn', 
  'Welcome Bonus', 
  '{"source": "signup_backfill", "base_amount": 50, "multiplier": 1}'::jsonb
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.points_transactions t
  WHERE t.user_id = p.id AND t.reason = 'Welcome Bonus'
);

-- 2. Update existing Rewards text from "Priority Same-Day Service" to "VIP Priority Service"
UPDATE public.rewards
SET name = 'VIP Priority Service'
WHERE name = 'Priority Same-Day Service';
