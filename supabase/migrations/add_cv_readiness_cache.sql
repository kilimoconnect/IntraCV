create table if not exists public.cv_readiness_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  data_hash text not null,
  cv_strength integer not null default 0,
  cv_issues text[] not null default '{}',
  cv_improvements text[] not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.cv_readiness_cache enable row level security;

create policy "Users can read own readiness cache"
  on public.cv_readiness_cache for select
  using (auth.uid() = user_id);

create policy "Users can upsert own readiness cache"
  on public.cv_readiness_cache for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
