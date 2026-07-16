-- Run this entire file once in the Supabase SQL Editor before opening the
-- client portal Gallery. It creates the gallery tables, enables permissive
-- development policies, and seeds the MVP books. It is safe to run again.

begin;

create table if not exists public.gallery_books (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id),
  title text not null,
  cover_note text,
  created_at timestamptz default now()
);

create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.gallery_books(id) on delete cascade,
  drive_link text,
  caption text,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table public.gallery_books enable row level security;
alter table public.gallery_photos enable row level security;

drop policy if exists "Allow all gallery book access"
  on public.gallery_books;
create policy "Allow all gallery book access"
  on public.gallery_books
  for all
  using (true)
  with check (true);

drop policy if exists "Allow all gallery photo access"
  on public.gallery_photos;
create policy "Allow all gallery photo access"
  on public.gallery_photos
  for all
  using (true)
  with check (true);

create unique index if not exists gallery_books_client_title_idx
  on public.gallery_books (client_id, title);

create index if not exists gallery_books_client_created_at_idx
  on public.gallery_books (client_id, created_at);

create index if not exists gallery_photos_book_sort_order_idx
  on public.gallery_photos (book_id, sort_order, created_at);

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

  insert into public.gallery_books (
    client_id,
    title,
    cover_note
  ) values
    (
      mvp_client_id,
      'Monsheong (Event)',
      '3 photos'
    ),
    (
      mvp_client_id,
      'Reformer',
      '3 photos'
    ),
    (
      mvp_client_id,
      'Tables',
      '3 photos'
    )
  on conflict (client_id, title) do update
  set cover_note = excluded.cover_note;
end
$seed$;

commit;
