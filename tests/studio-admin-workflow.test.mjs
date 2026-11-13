import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {studioService} from '../src/game/services/studioService.js';
import {eventService, isTournamentListing, isEventListing} from '../src/game/services/eventService.js';
const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Studio migration creates staff-protected project CRUD and poster bucket',()=>{
 const sql=read('supabase/migrations/20261113_studio_projects.sql');
 for(const marker of ['public.studio_projects','enable row level security','public.is_staff()',
 'public.is_admin_or_super()','studio-posters','file_size_limit','on conflict(id) do nothing'])
   assert.ok(sql.includes(marker),marker);
 assert.ok(!sql.includes('disable row level security'));
});
test('Studio admin supports project creation, editing, publishing, removal and poster upload',()=>{
 const admin=read('src/pages/AdminPage.jsx');
 const form=read('src/pages/StudioAdmin.jsx');
 const service=read('src/game/services/studioService.js');
 assert.ok(admin.includes("<StudioAdmin role={userRoleState} />"));
 for(const symbol of ['studioService.saveProject','studioService.removeProject',
 'studioService.uploadPoster','studioService.getProjects({includeDrafts:true})',
 'Publish on the public Studio page','accept="image/jpeg,image/png,image/webp,image/gif"'])
   assert.ok(form.includes(symbol),symbol);
 assert.ok(service.includes(".from('studio_projects')"));
 assert.ok(service.includes(".from('studio-posters')"));
 assert.ok(service.includes("await ensureStaff(true)"));
});
test('Studio local demo CRUD honors visibility and never contacts production',async()=>{
 if(studioService.isCloudConnected()) return;
 const originalWindow=globalThis.window;
 const data=new Map();
 globalThis.window={localStorage:{
   getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)
 }};
 try{
 const created=await studioService.saveProject({
   title:'Sample Studio Game',genre:'Puzzle',engine:'Godot',status:'PROTOTYPE',
   image:'/assets/game/campus-world.png',desc:'Sample project',projectUrl:'',
   accent:'#38bdf8',displayOrder:1,isPublished:false
 });
 assert.ok(created.id);
 assert.equal((await studioService.getProjects()).some(p=>p.id===created.id),false);
 created.isPublished=true;
 const updated=await studioService.saveProject(created);
 assert.equal(updated.title,'Sample Studio Game');
 assert.equal((await studioService.getProjects()).some(p=>p.id===created.id),true);
 await studioService.removeProject(created.id);
 assert.equal((await studioService.getProjects({includeDrafts:true})).some(p=>p.id===created.id),false);
 await assert.rejects(studioService.saveProject({...created,title:''}),/Title/);
 await assert.rejects(studioService.uploadPoster({type:'image/svg+xml',size:100}),/JPEG/);
 }finally{globalThis.window=originalWindow;}
});
test('Events and tournaments use distinct routing and protected workflows',()=>{
 const events=read('src/pages/EventsPage.jsx');
 const esports=read('src/pages/EsportsPage.jsx');
 const admin=read('src/pages/AdminPage.jsx');
 const service=read('src/game/services/eventService.js');
 assert.ok(events.includes('data.filter(isEventListing)'));
 assert.ok(esports.includes('events.filter(isTournamentListing)'));
 assert.ok(admin.includes("handleOpenCreate('EVENT')"));
 assert.ok(admin.includes("handleOpenCreate('TOURNAMENT')"));
 assert.ok(service.includes('createEvent(eventData)'));
 assert.ok(service.includes('updateEvent(id, updateData)'));
 assert.ok(service.includes("from('event-posters')"));
 assert.equal(isEventListing({listingType:'EVENT'}),true);
 assert.equal(isTournamentListing({listingType:'TOURNAMENT'}),true);
 assert.equal(isEventListing({listingType:'TOURNAMENT'}),false);
 assert.ok(eventService.createEvent);
});
test('Events poster labels cannot disappear into white poster artwork',()=>{
 const events=read('src/pages/EventsPage.jsx');
 const eventStyles=read('src/pages/EventGroundsGuide.css');
 const studio=read('src/pages/StudioPage.jsx');
 const studioStyles=read('src/pages/StudioJourney.css');
 assert.ok(!events.includes('events-partner-strip'));
 assert.ok(events.includes('event-status-card'));
 assert.ok(events.indexOf('event-status-card')>events.indexOf('event-card-body'));
 assert.ok(eventStyles.includes('.event-status-card{position:static'));
 assert.ok(eventStyles.includes('object-fit:contain'));
 assert.ok(studio.includes('studioService.getProjects()'));
 assert.ok(studioStyles.includes('object-fit:contain'));
 assert.ok(studioStyles.includes('max-height:320px'));
});

test('Event and tournament create workflows publish to their separate destinations',async()=>{
 if(eventService.isCloudConnected()) return;
 const base={
  category:'Esports',venue:'Chennai',startDate:'2027-02-10T10:00:00+05:30',
  endDate:'2027-02-10T18:00:00+05:30',posterUrl:'',
  registrationUrl:'',isDraft:false,statusMode:'AUTO'
 };
 const event=await eventService.createEvent({...base,title:'Test game jam event',listingType:'EVENT'});
 const tournament=await eventService.createEvent({...base,title:'Test game tournament',
  listingType:'TOURNAMENT',gameTitle:'BGMI',matchFormat:'Squads'});
 const publicRecords=await eventService.getPublicEvents();
 assert.ok(publicRecords.some(item=>item.id===event.id && isEventListing(item)));
 assert.ok(publicRecords.some(item=>item.id===tournament.id && isTournamentListing(item)));
 assert.ok(!publicRecords.filter(isEventListing).some(item=>item.id===tournament.id));
 assert.ok(!publicRecords.filter(isTournamentListing).some(item=>item.id===event.id));
});
