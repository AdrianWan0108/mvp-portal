-- Run this entire file once in the Supabase SQL Editor before testing the
-- website detail preview and comments. It is safe to run again.

begin;

alter table website_tasks
  add column if not exists live_url text;

do $migration$
declare
  website_task_id_type text;
begin
  if to_regclass('public.page_comments') is null then
    select format_type(attribute.atttypid, attribute.atttypmod)
    into website_task_id_type
    from pg_attribute as attribute
    join pg_class as relation on relation.oid = attribute.attrelid
    join pg_namespace as namespace on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relname = 'website_tasks'
      and attribute.attname = 'id'
      and not attribute.attisdropped;

    if website_task_id_type is null then
      raise exception 'website_tasks.id was not found';
    end if;

    execute format(
      'create table public.page_comments (
        id uuid primary key default gen_random_uuid(),
        task_id %s not null references public.website_tasks(id) on delete cascade,
        author text not null,
        comment text not null,
        created_at timestamptz not null default now()
      )',
      website_task_id_type
    );
  end if;
end
$migration$;

create index if not exists page_comments_task_id_created_at_idx
  on page_comments (task_id, created_at);

commit;
