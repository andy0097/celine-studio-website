-- Usage log of the admin Agent (plan 5.2 / 5.5). One row per chat request,
-- written by the site's server with the service-role key. The monthly cap
-- (AGENT_MONTHLY_BUDGET_USD) is the sum of cost_usd for the current month.
-- RLS on, no public policies: the anon key can neither read nor write.

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id text not null,
  user_name text,
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cache_read_tokens integer not null default 0,
  cache_write_tokens integer not null default 0,
  cost_usd numeric(10, 4) not null default 0,
  prompt text check (char_length(prompt) <= 2000),
  stop_reason text,
  pull_requests text[] not null default '{}'
);

create index agent_runs_created_at_idx on public.agent_runs (created_at desc);

alter table public.agent_runs enable row level security;

-- New Supabase projects don't grant API roles access to tables made in SQL.
grant select, insert on table public.agent_runs to service_role;
