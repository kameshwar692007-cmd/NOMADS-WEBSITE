import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getSpawnPoint,buildTravelPath,buildPathToPoint,PLAZA_ROUTE_GUIDES } from '../src/game/data/travelPaths.js';
import { LOCATION_MAP } from '../src/game/data/locationData.js';
import { isCementPixel } from '../src/game/data/cementMask.js';
import { isGroundPixel } from '../src/game/data/groundMask.js';
import { checkFootCollision,resolveMovement,resolvePathMovement } from '../src/game/systems/collision.js';
import { SCENE_OBJECTS,drawForegroundForPlayer } from '../src/game/data/sceneObjects.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('marked grass and event sand are walkable while water and scenery remain blocked',()=>{
  for(const [x,y] of [[835,555],[600,500],[835,610],[500,812],[1380,712]]){
    assert.equal(checkFootCollision(x,y),false,'accessible point '+x+','+y);
  }
  for(const [x,y] of [[20,750],[830,110],[835,475],[830,725],[548,838]]){
    assert.equal(checkFootCollision(x,y),true,'solid obstacle '+x+','+y);
  }
  assert.equal(isGroundPixel(600,500),true);
});

test('all six central routes reach their destinations without crossing obstacles',()=>{
 const start=getSpawnPoint();
 for(const [id,guide] of Object.entries(PLAZA_ROUTE_GUIDES)){
  assert.ok(guide.x>0&&guide.y>0);
  const path=buildTravelPath(start.x,start.y,id);
  assert.ok(path.length>0,'route missing '+id);
  let current=start,cementSteps=0;
  for(const next of path){
    const dx=next.x-current.x,dy=next.y-current.y;
    assert.ok(Math.abs(dx)<.05||Math.abs(dy)<.05||Math.hypot(dx,dy)<18.2,'diagonal shortcut to '+id);
    for(let d=0,n=Math.ceil(Math.hypot(dx,dy));d<=n;d++){
      const t=n?d/n:0;
      assert.equal(checkFootCollision(current.x+dx*t,current.y+dy*t),false,id+' crossed a blocked object');
    }
    if(isCementPixel(next.x,next.y))cementSteps++;
    current=next;
  }
  assert.ok(cementSteps>=Math.floor(path.length*.60),'guided route abandons cement for '+id);
 }
});

test('manual movement respects collision boundaries and can move through open grounds',()=>{
 const position={x:835-16,y:555-40};
 const step=resolveMovement(position.x,position.y,0,3);
 assert.ok(step.y>position.y);
 assert.equal(checkFootCollision(step.x+16,step.y+40),false);
 const blocked=resolvePathMovement(20-16,750-40,5,0);
 assert.ok(blocked.blocked);
});

test('marked props have ground collisions plus depth-correct foreground redraw',()=>{
 assert.ok(SCENE_OBJECTS.length>=20);
 const obj=SCENE_OBJECTS.find(o=>o.id==='west-courtyard-tree');
 assert.ok(obj);
 const campus={width:1672,height:941};
 const draw=[];
 const ctx={save(){},beginPath(){},ellipse(){},clip(){},drawImage(...args){draw.push(args);},restore(){}};
 drawForegroundForPlayer(ctx,campus,obj.footX,obj.baseY-20);
 assert.ok(draw.length>0,'tree should obscure player walking behind it');
 draw.length=0;
 drawForegroundForPlayer(ctx,campus,obj.footX,obj.baseY+10);
 assert.equal(draw.length,0,'player in front should render above tree canopy');
});

test('WASD, arrow keys, mobile D-pad, and automatic arrival popup are wired',()=>{
 const canvas=read('src/game/components/GameCanvas.jsx');
 const css=read('src/game/components/GameControls.css');
 for(const key of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',"w:'up'","a:'left'","s:'down'","d:'right'"]){
  assert.ok(canvas.includes(key),'missing keyboard control '+key);
 }
 assert.ok(canvas.includes('onPointerDown={e=>startTouchDirection(e,direction)}'));
 assert.ok(canvas.includes('onPointerUp={e=>endTouchDirection(e,direction)}'));
 assert.ok(canvas.includes('findNearbyLocation('));
 assert.ok(canvas.includes('interactRef.current(nearest)'));
 assert.ok(canvas.includes('travelRef.current.cancel()'));
 assert.ok(css.includes('touch-action:none'));
 assert.match(read('src/pages/HomePage.jsx'),/paused=\\{Boolean\\([^)]*activeLocation/);
});

test('central plaza honors all six colored guide corridors, elsewhere takes direct A*',()=>{
 const start=getSpawnPoint();
 for(const [id,guide] of Object.entries(PLAZA_ROUTE_GUIDES)){
  const path=buildTravelPath(start.x,start.y,id);
  assert.ok(path.some(p=>Math.hypot(p.x-guide.x,p.y-guide.y)<=1),'plaza missed route guide '+id);
 }
 const other=LOCATION_MAP['game-dev-studio'];
 const destination=LOCATION_MAP['contact-centre'];
 const shortest=buildPathToPoint(other.entranceX,other.entranceY,destination.entranceX,destination.entranceY);
 assert.deepEqual(buildTravelPath(other.entranceX,other.entranceY,destination.id),shortest,
  'from another location use the current-position shortest route, without plaza guide');
});
