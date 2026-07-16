-- Run this entire file in the Supabase SQL Editor before opening the rebuilt
-- Team Projects section. It creates the division task hierarchy and seeds the
-- existing MVP Social media and Website workspaces as task cards.
-- It is safe to run again.
--
-- DEVELOPMENT PROTOTYPE ONLY: access is enforced in the app layer. Replace
-- this permissive policy with Supabase Auth and role-based RLS before
-- production.

begin;

create table if not exists public.division_tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  division text not null check (
    division in ('social-media', 'website', 'ads', 'branding', 'event')
  ),
  title text not null,
  description text,
  status text not null default 'planning' check (
    status in ('planning', 'production', 'review', 'approved')
  ),
  template_type text not null default 'generic',
  content_brief_data jsonb,
  filming_card_data jsonb,
  research_entries jsonb not null default '[]'::jsonb,
  figjam_embed_url text,
  created_at timestamptz default now()
);

alter table public.division_tasks
  add column if not exists template_type text;
alter table public.division_tasks
  add column if not exists content_brief_data jsonb;
alter table public.division_tasks
  add column if not exists filming_card_data jsonb;
alter table public.division_tasks
  add column if not exists research_entries jsonb;

update public.division_tasks
set research_entries = '[]'::jsonb
where research_entries is null;

alter table public.division_tasks
  alter column research_entries set default '[]'::jsonb;
alter table public.division_tasks
  alter column research_entries set not null;

alter table public.division_tasks
  drop constraint if exists division_tasks_research_entries_check;
alter table public.division_tasks
  add constraint division_tasks_research_entries_check
  check (jsonb_typeof(research_entries) = 'array');

update public.division_tasks
set template_type = 'generic'
where template_type is null;

alter table public.division_tasks
  alter column template_type set default 'generic';
alter table public.division_tasks
  alter column template_type set not null;

alter table public.division_tasks
  drop constraint if exists division_tasks_template_type_check;
alter table public.division_tasks
  add constraint division_tasks_template_type_check
  check (
    template_type in (
      'generic',
      'content_brief',
      'content_calendar',
      'analytics_results_hub',
      'filming_card',
      'website_dashboard'
    )
  );

alter table public.division_tasks
  drop constraint if exists division_tasks_filming_card_data_check;
alter table public.division_tasks
  add constraint division_tasks_filming_card_data_check
  check (
    filming_card_data is null
    or jsonb_typeof(filming_card_data) = 'object'
  );

alter table public.tasks
  add column if not exists division_task_id uuid
  references public.division_tasks(id) on delete cascade;
alter table public.tasks
  add column if not exists format text;
alter table public.tasks
  add column if not exists reel_details jsonb;
alter table public.tasks
  add column if not exists visual_note text;

update public.tasks task
set visual_note = (
  select slide.visual_note
  from public.task_slides slide
  where slide.task_id = task.id
    and nullif(btrim(slide.visual_note), '') is not null
  order by slide.slide_number
  limit 1
)
where task.visual_note is null
  and exists (
    select 1
    from public.task_slides slide
    where slide.task_id = task.id
      and nullif(btrim(slide.visual_note), '') is not null
  );

update public.tasks task
set format = case
  when (
    select count(*)
    from public.task_slides slide
    where slide.task_id = task.id
  ) = 1 then 'image'
  else 'carousel'
end
where task.format is null;

alter table public.tasks
  alter column format set default 'carousel';
alter table public.tasks
  alter column format set not null;

alter table public.tasks
  drop constraint if exists tasks_format_check;
alter table public.tasks
  add constraint tasks_format_check
  check (format in ('reel', 'carousel', 'image'));

alter table public.tasks
  drop constraint if exists tasks_reel_details_check;
alter table public.tasks
  add constraint tasks_reel_details_check
  check (
    (
      format = 'reel'
      and (
        reel_details is null
        or jsonb_typeof(reel_details) = 'object'
      )
    )
    or (
      format <> 'reel'
      and reel_details is null
    )
  );

