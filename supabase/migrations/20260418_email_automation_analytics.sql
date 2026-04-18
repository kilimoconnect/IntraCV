-- ─────────────────────────────────────────────────────────────────────────────
-- Email Automation Analytics View
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ─────────────────────────────────────────────────────────────────────────────

-- Per-flow summary: sent, failed, cancelled, avg delay to send
CREATE OR REPLACE VIEW email_automation_flow_stats AS
SELECT
  flow,
  email_number,
  COUNT(*)                                                     AS total,
  COUNT(*) FILTER (WHERE status = 'sent')                      AS sent,
  COUNT(*) FILTER (WHERE status = 'failed')                    AS failed,
  COUNT(*) FILTER (WHERE status = 'cancelled')                 AS cancelled,
  COUNT(*) FILTER (WHERE status = 'pending')                   AS pending,
  ROUND(
    AVG(
      EXTRACT(EPOCH FROM (sent_at::timestamptz - created_at::timestamptz)) / 60
    ) FILTER (WHERE status = 'sent'),
    1
  )                                                            AS avg_minutes_to_send
FROM email_automation_queue
GROUP BY flow, email_number
ORDER BY flow, email_number;

-- Daily send volume (last 90 days)
CREATE OR REPLACE VIEW email_automation_daily_sends AS
SELECT
  DATE_TRUNC('day', sent_at)::date  AS send_date,
  flow,
  COUNT(*)                          AS emails_sent
FROM email_automation_queue
WHERE status = 'sent'
  AND sent_at >= NOW() - INTERVAL '90 days'
GROUP BY send_date, flow
ORDER BY send_date DESC, flow;

-- Per-user activity summary (for support / debugging)
CREATE OR REPLACE VIEW email_automation_user_summary AS
SELECT
  user_id,
  COUNT(*)                                    AS total_queued,
  COUNT(*) FILTER (WHERE status = 'sent')     AS total_sent,
  COUNT(*) FILTER (WHERE status = 'pending')  AS total_pending,
  MAX(sent_at)                                AS last_sent_at,
  ARRAY_AGG(DISTINCT flow ORDER BY flow)
    FILTER (WHERE status = 'sent')            AS flows_sent
FROM email_automation_queue
GROUP BY user_id;

-- Grant read access to the anon role (used by Supabase Studio dashboard queries)
GRANT SELECT ON email_automation_flow_stats   TO anon, authenticated;
GRANT SELECT ON email_automation_daily_sends  TO anon, authenticated;
GRANT SELECT ON email_automation_user_summary TO anon, authenticated;
