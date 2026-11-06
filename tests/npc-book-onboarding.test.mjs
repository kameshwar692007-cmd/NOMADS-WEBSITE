import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CAMPUS_NPCS,HERO_GUIDE,getNpcAtWorldPoint,getNearbyNpc,dialogueForLocation} from '../src/game/data/npcDialogues.js';
import {LOCATIONS} from '../src/game/data/locationData.js';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('all six campus NPCs map uniquely to real website sections',()=>{
 assert.equal(CAMPUS_NPCS.length,6);
 assert.equal(new Set(CAMPUS_NPCS.map(n=>n.id)).size,6);
 assert.deepEqual(new Set(CAMPUS_NPCS.map(n=>n.route)),new Set(['/about','/esports','/studio','/events','/community','/contact']));
 for(const loc of LOCATIONS){
  const npc=dialogueForLocation(loc);
  assert.ok(npc,loc.id);
  assert.equal(npc.route,loc.route);
  assert.ok(npc.message.length>25 && npc.actionLabel.length>3);
 }
});
test('click and nearby interaction targets work on each NPC and its floating marker',()=>{
 for(const npc of CAMPUS_NPCS){
  assert.equal(getNpcAtWorldPoint(npc.x,npc.y)?.id,npc.id);
  assert.equal(getNpcAtWorldPoint(npc.x,npc.y-48)?.id,npc.id);
  assert.equal(getNearbyNpc(npc.x+2,npc.y)?.id,npc.id);
 }
 assert.equal(getNpcAtWorldPoint(-100,-200),null);
 assert.equal(getNpcAtWorldPoint(NaN,100),null);
});
test('onboarding is skippable and first-session only with a short control tutorial',()=>{
 assert.match(HERO_GUIDE.note,/WASD/);
 assert.match(HERO_GUIDE.note,/Mobile:/);
 const home=read('src/pages/HomePage.jsx');
 const book=read('src/game/components/BookIntro.jsx');
 assert.ok(home.includes('sessionStorage.getItem('));
 assert.ok(home.includes('sessionStorage.setItem('));
 assert.ok(home.includes('onNpcInteract={setNpcDialogue}'));
 assert.ok(home.includes('paused={Boolean(introOpen || npcDialogue'));
 assert.match(book,/SKIP INTRO|Skip intro/);
 assert.ok(book.includes("e.key==='Escape'"));
 assert.ok(book.includes('prefers-reduced-motion'));
});
test('NPC clicks override buildings without affecting manual movement or AGY pages',()=>{
 const game=read('src/game/components/GameCanvas.jsx');
 const npcHit=game.indexOf('getNpcAtWorldPoint(point.x,point.y');
 const buildingHit=game.indexOf('findClickedBuilding(point.x,point.y)');
 assert.ok(npcHit>=0 && buildingHit>npcHit);
 assert.ok(game.includes('getNearbyNpc('));
 assert.ok(game.includes('npcRef.current?.(nearby)'));
 assert.ok(game.includes('onPointerDown'));
 assert.ok(game.includes('KEY_TO_DIRECTION'));
 const home=read('src/pages/HomePage.jsx');
 assert.ok(home.includes('<LocationPanel'),'building UI retained');
 assert.ok(home.includes('<Directory'),'directory retained');
});
test('checked-in portrait atlas and book cover have valid signatures',()=>{
 const portrait=readFileSync(new URL('../public/assets/onboarding/npc-portraits-atlas.webp',import.meta.url));
 assert.equal(portrait.toString('ascii',0,4),'RIFF');
 assert.equal(portrait.toString('ascii',8,12),'WEBP');
 assert.ok(portrait.length>3000);
 const cover=read('public/assets/onboarding/nomads-book-cover.svg');
 assert.ok(cover.includes('<svg')&&cover.includes("NOMAD'S"));
 const css=read('src/game/components/NpcDialogue.css');
 assert.ok(read('src/game/components/NpcDialogue.jsx').includes('npc-portraits-atlas.webp'));
 assert.ok(css.includes('np-portrait-image'));
 const sprites=readFileSync(new URL('../public/assets/onboarding/npc-complete-atlas.png',import.meta.url));
 assert.equal(sprites.toString('ascii',1,4),'PNG');
 assert.equal(sprites.readUInt32BE(16),192);
 assert.equal(sprites.readUInt32BE(20),48);
 assert.ok(css.includes('@media(max-width:600px)'));
 assert.ok(read('src/game/components/BookIntro.css').includes('np-book-hardcover'));
 assert.ok(read('src/game/components/BookIntro.css').includes('perspective:1500px'));
 assert.ok(read('src/game/components/BookIntro.jsx').includes('np-book-turn-page'));
 assert.ok(read('src/game/components/BookIntro.jsx').includes('np-cinematic-progress'));
});
