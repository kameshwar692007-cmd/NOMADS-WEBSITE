// One coherent campus illustration + procedural character. No 135 unused sprite requests.
function loadImage(url){
 return new Promise((resolve,reject)=>{
  const image=new Image();
  image.onload=()=>resolve(image);
  image.onerror=()=>reject(new Error('Failed to load campus artwork: '+url));
  image.src=url;
 });
}
export async function loadAllAssets(){
 const [campus,hero,plazaPatch,headerLeft,headerRight,foregroundMask]=await Promise.all([
  loadImage('/assets/game/campus-world.png'),
  loadImage('/assets/game/characters/player/nomad-goggles-v4.png'),
  loadImage('/assets/game/plaza-clean-patch.png'),
  loadImage('/assets/game/header-clean-left.webp'),
  loadImage('/assets/game/header-clean-right.webp'),
  loadImage('/assets/game/foreground-pixel-mask.png')
 ]);
 // Compose exact-alpha foreground once at load. Draw the campus through the
 // transparent mask; rendering may then copy only the masked object pixels.
 const canvas=document.createElement('canvas');
 canvas.width=campus.naturalWidth||campus.width;
 canvas.height=campus.naturalHeight||campus.height;
 const context=canvas.getContext('2d');
 if(!context)throw new Error('Unable to create foreground mask canvas');
 context.imageSmoothingEnabled=false;
 context.drawImage(campus,0,0,canvas.width,canvas.height);
 context.globalCompositeOperation='destination-in';
 context.drawImage(foregroundMask,0,0,canvas.width,canvas.height);
 context.globalCompositeOperation='source-over';
 return {'world/foreground-pixels':canvas,'world/campus':campus,'player/nomad-goggles-v4':hero,'world/plaza-patch':plazaPatch,
   'world/header-left':headerLeft,'world/header-right':headerRight};
}
