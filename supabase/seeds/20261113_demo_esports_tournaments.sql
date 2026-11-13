-- NOMAD'S PROVINCE: OPTIONAL DEMO TOURNAMENT SEED
-- Apply AFTER 20261106_create_events_schema.sql and 20261110_admin_tournaments_posters.sql.
-- These are fictional examples, NOT real open registrations.
-- Safe to rerun: each stable demo slug is inserted at most once.
insert into public.events
  (slug, title, category, venue, start_date, end_date, listing_type,
   game_title, match_format, prize_pool, partner_info, description,
   status_mode, is_draft, registration_url, poster_url)
values
  ('demo-bgmi-campus-cup', '[DEMO] BGMI Campus Cup', 'Esports', 'Online — Demo',
   '2026-12-12 10:00:00+05:30', '2026-12-12 18:00:00+05:30', 'TOURNAMENT',
   'BGMI', '4-player squads · Battle Royale', 'Demo only — no real prizes',
   'Demo listing — Nomad''s Province', 'DEMO DATA ONLY: Sample BGMI tournament to preview the Esports Arena. No real event or registration.',
   'AUTO', false, null, null),
  ('demo-valorant-open', '[DEMO] Valorant Open', 'Esports', 'Online — Demo',
   '2026-12-19 10:00:00+05:30', '2026-12-19 19:00:00+05:30', 'TOURNAMENT',
   'Valorant', '5v5 · Single elimination', 'Demo only — no real prizes',
   'Demo listing — Nomad''s Province', 'DEMO DATA ONLY: Sample Valorant tournament to preview filtering and brackets. No real event or registration.',
   'AUTO', false, null, null),
  ('demo-free-fire-showdown', '[DEMO] Free Fire Showdown', 'Esports', 'Online — Demo',
   '2026-12-26 10:00:00+05:30', '2026-12-26 17:00:00+05:30', 'TOURNAMENT',
   'Free Fire MAX', '4-player squads · Custom rooms', 'Demo only — no real prizes',
   'Demo listing — Nomad''s Province', 'DEMO DATA ONLY: Sample Free Fire MAX tournament for UI testing. No real event or registration.',
   'AUTO', false, null, null),
  ('demo-rocket-league-duos', '[DEMO] Rocket League Duos', 'Esports', 'Online — Demo',
   '2027-01-09 10:00:00+05:30', '2027-01-09 16:00:00+05:30', 'TOURNAMENT',
   'Rocket League', '2v2 · Group stage and finals', 'Demo only — no real prizes',
   'Demo listing — Nomad''s Province', 'DEMO DATA ONLY: Sample Rocket League tournament for carousel testing. No real event or registration.',
   'AUTO', false, null, null)
on conflict (slug) do nothing;

-- Verify the four distinct game filters and their published demo records.
select slug, title, game_title, listing_type, is_draft, start_date
from public.events
where slug like 'demo-%'
order by start_date;

-- Optional later cleanup (only removes these four seed entries):
-- delete from public.events where slug in
-- ('demo-bgmi-campus-cup','demo-valorant-open','demo-free-fire-showdown','demo-rocket-league-duos');
