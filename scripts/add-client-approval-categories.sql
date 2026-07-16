-- Run this entire file once in the Supabase SQL Editor before opening the
-- client portal Approvals section. It creates the category table, enables a
-- permissive development policy, and seeds the MVP categories. Safe to rerun.

begin;

create table if not exists public.client_approval_categories (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id),
  name text not null,
  status text not null check (
    status in ('approval_needed', 'revision_in_progress', 'up_to_date')
  ),
  description text,
  route_slug text not null,
  created_at timestamptz default now()
);

alter table public.client_approval_categories enable row level security;

drop policy if exists "Allow all client approval category access"
  on public.client_approval_categories;
create policy "Allow all client approval category access"
  on public.client_approval_categories
  for all
  using (true)
  with check (true);

create unique index if not exists client_approval_categories_client_slug_idx
  on public.client_approval_categories (client_id, route_slug);

create index if not exists client_approval_categories_client_created_at_idx
  on public.client_approval_categories (client_id, created_at);

do $seed$
declare
  mvp_client_id uuid;
begin
  select id
  into mvp_client_id
  from public.clients
  where slug = 'mvp'
  limit 1;

  if mvp_client_id is null then
    insert into public.clients (name, slug)
    values ('Motion Vitality Pilates', 'mvp')
    returning id into mvp_client_id;
  end if;

  insert into public.client_approval_categories (
    client_id,
    name,
    status,
    description,
    route_slug
  ) values
    (
      mvp_client_id,
      'Social media',
      'approval_needed',
      'August content calendar',
      'social-media'
    ),
    (
      mvp_client_id,
      'Website',
      'revision_in_progress',
      'Homepage and booking funnel design',
      'website'
    ),
    (
      mvp_client_id,
      'Brand palette',
      'up_to_date',
      'Logo and color system',
      'brand-palette'
    )
  on conflict (client_id, route_slug) do update
  set
    name = excluded.name,
    status = excluded.status,
    description = excluded.description;
end
$seed$;

commit;
