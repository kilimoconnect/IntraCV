-- ─── USER SETTINGS ───
-- Mirrors key personal info fields for the Settings panel.
-- cv_personal_info is the authoritative source; user_settings is a convenience sync.

create table if not exists public.user_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  full_name text,
  phone text,
  location text,
  headline text,
  linkedin text,
  website text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table public.user_settings enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'user_settings'
    and policyname = 'Users can manage own settings'
  ) then
    create policy "Users can manage own settings" on public.user_settings
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
