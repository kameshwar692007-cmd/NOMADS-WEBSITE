// Collision-aware campus pathfinding. No forced trips to the plaza.
import { LOCATION_MAP } from './locationData.js';
import { WORLD_WIDTH, WORLD_HEIGHT } from './mapData.js';
import { checkFootCollision } from '../systems/collision.js';
export const PLAZA_CENTER = { x:835, y:555 };
const CELL=12,COLS=Math.ceil(WORLD_WIDTH/CELL),ROWS=Math.ceil(WORLD_HEIGHT/CELL);
const DIRECTIONS=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
const idOf=(x,y)=>y*COLS+x;
const pointOf=id=>({x:(id%COLS)*CELL+CELL/2,y:Math.floor(id/COLS)*CELL+CELL/2});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function clearSegment(a,b){
 const length=distance(a,b);
 for(let d=0;d<=length;d+=1){const t=length?Math.min(1,d/length):1;
  if(checkFootCollision(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t))return false;}
 return !checkFootCollision(b.x,b.y);
}
function nearestFree(p){
 const cx=Math.max(0,Math.min(COLS-1,Math.floor(p.x/CELL)));
 const cy=Math.max(0,Math.min(ROWS-1,Math.floor(p.y/CELL)));
 const valid=(x,y)=>x>=0&&y>=0&&x<COLS&&y<ROWS&&!checkFootCollision((x+.5)*CELL,(y+.5)*CELL);
 if(valid(cx,cy))return idOf(cx,cy);
 for(let r=1;r<=12;r++)for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)
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
 if(clearSegment(start,end))return [end];
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
   if(checkFootCollision(p.x,p.y))continue;
   if(dx&&dy&&(checkFootCollision((x+dx+.5)*CELL,(y+.5)*CELL)||checkFootCollision((x+.5)*CELL,(y+dy+.5)*CELL)))continue;
   const newCost=costs[id]+CELL*(dx&&dy?Math.SQRT2:1);
   if(newCost<costs[target]){costs[target]=newCost;parents[target]=id;queue.push(target,newCost+h(target));}
  }
 }
 if(!Number.isFinite(costs[goal]))return [];
 const raw=[];for(let id=goal;id!==source&&id>=0;id=parents[id])raw.push(pointOf(id));raw.reverse();
 if(clearSegment(raw.at(-1)||start,end))raw.push(end);
 const result=[];let current=start;
 for(let i=0;i<raw.length;){
  let next=i;for(let j=raw.length-1;j>=i;j--)if(clearSegment(current,raw[j])){next=j;break;}
  if(!clearSegment(current,raw[next]))return [];
  result.push(raw[next]);current=raw[next];i=next+1;
 }
 return result;
}
// From the plaza, the Event Grounds entrance is reached via the western stone path.
const WESTERN_EVENT_WALKWAY=[
 {x:720,y:584},{x:660,y:611},{x:580,y:650},
 {x:584,y:706},{x:584,y:785},{x:622,y:803},{x:700,y:807}
];
function eventPath(start,end){
 if(distance(start,end)<14)return [];
 if(start.y>=750&&start.x>550&&start.x<725&&clearSegment(start,end))return [end];
 const fromPlaza=start.x>745&&start.x<940&&start.y>=525&&start.y<635;
 let selected=fromPlaza&&clearSegment(start,WESTERN_EVENT_WALKWAY[0])?0:-1;
 let score=Infinity;
 for(let i=0;selected<0&&i<WESTERN_EVENT_WALKWAY.length;i++){
  const p=WESTERN_EVENT_WALKWAY[i];if(!clearSegment(start,p))continue;
  const travel=distance(start,p);
  const remaining=WESTERN_EVENT_WALKWAY.slice(i).reduce((sum,v,j,a)=>sum+(j?distance(a[j-1],v):0),0);
  if(travel+remaining<score){score=travel+remaining;selected=i;}
 }
 let prefix=[];
 if(selected<0){
  let best=Infinity;
  for(let i=0;i<WESTERN_EVENT_WALKWAY.length;i++){
   const path=shortestPath(start,WESTERN_EVENT_WALKWAY[i]);if(!path.length)continue;
   const cost=path.reduce((sum,p,j)=>sum+distance(j?path[j-1]:start,p),0);
   if(cost<best){best=cost;selected=i;prefix=path;}
  }
 }
 if(selected<0)return [];
 const points=[...prefix,...WESTERN_EVENT_WALKWAY.slice(prefix.length?selected+1:selected),end];
 const checked=[];let previous=start;
 for(const p of points){
  if(distance(previous,p)<3)continue;
  if(!clearSegment(previous,p)){
   const detour=shortestPath(previous,p);if(!detour.length)return [];
   checked.push(...detour);
  }else checked.push(p);
  previous=p;
 }
 return checked;
}
export function buildTravelPath(fromX,fromY,destinationId){
 const destination=LOCATION_MAP[destinationId];if(!destination)return [];
 const start={x:fromX,y:fromY},end={x:destination.entranceX,y:destination.entranceY};
 return destinationId==='event-grounds'?eventPath(start,end):shortestPath(start,end);
}
export function getSpawnPoint(){return {...PLAZA_CENTER};}
