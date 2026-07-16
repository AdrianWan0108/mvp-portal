-- DEVELOPMENT PROTOTYPE ONLY.
--
-- The /admin login is currently a browser-side session flag, not Supabase
-- Auth. Supabase cannot distinguish that flag in RLS, so these policies allow
-- anonymous invoice writes required by the prototype admin console. Replace
-- this with Supabase Auth plus role-based RLS before production.
--
-- Other portal tables already use permissive "allow all for now" policies.
-- This file adds only the invoice table and Storage writes that were previously
-- made read-only. It is safe to run again.

begin;

drop policy if exists "Allow admin prototype invoice writes"
  on public.client_invoices;
create policy "Allow admin prototype invoice writes"
  on public.client_invoices
  for all
  to public
  using (true)
  with check (true);

drop policy if exists "Admin prototype can upload invoices"
  on storage.objects;
create policy "Admin prototype can upload invoices"
  on storage.objects
  for insert
  to public
  with check (bucket_id = 'client-invoices');

drop policy if exists "Admin prototype can delete invoices"
  on storage.objects;
create policy "Admin prototype can delete invoices"
  on storage.objects
  for delete
  to public
  using (bucket_id = 'client-invoices');

commit;
