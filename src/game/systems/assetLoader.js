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
 return {'world/campus':await loadImage('/assets/game/campus-world.png')};
}
