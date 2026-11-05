// Approved campus art with repaired UI and plaza overlays.
// All coordinates are in world pixels; gameplay remains on a separate moving layer.
import { WORLD_WIDTH, WORLD_HEIGHT } from '../data/mapData.js';
import { getNomadHeroFrame } from './nomadHero.js';

function drawArtwork(ctx, image) {
  ctx.drawImage(image, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  // Cover the non-interactive logo/menu/map graphics baked into the original art.
  // React's real Header renders functional controls above this world.
  ctx.fillStyle = '#0a1426';
  ctx.fillRect(0, 0, WORLD_WIDTH, 82);
  ctx.fillStyle = '#c83246';
  ctx.fillRect(0, 80, WORLD_WIDTH, 2);

  // The source illustration contains a smudged, ghost-like artifact below
  // the fountain. Rebuild that segment from intact mirrored pixel pavement.
  // Avoid blur/inpainting: it softens the existing retro pixel-art.
  ctx.save();
  ctx.beginPath();
  ctx.rect(802, 536, 63, 64);
  ctx.clip();
  ctx.translate(865, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(image, 739, 536, 63, 64, 0, 536, 63, 64);
  ctx.restore();
}

function drawPlayer(ctx, player, elapsed) {
  const {x, y, direction, moving} = player;
  // Fixed 32x48 world footprint for all directions and animation phases.
  const sprite = getNomadHeroFrame(direction, elapsed, moving);
  const px = Math.round(x), py = Math.round(y);
  ctx.fillStyle = 'rgba(4,8,14,.22)';
  ctx.beginPath();
  ctx.ellipse(px + 16, py + 41, 9, 3, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.drawImage(sprite, px, py, 32, 48);
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
  drawPlayer(ctx, player, elapsed);
  ctx.restore();
}

export function screenToWorld(x, y, camera, zoom, width, height) {
  return {x: (x - width / 2) / zoom + camera.x, y: (y - height / 2) / zoom + camera.y};
}
