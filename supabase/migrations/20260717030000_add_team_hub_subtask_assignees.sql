-- Add multi-person assignments to nested Team Hub tasks. The website columns
-- remain for compatibility with the original migration, though website pages
-- no longer expose assignment or watching controls in the application.

begin;

alter table public.website_tasks
  add column if not exists assignee_usernames text[]
    not null default '{}'::text[];

alter table public.tasks
  add column if not exists assignee_usernames text[]
    not null default '{}'::text[];

update public.website_tasks as task
set assignee_usernames = array[profile.team_username]
from public.profiles as profile
where cardinality(task.assignee_usernames) = 0
  and task.assigned_to is not null
  and lower(btrim(profile.full_name)) = lower(btrim(task.assigned_to));

update public.tasks as task
set assignee_usernames = array[profile.team_username]
from public.profiles as profile
where cardinality(task.assignee_usernames) = 0
  and task.assigned_to is not null
  and lower(btrim(profile.full_name)) = lower(btrim(task.assigned_to));

create index if not exists website_tasks_assignee_usernames_idx
  on public.website_tasks using gin (assignee_usernames);

create index if not exists tasks_assignee_usernames_idx
  on public.tasks using gin (assignee_usernames);

commit;
