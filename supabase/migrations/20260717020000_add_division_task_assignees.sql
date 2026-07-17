-- Allow project-level task cards to tag more than one team member. Usernames
-- are stable profile identifiers; display names and avatars still come from
-- team_profile_directory.

begin;

alter table public.division_tasks
  add column if not exists assignee_usernames text[]
    not null default '{}'::text[];

create index if not exists division_tasks_assignee_usernames_idx
  on public.division_tasks using gin (assignee_usernames);

commit;
