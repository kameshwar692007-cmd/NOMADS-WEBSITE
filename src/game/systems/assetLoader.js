// One coherent campus illustration + procedural character. No 135 unused sprite requests.
function loadImage(url){
 return new Promise((resolve,reject)=>{
  const image=new Image();
  image.onload=()=>resolve(image);
  image.onerror=()=>reject(new Error('Failed to load campus artwork: '+url));
  image.src=url;
 });
}

// Several older NPCs were flattened into the original background illustration.
// Remove only their tiny painted rectangles before drawing the actual full sprites.
// This precomputation runs ONCE during image loading, never per animation frame.
export const BAKED_NPC_RECTS=Object.freeze([
 [478,336,522,394],   // studio
 [1473,365,1517,427], // arena
 [465,605,507,664],   // community
 [1190,608,1236,672], // contact
 [723,751,767,817]    // event grounds
]);
// Use artist-inspected image patches instead of runtime interpolation that
// could create new blurry smudges in the approved campus painting.
export function createCleanCampus(campus,patchAtlas){
 const canvas=document.createElement('canvas');
 canvas.width=campus.naturalWidth||campus.width;
 canvas.height=campus.naturalHeight||campus.height;
 const ctx=canvas.getContext('2d');
 ctx.imageSmoothingEnabled=false;
 ctx.drawImage(campus,0,0);
 if(patchAtlas?.width){
  BAKED_NPC_RECTS.forEach(([x1,y1,x2,y2],i)=>{
   const width=x2-x1+8,height=y2-y1+8;
   ctx.drawImage(patchAtlas,i*56,0,width,height,x1-4,y1-4,width,height);
  });
 }
 return canvas;
}
export async function loadAllAssets(){
 const [campus,hero,plazaPatch,headerLeft,headerRight,foregroundMask,npcSprites,npcPatches]=await Promise.all([
  loadImage('/assets/game/campus-world.png'),
  loadImage('/assets/game/characters/player/nomad-goggles-v4.png'),
  loadImage('/assets/game/plaza-clean-patch.png'),
  loadImage('/assets/game/header-clean-left.webp'),
  loadImage('/assets/game/header-clean-right.webp'),
  loadImage('/assets/game/foreground-pixel-mask.png'),
  loadImage('/assets/onboarding/npc-complete-atlas.png'),
  loadImage('/assets/onboarding/npc-clean-patch-atlas.png')
 ]);
 // Compose cleaned world once, then its alpha-masked foreground layer.
 const cleanCampus=createCleanCampus(campus,npcPatches);
 const canvas=document.createElement('canvas');
 canvas.width=campus.naturalWidth||campus.width;
 canvas.height=campus.naturalHeight||campus.height;
 const context=canvas.getContext('2d');
 if(!context)throw new Error('Unable to create foreground mask canvas');
 context.imageSmoothingEnabled=false;
 context.drawImage(cleanCampus,0,0,canvas.width,canvas.height);
 context.globalCompositeOperation='destination-in';
 context.drawImage(foregroundMask,0,0,canvas.width,canvas.height);
 context.globalCompositeOperation='source-over';
 return {'npc/complete-sprites':npcSprites,'world/campus-clean':cleanCampus,'world/foreground-pixels':canvas,'world/campus':campus,'player/nomad-goggles-v4':hero,'world/plaza-patch':plazaPatch,
   'world/header-left':headerLeft,'world/header-right':headerRight};
}
