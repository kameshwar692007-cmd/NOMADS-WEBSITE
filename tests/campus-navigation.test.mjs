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


test('decorations, forest, coastline, and event objects block player feet',()=>{
  const blocked=[
    ['ocean',20,750],['north cliff',830,110],['tree trunk',595,555],
    ['bush',548,838],['north bench',630,415],['south lamp',660,585],
    ['fountain',835,475],['event stage',830,725],['event tent',655,790],
    ['dock water',80,780]
  ];
  for(const [name,x,y] of blocked){
    assert.equal(checkFootCollision(x,y),true,`${name} at (${x},${y}) must block feet`);
  }
  for(const [name,x,y] of [
    ['plaza path',835,555],['west event walkway',498,755],
    ['east contact walkway',1370,712]
  ]) assert.equal(checkFootCollision(x,y),false,`${name} should stay walkable`);
});

test('every entrance stays out of blocked zones',()=>{
  for(const location of LOCATIONS){
    assert.equal(checkFootCollision(location.entranceX,location.entranceY),false,
      `Entrance inaccessible: ${location.id}`);
  }
});
