-- ── Create avatars storage bucket ─────────────────────────────────────────────
-- Creates a public bucket for user avatar photos with proper RLS policies
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,                    -- public bucket so avatar URLs work without auth tokens
  5242880,                 -- 5MB max file size
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- ── RLS Policies for storage.objects ─────────────────────────────────────────

-- Allow authenticated users to upload to their own folder (user_id/ prefix)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Avatar upload: own folder only'
  ) THEN
    CREATE POLICY "Avatar upload: own folder only"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'avatars'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Allow authenticated users to update/replace their own avatar
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Avatar update: own folder only'
  ) THEN
    CREATE POLICY "Avatar update: own folder only"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'avatars'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Allow anyone to read/view avatar images (they are public)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Avatar read: public'
  ) THEN
    CREATE POLICY "Avatar read: public"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'avatars');
  END IF;
END $$;

-- Allow authenticated users to delete their own avatar
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Avatar delete: own folder only'
  ) THEN
    CREATE POLICY "Avatar delete: own folder only"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'avatars'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;
