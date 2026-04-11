-- supabase/migrations/006_scrub_test.sql
-- Resets the test user account back to true state and scrubs the test artifacts

UPDATE profiles 
SET total_points = 50, redeemable_points = 50, tier = 'Starter'
WHERE email = 'marcsantiago1998@gmail.com';

DELETE FROM points_transactions WHERE reason = 'TEST_REWARD_INJECTION';
DELETE FROM points_transactions WHERE type = 'redeem';
DELETE FROM redemptions;
