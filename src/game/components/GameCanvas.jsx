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

const PLAYER_SPEED = 2.6;
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
    playerRef.current.y = spawn.y - 24;
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
      autoTravelRef.current.startTravel(
        player.x + 16, player.y + 24,
        directoryTravelTarget,
        (destId) => {
          const loc = LOCATIONS.find(l => l.id === destId);
          if (loc) {
            onLocationInteract(loc);
          }
        }
      );
      if (onDirectoryTravelConsumed) onDirectoryTravelConsumed();
    }
  }, [directoryTravelTarget, loaded, onLocationInteract, onDirectoryTravelConsumed]);

  // Handle external mobile interact button trigger
  useEffect(() => {
    if (interactRequest && loaded) {
      const player = playerRef.current;
      const nearby = findNearbyLocation(player.x + 16, player.y + 24);
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
        const nearby = findNearbyLocation(player.x + 16, player.y + 24);
        if (nearby) {
          onLocationInteract(nearby);
        }
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onLocationInteract]);

  // Requirement 7: Click/tap to travel (building or its label)
  const handleCanvasClick = useCallback((e) => {
    if (!assetsRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const zoom = getRenderZoom(rect, isMobile);

    const screenX = (e.clientX - rect.left) * dpr;
    const screenY = (e.clientY - rect.top) * dpr;
    
    const world = screenToWorld(screenX, screenY, cameraRef.current, zoom * dpr, canvas.width, canvas.height);
    const clicked = findClickedBuilding(world.x, world.y);
    
    if (clicked) {
      const player = playerRef.current;
      autoTravelRef.current.startTravel(
        player.x + 16, player.y + 24,
        clicked.id,
        (destId) => {
          const loc = LOCATIONS.find(l => l.id === destId);
          if (loc) onLocationInteract(loc);
        }
      );
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

    const gameLoop = () => {
      frameRef.current++;
      const frame = frameRef.current;
      const dpr = window.devicePixelRatio || 1;
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

      // Auto-travel system
      if (autoTravelRef.current.isActive()) {
        const result = autoTravelRef.current.update(player.x + 16, player.y + 24);
        if (result && !result.arrived) {
          dx = result.dx;
          dy = result.dy;
          player.direction = result.direction;
          moving = true;
        }
      } else {
        // Manual keyboard input
        const keys = keysRef.current;
        if (keys.has('w') || keys.has('arrowup')) { dy -= PLAYER_SPEED; }
        if (keys.has('s') || keys.has('arrowdown')) { dy += PLAYER_SPEED; }
        if (keys.has('a') || keys.has('arrowleft')) { dx -= PLAYER_SPEED; }
        if (keys.has('d') || keys.has('arrowright')) { dx += PLAYER_SPEED; }

        // Mobile joystick input
        if (joystickInput && (joystickInput.dx !== 0 || joystickInput.dy !== 0)) {
          dx += joystickInput.dx * PLAYER_SPEED;
          dy += joystickInput.dy * PLAYER_SPEED;
          if (autoTravelRef.current.isActive()) {
            autoTravelRef.current.cancel();
          }
        }

        if (dx !== 0 || dy !== 0) {
          moving = true;
          // Normalize diagonal movement speed
          if (dx !== 0 && dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx = (dx / len) * PLAYER_SPEED;
            dy = (dy / len) * PLAYER_SPEED;
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
        player.x = newPos.x;
        player.y = newPos.y;
      }
      player.moving = moving;

      // Update camera follow
      cameraRef.current.update(
        player.x + 16, player.y + 24,
        canvas.width, canvas.height,
        zoom * dpr
      );

      // Periodically check nearby building proximity (every 6 frames for performance)
      if (frame - lastProximityCheck > 6) {
        lastProximityCheck = frame;
        const nearby = findNearbyLocation(player.x + 16, player.y + 24);
        setNearbyLocation(prev => {
          if (prev?.id !== nearby?.id) return nearby;
          return prev;
        });
      }

      // Render world
      ctx.imageSmoothingEnabled = false;
      renderWorld(
        ctx, assetsRef.current, cameraRef.current,
        player, zoom * dpr, canvas.width, canvas.height, frame
      );

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [loaded, isMobile, joystickInput]);

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
