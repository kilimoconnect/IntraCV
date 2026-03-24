-- =============================================
-- Migration: Add 6 new CV section tables
-- Run this in Supabase SQL Editor
-- =============================================

-- ─── CV MEMBERSHIPS ───
create table if not exists public.cv_memberships (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV KEY ACHIEVEMENTS ───
create table if not exists public.cv_key_achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  achievement text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV PROJECTS ───
create table if not exists public.cv_projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  tech text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV BOARD / LEADERSHIP ROLES ───
create table if not exists public.cv_board_roles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  organization text,
  start_date text,
  end_date text,
  description text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV EXECUTIVE TRAINING ───
create table if not exists public.cv_executive_training (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  institution text,
  year text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CV PUBLICATIONS / SPEAKING ───
create table if not exists public.cv_publications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  publisher text,
  year text,
  type text default 'publication',
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── Enable RLS ───
alter table public.cv_memberships enable row level security;
alter table public.cv_key_achievements enable row level security;
alter table public.cv_projects enable row level security;
alter table public.cv_board_roles enable row level security;
alter table public.cv_executive_training enable row level security;
alter table public.cv_publications enable row level security;

-- ─── RLS Policies ───
create policy "Users can manage own memberships" on public.cv_memberships
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own achievements" on public.cv_key_achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own projects" on public.cv_projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own board roles" on public.cv_board_roles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own executive training" on public.cv_executive_training
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own publications" on public.cv_publications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
