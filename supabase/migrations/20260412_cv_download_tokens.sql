-- cv_download_tokens
-- One row per successful CV payment. Consumed (used=true) when the PDF
-- is generated. order_tracking_id is unique so Pesapal retries / IPN
-- duplicates never grant a second token.

create table if not exists cv_download_tokens (
  id                 uuid        primary key default gen_random_uuid(),
  user_id            uuid        not null references auth.users(id) on delete cascade,
  plan               text        not null check (plan in ('starter', 'professional', 'full')),
  order_tracking_id  text        not null unique,
  used               boolean     not null default false,
  expires_at         timestamptz not null default (now() + interval '2 hours'),
  created_at         timestamptz not null default now()
);

-- Users can only read their own tokens (never write — all writes use service role)
alter table cv_download_tokens enable row level security;

create policy "Users can read own cv_download_tokens"
  on cv_download_tokens for select
  using (auth.uid() = user_id);
