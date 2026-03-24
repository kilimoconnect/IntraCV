-- =============================================
-- Migration: Add missing CV tables (idempotent)
-- cv_tools, cv_volunteer, cv_interests, cv_internships
-- + location column on cv_experiences
-- Safe to re-run — all statements use IF NOT EXISTS
-- Run this in Supabase SQL Editor
-- =============================================

-- ─── CV TOOLS / SOFTWARE ───
create table if not exists public.cv_tools (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);
alter table public.cv_tools enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'cv_tools' and policyname = 'Users can manage own tools') then
    create policy "Users can manage own tools" on public.cv_tools for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- ─── CV VOLUNTEER EXPERIENCE ───
create table if not exists public.cv_volunteer (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  description text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);
alter table public.cv_volunteer enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'cv_volunteer' and policyname = 'Users can manage own volunteer') then
    create policy "Users can manage own volunteer" on public.cv_volunteer for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- ─── CV INTERESTS ───
create table if not exists public.cv_interests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);
alter table public.cv_interests enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'cv_interests' and policyname = 'Users can manage own interests') then
    create policy "Users can manage own interests" on public.cv_interests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- ─── CV INTERNSHIPS ───
create table if not exists public.cv_internships (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  company text,
  location text default '',
  start_date text,
  end_date text,
  description text,
  sort_order integer default 0,
  created_at timestamptz default now()
);
alter table public.cv_internships enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'cv_internships' and policyname = 'Users can manage own internships') then
    create policy "Users can manage own internships" on public.cv_internships for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- ─── ADD location COLUMN TO cv_experiences (if missing) ───
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cv_experiences'
      and column_name = 'location'
  ) then
    alter table public.cv_experiences add column location text default '';
  end if;
end $$;
