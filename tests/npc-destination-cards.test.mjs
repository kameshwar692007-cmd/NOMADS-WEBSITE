import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { LOCATIONS } from '../src/game/data/locationData.js';
import { CAMPUS_NPCS } from '../src/game/data/npcDialogues.js';
const read = p => readFileSync(new URL('../'+p, import.meta.url),'utf8');

test('every destination uses its matching campus character and a shipped HD portrait',()=>{
 assert.equal(LOCATIONS.length,CAMPUS_NPCS.length);
 for(const loc of LOCATIONS){
   const npc=CAMPUS_NPCS.find(npc=>npc.route===loc.route);
   assert.ok(npc,loc.route);
   assert.ok(Number.isInteger(npc.portraitIndex) && npc.portraitIndex>0 && npc.portraitIndex<7,loc.route);
   const names=['guide','ezra','rex','kai','nova','ari','aiden'];
   assert.ok(existsSync(new URL('../public/assets/onboarding/portraits-hd/'+names[npc.portraitIndex]+'.webp',import.meta.url)),npc.name);
 }
});
test('destination and next-stop characters use reusable NPC dialogue with correct navigation',()=>{
 const shell=read('src/game/components/GameShell.jsx');
 assert.ok(shell.includes("CAMPUS_NPCS.find(npc => npc.route === campusLocation?.route)"));
 assert.ok(shell.includes("CAMPUS_NPCS.find(npc => npc.route === nextLocation?.route)"));
 assert.ok(shell.includes('<NpcPortrait portraitIndex={chapterNpc.portraitIndex}'));
 assert.ok(shell.includes('<NpcPortrait portraitIndex={nextNpc.portraitIndex}'));
 assert.ok(shell.includes('talkToNpc(chapterNpc, true)'));
 assert.ok(shell.includes('talkToNpc(nextNpc)'));
 assert.ok(shell.includes("actionLabel: 'Keep Exploring'"));
 assert.ok(shell.includes('<NpcDialogue npc={speakingNpc} onClose={() => setSpeakingNpc(null)} />'));
 assert.ok(shell.includes('onClick={() => handleNav(nextLocation.route)}'));
 assert.ok(shell.includes('onClick={handleReturnToCampus}'));
});
test('NPC destination cards follow existing visual system, keyboard and mobile rules',()=>{
 const intro=read('src/game/components/CampusContinuity.css');
 const notes=read('src/game/components/DestinationDiscovery.css');
 const shell=read('src/game/components/GameShell.jsx');
 assert.ok(shell.includes('campus-chapter-bridge gamified-card'));
 assert.ok(shell.includes('campus-discover gamified-card'));
 assert.ok(!shell.includes('src={campusLocation.badgeAsset}'));
 assert.ok(!shell.includes('src={nextLocation.badgeAsset}'));
 assert.ok(intro.includes('rgba(13,23,42,.85)'));
 assert.ok(notes.includes('rgba(13,23,42,.85)'));
 assert.ok(intro.includes('focus-visible') && notes.includes('focus-visible'));
 assert.ok(intro.includes('prefers-reduced-motion') && notes.includes('prefers-reduced-motion'));
 assert.ok(intro.includes('max-width:800px') && notes.includes('max-width:760px'));
});
