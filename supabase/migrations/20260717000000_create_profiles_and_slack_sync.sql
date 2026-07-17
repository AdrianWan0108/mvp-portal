-- Create the Understory team profile directory and add the fields populated by
-- the sync-slack-profiles Edge Function.

begin;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  email text,
  full_name text not null,
  role text,
  team_username text,
  title text,
  slack_user_id text,
  avatar_url text,
  slack_display_name text,
  slack_synced_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists user_id uuid references auth.users(id)
    on delete set null;
alter table public.profiles
  add column if not exists email text;
alter table public.profiles
  add column if not exists full_name text;
alter table public.profiles
  add column if not exists role text;
alter table public.profiles
  add column if not exists team_username text;
alter table public.profiles
  add column if not exists title text;
alter table public.profiles
  add column if not exists slack_user_id text;
alter table public.profiles
  add column if not exists avatar_url text;
alter table public.profiles
  add column if not exists slack_display_name text;
alter table public.profiles
  add column if not exists slack_synced_at timestamptz;
alter table public.profiles
  add column if not exists created_at timestamptz default now();

create unique index if not exists profiles_team_username_idx
  on public.profiles (team_username)
  where team_username is not null;

create unique index if not exists profiles_email_lower_idx
  on public.profiles (lower(email))
  where email is not null and btrim(email) <> '';

create unique index if not exists profiles_slack_user_id_idx
  on public.profiles (slack_user_id)
  where slack_user_id is not null and btrim(slack_user_id) <> '';

insert into public.profiles (
  team_username,
  full_name,
  role,
  title
)
values
  ('Understory_Karen', 'Karen', 'owner', 'Owner'),
  ('Understory_Adrian', 'Adrian', 'owner', 'Co-owner'),
  ('Understory_Arion', 'Arion', 'staff', 'Creative Director'),
  ('Understory_Sure', 'Sure', 'staff', 'Media Buyer'),
  ('Understory_Emilia', 'Emilia', 'staff', 'Graphic Designer')
on conflict (team_username) where team_username is not null do update
set
  full_name = excluded.full_name,
  role = excluded.role,
  title = excluded.title;

alter table public.profiles enable row level security;

-- Profile emails and identifiers remain service-role-only. The client reads
-- only this intentionally narrow directory view.
create or replace view public.team_profile_directory
with (security_invoker = false)
as
select
  team_username,
  full_name,
  avatar_url,
  slack_display_name,
  slack_synced_at
from public.profiles
where team_username is not null;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.team_profile_directory from anon, authenticated;
grant select on table public.team_profile_directory to anon, authenticated;

commit;
