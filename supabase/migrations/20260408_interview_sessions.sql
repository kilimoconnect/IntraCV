-- Interview sessions: multiple sessions per user, grouped by session
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  job_role        text NOT NULL DEFAULT '',
  company         text DEFAULT '',
  job_description text DEFAULT '',
  questions       jsonb DEFAULT '[]'::jsonb,
  answers         jsonb DEFAULT '{}'::jsonb,
  feedbacks       jsonb DEFAULT '{}'::jsonb,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
  -- No UNIQUE(user_id) — many sessions per user
);

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own interview sessions"
  ON public.interview_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.update_interview_session_timestamp()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER interview_sessions_updated_at
  BEFORE UPDATE ON public.interview_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_interview_session_timestamp();
