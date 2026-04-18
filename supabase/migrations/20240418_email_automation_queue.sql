-- Email Automation Queue
-- Stores scheduled emails for all automation flows.
-- Run this in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.email_automation_queue (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flow            TEXT        NOT NULL,
  email_number    INT         NOT NULL,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  sent_at         TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  status          TEXT        NOT NULL DEFAULT 'pending',  -- pending | sent | cancelled | failed
  metadata        JSONB       NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, flow, email_number)
);

-- Fast lookup of due pending emails
CREATE INDEX IF NOT EXISTS idx_email_queue_due
  ON public.email_automation_queue (scheduled_at, status)
  WHERE status = 'pending';

-- RLS: only the service role (server-side) can read/write
ALTER TABLE public.email_automation_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only" ON public.email_automation_queue;
CREATE POLICY "Service role only"
  ON public.email_automation_queue
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
