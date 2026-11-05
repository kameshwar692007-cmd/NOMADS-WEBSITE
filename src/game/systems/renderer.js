// Approved campus art with repaired UI and plaza overlays.
// All coordinates are in world pixels; gameplay remains on a separate moving layer.
import { WORLD_WIDTH, WORLD_HEIGHT } from '../data/mapData.js';

function drawArtwork(ctx, image) {
  ctx.drawImage(image, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  // The approved illustration already contains clean paving below the fountain.
  // Never mirror/copy canvas pixels into the plaza (that created the triangular seam).
  // Hide only the baked static corner buttons, not the landscape between them.
  ctx.fillStyle = '#0b1629';
  ctx.fillRect(0, 0, 437, 82);
  ctx.fillRect(1380, 0, WORLD_WIDTH - 1380, 82);

}

function drawPlayer(ctx, assets, player, elapsed) {
  const {x,y,direction,moving}=player;
  const row={down:0,left:1,right:2,up:3}[direction] ?? 0;
  const column=moving ? 1+Math.floor(elapsed/125)%3 : 0;
  const px=Math.round(x),py=Math.round(y);
  ctx.fillStyle='rgba(4,8,14,.22)';
  ctx.beginPath();
  ctx.ellipse(px+16,py+43,10,3,0,0,Math.PI*2);
  ctx.fill();
  const hero=assets['player/nomad-hero'];
  if(hero?.width){
    ctx.drawImage(hero,column*32,row*48,32,48,px,py,32,48);
  }
}

export function renderWorld(ctx, assets, camera, player, zoom, width, height, elapsed) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#07101d';
  ctx.fillRect(0, 0, width, height);
  ctx.translate(Math.round(width / 2), Math.round(height / 2));
  ctx.scale(zoom, zoom);
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));
  const campus = assets['world/campus'];
  if (campus?.width) drawArtwork(ctx, campus);
  drawPlayer(ctx, assets, player, elapsed);
  ctx.restore();
}

export function screenToWorld(x, y, camera, zoom, width, height) {
  return {x: (x - width / 2) / zoom + camera.x, y: (y - height / 2) / zoom + camera.y};
}
