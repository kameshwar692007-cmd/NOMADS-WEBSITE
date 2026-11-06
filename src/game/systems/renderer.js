// Approved campus art with repaired UI and plaza overlays.
// All coordinates are in world pixels; gameplay remains on a separate moving layer.
import { WORLD_WIDTH, WORLD_HEIGHT } from '../data/mapData.js';
import { drawForegroundForPlayer } from '../data/sceneObjects.js';
import {CAMPUS_NPCS,NPC_SPRITE_WIDTH,NPC_SPRITE_HEIGHT} from '../data/npcDialogues.js';

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
  const hero = assets['player/nomad-goggles-v4'];
  const { x, y } = player;
  // World collision coordinates stay at (x+16,y+40), independent of sprite size.
  const footX = Math.round(x + 16), footY = Math.round(y + 40);
  const drawX = footX - HERO_DRAW_WIDTH/2;
  const drawY = footY - HERO_DRAW_HEIGHT;
  ctx.fillStyle = 'rgba(4,8,14,.24)';
  ctx.beginPath();
  ctx.ellipse(footX,footY+1,11,3.1,0,0,Math.PI*2);
  ctx.fill();
  if (hero && (hero.naturalWidth || hero.width) > 0 && (hero.naturalHeight || hero.height) > 0) {
    const {row,col} = getHeroFrame(player);
    const fw=(hero.naturalWidth||hero.width)/4,fh=(hero.naturalHeight||hero.height)/4;
    ctx.drawImage(hero,col*fw,row*fh,fw,fh,
      Math.round(drawX),Math.round(drawY),HERO_DRAW_WIDTH,HERO_DRAW_HEIGHT);
  }
}

// Six complete 32x48 sprites, all tied to the same definitions as their
// dialogue portraits. Foot-based painter ordering prevents cut-off heads.
function drawNpcInteractions(ctx,assets,player,elapsed=0){
 const spriteAtlas=assets['npc/complete-sprites'];
 if(!spriteAtlas?.width){drawPlayer(ctx,assets,player);return;}
 const sorted=[...CAMPUS_NPCS.map(n=>({type:'npc',y:n.y,n})),{type:'hero',y:player.y+40}].sort((a,b)=>a.y-b.y);
 for(const item of sorted){
  if(item.type==='hero'){drawPlayer(ctx,assets,player);continue;}
  const n=item.n;
  ctx.save();
  ctx.fillStyle='rgba(3,8,20,.24)';
  ctx.beginPath();ctx.ellipse(n.x,n.y+1,11,3,0,0,Math.PI*2);ctx.fill();
  ctx.drawImage(spriteAtlas,n.spriteIndex*NPC_SPRITE_WIDTH,0,NPC_SPRITE_WIDTH,NPC_SPRITE_HEIGHT,
    Math.round(n.x-NPC_SPRITE_WIDTH/2),Math.round(n.y-NPC_SPRITE_HEIGHT),NPC_SPRITE_WIDTH,NPC_SPRITE_HEIGHT);
  const markerY=n.y-59+Math.sin(elapsed/550+n.x*.02)*1.6;
  ctx.fillStyle='#14233b';ctx.strokeStyle='#eec77f';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(n.x,markerY,8.6,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff5ce';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('!',n.x,markerY);
  ctx.restore();
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
  const campus = assets['world/campus-clean'] || assets['world/campus'];
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
  drawNpcInteractions(ctx,assets,player,elapsed);
  drawForegroundForPlayer(ctx,assets['world/foreground-pixels'],player.x+16,player.y+40,HERO_DRAW_WIDTH,HERO_DRAW_HEIGHT);
  ctx.restore();
}

export function screenToWorld(screenX, screenY, camera, zoom, canvasW, canvasH) {
  const worldX = (screenX - canvasW / 2) / zoom + camera.x;
  const worldY = (screenY - canvasH / 2) / zoom + camera.y;
  return { x: worldX, y: worldY };
}
