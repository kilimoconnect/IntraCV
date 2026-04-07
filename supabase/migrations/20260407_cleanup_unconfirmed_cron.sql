-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Enable pg_cron and pg_net for scheduled edge function invocation
--
-- After this migration runs, complete setup by running the one-time snippet in
-- Supabase Dashboard → SQL Editor (see SETUP INSTRUCTIONS in the README or
-- the comment in supabase/functions/cleanup-unconfirmed-users/index.ts).
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable required extensions (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net  WITH SCHEMA extensions;
