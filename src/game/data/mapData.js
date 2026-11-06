import { isCementPixel } from './cementMask.js';
import { isGroundPixel } from './groundMask.js';
import { hitsSceneObject } from './sceneObjects.js';
// Campus collision map: coordinates match 1672 × 941 approved illustration.
// Gameplay is deliberately confined to visible roads, plaza and building approaches:
// trees, water, cliffs, grass, fences and decorations are not walkable.
export const WORLD_WIDTH = 1672;
export const WORLD_HEIGHT = 941;
export const TILE_SIZE = 32;
export const GRID_COLS = Math.ceil(WORLD_WIDTH/TILE_SIZE);
export const GRID_ROWS = Math.ceil(WORLD_HEIGHT/TILE_SIZE);
export const PROPS = [];
export const NPCS = [];
export const WATER_FEATURES = [];
export const STRUCTURES = [];
export const CLIFFS = [];
export function generateTerrainGrid(){return [];}
export function getEnvironmentPropPath(){return '';}

// Every corridor is a capsule centered on a stone walkway. The last number
// is its usable half-width, already conservative near trees and ledges.
// This prevents walking through unmodelled scenery outside the pathways.
export const WALKABLE_CORRIDORS = [
 // North steps / headquarters
 [835,355,835,386,30],
 [835,386,734,390,34],
 [735,390,735,447,31],
 [735,447,678,447,32],
 [678,447,678,605,30],
 // Upper-left avenue / studio
 [678,448,525,447,32],
 [525,447,506,409,33],
 [506,409,355,410,32],
 // Upper-right avenue / arena
 [983,448,1155,448,35],
 [947,448,983,448,35],
 [1155,448,1155,410,32],
 [1155,410,1370,410,33],
 [983,545,983,448,30],
 // Main plaza and center, avoiding the fountain
 [678,605,835,555,38],
 [835,555,983,585,43],
 [835,555,835,610,55],
 [732,545,727,604,38],
 [947,545,952,604,38],
 // Central lower plaza / two branching roads
 [678,605,640,624,36],
 [640,624,550,655,37],
 [983,602,1040,624,36],
 [1040,624,1195,683,39],
 // Community Hub path
 [550,655,510,699,36],
 [510,699,345,710,36],
 // Contact Centre path
 [1195,683,1205,707,38],
 [1205,707,1380,712,36],
 // Western Event Grounds approach — not through tent or stage
 [510,699,488,699,32],
 [488,699,488,785,28],
 [488,785,488,816,27],
 [488,816,550,817,27],
 // Additional visible paving across the south
 [345,710,235,711,30],
 [1380,712,1460,715,28]
];

// Places with broad paving not accurately represented as a single corridor.
// [x,y,rx,ry] = ellipse with interior available to the player.
export const WALKABLE_PLAZAS = [
 [835,565,112,95],
 [828,608,140,48],
 [560,661,52,36],
 [1122,663,58,33],
];

// Precise bases/feet of visually tall objects. Tree canopy pixels may overlap
// the avatar visually, but only their solid trunks/bases collide.
export const RECT_OBSTACLES = [
 // Fountain and surrounding flower ring (raised stone)
 {name:'fountain pedestal',x:766,y:410,w:138,h:112},
 // Northern benches
 {name:'west bench',x:606,y:400,w:49,h:35},
 {name:'east bench',x:1008,y:399,w:51,h:38},
 // Lamp bases, along both sides of the plaza
 {name:'HQ west lamp',x:729,y:337,w:26,h:41},
 {name:'HQ east lamp',x:906,y:336,w:27,h:42},
 {name:'southwest lamp',x:637,y:531,w:29,h:49},
 {name:'southeast lamp',x:999,y:530,w:29,h:49},
 // Flagpole bases and stands (not the fabric)
 {name:'northwest banner',x:687,y:353,w:24,h:51},
 {name:'northeast banner',x:946,y:353,w:24,h:51},
 {name:'plaza west banner',x:689,y:492,w:26,h:69},
 {name:'plaza east banner',x:944,y:491,w:28,h:70},
 // Community patio fence, tables, cafe umbrella and benches
 {name:'community fence',x:515,y:552,w:44,h:107},
 {name:'community tables',x:382,y:605,w:107,h:60},
 // Event grounds is fenced; no shortcut through its stage/tents
 {name:'event left fence',x:582,y:716,w:24,h:126},
 {name:'event entrance tent',x:615,y:734,w:83,h:103},
 {name:'event main stage',x:728,y:680,w:214,h:101},
 {name:'event red tent',x:962,y:732,w:100,h:99},
 {name:'event lower fence',x:588,y:836,w:483,h:17},
 // Contact building exterior decorations
 {name:'contact shrub row',x:1192,y:629,w:35,h:35}
];

// Large hand-estimated tree-canopy blockers previously caused invisible lock zones.
// Only the fountain garden is fully solid; scenery uses smaller foot-based hitboxes.
export const ELLIPSE_OBSTACLES = [
 {name:'fountain flowers left',x:751,y:476,rx:18,ry:25},
 {name:'fountain flowers right',x:919,y:478,rx:18,ry:25}
];

function distanceToSegment(px,py,x1,y1,x2,y2) {
 const vx=x2-x1,vy=y2-y1;
 const denom=vx*vx+vy*vy;
 const t=denom?Math.max(0,Math.min(1,((px-x1)*vx+(py-y1)*vy)/denom)):0;
 return Math.hypot(px-x1-t*vx,py-y1-t*vy);
}
export function isWalkablePoint(x,y) {
  // Free exploration follows the user's annotated red perimeter, including lawns
  // and event sand. Guided travel uses the stricter cement-only route graph.
  return isCementPixel(x,y) || isGroundPixel(x,y);
}

export function isWorldCollision(x,y,w,h) {
 if(x<0||y<0||x+w>WORLD_WIDTH||y+h>WORLD_HEIGHT)return true;
 // Test each corner + center: the complete player-foot capsule must remain on land.
 const points=[
  [x,y],[x+w,y],[x,y+h],[x+w,y+h],[x+w/2,y+h/2]
 ];
 if(points.some(([px,py])=>!isWalkablePoint(px,py)))return true;
 if(RECT_OBSTACLES.some(b=>x<b.x+b.w&&x+w>b.x&&y<b.y+b.h&&y+h>b.y))return true;
 if(hitsSceneObject(x,y,w,h))return true;
 return ELLIPSE_OBSTACLES.some(b=>{
  // Closest point of rectangle to ellipse center.
  const cx=Math.max(x,Math.min(b.x,x+w)),cy=Math.max(y,Math.min(b.y,y+h));
  return ((cx-b.x)/b.rx)**2+((cy-b.y)/b.ry)**2<1;
 });
}
