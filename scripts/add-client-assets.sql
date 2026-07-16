-- Run this entire file once in the Supabase SQL Editor before opening the
-- client portal Asset upload page. It creates the public Storage bucket,
-- temporary public Storage policies, the client_assets table, and its RLS
-- policy. It is safe to run again.

begin;

insert into storage.buckets (id, name, public)
values ('client-assets', 'client-assets', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can view client assets"
  on storage.objects;
create policy "Public can view client assets"
  on storage.objects
  for select
  to public
  using (bucket_id = 'client-assets');

drop policy if exists "Public can upload client assets"
  on storage.objects;
create policy "Public can upload client assets"
  on storage.objects
  for insert
  to public
  with check (bucket_id = 'client-assets');

drop policy if exists "Public can delete client assets"
  on storage.objects;
create policy "Public can delete client assets"
  on storage.objects
  for delete
  to public
  using (bucket_id = 'client-assets');

create table if not exists public.client_assets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id),
  file_url text not null,
  file_name text,
  file_type text,
  uploaded_by text,
  created_at timestamptz default now()
);

alter table public.client_assets enable row level security;

drop policy if exists "Allow all client asset access"
  on public.client_assets;
create policy "Allow all client asset access"
  on public.client_assets
  for all
  using (true)
  with check (true);

create index if not exists client_assets_client_created_at_idx
  on public.client_assets (client_id, created_at desc);

commit;
