// Nomad's Province — Collision System
// Pixel-based collision detection for buildings, water, and world edges

import { LOCATIONS } from '../data/locationData.js';
import { isWorldCollision } from '../data/mapData.js';

const PLAYER_COLLISION_W = 20;
const PLAYER_COLLISION_H = 16;
const PLAYER_COLLISION_OFFSET_X = 6; // offset from sprite left
const PLAYER_COLLISION_OFFSET_Y = 32; // offset from sprite top (feet area)

/**
 * Check if moving to (newX, newY) would cause a collision
 * Coordinates are the top-left of the player sprite
 */
export function checkCollision(newX, newY) {
  // Player's collision box is at the feet
  const footX = newX + PLAYER_COLLISION_OFFSET_X;
  const footY = newY + PLAYER_COLLISION_OFFSET_Y;

  // World boundary and water collisions
  if (isWorldCollision(footX, footY, PLAYER_COLLISION_W, PLAYER_COLLISION_H)) {
    return true;
  }

  // Building collisions
  for (const loc of LOCATIONS) {
    const box = loc.collisionBox;
    const bx = loc.worldX + box.x;
    const by = loc.worldY + box.y;
    const bw = box.w;
    const bh = box.h;

    if (
      footX + PLAYER_COLLISION_W > bx &&
      footX < bx + bw &&
      footY + PLAYER_COLLISION_H > by &&
      footY < by + bh
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Attempt to move player, sliding along walls if partial movement is possible
 */
export function resolveMovement(currentX, currentY, dx, dy) {
  // Try full movement first
  if (!checkCollision(currentX + dx, currentY + dy)) {
    return { x: currentX + dx, y: currentY + dy };
  }

  // Try horizontal only
  if (dx !== 0 && !checkCollision(currentX + dx, currentY)) {
    return { x: currentX + dx, y: currentY };
  }

  // Try vertical only
  if (dy !== 0 && !checkCollision(currentX, currentY + dy)) {
    return { x: currentX, y: currentY + dy };
  }

  // Fully blocked
  return { x: currentX, y: currentY };
}

export { PLAYER_COLLISION_W, PLAYER_COLLISION_H, PLAYER_COLLISION_OFFSET_X, PLAYER_COLLISION_OFFSET_Y };
