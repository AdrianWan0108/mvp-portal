-- Run this entire file in the Supabase SQL Editor before opening the client
-- Dashboard or Projects pages. It creates and extends the portal tables,
-- applies permissive development policies, and seeds MVP starter data.
-- It is safe to run again.

begin;

create table if not exists public.client_projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id),
  name text not null,
  project_type text not null check (project_type in ('project', 'program')),
  status_note text,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists public.client_project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.client_projects(id) on delete cascade,
  title text not null,
  done boolean default false,
  note text,
  created_at timestamptz default now()
);

alter table public.client_projects
  add column if not exists image_url text;

alter table public.client_project_tasks
  add column if not exists note text;

create table if not exists public.client_action_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id),
  title text not null,
  description text,
  due_date date,
  resolved boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.client_updates (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id),
  title text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.client_meetings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id),
  title text not null,
  meeting_date timestamptz,
  notes text
);

alter table public.client_projects enable row level security;
alter table public.client_project_tasks enable row level security;
alter table public.client_action_items enable row level security;
alter table public.client_updates enable row level security;
alter table public.client_meetings enable row level security;

drop policy if exists "Allow all client project access" on public.client_projects;
create policy "Allow all client project access"
  on public.client_projects
  for all
  using (true)
  with check (true);

drop policy if exists "Allow all client project task access"
  on public.client_project_tasks;
create policy "Allow all client project task access"
  on public.client_project_tasks
  for all
  using (true)
  with check (true);

drop policy if exists "Allow all client action item access"
  on public.client_action_items;
create policy "Allow all client action item access"
  on public.client_action_items
  for all
  using (true)
  with check (true);

drop policy if exists "Allow all client update access"
  on public.client_updates;
create policy "Allow all client update access"
  on public.client_updates
  for all
  using (true)
  with check (true);

drop policy if exists "Allow all client meeting access"
  on public.client_meetings;
create policy "Allow all client meeting access"
  on public.client_meetings
  for all
  using (true)
  with check (true);

create index if not exists client_projects_client_id_created_at_idx
  on public.client_projects (client_id, created_at);

create index if not exists client_project_tasks_project_id_created_at_idx
  on public.client_project_tasks (project_id, created_at);

create index if not exists client_action_items_client_id_due_date_idx
  on public.client_action_items (client_id, due_date);

create index if not exists client_updates_client_id_created_at_idx
  on public.client_updates (client_id, created_at desc);

create index if not exists client_meetings_client_id_meeting_date_idx
  on public.client_meetings (client_id, meeting_date);

