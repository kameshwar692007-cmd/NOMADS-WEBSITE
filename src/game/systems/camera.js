// Nomad's Province — Camera System
// Smooth-follow camera with world bounds clamping

import { WORLD_WIDTH, WORLD_HEIGHT } from '../data/mapData.js';

export class CameraSystem {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.lerpSpeed = 0.1;
  }

  /**
   * Initialize camera to center on a position instantly
   */
  snapTo(targetX, targetY) {
    this.x = targetX;
    this.y = targetY;
  }

  /**
   * Smoothly follow a target position, clamping to world bounds
   */
  update(targetX, targetY, viewportWidth, viewportHeight, zoom) {
    // Lerp toward target
    this.x += (targetX - this.x) * this.lerpSpeed;
    this.y += (targetY - this.y) * this.lerpSpeed;

    // Calculate visible area in world pixels
    const halfViewW = (viewportWidth / zoom) / 2;
    const halfViewH = (viewportHeight / zoom) / 2;

    // Clamp so camera doesn't show outside world bounds.
    // If the viewport is larger than the world on an axis, lock that axis
    // to the exact world center instead of pushing the camera off-center.
    if (halfViewW >= WORLD_WIDTH / 2) {
      this.x = WORLD_WIDTH / 2;
    } else {
      this.x = Math.max(halfViewW, Math.min(WORLD_WIDTH - halfViewW, this.x));
    }

    if (halfViewH >= WORLD_HEIGHT / 2) {
      this.y = WORLD_HEIGHT / 2;
    } else {
      this.y = Math.max(halfViewH, Math.min(WORLD_HEIGHT - halfViewH, this.y));
    }
  }

  /**
   * Get the top-left corner of the visible area in world coords
   */
  getViewOrigin(viewportWidth, viewportHeight, zoom) {
    const halfViewW = (viewportWidth / zoom) / 2;
    const halfViewH = (viewportHeight / zoom) / 2;
    return {
      x: this.x - halfViewW,
      y: this.y - halfViewH
    };
  }
}
