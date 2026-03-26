-- Create cv_awards table for storing user awards
CREATE TABLE IF NOT EXISTS cv_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT NOW() NOT NULL,
  updated_at timestamp with time zone DEFAULT NOW() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cv_awards_user_id ON cv_awards(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_awards_sort_order ON cv_awards(user_id, sort_order);

-- Enable RLS (Row Level Security)
ALTER TABLE cv_awards ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own awards
CREATE POLICY "Users can manage their own awards" ON cv_awards
  FOR ALL USING (
    auth.uid() = user_id
  );

-- Create policy for authenticated users to read their own awards
CREATE POLICY "Users can read their own awards" ON cv_awards
  FOR SELECT USING (
    auth.uid() = user_id
  );
