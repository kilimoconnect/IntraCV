-- Stores AI-generated hook messages for CV Builder.
-- The data_hash column lets the API skip re-running AI if the CV data hasn't changed.
create table if not exists cv_hook_messages (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  message     text        not null,
  cta_label   text        not null default 'Complete Your Profile',
  data_hash   text        not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id)
);

alter table cv_hook_messages enable row level security;

create policy "Users can manage own hook messages"
  on cv_hook_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
