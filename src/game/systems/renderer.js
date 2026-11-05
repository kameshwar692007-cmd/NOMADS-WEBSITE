// Nomad's Province — approved-artwork renderer.
// The campus is a single authored background; gameplay remains fully interactive above it.
import { WORLD_WIDTH, WORLD_HEIGHT } from '../data/mapData.js';

export function renderWorld(ctx, assets, camera, playerState, zoom, canvasW, canvasH, frameCount) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#07101d';
  ctx.fillRect(0,0,canvasW,canvasH);
  ctx.translate(canvasW/2, canvasH/2);
  ctx.scale(zoom,zoom);
  ctx.translate(-camera.x,-camera.y);

  const bg = assets['world/campus'];
  if(bg) ctx.drawImage(bg,0,0,WORLD_WIDTH,WORLD_HEIGHT);
  drawPlayer(ctx,assets,playerState,frameCount);
  ctx.restore();
}

function drawPlayer(ctx, assets, playerState, frameCount) {
  const {x,y,direction,moving}=playerState;
  const step = moving && Math.floor(frameCount/7)%2===0;
  const key = step ? `player/player-walk-${direction}` : `player/player-idle-${direction}`;
  const img=assets[key];
  const drawW=24, drawH=36;
  const drawX=x+4, drawY=y+10;
  ctx.fillStyle='rgba(4,8,14,.30)';
  ctx.beginPath(); ctx.ellipse(drawX+12,drawY+34,8,3,0,0,Math.PI*2); ctx.fill();
  if(img) ctx.drawImage(img,drawX,drawY,drawW,drawH);
}

export function screenToWorld(screenX,screenY,camera,zoom,canvasW,canvasH){
  return {x:(screenX-canvasW/2)/zoom+camera.x, y:(screenY-canvasH/2)/zoom+camera.y};
}
