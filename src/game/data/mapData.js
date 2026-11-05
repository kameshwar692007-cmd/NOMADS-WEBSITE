// The approved campus artwork is the world. Gameplay systems use these logical dimensions.
export const WORLD_WIDTH = 1672;
export const WORLD_HEIGHT = 941;
export const TILE_SIZE = 32;
export const GRID_COLS = Math.ceil(WORLD_WIDTH / TILE_SIZE);
export const GRID_ROWS = Math.ceil(WORLD_HEIGHT / TILE_SIZE);
export const PROPS = [];
export const NPCS = [];
export const WATER_FEATURES = [];
export const STRUCTURES = [];
export const CLIFFS = [];
export function generateTerrainGrid(){ return []; }
export function getEnvironmentPropPath(){ return ''; }
export function isWorldCollision(px,py,w,h){
  // Keep the player on the main island/campus and away from the outer water/cliff frame.
  const marginX = 62, top = 86, bottom = 892;
  if(px < marginX || px + w > WORLD_WIDTH - marginX || py < top || py + h > bottom) return true;
  // Lower water pockets / decorative coast areas.
  const blocked = [
    {x:0,y:720,w:145,h:221}, {x:1525,y:700,w:147,h:241},
    {x:420,y:850,w:190,h:91}, {x:1070,y:850,w:230,h:91}
  ];
  return blocked.some(b=>px+w>b.x && px<b.x+b.w && py+h>b.y && py<b.y+b.h);
}
