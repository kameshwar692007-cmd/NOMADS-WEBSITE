// Nomad's Province — Auto Travel System
// Waypoint-based movement (no teleporting)

import { buildTravelPath } from '../data/travelPaths.js';

export class AutoTravelSystem {
  constructor() {
    this.active = false;
    this.destinationId = null;
    this.waypoints = [];
    this.currentWaypointIndex = 0;
    this.speed = 2.5; // pixels per frame
    this.onArrive = null; // callback when arriving at destination
  }

  /**
   * Start auto travel from current position to a destination location
   */
  startTravel(fromX, fromY, destinationId, onArrive) {
    const path = buildTravelPath(fromX, fromY, destinationId);
    if (path.length === 0) {
      // Already at destination
      if (onArrive) onArrive(destinationId);
      return false;
    }

    this.active = true;
    this.destinationId = destinationId;
    this.waypoints = path;
    this.currentWaypointIndex = 0;
    this.onArrive = onArrive;
    return true;
  }

  /**
   * Cancel auto travel (e.g. when player provides manual input)
   */
  cancel() {
    this.active = false;
    this.destinationId = null;
    this.waypoints = [];
    this.currentWaypointIndex = 0;
    this.onArrive = null;
  }

  /**
   * Update each frame. Returns { dx, dy, arrived, direction } or null if inactive
   */
  update(playerX, playerY) {
    if (!this.active || this.waypoints.length === 0) return null;

    const target = this.waypoints[this.currentWaypointIndex];
    const dx = target.x - playerX;
    const dy = target.y - playerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Reached current waypoint?
    if (dist < this.speed * 2) {
      this.currentWaypointIndex++;
      
      // Reached final waypoint?
      if (this.currentWaypointIndex >= this.waypoints.length) {
        const destId = this.destinationId;
        const callback = this.onArrive;
        this.cancel();
        if (callback) callback(destId);
        return { dx: 0, dy: 0, arrived: true, direction: 'down' };
      }
      
      // Continue to next waypoint
      return this.update(playerX, playerY);
    }

    // Move toward current waypoint
    const moveX = (dx / dist) * this.speed;
    const moveY = (dy / dist) * this.speed;

    // Determine facing direction
    let direction;
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? 'right' : 'left';
    } else {
      direction = dy > 0 ? 'down' : 'up';
    }

    return { dx: moveX, dy: moveY, arrived: false, direction };
  }

  isActive() {
    return this.active;
  }

  getDestinationId() {
    return this.destinationId;
  }
}
