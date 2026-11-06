// Approved campus art with repaired UI and plaza overlays.
// All coordinates are in world pixels; gameplay remains on a separate moving layer.
import { WORLD_WIDTH, WORLD_HEIGHT } from '../data/mapData.js';

function drawArtwork(ctx, image) {
  ctx.drawImage(image, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
}

// 4-phase natural walk cycle: Left Stride (1) -> Passing/Neutral (2) -> Right Stride (3) -> Passing/Neutral (2)
const WALK_CYCLE = [1, 2, 3, 2];

function drawPlayer(ctx, assets, player, elapsed) {
  const { x, y, direction, moving } = player;
  const row = { down: 0, up: 1, left: 2, right: 3 }[direction] ?? 0;
  const column = moving ? WALK_CYCLE[Math.floor(elapsed / 135) % 4] : 0;
  const px = Math.round(x), py = Math.round(y);

  ctx.fillStyle = 'rgba(4,8,14,.22)';
  ctx.beginPath();
  ctx.ellipse(px + 16, py + 40, 9, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const hero = assets['player/uploaded-hero'] || assets['player/nomad-hero'];
  if (hero?.width) {
    const fw = hero.width / 4;
    const fh = hero.height / 4;
    ctx.drawImage(hero, column * fw, row * fh, fw, fh, px + 2, py - 2, 28, 42);
  }
}

function drawWorldDirectory(ctx) {
  // Match the permanent, authored Menu and Map plaques on the top right.
  const x = 1203, y = 10, w = 167, h = 65;
  ctx.save();
  ctx.fillStyle = '#0d1b33';
  ctx.strokeStyle = '#e4e5ec';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 13);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('DIRECTORY', x + w / 2, y + h / 2);
  ctx.restore();
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
  // Correct the permanently baked character/smudge using the matching
  // clean reference pavement, before drawing the moving player.
  const plazaPatch = assets['world/plaza-patch'];
  if (plazaPatch?.width) ctx.drawImage(plazaPatch, 788, 511);
  drawWorldDirectory(ctx);
  drawPlayer(ctx, assets, player, elapsed);
  ctx.restore();
}

export function screenToWorld(screenX, screenY, camera, zoom, canvasW, canvasH) {
  const worldX = (screenX - canvasW / 2) / zoom + camera.x;
  const worldY = (screenY - canvasH / 2) / zoom + camera.y;
  return { x: worldX, y: worldY };
}
