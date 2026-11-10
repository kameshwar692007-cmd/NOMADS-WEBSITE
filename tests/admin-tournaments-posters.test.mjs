import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateEventPayload, eventService} from '../src/game/services/eventService.js';
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
 assert.ok(service.includes("Cloud save failed. Event was NOT published"));
 assert.ok(service.includes("Poster upload to Supabase failed"));
});
test('all public poster display areas preserve original image ratio',()=>{
 const eventStyles=read('src/GamifiedPages.css');
 const esportsStyles=read('src/pages/EsportsArenaGuide.css');
 const esports=read('src/pages/EsportsPage.jsx');
 assert.ok(eventStyles.includes('.event-poster-img {\n  display: block;\n  width: 100%;\n  height: auto;\n  object-fit: contain;'));
 assert.ok(eventStyles.includes('.detail-poster-img {\n  display: block;'));
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
