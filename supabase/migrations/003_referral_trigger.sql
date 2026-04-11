-- supabase/migrations/003_referral_trigger.sql
-- Enables rewarding referrers with 300 points dynamically on signup.

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
