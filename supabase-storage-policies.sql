insert into storage.buckets (id, name, public)
values ('vendor-media', 'vendor-media', true)
on conflict (id) do nothing;

drop policy if exists "Vendor media public read" on storage.objects;
create policy "Vendor media public read"
on storage.objects
for select
using (bucket_id = 'vendor-media');

drop policy if exists "Vendor media owner insert" on storage.objects;
create policy "Vendor media owner insert"
on storage.objects
for insert
with check (
  bucket_id = 'vendor-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Vendor media owner update" on storage.objects;
create policy "Vendor media owner update"
on storage.objects
for update
using (
  bucket_id = 'vendor-media'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'vendor-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Vendor media owner delete" on storage.objects;
create policy "Vendor media owner delete"
on storage.objects
for delete
using (
  bucket_id = 'vendor-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);
