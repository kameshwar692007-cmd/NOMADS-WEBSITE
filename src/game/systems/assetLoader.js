// Nomad's Province — Asset Loader
// Preloads all game images with nearest-neighbor rendering

import { LOCATIONS } from '../data/locationData.js';
import { PROPS, NPCS, STRUCTURES, CLIFFS, getEnvironmentPropPath } from '../data/mapData.js';

const TERRAIN_TILES = [
  'grass-01', 'grass-02', 'grass-flowers', 'dirt', 'sand',
  'stone-path', 'plaza-tile', 'plaza-center'
];

const PATH_TILES = [
  'path-straight-h', 'path-straight-v', 'path-crossroad',
  'path-corner-ne', 'path-corner-nw', 'path-corner-se', 'path-corner-sw',
  'path-t-north', 'path-t-south', 'path-t-east', 'path-t-west', 'plaza-deco'
];

const CLIFF_TILES = [
  'cliff-top', 'cliff-middle', 'cliff-bottom', 'rock',
  'cliff-corner-ne', 'cliff-corner-nw', 'cliff-corner-se', 'cliff-corner-sw'
];

const STRUCTURE_TILES = [
  'bridge-wood', 'bridge-stone', 'dock', 'stairs-stone', 'stairs-wood'
];

const PLAYER_SPRITES = [
  'player-idle-down', 'player-idle-up', 'player-idle-left', 'player-idle-right',
  'player-walk-down', 'player-walk-up', 'player-walk-left', 'player-walk-right'
];

const WATER_TILES = [
  'water-tile', 'water-edge-top', 'water-edge-bottom', 'water-edge-left', 'water-edge-right',
  'lily-pad', 'duck', 'shore-rock'
];

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn(`Failed to load: ${src}`);
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      resolve(canvas);
    };
    img.src = src;
  });
}

export async function loadAllAssets() {
  const assets = {};
  assets['world/campus'] = await loadImage('/assets/game/campus-world.png');

  // Terrain tiles
  const terrainPromises = TERRAIN_TILES.map(async (name) => {
    assets[`terrain/${name}`] = await loadImage(`/assets/game/terrain/${name}.png`);
  });

  // Path tiles
  const pathPromises = PATH_TILES.map(async (name) => {
    assets[`path/${name}`] = await loadImage(`/assets/game/paths/${name}.png`);
  });

  // Cliff tiles
  const cliffPromises = CLIFF_TILES.map(async (name) => {
    assets[`cliff/${name}`] = await loadImage(`/assets/game/cliffs/${name}.png`);
  });

  // Structure tiles
  const structPromises = STRUCTURE_TILES.map(async (name) => {
    assets[`structure/${name}`] = await loadImage(`/assets/game/structures/${name}.png`);
  });

  // Building sprites
  const buildingPromises = LOCATIONS.map(async (loc) => {
    assets[`building/${loc.id}`] = await loadImage(loc.buildingAsset);
  });

  // Location labels
  const labelPromises = LOCATIONS.map(async (loc) => {
    assets[`label/${loc.id}`] = await loadImage(loc.labelAsset);
  });

  // Badge icons
  const badgePromises = LOCATIONS.map(async (loc) => {
    assets[`badge/${loc.id}`] = await loadImage(loc.badgeAsset);
  });

  // Player sprites
  const playerPromises = PLAYER_SPRITES.map(async (name) => {
    assets[`player/${name}`] = await loadImage(`/assets/game/characters/player/${name}.png`);
  });

  // NPC sprites
  const npcNames = [...new Set(NPCS.map(n => n.asset))];
  const npcPromises = npcNames.map(async (name) => {
    assets[`npc/${name}`] = await loadImage(`/assets/game/characters/npcs/${name}.png`);
  });

  // Environment & event props
  const propNames = [...new Set(PROPS.map(p => p.asset))];
  const propPromises = propNames.map(async (name) => {
    assets[`prop/${name}`] = await loadImage(getEnvironmentPropPath(name));
  });

  // Water tiles
  const waterPromises = WATER_TILES.map(async (name) => {
    assets[`water/${name}`] = await loadImage(`/assets/game/water/${name}.png`);
  });

  await Promise.all([
    ...terrainPromises,
    ...pathPromises,
    ...cliffPromises,
    ...structPromises,
    ...buildingPromises,
    ...labelPromises,
    ...badgePromises,
    ...playerPromises,
    ...npcPromises,
    ...propPromises,
    ...waterPromises
  ]);

  return assets;
}
