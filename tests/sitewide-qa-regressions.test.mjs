import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import sharp from 'sharp';
import {LOCATIONS} from '../src/game/data/locationData.js';
import {CAMPUS_NPCS,HERO_GUIDE} from '../src/game/data/npcDialogues.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const portraitNames=['guide','ezra','rex','kai','nova','ari','aiden'];

test('all seven shipped high resolution portraits decode and map to real NPC indices',async()=>{
 const data=read('src/game/components/NpcDialogue.jsx');
 assert.ok(data.includes("PORTRAIT_NAMES = ['guide', 'ezra', 'rex', 'kai', 'nova', 'ari', 'aiden']"));
 assert.ok(data.includes('portraits-hd/'));
 assert.ok(data.includes('onError={() => setFailed(true)}'));
 assert.ok(data.includes('npc-portraits-atlas.webp'));
 for(const name of portraitNames){
  const path=new URL('../public/assets/onboarding/portraits-hd/'+name+'.webp',import.meta.url);
  assert.ok(existsSync(path),'missing '+name);
  const image=await sharp(readFileSync(path)).metadata();
  assert.equal(image.format,'webp',name);
  assert.equal(image.width,512,name);
  assert.equal(image.height,512,name);
  assert.equal(image.hasAlpha,true,name);
 }
 for(const npc of [HERO_GUIDE,...CAMPUS_NPCS]){
  assert.ok(Number.isInteger(npc.portraitIndex)&&npc.portraitIndex>=0&&npc.portraitIndex<7,npc.id);
 }
});

test('all gameplay routes lead to actual pages with consistent shared shell',()=>{
 const app=read('src/App.jsx');
 for(const loc of LOCATIONS){
  assert.ok(app.includes('path="'+loc.route+'"'),loc.route);
  assert.ok(existsSync(new URL('../public'+loc.badgeAsset,import.meta.url)),loc.id);
 }
 const home=read('src/pages/HomePage.jsx');
 const shell=read('src/game/components/GameShell.jsx');
 assert.ok(home.includes('onHelpOpen={() => setHelpOpen(true)}'));
 assert.ok(home.includes('|| helpOpen'));
 assert.ok(home.includes('<NpcDialogue'));
 assert.ok(home.includes('<LocationPanel'));
 assert.ok(!shell.includes('campus-chapter-bridge'));
 assert.ok(!shell.includes('campus-discover'));
 assert.ok(shell.includes('handleReturnToCampus'));
});

test('scroll observer reconnects interrupted hidden elements on reruns and respects reduced motion',()=>{
 const shell=read('src/game/components/GameShell.jsx');
 assert.ok(shell.includes("element.classList.contains('revealed')"));
 assert.ok(!shell.includes("element.classList.contains('scroll-reveal')) continue"));
 assert.ok(shell.includes('observer.observe(element)'));
 assert.ok(shell.includes('mutations.disconnect(); observer.disconnect();'));
 assert.ok(shell.includes("prefers-reduced-motion: reduce"));
});

test('sitewide enquiry forms never claim transmission without an actual send',()=>{
 const studio=read('src/pages/StudioPage.jsx');
 const contact=read('src/pages/ContactPage.jsx');
 const community=read('src/pages/CommunityPage.jsx');
 for(const [label,page] of [['studio',studio],['contact',contact],['community',community]]){
  assert.ok(page.includes('mailto:'),label);
 }
 assert.ok(studio.includes('href={pitchMailto}'));
 assert.ok(studio.includes('Edit pitch'));
 assert.ok(!studio.includes('TRANSMISSION LOGGED'));
 assert.ok(contact.includes('href={emailUrl}'));
 assert.ok(contact.includes('Edit message'));
 assert.ok(!contact.includes('INQUIRY TRANSMITTED'));
 assert.ok(community.includes('href={applicationMailto}'));
 assert.ok(community.includes('Edit application'));
 assert.ok(!community.includes('APPLICATION SUBMITTED'));
});
