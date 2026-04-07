-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Schedule daily cleanup of stale unconfirmed accounts
--
-- Prerequisites (enable once in Supabase Dashboard → Database → Extensions):
--   • pg_cron   — cron job scheduler
--   • pg_net    — async HTTP from SQL
--
-- After running this migration, also set these in your Supabase project:
--   Dashboard → Edge Functions → cleanup-unconfirmed-users → Secrets
--     CRON_SECRET = <generate with: openssl rand -hex 32>
--
-- To verify the cron job is registered:
--   SELECT * FROM cron.job;
--
-- To check execution history:
--   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable required extensions (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS pg_cron    WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net     WITH SCHEMA extensions;

-- Store project-level config that the cron job reads at runtime.
-- Replace the placeholder values after running this migration:
--   ALTER DATABASE postgres SET app.supabase_url        = 'https://xxxx.supabase.co';
--   ALTER DATABASE postgres SET app.cron_secret         = '<your-CRON_SECRET>';
-- (These are NOT secrets in code — they are set once directly in the DB console.)
DO $$
BEGIN
  -- Only create the settings if they don't already exist, so re-running is safe
  IF current_setting('app.supabase_url', true) IS NULL OR
     current_setting('app.supabase_url', true) = '' THEN
    EXECUTE 'ALTER DATABASE postgres SET app.supabase_url = ''''';
  END IF;

  IF current_setting('app.cron_secret', true) IS NULL OR
     current_setting('app.cron_secret', true) = '' THEN
    EXECUTE 'ALTER DATABASE postgres SET app.cron_secret = ''''';
  END IF;
END;
$$;

-- Remove any previous version of this job before (re-)creating it
SELECT cron.unschedule('cleanup-unconfirmed-users')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cleanup-unconfirmed-users'
);

-- Schedule: daily at 02:00 UTC
SELECT cron.schedule(
  'cleanup-unconfirmed-users',
  '0 2 * * *',
  $$
  SELECT extensions.net.http_post(
    url     := current_setting('app.supabase_url')
               || '/functions/v1/cleanup-unconfirmed-users',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.cron_secret')
    ),
    body    := '{}'::jsonb
  ) AS request_id;
  $$
);
