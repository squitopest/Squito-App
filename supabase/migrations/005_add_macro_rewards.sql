-- supabase/migrations/005_add_macro_rewards.sql
-- Re-add the high-tier services alongside the micro-rewards

INSERT INTO rewards (name, description, icon, cost_points) VALUES
  ('Tick Treatment', 'Full property tick treatment', '🕷️', 1000),
  ('Organic Treatment', 'Organic Mosquito & Tick Treatment', '🌿', 1000),
  ('Mosquito Barrier Spray', 'Standard yard mosquito barrier', '🦟', 1250),
  ('Termite Inspection', 'Full property termite assessment', '🔍', 2000),
  ('General Pest Control', 'General & Full Property Pest Control', '🐜', 3000),
  ('Hornet & Wasp Removal', 'Safe extraction of hornet and wasp nests', '🐝', 3500)
ON CONFLICT DO NOTHING;
