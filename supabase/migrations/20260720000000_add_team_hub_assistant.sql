-- Team Hub Claude assistant: conversations, messages, and per-request usage
-- so a monthly spend cap can be enforced server-side before ever calling the
-- Anthropic API. Access is entirely through app/api/team-hub/assistant, using
-- the service-role client and the team_session cookie (see the rationale in
-- 20260717010000_add_profile_self_service.sql) — RLS here stays the same
-- permissive "allow all" shape used across the rest of the Team Hub.

begin;

create table if not exists public.assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  team_username text not null,
  agent text not null,
  client_id uuid references public.clients(id) on delete set null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assistant_conversations
  drop constraint if exists assistant_conversations_agent_check;
alter table public.assistant_conversations
  add constraint assistant_conversations_agent_check check (
    agent in ('content', 'research')
  );

alter table public.assistant_conversations enable row level security;

drop policy if exists "Allow all assistant conversation access"
  on public.assistant_conversations;
create policy "Allow all assistant conversation access"
  on public.assistant_conversations
  for all
  using (true)
  with check (true);

create index if not exists assistant_conversations_team_created_at_idx
  on public.assistant_conversations (team_username, created_at desc);

create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null
    references public.assistant_conversations(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.assistant_messages
  drop constraint if exists assistant_messages_role_check;
alter table public.assistant_messages
  add constraint assistant_messages_role_check check (
    role in ('user', 'assistant')
  );

alter table public.assistant_messages enable row level security;

drop policy if exists "Allow all assistant message access"
  on public.assistant_messages;
create policy "Allow all assistant message access"
  on public.assistant_messages
  for all
  using (true)
  with check (true);

create index if not exists assistant_messages_conversation_created_at_idx
  on public.assistant_messages (conversation_id, created_at);

create table if not exists public.assistant_usage (
  id uuid primary key default gen_random_uuid(),
  team_username text not null,
  conversation_id uuid
    references public.assistant_conversations(id) on delete set null,
  agent text not null,
  model text not null,
  input_tokens integer not null,
  output_tokens integer not null,
  estimated_cost_usd numeric(10, 4) not null,
  created_at timestamptz not null default now()
);

alter table public.assistant_usage enable row level security;

drop policy if exists "Allow all assistant usage access"
  on public.assistant_usage;
create policy "Allow all assistant usage access"
  on public.assistant_usage
  for all
  using (true)
  with check (true);

create index if not exists assistant_usage_created_at_idx
  on public.assistant_usage (created_at);

commit;
