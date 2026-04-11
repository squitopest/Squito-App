-- supabase/migrations/004_update_rewards.sql
-- Transition from dummy rewards to actual service redemptions

-- 1. Wipe the old rewards catalog
UPDATE public.rewards SET active = false;

-- 2. Insert the actual Squito services as redeemable rewards
INSERT INTO rewards (name, description, icon, cost_points) VALUES
  ('10 Dollars Off Next Invoice', 'Instantly applied to your next Squito bill', '💵', 250),
  ('Rodent Assessment', 'Complimentary tech inspection for entry points', '🐀', 350),
  ('Garage / Shed Sweep', 'Exterior web and pest sweep of outer structure', '🧹', 450),
  ('Free Callback Visit', 'Complimentary spot-treatment between scheduled visits', '🏠', 500),
  ('Squito VIP Yeti Tumbler', 'Premium branded 20oz tumbler, delivered to you', '🥤', 750);
