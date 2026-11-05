// Original Nomad hero: deterministic 16x24 pixel-art frames.
// Every frame uses the same anchor and dimensions; no inconsistent cropped source PNGs.
// Draw at integer scale for sharp edges.
const COLORS = {
  outline:'#172039',shade:'#25334f',hair:'#1b1d34',hairlight:'#34364d',
  face:'#f7c591',faceShade:'#d89067',red:'#df364c',redDark:'#98253f',
  redLight:'#ff6472',white:'#f8ecdc',eye:'#20243b',jacket:'#263d5d',
  jacketLight:'#4d6f91',jeans:'#29415b',shoe:'#111c2a',shoeLight:'#a4c5d0'
};
const CACHE = new Map();
const W=16,H=24,S=2;
function makeFrame(direction,walkPhase) {
  const canvas=document.createElement('canvas');
  canvas.width=W*S;canvas.height=H*S;
  const ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled=false;
  const px=(x,y,w,h,color)=>{
    ctx.fillStyle=COLORS[color]||color;
    ctx.fillRect(Math.round(x*S),Math.round(y*S),Math.round(w*S),Math.round(h*S));
  };
  const walking=walkPhase>=0;
  const swing=walking ? [-1,0,1,0][walkPhase%4] : 0;
  const bob=walking && walkPhase%2 ? 1 : 0;
  const back=direction==='up', side=direction==='left'||direction==='right';
  const mirror=direction==='left';
  if(mirror){ctx.translate(canvas.width,0);ctx.scale(-1,1);}
  // Legs/shoes are independent so the character has an actual walk cycle.
  const leftStep=walking?swing:0, rightStep=walking?-swing:0;
  px(4+leftStep,17,4,4,'jeans');px(8+rightStep,17,4,4,'jeans');
  px(3+leftStep,20,5,2,'shoe');px(8+rightStep,20,5,2,'shoe');
  px(4+leftStep,20,3,1,'shoeLight');px(9+rightStep,20,3,1,'shoeLight');
  // Arms, body, zipper and nominal backpack when viewed from behind.
  px(2,11+bob+(walking?-swing:0),3,6,'outline');
  px(11,11+bob+(walking?swing:0),3,6,'outline');
  px(3,12+bob+(walking?-swing:0),2,4,'jacketLight');
  px(11,12+bob+(walking?swing:0),2,4,'jacketLight');
  px(4,10+bob,8,8,'outline');
  px(5,11+bob,6,6,back?'redDark':'jacket');
  px(5,12+bob,1,4,'jacketLight');
  px(10,12+bob,1,4,'jacketLight');
  if(back){px(6,12+bob,4,3,'red');px(7,13+bob,2,1,'white');}
  else{px(7,11+bob,2,6,'red');px(8,12+bob,1,4,'white');}
  // Head and cap geometry are constant for all animation poses.
  px(4,3+bob,8,9,'outline');
  px(5,4+bob,6,7,back?'hair':'face');
  px(5,8+bob,6,3,back?'hairlight':'faceShade');
  if(side){
    px(10,6+bob,2,3,'face');px(10,8+bob,1,1,'eye');
    px(5,6+bob,2,4,'hair');
    px(11,5+bob,3,2,'redDark');
  }else if(!back){
    px(6,8+bob,1,1,'eye');px(9,8+bob,1,1,'eye');
    px(7,10+bob,2,1,'faceShade');
  }
  px(3,3+bob,10,4,'outline');
  px(4,2+bob,8,4,'redDark');
  px(5,2+bob,6,2,'redLight');
  px(5,5+bob,7,1,'red');
  if(!back) px(5,6+bob,8,2,'red');
  else px(7,3+bob,2,2,'white');
  return canvas;
}
export function getNomadHeroFrame(direction='down',elapsed=0,moving=false){
  const allowed=['down','up','left','right'];
  const dir=allowed.includes(direction)?direction:'down';
  const phase=moving?Math.floor(elapsed/125)%4:-1;
  const key=dir+'-'+phase;
  if(!CACHE.has(key))CACHE.set(key,makeFrame(dir,phase));
  return CACHE.get(key);
}
