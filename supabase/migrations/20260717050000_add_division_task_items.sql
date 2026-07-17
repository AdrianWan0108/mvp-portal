-- Free-form items nested under every Team Hub project task. Item titles and
-- descriptions are authored by the team; no preset item options are seeded.

begin;

create table if not exists public.division_task_items (
  id uuid primary key default gen_random_uuid(),
  division_task_id uuid not null
    references public.division_tasks(id) on delete cascade,
  title text not null,
  description text,
  completed boolean not null default false,
  assignee_usernames text[] not null default '{}'::text[],
  watcher_usernames text[] not null default array[
    'Understory_Karen',
    'Understory_Adrian'
  ]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.division_task_items enable row level security;

drop policy if exists "Allow all division task item access"
  on public.division_task_items;
create policy "Allow all division task item access"
  on public.division_task_items
  for all
  using (true)
  with check (true);

create index if not exists division_task_items_task_created_at_idx
  on public.division_task_items (division_task_id, created_at);

create index if not exists division_task_items_assignee_usernames_idx
  on public.division_task_items using gin (assignee_usernames);

create index if not exists division_task_items_watcher_usernames_idx
  on public.division_task_items using gin (watcher_usernames);

commit;
