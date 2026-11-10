-- Run in Supabase SQL Editor after 20261106_create_events_schema.sql.
-- Existing rows remain published events. New staff-managed tournaments also appear in Esports.
alter table public.events
  add column if not exists listing_type text not null default 'EVENT',
  add column if not exists game_title text,
  add column if not exists match_format text,
  add column if not exists prize_pool text,
  add column if not exists partner_info text;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'events_listing_type_check' and conrelid = 'public.events'::regclass
  ) then
    alter table public.events
      add constraint events_listing_type_check check (listing_type in ('EVENT', 'TOURNAMENT'));
  end if;
end $$;

create index if not exists idx_events_published_tournaments
  on public.events (listing_type, is_draft, start_date desc);

-- Existing storage bucket and staff policies are supplied by the base schema.
-- Reapply bucket settings safely if the initial schema was already installed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-posters', 'event-posters', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- The original schema's public.events RLS and event-posters storage RLS remain in force.
-- Confirm verified staff records exist in public.admin_users before publishing.
