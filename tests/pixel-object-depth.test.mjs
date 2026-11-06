import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { SCENE_OBJECTS,drawForegroundForPlayer,hitsSceneObject } from '../src/game/data/sceneObjects.js';
import { checkFootCollision } from '../src/game/systems/collision.js';
import { getSpawnPoint,buildTravelPath } from '../src/game/data/travelPaths.js';
import { LOCATIONS } from '../src/game/data/locationData.js';

const mask=PNG.sync.read(readFileSync(new URL('../public/assets/game/foreground-pixel-mask.png',import.meta.url)));
const alpha=(x,y)=>mask.data[((Math.floor(y/2)*mask.width)+Math.floor(x/2))*4+3];

test('foreground atlas contains only masked object pixels, not rectangular terrain crops',()=>{
 assert.equal(mask.width,836);
 assert.equal(mask.height,471);
 assert.equal(alpha(835,610),0,'central cement must stay perfectly transparent');
 assert.equal(alpha(850,400),0,'HQ steps must not become a foreground slab');
 for(const [name,x,y] of [
  ['courtyard tree crown',595,500],
  ['contact centre shrub',1275,620],
  ['contact flowerbed',1417,736],
  ['paved bench',641,406]
 ]) assert.ok(alpha(x,y)>0,name+' should be retained as actual obstacle artwork');
 assert.ok(mask.data.filter((_,i)=>i%4===3).some(v=>v===0));
 assert.ok(mask.data.filter((_,i)=>i%4===3).some(v=>v===255));
});

test('all mapped objects have tiny base contacts inside their own source bounds',()=>{
 assert.equal(SCENE_OBJECTS.length,34);
 const ids=new Set();
 for(const o of SCENE_OBJECTS){
  assert.ok(!ids.has(o.id),'duplicate object '+o.id);
  ids.add(o.id);
  assert.ok(o.w>0&&o.h>0&&o.x>=0&&o.y>=0);
  assert.ok(o.x+o.w<=1672&&o.y+o.h<=941);
  assert.ok(o.footX>=o.x&&o.footX<=o.x+o.w);
  assert.ok(o.baseY>=o.y&&o.baseY<=o.y+o.h);
  assert.ok(o.solidRx<o.w/3&&o.solidRy<o.h/3,'oversized lock-zone around '+o.id);
  assert.equal(hitsSceneObject(o.footX-o.solidRx/2,o.baseY-o.solidRy/2,o.solidRx,o.solidRy),true);
 }
});
test('player is covered only by correct foreground rows, never by the oval campus crop',()=>{
 const asset={width:1672,height:941};
 const draws=[];
 const ctx={drawImage(...args){draws.push(args)}};
 const tree=SCENE_OBJECTS.find(o=>o.id==='west-courtyard-tree');
 drawForegroundForPlayer(ctx,asset,tree.footX,tree.baseY-24);
 assert.ok(draws.some(args=>args[1]===tree.x&&args[2]===tree.y),'tree must draw over player when behind');
 draws.length=0;
 drawForegroundForPlayer(ctx,asset,tree.footX,tree.baseY+15);
 assert.equal(draws.length,0,'object must not cut through player standing in front');
 assert.ok(!readFileSync(new URL('../src/game/data/sceneObjects.js',import.meta.url),'utf8').includes('ctx.ellipse('));
});

test('all six entrances remain reachable from each other with real foot collisions',()=>{
 for(const source of [getSpawnPoint(),...LOCATIONS.map(l=>({x:l.entranceX,y:l.entranceY}))]){
  for(const destination of LOCATIONS){
   if(Math.hypot(source.x-destination.entranceX,source.y-destination.entranceY)<10)continue;
   const path=buildTravelPath(source.x,source.y,destination.id);
   assert.ok(path.length>0,'unreachable '+destination.id);
   let previous=source;
   for(const next of path){
    const distance=Math.hypot(next.x-previous.x,next.y-previous.y);
    for(let i=0,n=Math.max(1,Math.ceil(distance));i<=n;i++){
     const p={x:previous.x+(next.x-previous.x)*(i/n),y:previous.y+(next.y-previous.y)*(i/n)};
     assert.equal(checkFootCollision(p.x,p.y),false,destination.id+' clips object along route');
    }
    previous=next;
   }
  }
 }
});
