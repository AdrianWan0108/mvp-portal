-- Run this entire file once in the Supabase SQL Editor before testing
-- positioned comments on website previews. It is safe to run again.

begin;

-- Migrate the previous first-stage status to the expanded workflow name.
update public.website_tasks
set column_status = 'needs_content'
where column_status = 'backlog';

do $migration$
declare
  website_task_id_type text;
begin
  if to_regclass('public.page_comment_pins') is null then
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
      'create table public.page_comment_pins (
        id uuid primary key default gen_random_uuid(),
        task_id %s not null references public.website_tasks(id) on delete cascade,
        x_percent double precision not null check (x_percent between 0 and 100),
        y_percent double precision not null check (y_percent between 0 and 100),
        comment text not null check (length(trim(comment)) > 0),
        author text not null,
        resolved boolean not null default false,
        created_at timestamptz not null default now()
      )',
      website_task_id_type
    );
  end if;
end
$migration$;

alter table public.page_comment_pins
  add column if not exists resolved boolean not null default false;

create index if not exists page_comment_pins_task_id_created_at_idx
  on public.page_comment_pins (task_id, created_at);

commit;
