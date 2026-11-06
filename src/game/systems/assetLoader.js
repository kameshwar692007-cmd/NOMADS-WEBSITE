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
 const [campus,hero,plazaPatch,headerLeft,headerRight]=await Promise.all([
  loadImage('/assets/game/campus-world.png'),
  loadImage('/assets/game/characters/player/nomad-hero-v2.svg'),
  loadImage('/assets/game/plaza-clean-patch.png'),
  loadImage('/assets/game/header-clean-left.webp'),
  loadImage('/assets/game/header-clean-right.webp')
 ]);
 return {'world/campus':campus,'player/nomad-hero-v2':hero,'world/plaza-patch':plazaPatch,
   'world/header-left':headerLeft,'world/header-right':headerRight};
}
