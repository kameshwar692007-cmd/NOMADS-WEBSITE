import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCATIONS } from '../src/game/data/locationData.js';
import { checkFootCollision } from '../src/game/systems/collision.js';
import { buildTravelPath, buildPathToPoint, getSpawnPoint } from '../src/game/data/travelPaths.js';

function checkRoute(start,waypoints,label){
 let from=start;
 for(const next of waypoints){
  const dx=Math.abs(next.x-from.x),dy=Math.abs(next.y-from.y);
  assert.ok(dx<0.05||dy<0.05||Math.hypot(dx,dy)<=18.1,
   `${label}: diagonal shortcut from ${JSON.stringify(from)} to ${JSON.stringify(next)}`);
  const n=Math.max(1,Math.ceil(Math.hypot(dx,dy)));
  for(let i=0;i<=n;i++){
   const t=i/n;
   assert.equal(checkFootCollision(from.x+(next.x-from.x)*t,from.y+(next.y-from.y)*t),false,
    `${label}: segment enters unwalkable ground at step ${i}`);
  }
  from=next;
 }
}
test('all destinations use cement-constrained paths without long diagonal grass shortcuts',()=>{
 const starts=[getSpawnPoint(),...LOCATIONS.map(l=>({x:l.entranceX,y:l.entranceY}))];
 for(const start of starts)for(const loc of LOCATIONS){
  const path=buildTravelPath(start.x,start.y,loc.id);
  if(Math.hypot(loc.entranceX-start.x,loc.entranceY-start.y)>=10){
   assert.ok(path.length>0,`missing route to ${loc.id}`);
   checkRoute(start,path,loc.id);
  }
 }
});
test('clicking water, bushes, trees, stage or grass cannot start travel',()=>{
 const spawn=getSpawnPoint();
 for(const [x,y] of [[20,750],[830,110],[590,535],[534,761],[835,475],[830,725]]){
  assert.equal(checkFootCollision(x,y),true);
  assert.deepEqual(buildPathToPoint(spawn.x,spawn.y,x,y),[]);
 }
 const path=buildPathToPoint(spawn.x,spawn.y,835,610);
 assert.ok(path.length>0,'reachable cement point should start walking');
 checkRoute(spawn,path,'ground click');
});
