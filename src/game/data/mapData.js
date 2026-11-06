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
// Only large, truly structural pieces remain rectangular. Trees, flowers,
// small benches, lamp posts and flags use their tiny actual ground contacts
// from sceneObjects.js, NOT full canopy/illustration rectangles.
export const RECT_OBSTACLES = [
 {name:'fountain pedestal',x:766,y:410,w:138,h:112},
 // Community café: furniture base only, not the whole patio.
 {name:'community table A',x:407,y:644,w:18,h:10},
 {name:'community table B',x:450,y:642,w:18,h:10},
 {name:'community western fence',x:512,y:616,w:11,h:36},
 // Event grounds stage, pitched tents and physical fences are solid.
 {name:'event western fence',x:582,y:742,w:13,h:95},
 {name:'event blue tent',x:615,y:747,w:77,h:88},
 {name:'event stage',x:728,y:694,w:214,h:88},
 {name:'event red tent',x:962,y:748,w:96,h:82},
 // The event fence consists of separate posts/rails, not a sealed
 // 483-pixel wall. Leave the marked entry gap clear for walking.
 {name:'event lower fence west',x:587,y:837,w:72,h:12},
 {name:'event lower fence east',x:960,y:837,w:113,h:12}
];
export const ELLIPSE_OBSTACLES = [
 // Raised planted stone border, not tree canopies.
 {name:'fountain flowers left',x:751,y:476,rx:18,ry:25},
 {name:'fountain flowers right',x:919,y:478,rx:18,ry:25}
];

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
