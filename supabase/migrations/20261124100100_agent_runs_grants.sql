-- Grant the server (service_role) access to the agent usage log, like
-- 20261124010000_leads_grants.sql: new Supabase projects don't auto-grant
-- privileges on tables created in SQL. anon/authenticated get nothing.

grant select, insert on table public.agent_runs to service_role;
