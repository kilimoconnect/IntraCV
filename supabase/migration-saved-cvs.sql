-- =============================================
-- Migration: Add saved_cvs table
-- One row per user — stores the auto-generated CV
-- Run this in Supabase SQL Editor
-- =============================================

create table if not exists public.saved_cvs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  cv_data jsonb not null default '{}'::jsonb,
  style_id text not null default 'corporate',
  layout_type text not null default 'sidebar-left',
  template_type text not null default 'two-page',
  target_role text default '',
  job_description text default '',
  source_data_hash text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.saved_cvs enable row level security;

create policy "Users can manage own saved cv" on public.saved_cvs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
