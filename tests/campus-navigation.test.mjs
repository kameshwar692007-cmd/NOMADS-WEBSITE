import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCATIONS } from '../src/game/data/locationData.js';
import { getSpawnPoint, buildTravelPath } from '../src/game/data/travelPaths.js';
import { checkFootCollision } from '../src/game/systems/collision.js';
import { AutoTravelSystem } from '../src/game/systems/autoTravel.js';

function crossesObstacle(a,b){
  const d=Math.hypot(b.x-a.x,b.y-a.y);
  for(let step=0;step<=d;step+=1){
    const t=d?Math.min(1,step/d):1;
    if(checkFootCollision(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t))return true;
  }
  return checkFootCollision(b.x,b.y);
}
test('every location is reachable from the plaza and every other entrance',()=>{
  const starts=[getSpawnPoint(),...LOCATIONS.map(l=>({x:l.entranceX,y:l.entranceY}))];
  for(const start of starts)for(const loc of LOCATIONS){
    if(Math.hypot(loc.entranceX-start.x,loc.entranceY-start.y)<10)continue;
    const path=buildTravelPath(start.x,start.y,loc.id);
    assert.ok(path.length>0,`No path from ${JSON.stringify(start)} to ${loc.id}`);
    let previous=start;
    for(const waypoint of path){
      assert.ok(!crossesObstacle(previous,waypoint),`Obstacle on path to ${loc.id}: ${JSON.stringify(previous)} -> ${JSON.stringify(waypoint)}`);
      previous=waypoint;
    }
    assert.ok(Math.hypot(previous.x-loc.entranceX,previous.y-loc.entranceY)<3);
  }
});
test('Event Grounds uses the western walkway from the central plaza',()=>{
  const start=getSpawnPoint();
  const path=buildTravelPath(start.x,start.y,'event-grounds');
  assert.ok(path.length>=4);
  assert.ok(path.some(p=>p.x<670&&p.y>600),'Must take west route');
  assert.ok(path.some(p=>p.y>770&&p.x<700),'Must enter from western lower path');
});
test('nearby direct travel never detours through the plaza',()=>{
  const h=LOCATIONS.find(l=>l.id==='main-headquarters');
  const start={x:h.entranceX+18,y:h.entranceY};
  const path=buildTravelPath(start.x,start.y,'main-headquarters');
  assert.ok(path.length<=1);
});
test('autotravel movement is time-based and never announces arrival before reaching endpoint',()=>{
  const a=new AutoTravelSystem();
  let arrived=false;
  const origin=getSpawnPoint();
  assert.ok(a.startTravel(origin.x,origin.y,'main-headquarters',()=>arrived=true));
  let pos={...origin};
  let iterations=0;
  while(a.isActive()&&iterations++<1000){
    const m=a.update(pos.x,pos.y,1/60);
    pos.x+=m.dx;pos.y+=m.dy;
  }
  assert.ok(iterations<1000,'navigation stuck');
  assert.ok(arrived,'arrival callback missing');
  const dest=LOCATIONS.find(l=>l.id==='main-headquarters');
  assert.ok(Math.hypot(pos.x-dest.entranceX,pos.y-dest.entranceY)<2,'announced arrival before reaching endpoint');
});
