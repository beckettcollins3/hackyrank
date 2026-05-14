-- Run these AFTER creating a public bucket named "videos" in Supabase Storage UI.
-- Storage > Policies > New Policy > "For full customization" > paste each below.

-- Public read
create policy "videos public read"
  on storage.objects for select
  using (bucket_id = 'videos');

-- Authenticated upload
create policy "videos auth upload"
  on storage.objects for insert
  with check (bucket_id = 'videos' and auth.role() = 'authenticated');

-- Owner delete
create policy "videos owner delete"
  on storage.objects for delete
  using (bucket_id = 'videos' and owner = auth.uid());
