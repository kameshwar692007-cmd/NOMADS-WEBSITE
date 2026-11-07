-- ============================================================================
-- NOMAD'S PROVINCE — SITE & CONTACT SETTINGS SCHEMA + RLS POLICIES
-- Target: Supabase PostgreSQL (Idempotent, Production-Hardened)
-- Allows authorized staff/admin to dynamically update WhatsApp number & Email
-- ============================================================================

-- 1. Create site_settings table
create table if not exists public.site_settings (
  id text primary key default 'primary_config',
  whatsapp_number text not null default '+91 97897 20897',
  email text not null default 'nomadsprovince@gmail.com',
  instagram text default 'https://www.instagram.com/nomadsprovince?cplk=MWxzbHM3bWNrdXJ3Ng==',
  location text default 'Chennai, India',
  updated_by uuid references auth.users(id) on delete set null default auth.uid(),
  updated_at timestamptz not null default now(),
  constraint check_whatsapp_not_empty check (length(trim(whatsapp_number)) > 0),
  constraint check_email_format check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 2. Seed initial primary configuration row (with current verified WhatsApp number)
insert into public.site_settings (id, whatsapp_number, email, instagram, location)
values (
  'primary_config',
  '+91 97897 20897',
  'nomadsprovince@gmail.com',
  'https://www.instagram.com/nomadsprovince?cplk=MWxzbHM3bWNrdXJ3Ng==',
  'Chennai, India'
)
on conflict (id) do update set
  whatsapp_number = excluded.whatsapp_number,
  email = excluded.email,
  updated_at = now();

-- 3. Automatic updated_at trigger
create or replace function public.set_site_settings_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  NEW.updated_by = coalesce(auth.uid(), NEW.updated_by);
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_site_settings_updated_at();

-- 4. Enable Row Level Security (RLS)
alter table public.site_settings enable row level security;

-- ----------------------------------------------------------------------------
-- RLS POLICIES: site_settings table
-- ----------------------------------------------------------------------------

-- SELECT Policy: Public visitors and app users can read contact details
drop policy if exists "Public can view site settings" on public.site_settings;
create policy "Public can view site settings"
  on public.site_settings
  for select
  using (true);

-- INSERT Policy: Only authorized staff (SUPER_ADMIN, ADMIN, EDITOR) can insert settings
drop policy if exists "Staff can insert site settings" on public.site_settings;
create policy "Staff can insert site settings"
  on public.site_settings
  for insert
  with check (public.is_staff());

-- UPDATE Policy: Only authorized staff (SUPER_ADMIN, ADMIN, EDITOR) can update settings
drop policy if exists "Staff can update site settings" on public.site_settings;
create policy "Staff can update site settings"
  on public.site_settings
  for update
  using (public.is_staff())
  with check (public.is_staff());

-- DELETE Policy: Prevent deletion of primary configuration
drop policy if exists "Admins can delete site settings" on public.site_settings;
create policy "Admins can delete site settings"
  on public.site_settings
  for delete
  using (public.is_super_admin() and id <> 'primary_config');
