-- ============================================================================
-- NOMAD'S PROVINCE — OFFICIAL EVENT MANAGEMENT SCHEMA & RLS POLICIES
-- Target: Supabase PostgreSQL (Free Tier Compatible)
-- ============================================================================

-- 1. Create Events Table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('Esports', 'Game Development', 'Sports')),
  venue text not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  registration_deadline timestamptz,
  status text not null check (status in ('AUTO', 'UPCOMING', 'ONGOING', 'ENDED')) default 'AUTO',
  is_draft boolean not null default false,
  poster_url text,
  registration_url text,
  partner text,
  description text,
  results jsonb default '{"champion": "", "runner_up": "", "highlights": "", "trophy_notes": ""}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for high-performance public filtering
create index if not exists idx_events_visibility on public.events (is_draft, start_date, end_date);
create index if not exists idx_events_category on public.events (category);

-- 2. Audit Log Table for Administrative Operations
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete set null,
  action text not null, -- 'CREATE', 'UPDATE', 'DELETE', 'STATUS_OVERRIDE', 'PUBLISH'
  performed_by text not null default 'admin',
  details jsonb,
  created_at timestamptz not null default now()
);

-- 3. Row Level Security (RLS)
alter table public.events enable row level security;
alter table public.admin_audit_logs enable row level security;

-- Drop old policies if existing
drop policy if exists "Public visitors can only view published events" on public.events;
drop policy if exists "Authenticated admins can manage all events" on public.events;
drop policy if exists "Authenticated admins can manage audit logs" on public.admin_audit_logs;

-- PUBLIC POLICY: Visitors can ONLY see non-draft events
create policy "Public visitors can only view published events"
  on public.events
  for select
  using (is_draft = false);

-- ADMIN POLICY: Authenticated users have full management rights
create policy "Authenticated admins can manage all events"
  on public.events
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- AUDIT LOG POLICY: Authenticated users can read and insert logs
create policy "Authenticated admins can manage audit logs"
  on public.admin_audit_logs
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 4. Storage Bucket Setup for Event Posters
insert into storage.buckets (id, name, public)
values ('event-posters', 'event-posters', true)
on conflict (id) do update set public = true;

-- Storage RLS: Public read access for posters
drop policy if exists "Public access to event posters" on storage.objects;
create policy "Public access to event posters"
  on storage.objects
  for select
  using (bucket_id = 'event-posters');

-- Storage RLS: Authenticated upload/edit access for admins
drop policy if exists "Admins can upload event posters" on storage.objects;
create policy "Admins can upload event posters"
  on storage.objects
  for all
  using (bucket_id = 'event-posters' and auth.role() = 'authenticated')
  with check (bucket_id = 'event-posters' and auth.role() = 'authenticated');
