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
 [478,336,522,394],  // studio
 [1473,365,1517,427], // arena
 [465,605,507,664],  // community
 [1190,608,1236,672],// contact
 [723,751,767,817]   // events
]);
export function createCleanCampus(campus) {
 const cleanCampus=createCleanCampus(campus);
 const canvas=document.createElement('canvas');
 canvas.width=campus.naturalWidth||campus.width;canvas.height=campus.naturalHeight||campus.height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 ctx.drawImage(campus,0,0);
 const data=ctx.getImageData(0,0,canvas.width,canvas.height);
 const source=new Uint8ClampedArray(data.data);
 const w=canvas.width;
 // Blend sampled surrounding terrain across each narrow NPC-sized cutout.
 // Keep the original pixels in a small feathered edge to avoid hard seams.
 for(const [x1,y1,x2,y2] of BAKED_NPC_RECTS){
  for(let y=y1;y<y2;y++)for(let x=x1;x<x2;x++){
   const i=(y*w+x)*4;
   const left=(y*w+(x1-9))*4,right=(y*w+(x2+9))*4;
   const above=((y1-8)*w+x)*4,below=((y2+8)*w+x)*4;
   const fx=(x-x1)/(x2-x1),fy=(y-y1)/(y2-y1);
   const blendX=source[left]*(1-fx)+source[right]*fx;
   const blendY=source[above]*(1-fy)+source[below]*fy;
   const edge=Math.min(x-x1,x2-x-1,y-y1,y2-y-1);
   const opacity=Math.min(1,Math.max(0,edge/5));
   for(let channel=0;channel<3;channel++){
    const horizontal=source[left+channel]*(1-fx)+source[right+channel]*fx;
    const vertical=source[above+channel]*(1-fy)+source[below+channel]*fy;
    const replacement=horizontal*.65+vertical*.35;
    data.data[i+channel]=source[i+channel]*(1-opacity)+replacement*opacity;
   }
  }
 }
 ctx.putImageData(data,0,0);
 return canvas;
}

export async function loadAllAssets(){
 const [campus,hero,plazaPatch,headerLeft,headerRight,foregroundMask,npcSprites]=await Promise.all([
  loadImage('/assets/game/campus-world.png'),
  loadImage('/assets/game/characters/player/nomad-goggles-v4.png'),
  loadImage('/assets/game/plaza-clean-patch.png'),
  loadImage('/assets/game/header-clean-left.webp'),
  loadImage('/assets/game/header-clean-right.webp'),
  loadImage('/assets/game/foreground-pixel-mask.png'),
  loadImage('/assets/onboarding/npc-complete-atlas.png')
 ]);
 // Compose exact-alpha foreground once at load. Draw the campus through the
 // transparent mask; rendering may then copy only the masked object pixels.
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
