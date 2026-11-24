-- Leads from the booking form (plan 3.5, decision 0.7: a small Postgres DB in Supabase).
-- Only the site's server writes here, with the service-role key; RLS is on and
-- there are no public policies, so the anon key can neither read nor write.

create type lead_status as enum ('new', 'contacted', 'meeting', 'proposal', 'won', 'lost');
create type lead_project_type as enum ('residential', 'horeca', 'onSite');

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 3 and 320),
  phone text check (char_length(phone) <= 50),
  project_type lead_project_type not null,
  city text check (char_length(city) <= 200),
  about text check (char_length(about) <= 5000),
  locale text not null default 'ro' check (locale in ('ro', 'en')),
  source_page text,
  status lead_status not null default 'new',
  notes text,
  email_sent boolean not null default false
);

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status);

alter table public.leads enable row level security;

create function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_touch_updated_at
  before update on public.leads
  for each row execute function public.touch_updated_at();
