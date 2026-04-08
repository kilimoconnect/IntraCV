-- Lifetime interview question usage tracking on profiles.
-- These columns only ever increase — deleting sessions/questions does NOT decrement them.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS interview_questions_generated integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interview_questions_paid_quota integer NOT NULL DEFAULT 0;

-- Atomic increment functions (SECURITY DEFINER bypasses RLS so the API can safely increment)
CREATE OR REPLACE FUNCTION public.add_interview_generated(uid uuid, n integer)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.profiles
  SET interview_questions_generated = interview_questions_generated + n
  WHERE id = uid;
$$;

CREATE OR REPLACE FUNCTION public.add_interview_paid_quota(uid uuid, n integer)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.profiles
  SET interview_questions_paid_quota = interview_questions_paid_quota + n
  WHERE id = uid;
$$;
