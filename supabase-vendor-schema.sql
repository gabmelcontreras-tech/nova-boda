create extension if not exists pgcrypto;

create table if not exists public.vendors (
  id uuid primary key references auth.users(id) on delete cascade,
  slug text unique,
  email text,
  contact_email text,
  name text not null default '',
  category text not null default '',
  location text not null default '',
  description text not null default '',
  phone text not null default '',
  rating text not null default '',
  response_time text not null default '24-48h',
  availability text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vendor_packages (
  id bigint generated always as identity primary key,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  name text not null default '',
  price text not null default '',
  currency text not null default 'EUR',
  items jsonb not null default '[]'::jsonb,
  position int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.vendor_faqs (
  id bigint generated always as identity primary key,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  question text not null default '',
  answer text not null default '',
  position int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists idx_vendor_packages_vendor_id on public.vendor_packages(vendor_id);
create index if not exists idx_vendor_faqs_vendor_id on public.vendor_faqs(vendor_id);

alter table public.vendors enable row level security;
alter table public.vendor_packages enable row level security;
alter table public.vendor_faqs enable row level security;

drop policy if exists vendors_select_public on public.vendors;
create policy vendors_select_public
on public.vendors
for select
using (true);

drop policy if exists vendors_insert_own on public.vendors;
create policy vendors_insert_own
on public.vendors
for insert
with check (auth.uid() = id);

drop policy if exists vendors_update_own on public.vendors;
create policy vendors_update_own
on public.vendors
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists vendors_delete_own on public.vendors;
create policy vendors_delete_own
on public.vendors
for delete
using (auth.uid() = id);

drop policy if exists vendor_packages_select_public on public.vendor_packages;
create policy vendor_packages_select_public
on public.vendor_packages
for select
using (true);

drop policy if exists vendor_packages_insert_own on public.vendor_packages;
create policy vendor_packages_insert_own
on public.vendor_packages
for insert
with check (auth.uid() = vendor_id);

drop policy if exists vendor_packages_update_own on public.vendor_packages;
create policy vendor_packages_update_own
on public.vendor_packages
for update
using (auth.uid() = vendor_id)
with check (auth.uid() = vendor_id);

drop policy if exists vendor_packages_delete_own on public.vendor_packages;
create policy vendor_packages_delete_own
on public.vendor_packages
for delete
using (auth.uid() = vendor_id);

drop policy if exists vendor_faqs_select_public on public.vendor_faqs;
create policy vendor_faqs_select_public
on public.vendor_faqs
for select
using (true);

drop policy if exists vendor_faqs_insert_own on public.vendor_faqs;
create policy vendor_faqs_insert_own
on public.vendor_faqs
for insert
with check (auth.uid() = vendor_id);

drop policy if exists vendor_faqs_update_own on public.vendor_faqs;
create policy vendor_faqs_update_own
on public.vendor_faqs
for update
using (auth.uid() = vendor_id)
with check (auth.uid() = vendor_id);

drop policy if exists vendor_faqs_delete_own on public.vendor_faqs;
create policy vendor_faqs_delete_own
on public.vendor_faqs
for delete
using (auth.uid() = vendor_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_vendors_set_updated_at on public.vendors;
create trigger trg_vendors_set_updated_at
before update on public.vendors
for each row execute function public.set_updated_at();
