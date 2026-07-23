-- Shared social approval workflow. Posts remain in the production `tasks`
-- table; this migration adds the internal gate and the client-facing handoff.

begin;

alter table public.division_tasks
  drop constraint if exists division_tasks_template_type_check;
alter table public.division_tasks
  add constraint division_tasks_template_type_check
  check (
    template_type in (
      'generic',
      'content_brief',
      'content_calendar',
      'internal_approval',
      'analytics_results_hub',
      'website_dashboard'
    )
  );

alter table public.tasks
  add column if not exists scheduled_at timestamptz;
alter table public.tasks
  add column if not exists internal_review_submitted_at timestamptz;
alter table public.tasks
  add column if not exists internal_approval_task_id uuid
    references public.division_tasks(id) on delete set null;
alter table public.tasks
  add column if not exists internal_approvals jsonb
    not null default '{}'::jsonb;
alter table public.tasks
  add column if not exists client_approvals jsonb
    not null default '{}'::jsonb;
alter table public.tasks
  add column if not exists approval_history jsonb
    not null default '[]'::jsonb;
alter table public.tasks
  add column if not exists final_confirmed boolean
    not null default false;
alter table public.tasks
  add column if not exists final_confirmed_by text;
alter table public.tasks
  add column if not exists final_confirmed_at timestamptz;
alter table public.tasks
  add column if not exists sent_to_client_at timestamptz;
alter table public.tasks
  add column if not exists sent_to_client_by text;

alter table public.tasks
  drop constraint if exists tasks_internal_approvals_object_check;
alter table public.tasks
  add constraint tasks_internal_approvals_object_check
  check (jsonb_typeof(internal_approvals) = 'object');

alter table public.tasks
  drop constraint if exists tasks_client_approvals_object_check;
alter table public.tasks
  add constraint tasks_client_approvals_object_check
  check (jsonb_typeof(client_approvals) = 'object');

alter table public.tasks
  drop constraint if exists tasks_approval_history_array_check;
alter table public.tasks
  add constraint tasks_approval_history_array_check
  check (jsonb_typeof(approval_history) = 'array');

create index if not exists tasks_internal_approval_queue_idx
  on public.tasks (internal_approval_task_id, internal_review_submitted_at);

create index if not exists tasks_client_social_approval_queue_idx
  on public.tasks (client_id, sent_to_client_at);

-- Every existing client receives one canonical Internal Approval task.
insert into public.division_tasks (
  client_id,
  division,
  title,
  description,
  status,
  template_type,
  watcher_usernames
)
select
  client.id,
  'social-media',
  'Internal Approval',
  'Review submitted social posts, confirm the schedule and final caption, then send approved work to the client portal.',
  'review',
  'internal_approval',
  array['Understory_Karen', 'Understory_Adrian']::text[]
from public.clients client
where not exists (
  select 1
  from public.division_tasks existing
  where existing.client_id = client.id
    and existing.division = 'social-media'
    and existing.template_type = 'internal_approval'
);

-- Attach social posts already waiting for review to the matching queue.
update public.tasks post
set
  internal_approval_task_id = (
    select division_task.id
    from public.division_tasks division_task
    where division_task.client_id = post.client_id
      and division_task.division = 'social-media'
      and division_task.template_type = 'internal_approval'
    order by division_task.created_at asc
    limit 1
  ),
  internal_review_submitted_at = coalesce(
    post.internal_review_submitted_at,
    post.created_at,
    now()
  )
where post.status = 'for_review'
  and post.internal_approval_task_id is null
  and exists (
    select 1
    from public.division_tasks division_task
    where division_task.client_id = post.client_id
      and division_task.division = 'social-media'
      and division_task.template_type = 'internal_approval'
  );

commit;
