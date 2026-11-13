-- Apply AFTER 20261106_create_events_schema.sql (staff helper functions required).
-- Idempotent Studio portfolio schema. Public can read only published records.
create table if not exists public.studio_projects (
  id text primary key,
  title text not null check (length(trim(title)) between 1 and 140),
  genre text not null default '',
  engine text not null default '',
  status text not null default 'IN DEVELOPMENT',
  accent text not null default '#38bdf8' check (accent ~ '^#[0-9A-Fa-f]{6}$'),
  image_url text not null default '',
  description text not null default '',
  project_url text,
  is_published boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null default auth.uid()
);
create index if not exists idx_studio_projects_public on public.studio_projects(is_published,display_order,id);
drop trigger if exists trg_studio_projects_updated_at on public.studio_projects;
create trigger trg_studio_projects_updated_at before update on public.studio_projects
for each row execute function public.set_updated_at();
alter table public.studio_projects enable row level security;
drop policy if exists "Studio published or staff read" on public.studio_projects;
create policy "Studio published or staff read" on public.studio_projects
for select using (is_published = true or public.is_staff());
drop policy if exists "Studio staff insert" on public.studio_projects;
create policy "Studio staff insert" on public.studio_projects
for insert with check (public.is_staff());
drop policy if exists "Studio staff update" on public.studio_projects;
create policy "Studio staff update" on public.studio_projects
for update using (public.is_staff()) with check (public.is_staff());
drop policy if exists "Studio admin delete" on public.studio_projects;
create policy "Studio admin delete" on public.studio_projects
for delete using (public.is_admin_or_super());

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('studio-posters','studio-posters',true,5242880,
array['image/jpeg','image/png','image/webp','image/gif'])
on conflict(id) do update set public=true,file_size_limit=5242880,
allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'];
drop policy if exists "Studio public poster read" on storage.objects;
create policy "Studio public poster read" on storage.objects
for select using (bucket_id='studio-posters');
drop policy if exists "Studio staff poster insert" on storage.objects;
create policy "Studio staff poster insert" on storage.objects
for insert with check(bucket_id='studio-posters' and public.is_staff());
drop policy if exists "Studio staff poster update" on storage.objects;
create policy "Studio staff poster update" on storage.objects
for update using(bucket_id='studio-posters' and public.is_staff())
with check(bucket_id='studio-posters' and public.is_staff());
drop policy if exists "Studio admin poster delete" on storage.objects;
create policy "Studio admin poster delete" on storage.objects
for delete using(bucket_id='studio-posters' and public.is_admin_or_super());

-- Bring the existing three Studio cards under the same database CRUD without duplicating them.
insert into public.studio_projects
(id,title,genre,engine,status,accent,image_url,description,is_published,display_order)
values
('nomads-headquarters','Nomad''s Province 2D Virtual Campus',
'Retro Top-Down Adventure / Interactive Web World','WebGL / HTML5 Canvas + React',
'LIVE ON WEBSITE','#38bdf8','/assets/game/campus-world.png',
'An interactive 2D top-down gamified headquarters featuring playable character movement, building entry portals, dynamic waypoints, and seamless responsive controls.',true,10),
('gamejam-x-prototypes','GameJam X Esports Prototypes',
'24-Hour Hackathon Game Prototypes','Unity / Godot / WebGL',
'STUDIO PROGRAM','#f59e0b',
'/assets/events-and-logos/img_13_2026-11-05_at_10.30.15_AM__1_.jpeg',
'Rapid game design prototypes and experimental mechanics built during 24-hour game jams co-organized with GDAI and SRMIST.',true,20),
('indie-game-incubation','Original Indie Game Development',
'2D Action / Adventure Interactive Experience','Game Development Pipeline',
'IN PRODUCTION','#e84537',
'/assets/events-and-logos/img_14_2026-11-05_at_10.30.15_AM__2_.jpeg',
'Nomad''s Province studio is actively expanding into original indie game titles, interactive experiences, and digital gaming products.',true,30)
on conflict(id) do nothing;
-- Check publishing and access using authenticated /admin; SQL Editor runs privileged.
select id,title,is_published,display_order from public.studio_projects order by display_order;
