// Time-based, destination-aware movement with no teleport or early arrival.
import { buildTravelPath } from '../data/travelPaths.js';

export class AutoTravelSystem {
  constructor() {
    this.active = false;
    this.destinationId = null;
    this.waypoints = [];
    this.index = 0;
    this.speed = 150; // world pixels per second
    this.onArrive = null;
    this.lastFailedDestination = null;
    this.currentDirection = 'down';
  }

  startTravel(x, y, id, onArrive) {
    this.cancel();
    const path = buildTravelPath(x, y, id);
    if (!path.length) {
      // Empty path means already nearby or unreachable. Never teleport.
      this.lastFailedDestination = id;
      return false;
    }
    this.lastFailedDestination = null;
    this.destinationId = id;
    this.waypoints = path;
    this.index = 0;
    this.onArrive = onArrive;
    this.active = true;
    return true;
  }

  startPath(path, onArrive = null) {
    this.cancel();
    if (!path || path.length === 0) return false;
    this.active = true;
    this.destinationId = null;
    this.waypoints = path;
    this.index = 0;
    this.onArrive = onArrive;
    return true;
  }

  cancel() {
    this.active = false;
    this.destinationId = null;
    this.waypoints = [];
    this.index = 0;
    this.onArrive = null;
  }

  isActive() { return this.active; }
  getDestinationId() { return this.destinationId; }

  update(x, y, dt = 1 / 60) {
    if (!this.active) return null;
    const step = this.speed * Math.max(0, Math.min(dt, 0.05));
    while (this.index < this.waypoints.length) {
      const target = this.waypoints[this.index];
      const dx = target.x - x;
      const dy = target.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist <= 0.7) {
        this.index++;
        continue;
      }
      const length = Math.min(step, dist);

      // Direction hysteresis: prevent rapid 1-frame flickering on diagonal movement
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      let dir = this.currentDirection || 'down';

      if (absDx > absDy * 1.2) {
        dir = dx > 0 ? 'right' : 'left';
      } else if (absDy > absDx * 1.2) {
        dir = dy > 0 ? 'down' : 'up';
      } else if (!this.currentDirection) {
        dir = absDx > absDy ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      }
      this.currentDirection = dir;

      return {
        dx: dx / dist * length,
        dy: dy / dist * length,
        arrived: false,
        direction: dir
      };
    }
    const callback = this.onArrive;
    const id = this.destinationId;
    this.cancel();
    if (callback) callback(id);
    return { dx: 0, dy: 0, arrived: true, direction: this.currentDirection || 'down' };
  }
}
