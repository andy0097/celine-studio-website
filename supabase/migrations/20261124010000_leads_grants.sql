-- Grant the server (service_role) access to the leads table.
-- New Supabase projects do not auto-grant privileges on tables created in SQL,
-- so without this the admin Leads screen gets "permission denied for table leads".
-- anon/authenticated get nothing: RLS stays on and the table is server-only.

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.leads to service_role;
grant usage on type public.lead_status, public.lead_project_type to service_role;
