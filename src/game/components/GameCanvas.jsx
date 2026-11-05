// Nomad's Province — Main Game Canvas Component
// Orchestrates: rendering, player input, camera, auto-travel, interactions

import { useState, useEffect, useRef, useCallback } from 'react';
import { LOCATIONS, findNearbyLocation, findClickedBuilding } from '../data/locationData.js';
import { getSpawnPoint } from '../data/travelPaths.js';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../data/mapData.js';
import { AutoTravelSystem } from '../systems/autoTravel.js';
import { CameraSystem } from '../systems/camera.js';
import { resolveMovement } from '../systems/collision.js';
import { loadAllAssets } from '../systems/assetLoader.js';
import { renderWorld, screenToWorld } from '../systems/renderer.js';

const PLAYER_SPEED = 168; // pixels per second, independent of FPS
const DESKTOP_FIT_PADDING = 0.96;
const MOBILE_ZOOM = 1.35;

function getRenderZoom(rect, isMobile) {
  if (isMobile) return MOBILE_ZOOM;
  const fitX = rect.width / WORLD_WIDTH;
  const fitY = rect.height / WORLD_HEIGHT;
  return Math.max(0.72, Math.min(1.0, Math.min(fitX, fitY) * DESKTOP_FIT_PADDING));
}

export default function GameCanvas({ 
  onLocationInteract, 
  isMobile,
  joystickInput,
  directoryTravelTarget,
  onDirectoryTravelConsumed,
  interactRequest,
  onInteractRequestConsumed
}) {
  const canvasRef = useRef(null);
  const assetsRef = useRef(null);
  const cameraRef = useRef(new CameraSystem());
  const autoTravelRef = useRef(new AutoTravelSystem());
  const keysRef = useRef(new Set());
  const joystickRef = useRef(joystickInput);
  useEffect(() => { joystickRef.current = joystickInput; }, [joystickInput]);
  const frameRef = useRef(0);
  const playerRef = useRef({
    x: 0, y: 0,
    direction: 'down',
    moving: false
  });

  const [loaded, setLoaded] = useState(false);
  const [nearbyLocation, setNearbyLocation] = useState(null);

  // Initialize spawn position & load assets
  useEffect(() => {
    const spawn = getSpawnPoint();
    playerRef.current.x = spawn.x - 16;
    playerRef.current.y = spawn.y - 40;
    cameraRef.current.snapTo(spawn.x, spawn.y);

    loadAllAssets().then(assets => {
      assetsRef.current = assets;
      setLoaded(true);
    });
  }, []);

  // Handle external directory/map travel requests
  useEffect(() => {
    if (directoryTravelTarget && loaded) {
      const player = playerRef.current;
      const started = autoTravelRef.current.startTravel(
        player.x + 16, player.y + 40,
        directoryTravelTarget,
        (destId) => {
          const loc = LOCATIONS.find(l => l.id === destId);
          if (loc) {
            onLocationInteract(loc);
          }
        }
      );
      if (!started) {
        const location = LOCATIONS.find(item => item.id === directoryTravelTarget);
        if (location && Math.hypot(player.x + 16 - location.entranceX, player.y + 40 - location.entranceY) < location.interactionRadius) onLocationInteract(location);
      }
      if (onDirectoryTravelConsumed) onDirectoryTravelConsumed();
    }
  }, [directoryTravelTarget, loaded, onLocationInteract, onDirectoryTravelConsumed]);

  // Handle external mobile interact button trigger
  useEffect(() => {
    if (interactRequest && loaded) {
      const player = playerRef.current;
      const nearby = findNearbyLocation(player.x + 16, player.y + 40);
      if (nearby) {
        onLocationInteract(nearby);
      }
      if (onInteractRequestConsumed) onInteractRequestConsumed();
    }
  }, [interactRequest, loaded, onLocationInteract, onInteractRequestConsumed]);

  // Keyboard navigation & interaction
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        keysRef.current.add(key);
        // Requirement 7: Cancel auto-travel on manual input immediately
        if (autoTravelRef.current.isActive()) {
          autoTravelRef.current.cancel();
        }
      }
      // Requirement 5: Interaction with E, Enter, Space
      if (key === 'e' || key === 'enter' || key === ' ') {
        e.preventDefault();
        const player = playerRef.current;
        const nearby = findNearbyLocation(player.x + 16, player.y + 40);
        if (nearby) {
          onLocationInteract(nearby);
        }
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    const resetKeys = () => keysRef.current.clear();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', resetKeys);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', resetKeys);
    };
  }, [onLocationInteract]);

  // Requirement 7: Click/tap to travel (building or its label)
  const handleCanvasClick = useCallback((e) => {
    if (!assetsRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const zoom = getRenderZoom(rect, isMobile);

    const screenX = (e.clientX - rect.left) * dpr;
    const screenY = (e.clientY - rect.top) * dpr;
    
    const world = screenToWorld(screenX, screenY, cameraRef.current, zoom * dpr, canvas.width, canvas.height);
    const clicked = findClickedBuilding(world.x, world.y);
    
    if (clicked) {
      const player = playerRef.current;
      const started = autoTravelRef.current.startTravel(
        player.x + 16, player.y + 40,
        clicked.id,
        (destId) => {
          const loc = LOCATIONS.find(l => l.id === destId);
          if (loc) onLocationInteract(loc);
        }
      );
      if (!started && Math.hypot(player.x + 16 - clicked.entranceX, player.y + 40 - clicked.entranceY) <= clicked.interactionRadius) {
        onLocationInteract(clicked);
      }
    }
  }, [isMobile, onLocationInteract]);

  // Main game loop (60 FPS RequestAnimationFrame)
  useEffect(() => {
    if (!loaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let lastProximityCheck = 0;
    let lastTime = 0;
    let blockedFrames = 0;

    const gameLoop = (now) => {
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.035) : 1 / 60;
      lastTime = now;
      frameRef.current++;
      const frame = frameRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      const zoom = getRenderZoom(rect, isMobile);

      // Handle window resize dynamically
      const targetW = Math.floor(rect.width * dpr);
      const targetH = Math.floor(rect.height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const player = playerRef.current;
      let moving = false;
      let dx = 0, dy = 0;

      // Manual joystick input should immediately cancel an active auto-trip.
      if (autoTravelRef.current.isActive() && joystickRef.current &&
          Math.hypot(joystickRef.current.dx, joystickRef.current.dy) > 0.15) {
        autoTravelRef.current.cancel();
      }

      // Auto-travel system
      if (autoTravelRef.current.isActive()) {
        const result = autoTravelRef.current.update(player.x + 16, player.y + 40, dt);
        if (result && !result.arrived) {
          dx = result.dx;
          dy = result.dy;
          player.direction = result.direction;
          moving = true;
        }
      } else {
        // Manual keyboard input
        const keys = keysRef.current;
        if (keys.has('w') || keys.has('arrowup')) { dy -= PLAYER_SPEED * dt; }
        if (keys.has('s') || keys.has('arrowdown')) { dy += PLAYER_SPEED * dt; }
        if (keys.has('a') || keys.has('arrowleft')) { dx -= PLAYER_SPEED * dt; }
        if (keys.has('d') || keys.has('arrowright')) { dx += PLAYER_SPEED * dt; }

        // Mobile joystick input
        const joystick = joystickRef.current;
        if (joystick && (joystick.dx !== 0 || joystick.dy !== 0)) {
          dx += joystick.dx * PLAYER_SPEED * dt;
          dy += joystick.dy * PLAYER_SPEED * dt;
          if (autoTravelRef.current.isActive()) {
            autoTravelRef.current.cancel();
          }
        }

        if (dx !== 0 || dy !== 0) {
          moving = true;
          // Normalize diagonal movement speed
          if (dx !== 0 && dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx = (dx / len) * PLAYER_SPEED * dt;
            dy = (dy / len) * PLAYER_SPEED * dt;
          }
          if (Math.abs(dx) > Math.abs(dy)) {
            player.direction = dx > 0 ? 'right' : 'left';
          } else {
            player.direction = dy > 0 ? 'down' : 'up';
          }
        }
      }

      // Check collisions against buildings, water, cliffs & world boundaries
      if (moving) {
        const newPos = resolveMovement(player.x, player.y, dx, dy);
        const travelled = Math.hypot(newPos.x - player.x, newPos.y - player.y);
        // Blocked by a newly encountered object? Reroute from the ACTUAL position.
        if (autoTravelRef.current.isActive() && travelled < 0.12 && Math.hypot(dx, dy) > 0.12) {
          blockedFrames++;
          if (blockedFrames === 15) {
            const destinationId = autoTravelRef.current.getDestinationId();
            autoTravelRef.current.startTravel(player.x + 16, player.y + 40, destinationId, (id) => {
              const location = LOCATIONS.find(item => item.id === id);
              if (location) onLocationInteract(location);
            });
          }
          if (blockedFrames > 40) autoTravelRef.current.cancel();
        } else {
          blockedFrames = 0;
        }
        player.x = newPos.x;
        player.y = newPos.y;
        moving = travelled > 0.08;
      }
      player.moving = moving;

      // Update camera follow
      cameraRef.current.update(
        player.x + 16, player.y + 40,
        canvas.width, canvas.height,
        zoom * dpr
      );

      // Periodically check nearby building proximity (every 6 frames for performance)
      if (frame - lastProximityCheck > 6) {
        lastProximityCheck = frame;
        const nearby = findNearbyLocation(player.x + 16, player.y + 40);
        setNearbyLocation(prev => {
          if (prev?.id !== nearby?.id) return nearby;
          return prev;
        });
      }

      // Render world
      ctx.imageSmoothingEnabled = false;
      renderWorld(
        ctx, assetsRef.current, cameraRef.current,
        player, zoom * dpr, canvas.width, canvas.height, now
      );

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [loaded, isMobile, onLocationInteract]);

  if (!loaded) {
    return (
      <div className="game-loading">
        <div className="loading-content">
          <div className="loading-brand">NOMAD'S PROVINCE</div>
          <div className="loading-bar-track">
            <div className="loading-bar-fill"></div>
          </div>
          <div className="loading-text">Loading campus world assets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="canvas-wrapper">
      <canvas 
        ref={canvasRef} 
        className="world-canvas"
        onClick={handleCanvasClick}
      />

      {/* Floating proximity indicator when near building entrance */}
      {nearbyLocation && (
        <div 
          className="in-world-prompt"
          onClick={() => onLocationInteract(nearbyLocation)}
        >
          <span className="prompt-badge" style={{ backgroundColor: nearbyLocation.accentColor }}>E</span>
          <span className="prompt-label">Enter <strong>{nearbyLocation.displayName}</strong></span>
          <span className="prompt-sub">&rarr;</span>
        </div>
      )}
    </div>
  );
}
