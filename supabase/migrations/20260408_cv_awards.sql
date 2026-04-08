-- =============================================
-- Migration: Add cv_awards table (idempotent)
-- Run this in Supabase SQL Editor
-- =============================================

create table if not exists public.cv_awards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.cv_awards enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'cv_awards'
    and policyname = 'Users can manage own awards'
  ) then
    create policy "Users can manage own awards" on public.cv_awards
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
