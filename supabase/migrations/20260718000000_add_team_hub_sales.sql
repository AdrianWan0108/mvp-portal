-- Adds the Team Hub "Sales" pipeline: prospecting clients, their stage,
-- service needed, quote status, expected resources/cost, and a preview
-- image. Restricted in the app to owners (Karen and Adrian) the same way
-- Management is; RLS here stays permissive since the Team Hub does not use
-- Supabase Auth (see 20260717010000_add_profile_self_service.sql).

begin;

insert into storage.buckets (id, name, public)
values ('sales-prospect-images', 'sales-prospect-images', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can view sales prospect images"
  on storage.objects;
create policy "Public can view sales prospect images"
  on storage.objects
  for select
  to public
  using (bucket_id = 'sales-prospect-images');

drop policy if exists "Public can upload sales prospect images"
  on storage.objects;
create policy "Public can upload sales prospect images"
  on storage.objects
  for insert
  to public
  with check (bucket_id = 'sales-prospect-images');

drop policy if exists "Public can delete sales prospect images"
  on storage.objects;
create policy "Public can delete sales prospect images"
  on storage.objects
  for delete
  to public
  using (bucket_id = 'sales-prospect-images');

create table if not exists public.sales_prospects (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  stage text not null default 'prospecting',
  service_needed text,
  quote_sent boolean not null default false,
  quote_amount numeric(12, 2),
  quote_sent_at timestamptz,
  expected_resources text,
  expected_cost numeric(12, 2),
  preview_image_url text,
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sales_prospects
  drop constraint if exists sales_prospects_stage_check;
alter table public.sales_prospects
  add constraint sales_prospects_stage_check check (
    stage in (
      'prospecting',
      'contacted',
      'meeting_scheduled',
      'negotiating',
      'won',
      'lost'
    )
  );

alter table public.sales_prospects enable row level security;

drop policy if exists "Allow all sales prospect access"
  on public.sales_prospects;
create policy "Allow all sales prospect access"
  on public.sales_prospects
  for all
  using (true)
  with check (true);

create index if not exists sales_prospects_stage_created_at_idx
  on public.sales_prospects (stage, created_at desc);

commit;
