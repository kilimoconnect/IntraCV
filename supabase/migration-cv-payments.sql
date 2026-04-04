-- ═══════════════════════════════════════════════
-- CV PAYMENT RECORDS
-- Tracks paid CV downloads for audit & receipts
-- ═══════════════════════════════════════════════
create table if not exists public.cv_payment_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  transaction_id text not null,
  tx_ref text not null unique,
  amount numeric(10,2) not null,
  currency text not null default 'USD',
  status text not null default 'successful',
  cv_category text,
  document_id uuid references public.generated_documents(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.cv_payment_records enable row level security;

create policy "Users can view own payment records" on public.cv_payment_records
  for select using (auth.uid() = user_id);

create policy "Service role can insert payment records" on public.cv_payment_records
  for insert with check (auth.uid() = user_id);
