// Author-approved image is the world background; collisions match actual visible scenery.
export const WORLD_WIDTH=1672;
export const WORLD_HEIGHT=941;
export const TILE_SIZE=32;
export const GRID_COLS=Math.ceil(WORLD_WIDTH/TILE_SIZE);
export const GRID_ROWS=Math.ceil(WORLD_HEIGHT/TILE_SIZE);
export const PROPS=[];
export const NPCS=[];
export const WATER_FEATURES=[];
export const STRUCTURES=[];
export const CLIFFS=[];
export function generateTerrainGrid(){return [];}
export function getEnvironmentPropPath(){return '';}

export const RECT_OBSTACLES=[
  // Northern landscape / raised forest
  {x:0,y:0,w:1672,h:80},
  // Central fountain and stone pedestal
  {x:775,y:416,w:122,h:108},
  // Planters and shrubs beside the central plaza
  {x:675,y:426,w:61,h:80},
  {x:941,y:430,w:62,h:76},
  // Island coastline and water edges
  {x:0,y:670,w:152,h:271},
  {x:1515,y:655,w:157,h:286},
  {x:0,y:815,w:670,h:126},
  {x:1035,y:825,w:637,h:116},
  // Upper rock ridges
  {x:0,y:80,w:130,h:205},
  {x:1540,y:80,w:132,h:220},
  // Dock edges; prevent walking into the sea
  {x:40,y:520,w:55,h:125}
];
export const CIRCLE_OBSTACLES=[
  {x:96,y:390,r:36},{x:156,y:320,r:27},{x:590,y:515,r:28},
  {x:1070,y:520,r:29},{x:1590,y:510,r:35},
  {x:540,y:790,r:29},{x:1122,y:782,r:29}
];
export function isWorldCollision(x,y,w,h) {
  if(x<46||y<98||x+w>WORLD_WIDTH-46||y+h>WORLD_HEIGHT-60)return true;
  if(RECT_OBSTACLES.some(b=>x<b.x+b.w&&x+w>b.x&&y<b.y+b.h&&y+h>b.y))return true;
  return CIRCLE_OBSTACLES.some(c=>{
    const px=Math.max(x,Math.min(c.x,x+w));
    const py=Math.max(y,Math.min(c.y,y+h));
    return (px-c.x)**2+(py-c.y)**2<c.r**2;
  });
}
