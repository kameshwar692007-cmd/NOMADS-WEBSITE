// Collision-aware campus pathfinding. No forced trips to the plaza.
import { LOCATION_MAP } from './locationData.js';
import { WORLD_WIDTH, WORLD_HEIGHT } from './mapData.js';
import { checkFootCollision } from '../systems/collision.js';
export const PLAZA_CENTER = { x:835, y:555 };
const CELL=8,COLS=Math.ceil(WORLD_WIDTH/CELL),ROWS=Math.ceil(WORLD_HEIGHT/CELL);
// Four orthogonal grid directions follow the paved routes without diagonal grass shortcuts.
const DIRECTIONS=[[1,0],[-1,0],[0,1],[0,-1]];
const idOf=(x,y)=>y*COLS+x;
const pointOf=id=>({x:(id%COLS)*CELL+CELL/2,y:Math.floor(id/COLS)*CELL+CELL/2});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function clearSegment(a,b){
 const length=distance(a,b);
 for(let d=0;d<=length;d+=1){const t=length?Math.min(1,d/length):1;
  if(checkFootCollision(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t))return false;}
 return !checkFootCollision(b.x,b.y);
}
// Long route segments must stay axis-aligned with the mapped cement walkways.
// Only one-cell diagonal corrections are allowed when aligning a click to the grid.
function canFollowCement(a,b){
 const dx=Math.abs(a.x-b.x),dy=Math.abs(a.y-b.y);
 return (dx<0.01||dy<0.01||Math.hypot(dx,dy)<=18) && clearSegment(a,b);
}
function nearestFree(p){
 const cx=Math.max(0,Math.min(COLS-1,Math.floor(p.x/CELL)));
 const cy=Math.max(0,Math.min(ROWS-1,Math.floor(p.y/CELL)));
 const valid=(x,y)=>x>=0&&y>=0&&x<COLS&&y<ROWS&&!checkFootCollision((x+.5)*CELL,(y+.5)*CELL);
 if(valid(cx,cy))return idOf(cx,cy);
 for(let r=1;r<=14;r++)for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)
  if(Math.max(Math.abs(x-cx),Math.abs(y-cy))===r&&valid(x,y))return idOf(x,y);
 return null;
}
class MinHeap{
 constructor(){this.items=[];}
 push(id,f){const a=this.items;let i=a.length;a.push({id,f});while(i){const p=(i-1)>>1;if(a[p].f<=f)break;a[i]=a[p];i=p;}a[i]={id,f};}
 pop(){const a=this.items,first=a[0],last=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let j=i*2+1;if(j+1<a.length&&a[j+1].f<a[j].f)j++;if(a[j].f>=last.f)break;a[i]=a[j];i=j;}a[i]=last;}return first;}
 get length(){return this.items.length;}
}
function shortestPath(start,end){
 if(distance(start,end)<10)return [];
 if(canFollowCement(start,end))return [end];
 const source=nearestFree(start),goal=nearestFree(end);if(source===null||goal===null)return [];
 const costs=new Float64Array(COLS*ROWS).fill(Infinity);
 const parents=new Int32Array(COLS*ROWS).fill(-1);
 const h=id=>distance(pointOf(id),pointOf(goal));
 const queue=new MinHeap();costs[source]=0;queue.push(source,h(source));
 let expanded=0;
 while(queue.length&&expanded<24000){
  const {id,f}=queue.pop();if(f>costs[id]+h(id)+.001)continue;
  if(id===goal)break;expanded++;
  const x=id%COLS,y=Math.floor(id/COLS);
  for(const [dx,dy] of DIRECTIONS){
   const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=COLS||ny>=ROWS)continue;
   const target=idOf(nx,ny),p=pointOf(target);
   if(checkFootCollision(p.x,p.y) || !clearSegment(pointOf(id),p))continue;
   // Never traverse a blocked cement/obstacle cell; all moves are orthogonal.
   const newCost=costs[id]+CELL;
   if(newCost<costs[target]){costs[target]=newCost;parents[target]=id;queue.push(target,newCost+h(target));}
  }
 }
 if(!Number.isFinite(costs[goal]))return [];
 const raw=[];for(let id=goal;id!==source&&id>=0;id=parents[id])raw.push(pointOf(id));raw.reverse();
 if(canFollowCement(raw.at(-1)||start,end))raw.push(end);
 const result=[];let current=start;
 for(let i=0;i<raw.length;){
  let next=i;for(let j=raw.length-1;j>=i;j--)if(canFollowCement(current,raw[j])){next=j;break;}
  if(!canFollowCement(current,raw[next]))return [];
  result.push(raw[next]);current=raw[next];i=next+1;
 }
 return result;
}
export function buildTravelPath(fromX,fromY,destinationId){
 const destination=LOCATION_MAP[destinationId];if(!destination)return [];
 const start={x:fromX,y:fromY},end={x:destination.entranceX,y:destination.entranceY};
 // The dedicated west-side paving is the only accessible Event Grounds route.
 // Let A* select the nearest path from the CURRENT position, without a forced detour.
 return shortestPath(start,end);
}
export function getSpawnPoint(){return {...PLAZA_CENTER};}

/** Click/tap on existing accessible cement tiles. Grass/water taps are rejected. */
export function buildPathToPoint(fromX,fromY,targetX,targetY){
 const start={x:fromX,y:fromY};
 if(!Number.isFinite(targetX)||!Number.isFinite(targetY))return [];
 const end={x:targetX,y:targetY};
 if(checkFootCollision(end.x,end.y))return [];
 return shortestPath(start,end);
}
