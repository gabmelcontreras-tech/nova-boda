-- ============================================================
-- NOVA BODA — Photos + Analytics migration
-- Run in Supabase SQL Editor → New query → paste → Run
-- ============================================================

-- 1. Add photo columns to vendors
alter table public.vendors add column if not exists cover_photo text;
alter table public.vendors add column if not exists photos jsonb not null default '[]'::jsonb;

-- 2. Vendor events table (for analytics)
create table if not exists public.vendor_events (
  id          bigint generated always as identity primary key,
  vendor_id   uuid not null references public.vendors(id) on delete cascade,
  event_type  text not null,  -- 'profile_view' | 'contact_submit'
  created_at  timestamptz not null default now()
);

create index if not exists idx_vendor_events_vendor_id_type
  on public.vendor_events(vendor_id, event_type, created_at desc);

alter table public.vendor_events enable row level security;

-- Anyone can insert events (anonymous tracking)
drop policy if exists vendor_events_insert_anon on public.vendor_events;
create policy vendor_events_insert_anon on public.vendor_events
  for insert with check (true);

-- Vendors can only read their own events
drop policy if exists vendor_events_select_own on public.vendor_events;
create policy vendor_events_select_own on public.vendor_events
  for select using (auth.uid() = vendor_id);

-- ============================================================
-- 3. Storage bucket setup (do this in Supabase dashboard UI)
-- ============================================================
-- Go to: Storage → New bucket
--   Name: vendor-media
--   Public bucket: ON (so photos are publicly accessible)
--
-- Then add these Storage RLS policies (Storage → vendor-media → Policies):
--
-- INSERT policy (authenticated vendors upload to their own folder):
--   Policy name: vendor_media_insert_own
--   Allowed operation: INSERT
--   Target roles: authenticated
--   USING expression: (storage.foldername(name))[1] = auth.uid()::text
--
-- UPDATE/DELETE policy (vendors manage their own files):
--   Policy name: vendor_media_update_own
--   Allowed operation: UPDATE, DELETE
--   Target roles: authenticated
--   USING expression: (storage.foldername(name))[1] = auth.uid()::text
-- ============================================================
