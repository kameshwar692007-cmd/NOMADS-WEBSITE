// Feet-based collision coordinates for the 32x48 player avatar.
import { LOCATIONS } from '../data/locationData.js';
import { isWorldCollision } from '../data/mapData.js';
export const PLAYER_COLLISION_W=14;
export const PLAYER_COLLISION_H=10;
export const PLAYER_COLLISION_OFFSET_X=9;
export const PLAYER_COLLISION_OFFSET_Y=35;

export function checkFootCollision(footX, footY) {
  const x=footX-PLAYER_COLLISION_W/2,y=footY-PLAYER_COLLISION_H/2;
  if(isWorldCollision(x,y,PLAYER_COLLISION_W,PLAYER_COLLISION_H))return true;
  for(const loc of LOCATIONS){
    const box=loc.collisionBox;
    const bx=loc.worldX+box.x,by=loc.worldY+box.y;
    if(x<bx+box.w&&x+PLAYER_COLLISION_W>bx&&y<by+box.h&&y+PLAYER_COLLISION_H>by)return true;
  }
  return false;
}
export function checkCollision(x,y){return checkFootCollision(x+16,y+40);}
export function resolveMovement(x,y,dx,dy){
  // Prevent tunneling through thin obstacles during FPS dips.
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/3));
  let px=x,py=y;
  for(let i=0;i<steps;i++){
    const mx=dx/steps,my=dy/steps;
    if(!checkCollision(px+mx,py+my)){px+=mx;py+=my;continue;}
    if(mx!==0&&!checkCollision(px+mx,py))px+=mx;
    if(my!==0&&!checkCollision(px,py+my))py+=my;
  }
  return {x:px,y:py};
}

// Autopilot follows the planned cement corridor exactly. Unlike the generic
// sliding resolver, it must never slide sideways into another obstacle/route.
export function resolvePathMovement(x,y,dx,dy) {
 const distance=Math.hypot(dx,dy);
 const steps=Math.max(1,Math.ceil(distance/1.5));
 let px=x,py=y;
 for(let i=0;i<steps;i++){
  const nx=px+dx/steps,ny=py+dy/steps;
  if(checkCollision(nx,ny))return {x:px,y:py,blocked:true};
  px=nx;py=ny;
 }
 return {x:px,y:py,blocked:false};
}
