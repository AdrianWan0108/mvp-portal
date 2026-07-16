-- Run this entire file once in the Supabase SQL Editor before opening the
-- client portal Documents page. It creates the PDF Storage bucket, temporary
-- public policies, the client_documents table, and the three-source migration.
-- It is safe to run again.

begin;

insert into storage.buckets (id, name, public)
values ('client-documents', 'client-documents', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public can view client documents"
  on storage.objects;
create policy "Public can view client documents"
  on storage.objects
  for select
  to public
  using (bucket_id = 'client-documents');

drop policy if exists "Public can upload client documents"
  on storage.objects;
create policy "Public can upload client documents"
  on storage.objects
  for insert
  to public
  with check (bucket_id = 'client-documents');

drop policy if exists "Public can delete client documents"
  on storage.objects;
create policy "Public can delete client documents"
  on storage.objects
  for delete
  to public
  using (bucket_id = 'client-documents');

create table if not exists public.client_documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id),
  file_url text,
  file_name text,
  file_type text,
  category text,
  uploaded_by text,
  source_type text not null default 'pdf_upload',
  google_link text,
  created_at timestamptz default now()
);

-- These statements also migrate an existing file-upload-only table.
alter table public.client_documents
  add column if not exists source_type text;

alter table public.client_documents
  add column if not exists google_link text;

-- Google-backed rows intentionally have no uploaded file URL.
alter table public.client_documents
  alter column file_url drop not null;

update public.client_documents
set source_type = 'pdf_upload'
where source_type is null
  or source_type not in ('pdf_upload', 'google_doc', 'google_slide');

alter table public.client_documents
  alter column source_type set default 'pdf_upload',
  alter column source_type set not null;

alter table public.client_documents
  drop constraint if exists client_documents_source_type_check;

alter table public.client_documents
  add constraint client_documents_source_type_check check (
    source_type in ('pdf_upload', 'google_doc', 'google_slide')
  );

alter table public.client_documents enable row level security;

drop policy if exists "Allow all client document access"
  on public.client_documents;
create policy "Allow all client document access"
  on public.client_documents
  for all
  using (true)
  with check (true);

create index if not exists client_documents_client_created_at_idx
  on public.client_documents (client_id, created_at desc);

create index if not exists client_documents_client_category_idx
  on public.client_documents (client_id, category);

commit;
