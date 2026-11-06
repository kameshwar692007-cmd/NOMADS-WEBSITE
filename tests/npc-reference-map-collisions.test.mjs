import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CAMPUS_NPCS} from '../src/game/data/npcDialogues.js';
import {checkFootCollision,hitsNpcFoot,resolveMovement} from '../src/game/systems/collision.js';
import {LOCATIONS} from '../src/game/data/locationData.js';
import {getSpawnPoint,buildTravelPath} from '../src/game/data/travelPaths.js';
import {CLEAN_TILE_RECTS,createCleanCampus} from '../src/game/systems/assetLoader.js';
import {HERO_DRAW_WIDTH,HERO_DRAW_HEIGHT} from '../src/game/systems/renderer.js';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('all six NPC feet block the avatar, with accessible ring around each',()=>{
 for(const n of CAMPUS_NPCS){
  assert.equal(hitsNpcFoot(n.x,n.y),true, n.id+' must have a real collider');
  assert.equal(hitsNpcFoot(n.x+35,n.y+30),false, n.id+' must not create oversized invisible wall');
  assert.ok(!LOCATIONS.some(l=>{
    const c=l.collisionBox;
    return n.x>=l.worldX+c.x && n.x<=l.worldX+c.x+c.w &&
      n.y>=l.worldY+c.y && n.y<=l.worldY+c.y+c.h;
  }),n.id+' must not be inside a solid building');
 }
});
test('NPC collision prevents manual walking through NPC feet',()=>{
 const n=CAMPUS_NPCS.find(x=>x.id==='receptionist');
 const start={x:n.x-16-32,y:n.y-40};
 const current=resolveMovement(start.x,start.y,40,0);
 assert.ok(current.x<start.x+40,'manual player must stop before NPC base');
});
test('all six building approaches remain reachable with NPC collisions enabled',()=>{
 const spawn=getSpawnPoint();
 for(const location of LOCATIONS){
  const path=buildTravelPath(spawn.x,spawn.y,location.id);
  assert.ok(path.length>0,'route missing: '+location.id);
  for(const p of path)assert.equal(checkFootCollision(p.x,p.y),false,location.id+' collides with NPC');
 }
});
test('user reference atlas contains six character-free tiles, and the old smudged atlas is no longer loaded',()=>{
 const binary=readFileSync(new URL('../public/assets/game/reference-clean-tiles.webp',import.meta.url));
 assert.equal(binary.toString('ascii',0,4),'RIFF');
 assert.equal(binary.toString('ascii',8,12),'WEBP');
 assert.equal(CLEAN_TILE_RECTS.length,6);
 const drawn=[];
 const oldDocument=globalThis.document;
 globalThis.document={createElement:()=>({
  width:0,height:0,getContext(){return {imageSmoothingEnabled:true,drawImage(...args){drawn.push(args)}};}
 })};
 try{
  const canvas=createCleanCampus({width:1672,height:941},{width:576,height:112});
  assert.equal(canvas.width,1672);
  assert.equal(canvas.height,941);
  assert.equal(drawn.length,7,'original base plus precisely six reference tiles');
 } finally {globalThis.document=oldDocument;}
 const loader=read('src/game/systems/assetLoader.js');
 assert.ok(!loader.includes('npc-clean-patch-atlas.png'));
 assert.ok(!loader.includes('plaza-clean-patch.png'));
});
test('player is appropriately enlarged visually but keeps collision feet at fixed coordinates',()=>{
 assert.equal(HERO_DRAW_WIDTH,40);
 assert.equal(HERO_DRAW_HEIGHT,60);
 const renderer=read('src/game/systems/renderer.js');
 assert.match(renderer,/footX\s*=\s*Math\.round\(x\s*\+\s*16\)/);
 assert.match(renderer,/footY\s*=\s*Math\.round\(y\s*\+\s*40\)/);
});
test('NPC dialogue loads the WebP atlas directly without blank SVG wrappers',()=>{
 const portrait=read('src/game/components/NpcDialogue.jsx');
 assert.ok(portrait.includes('np-portrait-sheet'));
 assert.ok(portrait.includes('src={PORTRAIT_ATLAS}'));
 assert.ok(!portrait.includes('toDataURL('));
 const hq=CAMPUS_NPCS.find(n=>n.id==='receptionist');
 assert.equal(hq.portraitIndex,6);
 assert.equal(hq.spriteIndex,5);
 assert.notEqual(hq.id,'hero-guide');
});
