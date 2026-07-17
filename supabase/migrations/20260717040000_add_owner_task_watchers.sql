-- Karen and Adrian automatically watch every Team Hub project and social task.
-- Watching is stored separately from assignment so owner dashboards can show
-- the work they oversee and the team members currently in charge.

begin;

alter table public.division_tasks
  add column if not exists watcher_usernames text[]
    not null default array[
      'Understory_Karen',
      'Understory_Adrian'
    ]::text[];

alter table public.tasks
  add column if not exists watcher_usernames text[]
    not null default array[
      'Understory_Karen',
      'Understory_Adrian'
    ]::text[];

alter table public.division_tasks
  alter column watcher_usernames set default array[
    'Understory_Karen',
    'Understory_Adrian'
  ]::text[];

alter table public.tasks
  alter column watcher_usernames set default array[
    'Understory_Karen',
    'Understory_Adrian'
  ]::text[];

update public.division_tasks
set watcher_usernames = array[
  'Understory_Karen',
  'Understory_Adrian'
]::text[]
where cardinality(watcher_usernames) = 0;

update public.tasks
set watcher_usernames = array[
  'Understory_Karen',
  'Understory_Adrian'
]::text[]
where cardinality(watcher_usernames) = 0;

create index if not exists division_tasks_watcher_usernames_idx
  on public.division_tasks using gin (watcher_usernames);

create index if not exists tasks_watcher_usernames_idx
  on public.tasks using gin (watcher_usernames);

commit;
