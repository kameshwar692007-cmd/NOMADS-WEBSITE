import test from 'node:test';
import assert from 'node:assert/strict';
import {renderWorld} from '../src/game/systems/renderer.js';
import {checkFootCollision,resolvePathMovement} from '../src/game/systems/collision.js';
import {getSpawnPoint,buildTravelPath} from '../src/game/data/travelPaths.js';

test('loaded player image is drawn above terrain, not silently skipped',()=>{
 const calls=[];
 const ctx={
   save(){},restore(){},translate(){},scale(){},fillRect(){},beginPath(){},
   ellipse(){},fill(){},drawImage(...a){calls.push(a);}
 };
 const hero={complete:true,naturalWidth:128,naturalHeight:192};
 const camera={x:835,y:555};
 const pos=getSpawnPoint();
 const player={x:pos.x-16,y:pos.y-40,direction:'down',moving:false,walkCycleTime:0};
 renderWorld(ctx,{'player/nomad-goggles-v4':hero},camera,player,1,1672,941,0);
 assert.equal(calls.length,1,'the hero must be drawn when loaded');
 assert.equal(calls[0][0],hero);
 assert.deepEqual(calls[0].slice(1,5),[0,0,32,48]);
});
test('collision-locked movement cannot move feet onto trees, water or stage',()=>{
 for(const position of [[20,750],[590,535],[830,725]])
  assert.equal(checkFootCollision(...position),true);
 const pos=getSpawnPoint();
 const moved=resolvePathMovement(pos.x-16,pos.y-40,0,12);
 assert.equal(moved.blocked,false);
 assert.equal(checkFootCollision(moved.x+16,moved.y+40),false);
});
test('every route is traversable by the real movement resolver without sideways slides',()=>{
 const start=getSpawnPoint();
 for(const id of ['main-headquarters','esports-arena','game-dev-studio','community-hub','contact-centre','event-grounds']){
  const waypoints=buildTravelPath(start.x,start.y,id);
  assert.ok(waypoints.length>0,id);
  let position={x:start.x-16,y:start.y-40};
  for(const wp of waypoints){
   const dx=wp.x-(position.x+16),dy=wp.y-(position.y+40);
   const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/3));
   for(let i=0;i<steps;i++){
    const n=resolvePathMovement(position.x,position.y,dx/steps,dy/steps);
    assert.equal(n.blocked,false,id+' unexpectedly blocked');
    position=n;
   }
  }
 }
});
