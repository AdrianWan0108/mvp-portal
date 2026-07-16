-- Run this entire file once in the Supabase SQL Editor.
-- It is safe to run again: matching starter task titles are skipped.

begin;

do $seed$
declare
  mvp_client_id clients.id%type;
  boardwalk_client_id clients.id%type;
begin
  select id into mvp_client_id
  from clients
  where slug = 'mvp'
  limit 1;

  if mvp_client_id is null then
    insert into clients (name, slug)
    values ('Motion Vitality Pilates', 'mvp')
    returning id into mvp_client_id;
  end if;

  select id into boardwalk_client_id
  from clients
  where slug = 'boardwalk'
  limit 1;

  if boardwalk_client_id is null then
    insert into clients (name, slug)
    values ('Boardwalk', 'boardwalk')
    returning id into boardwalk_client_id;
  end if;

  if not exists (
    select 1 from website_tasks
    where client_id = mvp_client_id
      and title = 'Homepage needs-based funnel'
  ) then
    insert into website_tasks (
      client_id, title, description, column_status, priority
    ) values (
      mvp_client_id,
      'Homepage needs-based funnel',
      'Build out the funnel flow connecting homepage to class booking.',
      'in_progress',
      'normal'
    );
  end if;

  if not exists (
    select 1 from website_tasks
    where client_id = mvp_client_id
      and title = 'Polestar training page'
  ) then
    insert into website_tasks (
      client_id, title, description, column_status, priority
    ) values (
      mvp_client_id,
      'Polestar training page',
      'Content and layout for the Polestar teacher training program page.',
      'review',
      'normal'
    );
  end if;

  if not exists (
    select 1 from website_tasks
    where client_id = boardwalk_client_id
      and title = 'Ortho-K Google Ads landing page'
  ) then
    insert into website_tasks (
      client_id, title, description, column_status, priority
    ) values (
      boardwalk_client_id,
      'Ortho-K Google Ads landing page',
      'Landing page for the Ortho-K campaign.',
      'done',
      'normal'
    );
  end if;

  if not exists (
    select 1 from website_tasks
    where client_id = boardwalk_client_id
      and title = 'Nano Vista trunk show event page'
  ) then
    insert into website_tasks (
      client_id, title, description, column_status, priority
    ) values (
      boardwalk_client_id,
      'Nano Vista trunk show event page',
      'Event page for the August 22 trunk show.',
      'needs_content',
      'high'
    );
  end if;
end
$seed$;

commit;