do $seed$
declare
  mvp_client_id uuid;
  seeded_project_id uuid;
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

  select id into seeded_project_id
  from public.client_projects
  where client_id = mvp_client_id and name = 'Rebranding'
  limit 1;

  if seeded_project_id is null then
    insert into public.client_projects (
      client_id, name, project_type, status_note
    ) values (
      mvp_client_id, 'Rebranding', 'project', null
    ) returning id into seeded_project_id;
  else
    update public.client_projects
    set project_type = 'project', status_note = null
    where id = seeded_project_id;
  end if;

  insert into public.client_project_tasks (project_id, title, done)
  select seeded_project_id, task.title, task.done
  from (
    values
      ('Logo', true),
      ('Colour palette', true),
      ('Fonts', false),
      ('Storefront banner', false)
  ) as task(title, done)
  where not exists (
    select 1
    from public.client_project_tasks existing
    where existing.project_id = seeded_project_id
      and existing.title = task.title
  );

  select id into seeded_project_id
  from public.client_projects
  where client_id = mvp_client_id and name = 'Website rebuild'
  limit 1;

  if seeded_project_id is null then
    insert into public.client_projects (
      client_id, name, project_type, status_note
    ) values (
      mvp_client_id, 'Website rebuild', 'project', null
    ) returning id into seeded_project_id;
  else
    update public.client_projects
    set project_type = 'project', status_note = null
    where id = seeded_project_id;
  end if;

  insert into public.client_project_tasks (project_id, title, done)
  select seeded_project_id, task.title, task.done
  from (
    values
      ('Homepage', true),
      ('Booking funnel', false),
      ('Training page', false)
  ) as task(title, done)
  where not exists (
    select 1
    from public.client_project_tasks existing
    where existing.project_id = seeded_project_id
      and existing.title = task.title
  );

  select id into seeded_project_id
  from public.client_projects
  where client_id = mvp_client_id and name = 'Anniversary event'
  limit 1;

  if seeded_project_id is null then
    insert into public.client_projects (
      client_id, name, project_type, status_note
    ) values (
      mvp_client_id, 'Anniversary event', 'project', null
    ) returning id into seeded_project_id;
  else
    update public.client_projects
    set project_type = 'project', status_note = null
    where id = seeded_project_id;
  end if;

  insert into public.client_project_tasks (project_id, title, done)
  select seeded_project_id, task.title, false
  from (
    values
      ('Venue'),
      ('Invitations'),
      ('Run of show')
  ) as task(title)
  where not exists (
    select 1
    from public.client_project_tasks existing
    where existing.project_id = seeded_project_id
      and existing.title = task.title
  );

  if not exists (
    select 1
    from public.client_projects
    where client_id = mvp_client_id
      and name = 'Social media management'
  ) then
    insert into public.client_projects (
      client_id, name, project_type, status_note
    ) values (
      mvp_client_id,
      'Social media management',
      'program',
      'Starting August · prep underway'
    );
  else
    update public.client_projects
    set
      project_type = 'program',
      status_note = 'Starting August · prep underway'
    where client_id = mvp_client_id
      and name = 'Social media management';
  end if;

  if not exists (
    select 1
    from public.client_projects
    where client_id = mvp_client_id
      and name = 'Website optimisation'
  ) then
    insert into public.client_projects (
      client_id, name, project_type, status_note
    ) values (
      mvp_client_id,
      'Website optimisation',
      'program',
      'Starting August · prep underway'
    );
  else
    update public.client_projects
    set
      project_type = 'program',
      status_note = 'Starting August · prep underway'
    where client_id = mvp_client_id
      and name = 'Website optimisation';
  end if;

  -- Give active project cards a temporary cover until final visuals exist.
  update public.client_projects
  set image_url = 'https://placehold.co/400x200'
  where client_id = mvp_client_id
    and project_type = 'project'
    and image_url is null;

  -- Add context to each pending task without changing its completion state.
  update public.client_project_tasks as project_task
  set note = seeded_note.note
  from public.client_projects as project,
    (
      values
        (
          'Rebranding',
          'Fonts',
          'Two directions in review, final pick due this week'
        ),
        (
          'Rebranding',
          'Storefront banner',
          'Design draft in progress'
        ),
        (
          'Website rebuild',
          'Booking funnel',
          'Wireframe review needed'
        ),
        (
          'Website rebuild',
          'Training page',
          'Content pending from Dorothy'
        ),
        (
          'Anniversary event',
          'Venue',
          'Shortlisting 3 options'
        ),
        (
          'Anniversary event',
          'Invitations',
          'Design not started'
        ),
        (
          'Anniversary event',
          'Run of show',
          'Draft timeline pending'
        )
    ) as seeded_note(project_name, task_title, note)
  where project_task.project_id = project.id
    and project.client_id = mvp_client_id
    and project.name = seeded_note.project_name
    and project_task.title = seeded_note.task_title
    and project_task.note is null;

  insert into public.client_action_items (
    client_id,
    title,
    description,
    due_date
  )
  select
    mvp_client_id,
    seeded_action.title,
    seeded_action.description,
    seeded_action.due_date
  from (
    values
      (
        'Confirm storefront banner direction',
        'Review the two proposed banner directions and confirm which one should move into final design.',
        current_date + 3
      ),
      (
        'Approve August social calendar',
        'Review the August carousel plan and flag any final copy or visual changes.',
        (date_trunc('month', current_date) + interval '1 month - 1 day')::date
      ),
      (
        'Send training page copy',
        'Share Dorothy’s final program details so the training page can move forward.',
        current_date + 7
      )
  ) as seeded_action(title, description, due_date)
  where not exists (
    select 1
    from public.client_action_items existing
    where existing.client_id = mvp_client_id
      and existing.title = seeded_action.title
  );

  insert into public.client_updates (
    client_id,
    title,
    description,
    created_at
  )
  select
    mvp_client_id,
    seeded_update.title,
    seeded_update.description,
    seeded_update.created_at
  from (
    values
      (
        'Logo finalized and added to Gallery',
        'The approved primary logo is ready to view alongside the supporting brand files.',
        now() - interval '1 day'
      ),
      (
        'Homepage build completed',
        'The new homepage structure and responsive build are complete and ready for the next review.',
        now() - interval '3 days'
      ),
      (
        'August social concepts prepared',
        'Initial carousel concepts and visual direction have been organized for approval.',
        now() - interval '5 days'
      )
  ) as seeded_update(title, description, created_at)
  where not exists (
    select 1
    from public.client_updates existing
    where existing.client_id = mvp_client_id
      and existing.title = seeded_update.title
  );

  insert into public.client_meetings (
    client_id,
    title,
    meeting_date,
    notes
  )
  select
    mvp_client_id,
    'Rebrand check-in call',
    date_trunc('day', now()) + interval '4 days 14 hours',
    'Review the remaining brand decisions and confirm next steps.'
  where not exists (
    select 1
    from public.client_meetings existing
    where existing.client_id = mvp_client_id
      and existing.title = 'Rebrand check-in call'
      and existing.meeting_date >= now()
  );
end
$seed$;

commit;
