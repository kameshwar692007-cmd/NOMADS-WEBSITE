// Character-free reference artwork preserves the original user's approved map.
// Compose five baked-character clean tiles and one plaza tile exactly once.
const CLEAN_TILE_RECTS=Object.freeze([
  [471,327,528,406], [1459,351,1528,438],
  [453,590,521,675], [1177,594,1242,686],
  [708,738,780,832], [790,511,875,611]
]);
const TILE_STRIDE=96;
export { CLEAN_TILE_RECTS };
function loadImage(url){
  return new Promise((resolve,reject)=>{
    const image=new Image();
    image.onload=()=>resolve(image);
    image.onerror=()=>reject(new Error('Failed to load game image: '+url));
    image.src=url;
  });
}
export function createCleanCampus(campus,cleanTiles){
  const canvas=document.createElement('canvas');
  canvas.width=campus.naturalWidth||campus.width;
  canvas.height=campus.naturalHeight||campus.height;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('Unable to compose clean campus canvas');
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(campus,0,0,canvas.width,canvas.height);
  // Each clean tile is cropped directly from the supplied character-free
  // reference map, with a transparent feather at its outside boundary.
  if(cleanTiles?.width){
    CLEAN_TILE_RECTS.forEach(([x1,y1,x2,y2],i)=>{
      const w=x2-x1,h=y2-y1;
      ctx.drawImage(cleanTiles,i*TILE_STRIDE,0,w,h,x1,y1,w,h);
    });
  }
  return canvas;
}
export async function loadAllAssets(){
 const [campus,hero,headerLeft,headerRight,foregroundMask,npcSprites,cleanTiles]=await Promise.all([
  loadImage('/assets/game/campus-world.png'),
  loadImage('/assets/game/characters/player/nomad-goggles-v4.png'),
  loadImage('/assets/game/header-clean-left.webp'),
  loadImage('/assets/game/header-clean-right.webp'),
  loadImage('/assets/game/foreground-pixel-mask.png'),
  loadImage('/assets/onboarding/npc-complete-atlas.png'),
  loadImage('/assets/game/reference-clean-tiles.webp'),
 ]);
 const cleanCampus=createCleanCampus(campus,cleanTiles);
 const foreground=document.createElement('canvas');
 foreground.width=cleanCampus.width; foreground.height=cleanCampus.height;
 const ctx=foreground.getContext('2d');
 if(!ctx)throw new Error('Unable to compose foreground mask');
 ctx.imageSmoothingEnabled=false;
 ctx.drawImage(cleanCampus,0,0);
 ctx.globalCompositeOperation='destination-in';
 ctx.drawImage(foregroundMask,0,0,foreground.width,foreground.height);
 ctx.globalCompositeOperation='source-over';
 return {
  'npc/complete-sprites':npcSprites,
  'world/campus-clean':cleanCampus,
  'world/foreground-pixels':foreground,
  'world/campus':campus,
  'player/nomad-goggles-v4':hero,
  'world/header-left':headerLeft,
  'world/header-right':headerRight
 };
}
