-- Adds self-service profile access for the Team Hub "Profile" page.
--
-- IMPORTANT CONTEXT: the Team Hub does not use Supabase Auth. Login is a
-- client-side cookie holding a plaintext team username, checked against a
-- hardcoded identity map (see lib/team-auth.ts). auth.uid() is therefore
-- always null for every request the browser makes, and public.profiles
-- already has RLS enabled with no policies plus `revoke all ... from anon,
-- authenticated`. Real enforcement for this feature happens server-side in
-- app/api/team-hub/profile/route.ts, which reads the team_session cookie
-- and uses a service-role client that bypasses RLS entirely.
--
-- The policies and grants below are added anyway as defense-in-depth for a
-- future migration to real Supabase Auth, where auth.uid() would actually
-- be populated. They are inert today.

begin;

-- Lets a policy check "is the caller an owner" without recursively
-- re-applying RLS to profiles from inside its own policy.
create or replace function public.is_team_hub_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and role = 'owner'
  );
$$;

revoke all on function public.is_team_hub_owner() from public;
grant execute on function public.is_team_hub_owner() to authenticated;

drop policy if exists "Team members can view own profile" on public.profiles;
create policy "Team members can view own profile"
  on public.profiles
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Team members can update own profile"
  on public.profiles;
create policy "Team members can update own profile"
  on public.profiles
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Owners can view any profile" on public.profiles;
create policy "Owners can view any profile"
  on public.profiles
  for select
  to authenticated
  using (public.is_team_hub_owner());

drop policy if exists "Owners can update any profile" on public.profiles;
create policy "Owners can update any profile"
  on public.profiles
  for update
  to authenticated
  using (public.is_team_hub_owner())
  with check (public.is_team_hub_owner());

-- Column-level grant: even once `authenticated` can reach this table, only
-- the fields this feature edits are writable that way. avatar_url,
-- slack_display_name, slack_user_id, slack_synced_at, role, team_username,
-- id, user_id, and created_at stay out of reach for both self- and
-- owner-edits, matching the exclusions enforced again in the API route.
grant select on public.profiles to authenticated;
grant update (full_name, email, title) on public.profiles to authenticated;

commit;
