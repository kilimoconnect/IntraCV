-- ──────────────────────────────────────────────────────────────────────────────
-- Migration: add pdf_url to generated_documents + create cv-pdfs storage bucket
-- Run this in: Supabase Dashboard → SQL Editor
-- ──────────────────────────────────────────────────────────────────────────────

-- 1. Add pdf_url column to generated_documents
ALTER TABLE generated_documents
  ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- 2. Create the cv-pdfs storage bucket (public so the iframe src works directly)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cv-pdfs',
  'cv-pdfs',
  true,
  10485760,            -- 10 MB per file
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policy: users can read their own PDFs (public bucket handles anonymous reads)
--    Service role key bypasses RLS for server-side uploads, so only a read policy needed.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can read their own CVs'
  ) THEN
    CREATE POLICY "Users can read their own CVs"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'cv-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;
