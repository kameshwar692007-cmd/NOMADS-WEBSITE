-- ============================================================================
-- NOMAD'S PROVINCE — PRODUCTION HARDENED SCHEMA & RBAC SECURITY POLICIES
-- Target: Supabase PostgreSQL (Free Tier Compatible, Idempotent)
-- ============================================================================

-- 1. Create Roles Enum & Admin Users Table
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('SUPER_ADMIN', 'ADMIN', 'EDITOR')),
  assigned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for RBAC role lookups
create index if not exists idx_admin_users_role on public.admin_users (role);
create index if not exists idx_admin_users_email on public.admin_users (email);

-- 2. Security Definer Helper Functions (To prevent RLS recursion & enforce RBAC)
create or replace function public.get_current_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role from public.admin_users where id = auth.uid()),
    'ANONYMOUS'
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid() and role = 'SUPER_ADMIN'
  );
$$;

create or replace function public.is_admin_or_super()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid() and role in ('SUPER_ADMIN', 'ADMIN')
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid() and role in ('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  );
$$;

-- 3. Create Events Table with Strict Integrity Constraints
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null check (length(trim(title)) > 0 and length(title) <= 140),
  category text not null check (category in ('Esports', 'Game Development', 'Sports')),
  venue text not null check (length(trim(venue)) > 0),
  start_date timestamptz not null,
  end_date timestamptz not null,
  registration_deadline timestamptz,
  status_mode text not null default 'AUTO' check (status_mode in ('AUTO', 'MANUAL')),
  manual_status text check (manual_status in ('UPCOMING', 'ONGOING', 'ENDED')),
  is_draft boolean not null default false,
  poster_url text,
  registration_url text,
  partner text default 'Nomad''s Province',
  description text,
  results jsonb default '{"champion": "", "runner_up": "", "highlights": "", "trophy_notes": ""}'::jsonb,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_dates_order check (end_date > start_date),
  constraint check_registration_deadline check (registration_deadline is null or registration_deadline <= end_date)
);

-- Ensure backwards-compatible columns if table already existed
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'events' and column_name = 'slug') then
    alter table public.events add column slug text;
    update public.events set slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(id::text, 1, 8);
    alter table public.events alter column slug set not null;
    alter table public.events add constraint events_slug_key unique (slug);
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'events' and column_name = 'status_mode') then
    alter table public.events add column status_mode text not null default 'AUTO' check (status_mode in ('AUTO', 'MANUAL'));
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'events' and column_name = 'manual_status') then
    alter table public.events add column manual_status text check (manual_status in ('UPCOMING', 'ONGOING', 'ENDED'));
  end if;

  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'events' and column_name = 'created_by') then
    alter table public.events add column created_by uuid references auth.users(id) on delete set null default auth.uid();
  end if;
end $$;

-- Indexes for events
create index if not exists idx_events_public_lookup on public.events (is_draft, start_date desc);
create index if not exists idx_events_slug on public.events (slug);
create index if not exists idx_events_category on public.events (category);
create index if not exists idx_events_status_mode on public.events (status_mode, manual_status);

-- Automatic updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_events_updated_at on public.events;
create trigger trg_events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- 4. Audit Log Table (Tamper-Resistant, Append-Only)
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE', 'STATUS_OVERRIDE', 'DRAFT_TOGGLE', 'RESULTS_RECORDED')),
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text not null default 'UNKNOWN',
  target_table text not null default 'events',
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_event on public.admin_audit_logs (event_id, created_at desc);
create index if not exists idx_audit_logs_actor on public.admin_audit_logs (actor_id);

-- Secure Audit Log Trigger (Executed by Database Engine, Cannot Be Fabricated by Client)
create or replace function public.process_events_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_role text;
  v_action text := TG_OP;
  v_event_id uuid := coalesce(NEW.id, OLD.id);
  v_payload jsonb;
begin
  -- Resolve actor role from trusted table
  select coalesce(
    (select role from public.admin_users where id = v_actor_id),
    case when v_actor_id is not null then 'AUTHENTICATED_USER' else 'SYSTEM' end
  ) into v_actor_role;

  if TG_OP = 'INSERT' then
    v_payload := jsonb_build_object(
      'title', NEW.title,
      'category', NEW.category,
      'is_draft', NEW.is_draft,
      'status_mode', NEW.status_mode,
      'start_date', NEW.start_date,
      'end_date', NEW.end_date
    );
  elsif TG_OP = 'UPDATE' then
    v_payload := jsonb_build_object(
      'changes', jsonb_strip_nulls(jsonb_build_object(
        'title', case when NEW.title is distinct from OLD.title then jsonb_build_object('old', OLD.title, 'new', NEW.title) else null end,
        'is_draft', case when NEW.is_draft is distinct from OLD.is_draft then jsonb_build_object('old', OLD.is_draft, 'new', NEW.is_draft) else null end,
        'status_mode', case when NEW.status_mode is distinct from OLD.status_mode then jsonb_build_object('old', OLD.status_mode, 'new', NEW.status_mode) else null end,
        'manual_status', case when NEW.manual_status is distinct from OLD.manual_status then jsonb_build_object('old', OLD.manual_status, 'new', NEW.manual_status) else null end,
        'results', case when NEW.results is distinct from OLD.results then jsonb_build_object('recorded', true) else null end
      ))
    );
  elsif TG_OP = 'DELETE' then
    v_payload := jsonb_build_object(
      'deleted_title', OLD.title,
      'deleted_slug', OLD.slug,
      'deleted_category', OLD.category
    );
  end if;

  insert into public.admin_audit_logs (event_id, action, actor_id, actor_role, target_table, payload)
  values (v_event_id, v_action, v_actor_id, v_actor_role, 'events', v_payload);

  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists trg_events_audit_log on public.events;
