import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {LOCATIONS} from '../src/game/data/locationData.js';
import {CAMPUS_NPCS} from '../src/game/data/npcDialogues.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('all destination NPCs and high-resolution portraits remain available in the game',()=>{
 assert.equal(LOCATIONS.length,CAMPUS_NPCS.length);
 for(const loc of LOCATIONS){
  const npc=CAMPUS_NPCS.find(x=>x.route===loc.route);
  assert.ok(npc,loc.route);
  assert.ok(Number.isInteger(npc.portraitIndex)&&npc.portraitIndex>0&&npc.portraitIndex<7);
  const names=['guide','ezra','rex','kai','nova','ari','aiden'];
  assert.ok(existsSync(new URL('../public/assets/onboarding/portraits-hd/'+names[npc.portraitIndex]+'.webp',import.meta.url)),npc.name);
 }
 const home=read('src/pages/HomePage.jsx');
 assert.ok(home.includes('<NpcDialogue'));
});
test('informational pages no longer duplicate NPC navigation and page-level campus buttons',()=>{
 const shell=read('src/game/components/GameShell.jsx');
 assert.ok(!shell.includes('campus-chapter-character'));
 assert.ok(!shell.includes('campus-next-character'));
 assert.ok(!shell.includes('campus-chapter-map-link'));
 assert.ok(!shell.includes('<NpcDialogue npc={speakingNpc}'));
 assert.ok(shell.includes('onClick={handleReturnToCampus}'));
 assert.ok(shell.includes('onClick={() => handleNav(dest.path)}'));
});