import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateEventPayload, eventService, describeSupabaseWriteError} from '../src/game/services/eventService.js';
const read = p => readFileSync(new URL('../'+p,import.meta.url),'utf8');
const base = {
 title:'Sample Tournament',category:'Esports',venue:'Chennai',
 startDate:'2026-12-10T10:00:00+05:30',endDate:'2026-12-10T14:00:00+05:30',
 listingType:'TOURNAMENT',gameTitle:'Sample Game',matchFormat:'Squads',
 prizePool:'Confirmed rewards',partnerInfo:'Official partner',
 posterUrl:'https://example.org/poster.png',registrationUrl:'https://example.org/join'
};
test('tournament payload validates required game and preserves poster metadata',()=>{
 const r=validateEventPayload(base);
 assert.equal(r.isValid,true, r.errors.join('; '));
 assert.equal(r.sanitized.listingType,'TOURNAMENT');
 assert.equal(r.sanitized.gameTitle,'Sample Game');
 assert.equal(r.sanitized.posterUrl,base.posterUrl);
 assert.equal(r.sanitized.matchFormat,'Squads');
 assert.equal(validateEventPayload({...base,gameTitle:''}).isValid,false);
 assert.equal(validateEventPayload({...base,listingType:'EVENT',gameTitle:''}).isValid,true);
});
test('admin form can create tournaments and upload a complete poster with truthful cloud errors',()=>{
 const admin=read('src/pages/AdminPage.jsx');
 const service=read('src/game/services/eventService.js');
 assert.ok(admin.includes("handleOpenCreate('TOURNAMENT')"));
 assert.ok(admin.includes('id="listing-type"'));
 assert.ok(admin.includes('id="admin-game-title"'));
 assert.ok(admin.includes('handleFileUpload'));
 assert.ok(admin.includes('uploadingPoster ?'));
 assert.ok(service.includes("listing_type: sanitized.listingType"));
 assert.ok(service.includes("game_title: sanitized.gameTitle"));
 assert.ok(service.includes("from('event-posters')"));
 assert.ok(service.includes("Supabase create failed; nothing was published:"));
 assert.ok(service.includes("Sign in with a verified Supabase staff account before publishing events."));
 assert.ok(service.includes("describeSupabaseWriteError(err, 'create')"));
 assert.ok(service.includes("Sign in with your Supabase staff account"));
 assert.ok(service.includes("Supabase poster upload failed:"));
 assert.ok(service.includes("from('admin_users')"));
 assert.ok(service.includes("storage INSERT RLS policy"));
 assert.ok(admin.includes("!eventService.isCloudConnected()"));
 assert.ok(admin.includes("role: 'ANONYMOUS'"));
});
test('all public poster display areas preserve original image ratio',()=>{
 const eventStyles=read('src/GamifiedPages.css');
 const esportsStyles=read('src/pages/EsportsArenaGuide.css');
 const esports=read('src/pages/EsportsPage.jsx');
 // Use line-ending and whitespace-independent declarations: Windows Git checkouts
 // may convert LF to CRLF without changing the browser's computed CSS.
 const hasUncroppedPoster = selector => {
   const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
   // Earlier theme rules may crop the poster; the final override must win.
   const blocks = [...eventStyles.matchAll(new RegExp(escaped + '\\s*\\{([^}]*)\\}', 'g'))];
   const block = blocks.at(-1)?.[1] || '';
   return /width\s*:\s*100%\s*;/i.test(block)
     && /height\s*:\s*auto\s*;/i.test(block)
     && /object-fit\s*:\s*contain\s*;/i.test(block);
 };
 assert.ok(hasUncroppedPoster('.event-poster-img'), 'event poster must keep natural aspect ratio');
 assert.ok(hasUncroppedPoster('.detail-poster-img'), 'event detail poster must keep natural aspect ratio');
 assert.ok(hasUncroppedPoster('.poster-preview-original .poster-preview-img'), 'admin poster preview must remain uncropped');
 assert.ok(esportsStyles.includes('.tourney-poster-img'));
 assert.ok(esportsStyles.includes('object-fit:contain'));
 assert.ok(esports.includes('t.posterUrl &&'));
 assert.ok(esports.includes('tourney-modal-poster'));
});
test('migration adds tournament metadata without weakening staff RLS',()=>{
 const sql=read('supabase/migrations/20261110_admin_tournaments_posters.sql');
 assert.ok(sql.includes('add column if not exists listing_type'));
 assert.ok(sql.includes("('EVENT', 'TOURNAMENT')"));
 assert.ok(sql.includes('add column if not exists game_title'));
 assert.ok(sql.includes("'event-posters'"));
 assert.ok(!sql.includes('disable row level security'));
});