create trigger trg_events_audit_log
  after insert or update or delete on public.events
  for each row execute function public.process_events_audit_log();

-- 5. Enable Row Level Security (RLS) on All Tables
alter table public.admin_users enable row level security;
alter table public.events enable row level security;
alter table public.admin_audit_logs enable row level security;

-- ----------------------------------------------------------------------------
-- RLS POLICIES: admin_users table
-- ----------------------------------------------------------------------------
drop policy if exists "Users can read own role" on public.admin_users;
create policy "Users can read own role"
  on public.admin_users
  for select
  using (id = auth.uid() or public.is_super_admin());

drop policy if exists "Only Super Admins can insert admin users" on public.admin_users;
create policy "Only Super Admins can insert admin users"
  on public.admin_users
  for insert
  with check (public.is_super_admin());

drop policy if exists "Only Super Admins can update admin users" on public.admin_users;
create policy "Only Super Admins can update admin users"
  on public.admin_users
  for update
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "Only Super Admins can delete admin users" on public.admin_users;
create policy "Only Super Admins can delete admin users"
  on public.admin_users
  for delete
  using (public.is_super_admin());

-- ----------------------------------------------------------------------------
-- RLS POLICIES: events table
-- ----------------------------------------------------------------------------
-- SELECT: Anonymous and Non-Staff can only see published events (is_draft = false)
-- Staff (SUPER_ADMIN, ADMIN, EDITOR) can see all events (including drafts)
drop policy if exists "Public and non-staff can only view published events" on public.events;
drop policy if exists "Public visitors can only view published events" on public.events;
drop policy if exists "Authenticated admins can manage all events" on public.events;

create policy "Events select policy"
  on public.events
  for select
  using (
    is_draft = false
    or public.is_staff()
  );

-- INSERT: Only verified Staff (SUPER_ADMIN, ADMIN, EDITOR) can insert events
create policy "Staff can insert events"
  on public.events
  for insert
  with check (public.is_staff());

-- UPDATE: Only verified Staff can update events
create policy "Staff can update events"
  on public.events
  for update
  using (public.is_staff())
  with check (public.is_staff());

-- DELETE: Only ADMIN and SUPER_ADMIN can delete events (EDITORS cannot delete)
create policy "Admins and Super Admins can delete events"
  on public.events
  for delete
  using (public.is_admin_or_super());

-- ----------------------------------------------------------------------------
-- RLS POLICIES: admin_audit_logs table (Immutable Audit Trail)
-- ----------------------------------------------------------------------------
drop policy if exists "Authenticated admins can manage audit logs" on public.admin_audit_logs;
drop policy if exists "Admins and Super Admins can view audit logs" on public.admin_audit_logs;

-- SELECT: Only Admins and Super Admins can inspect audit logs
create policy "Admins and Super Admins can view audit logs"
  on public.admin_audit_logs
  for select
  using (public.is_admin_or_super());

-- Note: No client INSERT, UPDATE, or DELETE policies exist for admin_audit_logs!
-- Inserts are exclusively generated by the trusted process_events_audit_log() database trigger.
-- Direct client tampering, modification, or deletion of audit logs is completely blocked.

-- 6. Storage Bucket Setup & Hardened Storage RLS
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-posters',
  'event-posters',
  true,
  5242880, -- 5 MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage SELECT: Anyone can view public event posters
drop policy if exists "Public access to event posters" on storage.objects;
create policy "Public access to event posters"
  on storage.objects
  for select
  using (bucket_id = 'event-posters');

-- Storage INSERT: Only verified Staff can upload posters with mime check
drop policy if exists "Admins can upload event posters" on storage.objects;
drop policy if exists "Staff can upload event posters" on storage.objects;
create policy "Staff can upload event posters"
  on storage.objects
  for insert
  with check (
    bucket_id = 'event-posters'
    and public.is_staff()
  );

-- Storage UPDATE: Only verified Staff can replace posters
drop policy if exists "Staff can update event posters" on storage.objects;
create policy "Staff can update event posters"
  on storage.objects
  for update
  using (
    bucket_id = 'event-posters'
    and public.is_staff()
  )
  with check (
    bucket_id = 'event-posters'
    and public.is_staff()
  );

-- Storage DELETE: Only ADMIN and SUPER_ADMIN can delete poster files
drop policy if exists "Admins can delete event posters" on storage.objects;
create policy "Admins can delete event posters"
  on storage.objects
  for delete
  using (
    bucket_id = 'event-posters'
    and public.is_admin_or_super()
  );
