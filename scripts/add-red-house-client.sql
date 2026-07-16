-- Run this once in the Supabase SQL Editor before selecting the Red House
-- workspace. It is safe to run again.

insert into public.clients (name, slug)
values ('Red House Vision Centre', 'red-house')
on conflict (slug) do nothing;
