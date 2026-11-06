// Approved campus art with repaired UI and plaza overlays.
// All coordinates are in world pixels; gameplay remains on a separate moving layer.
import { WORLD_WIDTH, WORLD_HEIGHT } from '../data/mapData.js';

function drawArtwork(ctx, image) {
  ctx.drawImage(image, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
}

// Stable timeline: frame advances only while feet actually travel.
// Idle always uses the fixed first cell, no jump from global clock.
const WALK_CYCLE = [1, 2, 3, 2];
export const HERO_DRAW_WIDTH = 32;
export const HERO_DRAW_HEIGHT = 48;

export function getHeroFrame(player) {
  const row = { down:0, left:1, right:2, up:3 }[player.direction] ?? 0;
  const phase = player.moving ? Math.floor((player.walkCycleTime ?? 0) / 155) % WALK_CYCLE.length : 0;
  const col = player.moving ? WALK_CYCLE[phase] : 0;
  return { row, col };
}

function drawPlayer(ctx, assets, player) {
  const { x, y } = player;
  // World collision coordinates stay at (x+16,y+40), independent of sprite size.
  const footX = Math.round(x + 16), footY = Math.round(y + 40);
  const drawX = footX - HERO_DRAW_WIDTH/2;
  const drawY = footY - HERO_DRAW_HEIGHT;
  ctx.fillStyle = 'rgba(4,8,14,.24)';
  ctx.beginPath();
  ctx.ellipse(footX,footY+1,11,3.1,0,0,Math.PI*2);
  ctx.fill();
  const hero = assets['player/nomad-goggles-v3'];
  if (!hero?.complete || hero.naturalWidth!==128 || hero.naturalHeight!==192) return;
  const {row,col} = getHeroFrame(player);
  const fw=hero.naturalWidth/4,fh=hero.naturalHeight/4;
  ctx.drawImage(hero,col*fw,row*fh,fw,fh,
    Math.round(drawX),Math.round(drawY),HERO_DRAW_WIDTH,HERO_DRAW_HEIGHT);
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
  // Restore unbranded scenery using the matching clean reference artwork.
  // These are WORLD-space pixels and therefore move with the map, while
  // the real banner, Map and Menu live in the fixed React overlay.
  const cleanLeft=assets['world/header-left'];
  if(cleanLeft?.width) ctx.drawImage(cleanLeft,0,0,420,110);
  const cleanRight=assets['world/header-right'];
  if(cleanRight?.width) ctx.drawImage(cleanRight,1380,0,292,100);
  // Correct the permanently baked character/smudge using the matching
  // clean reference pavement, before drawing the moving player.
  const plazaPatch = assets['world/plaza-patch'];
  if (plazaPatch?.width) ctx.drawImage(plazaPatch, 788, 511);
  drawPlayer(ctx, assets, player);
  ctx.restore();
}

export function screenToWorld(screenX, screenY, camera, zoom, canvasW, canvasH) {
  const worldX = (screenX - canvasW / 2) / zoom + camera.x;
  const worldY = (screenY - canvasH / 2) / zoom + camera.y;
  return { x: worldX, y: worldY };
}