test('a newly created tournament appears in public event records in local demo mode',async()=>{
 if(eventService.isCloudConnected()) return;
 const created=await eventService.createEvent(base);
 assert.ok(created.id);
 const publicEvents=await eventService.getPublicEvents();
 const newlyListed=publicEvents.find(item=>item.id===created.id);
 assert.ok(newlyListed);
 assert.equal(newlyListed.listingType,'TOURNAMENT');
 assert.equal(newlyListed.gameTitle,'Sample Game');
 assert.equal(newlyListed.posterUrl,base.posterUrl);
});

test('Allies carousel auto-switches at four seconds without removing manual navigation', () => {
 const carousel=read('src/game/components/PinnedPartnersShowcase.jsx');
 assert.ok(carousel.includes('ALLY_HOLD_MS = 4000'));
 assert.ok(carousel.includes('filteredPartners.length), ALLY_HOLD_MS)'));
 assert.ok(carousel.includes('handlePrev'));
 assert.ok(carousel.includes('handleNext'));
 assert.ok(carousel.includes('isReducedMotion'));
});

test('cloud write errors retain actionable PostgREST codes and details',()=>{
 const denied = describeSupabaseWriteError({code:'42501',message:'new row violates row-level security policy'},'create');
 assert.match(denied,/42501/);
 assert.match(denied,/row-level security/);
 assert.match(denied,/staff role/);
 const missing = describeSupabaseWriteError({code:'PGRST204',message:'Could not find listing_type column'},'update');
 assert.match(missing,/PGRST204/);
 assert.match(missing,/tournament migration/);
 const unique = describeSupabaseWriteError({code:'23505',message:'duplicate key value'},'create');
 assert.match(unique,/unique/);
});

test('published listings have exactly one public destination and no dummy tournaments', () => {
 const service=read('src/game/services/eventService.js');
 const eventsPage=read('src/pages/EventsPage.jsx');
 const esportsPage=read('src/pages/EsportsPage.jsx');
 const eventDetail=read('src/pages/EventDetailPage.jsx');
 const centralData=read('src/game/data/campusContent.js');
 assert.ok(service.includes('export const isTournamentListing'));
 assert.ok(service.includes('export const isEventListing'));
 assert.ok(eventsPage.includes('data.filter(isEventListing)'));
 assert.ok(esportsPage.includes('events.filter(isTournamentListing)'));
 assert.ok(esportsPage.includes('const allTournaments = publishedTournaments;'));
 assert.ok(esportsPage.includes('No tournaments published yet'));
 assert.ok(!esportsPage.includes('...TOURNAMENTS'));
 assert.ok(!centralData.includes('export const TOURNAMENTS ='));
 assert.ok(eventDetail.includes('if (isTournamentListing(event)) return <Navigate to="/esports" replace />;'));
 assert.ok(!read('src/pages/AdminPage.jsx').includes('TOURNAMENT · ESPORTS + EVENTS'));
});
test('connected Supabase public read errors never display fabricated local entries', () => {
 const service=read('src/game/services/eventService.js');
 const eventsPage=read('src/pages/EventsPage.jsx');
 const esportsPage=read('src/pages/EsportsPage.jsx');
 assert.ok(service.includes("throw new Error(describeSupabaseWriteError(err, 'public read'))"));
 assert.ok(service.includes('Only projects without a Supabase connection use offline demo data'));
 assert.ok(eventsPage.includes('loadError'));
 assert.ok(eventsPage.includes('Retry loading'));
 assert.ok(esportsPage.includes("setLoadError('Tournaments could not be loaded. Please retry.')"));
});
test('admin uses only styled vector controls instead of emoji labels', () => {
 const admin=read('src/pages/AdminPage.jsx');
 assert.ok(admin.includes('<IconShield size={24}'));
 assert.ok(admin.includes('<IconTrophy size={13} /> Results'));
 assert.ok(admin.includes('<IconZap size={13} /> Auto'));
 assert.ok(admin.includes('<IconClose size={16} />'));
 assert.equal(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF]/u.test(admin),false);
});
