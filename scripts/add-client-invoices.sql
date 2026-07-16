-- Run this entire file once in the Supabase SQL Editor before opening the
-- client portal Invoices page. It creates the invoice table and PDF bucket if
-- needed, migrates legacy statuses, installs the two-status constraint, and
-- keeps public client access read-only. It is safe to run again.

begin;

insert into storage.buckets (id, name, public)
values ('client-invoices', 'client-invoices', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can view client invoices"
  on storage.objects;
create policy "Public can view client invoices"
  on storage.objects
  for select
  to public
  using (bucket_id = 'client-invoices');

drop policy if exists "Public can upload client invoices"
  on storage.objects;

drop policy if exists "Public can delete client invoices"
  on storage.objects;

create table if not exists public.client_invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id),
  invoice_number text not null,
  description text,
  amount numeric(12, 2) not null default 0,
  currency text not null default 'CAD',
  status text not null default 'sent',
  issued_date date not null default current_date,
  due_date date,
  file_url text,
  file_name text,
  uploaded_by text,
  created_at timestamptz default now()
);

-- Remove any existing check constraint tied to `status` before migration in
-- case its name differs or it does not allow the new `received` value yet.
do $migration$
declare
  status_constraint record;
begin
  for status_constraint in
    select constraint_row.conname
    from pg_constraint as constraint_row
    where constraint_row.conrelid = 'public.client_invoices'::regclass
      and constraint_row.contype = 'c'
      and pg_get_constraintdef(constraint_row.oid) ilike '%status%'
  loop
    execute format(
      'alter table public.client_invoices drop constraint %I',
      status_constraint.conname
    );
  end loop;
end
$migration$;

update public.client_invoices
set status = 'received'
where status in ('pending_payment', 'paid');

update public.client_invoices
set status = 'sent'
where status is null;

alter table public.client_invoices
  alter column status set default 'sent',
  alter column status set not null;

alter table public.client_invoices
  add constraint client_invoices_status_check check (
    status in ('sent', 'received')
  );

alter table public.client_invoices enable row level security;

drop policy if exists "Allow all client invoice access"
  on public.client_invoices;

drop policy if exists "Allow public client invoice reads"
  on public.client_invoices;
create policy "Allow public client invoice reads"
  on public.client_invoices
  for select
  to public
  using (true);

create unique index if not exists client_invoices_client_number_idx
  on public.client_invoices (client_id, invoice_number);

create index if not exists client_invoices_client_issued_date_idx
  on public.client_invoices (client_id, issued_date desc);

commit;