create table if not exists public.social_research_entries (
  id uuid primary key default gen_random_uuid(),
  division_task_id uuid not null
    references public.division_tasks(id) on delete cascade,
  reference_link text not null,
  format text not null check (
    format in ('reel', 'carousel', 'image')
  ),
  hook text,
  storytelling_approach text,
  used_trending_audio boolean not null default false,
  audio_name text,
  views bigint check (views is null or views >= 0),
  engagement_rate numeric(7, 3) check (
    engagement_rate is null
    or (
      engagement_rate >= 0
      and engagement_rate <= 100
    )
  ),
  hook_types text[] not null default '{}'::text[],
  hook_explanation text,
  content_type text check (
    content_type is null
    or content_type in (
      'educational',
      'entertaining',
      'authority',
      'inspirational',
      'relatable',
      'promotional'
    )
  ),
  why_it_worked text,
  cta text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_research_entries
  drop constraint if exists social_research_entries_hook_types_check;
alter table public.social_research_entries
  add constraint social_research_entries_hook_types_check
  check (
    hook_types <@ array[
      'text_hook',
      'visual_hook',
      'audio_hook'
    ]::text[]
  );

alter table public.social_research_entries enable row level security;

drop policy if exists "Allow all social research entry access"
  on public.social_research_entries;
create policy "Allow all social research entry access"
  on public.social_research_entries
  for all
  using (true)
  with check (true);

create index if not exists social_research_entries_task_created_at_idx
  on public.social_research_entries (division_task_id, created_at desc);

insert into public.social_research_entries (
  id,
  division_task_id,
  reference_link,
  format,
  hook,
  storytelling_approach,
  used_trending_audio,
  audio_name,
  views,
  engagement_rate,
  hook_types,
  hook_explanation,
  content_type,
  why_it_worked,
  cta
)
select
  case
    when legacy.entry->>'id'
      ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      then (legacy.entry->>'id')::uuid
    else gen_random_uuid()
  end,
  task.id,
  legacy.entry->>'reference_link',
  case
    when legacy.entry->>'format' in ('reel', 'carousel', 'image')
      then legacy.entry->>'format'
    else 'carousel'
  end,
  nullif(legacy.entry->>'hook', ''),
  nullif(legacy.entry->>'storytelling_approach', ''),
  coalesce((legacy.entry->>'used_trending_audio')::boolean, false),
  nullif(legacy.entry->>'audio_name', ''),
  null,
  null,
  '{}'::text[],
  null,
  null,
  null,
  null
from public.division_tasks task
cross join lateral jsonb_array_elements(task.research_entries)
  as legacy(entry)
where task.template_type = 'analytics_results_hub'
  and nullif(legacy.entry->>'reference_link', '') is not null
on conflict (id) do nothing;

alter table public.division_tasks enable row level security;

drop policy if exists "Allow all division task access"
  on public.division_tasks;
create policy "Allow all division task access"
  on public.division_tasks
  for all
  using (true)
  with check (true);

create index if not exists division_tasks_client_division_created_at_idx
  on public.division_tasks (client_id, division, created_at desc);

create index if not exists tasks_division_task_created_at_idx
  on public.tasks (division_task_id, created_at);

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

  insert into public.division_tasks (
    client_id, division, title, description, status, template_type
  )
  select
    mvp_client_id,
    'social-media',
    'August content calendar',
    'Plan, produce, and review MVP social content for August.',
    'production',
    'content_calendar'
  where not exists (
    select 1
    from public.division_tasks existing
    where existing.client_id = mvp_client_id
      and existing.division = 'social-media'
      and existing.title = 'August content calendar'
  );

  insert into public.division_tasks (
    client_id, division, title, description, status, template_type
  )
  select
    client.id,
    'website',
    'Website dashboard',
    'Manage website page production, review, QA, and live previews.',
    'production',
    'website_dashboard'
  from public.clients client
  where client.slug in ('mvp', 'boardwalk', 'red-house')
    and not exists (
      select 1
      from public.division_tasks existing
      where existing.client_id = client.id
        and existing.division = 'website'
        and existing.title = 'Website dashboard'
  );

  update public.division_tasks
  set template_type = 'content_calendar'
  where division = 'social-media'
    and title = 'August content calendar';

  update public.division_tasks
  set template_type = 'website_dashboard'
  where division = 'website'
    and title = 'Website dashboard';

  update public.tasks social_task
  set division_task_id = calendar.id
  from public.division_tasks calendar
  where social_task.division_task_id is null
    and calendar.client_id = social_task.client_id
    and calendar.division = 'social-media'
    and calendar.template_type = 'content_calendar'
    and calendar.title = 'August content calendar';
end
$seed$;

commit;
