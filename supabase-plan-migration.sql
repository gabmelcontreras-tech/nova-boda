-- Run this in the Supabase SQL editor (Dashboard > SQL Editor > New query)
-- Adds plan, verified, and Stripe fields to the vendors table

alter table public.vendors
  add column if not exists verified boolean not null default false,
  add column if not exists plan text not null default 'free',
  add column if not exists plan_expires_at timestamptz,
  add column if not exists stripe_customer_id text;

-- Index for Stripe webhook lookups by customer ID
create index if not exists idx_vendors_stripe_customer_id
  on public.vendors(stripe_customer_id);

-- RLS policy: allow admin email(s) to update any vendor row
-- (needed for the admin panel verified toggle)
create policy vendors_update_admin on public.vendors
  for update
  using (auth.email() = any(array['admin@novaboda.es']))  -- TODO: add real admin email(s)
  with check (auth.email() = any(array['admin@novaboda.es']));
