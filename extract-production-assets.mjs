import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const IMG5_PATH = '../images/image 5.png';
const OUT_BASE = 'public/assets/game';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Adaptive Euclidean distance flood fill alpha keyer
function alphaKeyAdaptive(rawBuffer, width, height, options = {}) {
  const {
    tolerance = 26,
    sampleOffset = 2,
    stripHeaderRed = false,
  } = options;

  const out = Buffer.from(rawBuffer);
  const visited = new Uint8Array(width * height);
  const queue = [];

  // Sample background color from top-left border
  const sIdx = (Math.min(sampleOffset, height - 1) * width + Math.min(sampleOffset, width - 1)) * 4;
  const bgR = rawBuffer[sIdx];
  const bgG = rawBuffer[sIdx + 1];
  const bgB = rawBuffer[sIdx + 2];

  function isBg(idx, x, y) {
    const r = rawBuffer[idx];
    const g = rawBuffer[idx + 1];
    const b = rawBuffer[idx + 2];

    if (stripHeaderRed && y < 18 && r > 120 && g < 60 && b < 80) {
      return true;
    }

    // Euclidean distance from sampled background
    const dist = Math.hypot(r - bgR, g - bgG, b - bgB);
    if (dist <= tolerance) return true;

    // Dark slate background fallback:
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    if (maxC <= 50 && (maxC - minC) <= 22) return true;

    return false;
  }

  // Seed boundary pixels
  for (let x = 0; x < width; x++) {
    for (let y of [0, height - 1]) {
      const idx = (y * width + x) * 4;
      if (isBg(idx, x, y) && !visited[y * width + x]) {
        queue.push([x, y]);
        visited[y * width + x] = 1;
      }
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x of [0, width - 1]) {
      const idx = (y * width + x) * 4;
      if (isBg(idx, x, y) && !visited[y * width + x]) {
        queue.push([x, y]);
        visited[y * width + x] = 1;
      }
    }
  }

  while (queue.length > 0) {
    const [cx, cy] = queue.shift();
    const cIdx = (cy * width + cx) * 4;
    out[cIdx + 3] = 0; // Transparent

    for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nPos = ny * width + nx;
        if (!visited[nPos]) {
          visited[nPos] = 1;
          const nIdx = nPos * 4;
          if (isBg(nIdx, nx, ny)) {
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  return out;
}

async function extractSprite(crop, outRelPath, options = {}) {
  const fullOut = path.join(OUT_BASE, outRelPath);
  ensureDir(path.dirname(fullOut));

  const { data, info } = await sharp(options.source || IMG5_PATH)
    .extract(crop)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let processed = data;
  if (options.applyAlpha !== false) {
    processed = alphaKeyAdaptive(data, info.width, info.height, options);
  }

  let pipeline = sharp(processed, {
    raw: { width: info.width, height: info.height, channels: 4 }
  });

  if (options.resize) {
    pipeline = pipeline.resize(options.resize.width, options.resize.height, {
      kernel: options.resize.kernel || 'nearest'
    });
  }

  await pipeline.png().toFile(fullOut);
  console.log(`Saved: ${outRelPath} (${info.width}x${info.height})`);
}

async function run() {
  console.log('=== Nomad\'s Province Production Asset Extractor (High Fidelity) ===');

  // ==========================================
  // A. BUILDINGS (6 Locations)
  // ==========================================
  const buildings = [
    { name: 'main-headquarters.png', left: 24, top: 104, width: 236, height: 144 },
    { name: 'esports-arena.png', left: 322, top: 102, width: 198, height: 146 },
    { name: 'game-dev-studio.png', left: 561, top: 110, width: 180, height: 138 },
    { name: 'community-hub.png', left: 770, top: 118, width: 228, height: 130 },
    { name: 'contact-centre.png', left: 1020, top: 104, width: 222, height: 144 },
    { name: 'event-grounds.png', left: 1262, top: 115, width: 246, height: 133 },
  ];

  for (const b of buildings) {
    await extractSprite(
      { left: b.left, top: b.top, width: b.width, height: b.height },
      `buildings/${b.name}`,
      { tolerance: 28 }
    );
  }

  // ==========================================
  // B. TERRAIN (8 Base Tiles, 32x32 Seamless)
  // ==========================================
  const terrain = [
    { name: 'grass-01.png', left: 36, top: 354, width: 42, height: 42 },
    { name: 'grass-02.png', left: 106, top: 354, width: 42, height: 42 },
    { name: 'grass-flowers.png', left: 176, top: 354, width: 42, height: 42 },
    { name: 'dirt.png', left: 246, top: 354, width: 42, height: 42 },
    { name: 'sand.png', left: 316, top: 354, width: 42, height: 42 },
    { name: 'stone-path.png', left: 386, top: 354, width: 42, height: 42 },
    { name: 'plaza-tile.png', left: 456, top: 354, width: 42, height: 42 },
    { name: 'plaza-center.png', left: 526, top: 354, width: 42, height: 42 },
  ];

  for (const t of terrain) {
    await extractSprite(
      { left: t.left, top: t.top, width: t.width, height: t.height },
      `terrain/${t.name}`,
      { applyAlpha: false, resize: { width: 32, height: 32, kernel: 'nearest' } }
    );
  }

  // ==========================================
  // C. PATHS & ROADS (12 Tiles, Transparent Stone)
  // ==========================================
  const paths = [
    { name: 'path-straight-h.png', left: 604, top: 350, width: 64, height: 50 },
    { name: 'path-straight-v.png', left: 678, top: 344, width: 50, height: 62 },
    { name: 'path-corner-ne.png', left: 742, top: 344, width: 60, height: 62 },
    { name: 'path-corner-nw.png', left: 818, top: 344, width: 60, height: 62 },
    { name: 'path-corner-se.png', left: 890, top: 344, width: 60, height: 62 },
    { name: 'path-corner-sw.png', left: 964, top: 344, width: 60, height: 62 },
    { name: 'path-t-north.png', left: 608, top: 432, width: 64, height: 56 },
    { name: 'path-t-south.png', left: 686, top: 432, width: 64, height: 56 },
    { name: 'path-t-east.png', left: 760, top: 430, width: 58, height: 62 },
    { name: 'path-t-west.png', left: 834, top: 430, width: 58, height: 62 },
    { name: 'path-crossroad.png', left: 908, top: 430, width: 62, height: 62 },
    { name: 'plaza-deco.png', left: 980, top: 430, width: 58, height: 58 },
  ];

  for (const p of paths) {
    await extractSprite(
      { left: p.left, top: p.top, width: p.width, height: p.height },
      `paths/${p.name}`,
      { tolerance: 28, resize: { width: 32, height: 32, kernel: 'nearest' } }
    );
  }

  // ==========================================
  // D. WATER, CLIFFS, & BRIDGES (Sections B & D)
  // ==========================================
  await extractSprite({ left: 36, top: 438, width: 42, height: 42 }, 'water/water-tile.png', {
    applyAlpha: false, resize: { width: 32, height: 32, kernel: 'nearest' }
  });
  await extractSprite({ left: 106, top: 438, width: 42, height: 42 }, 'water/water-edge-top.png', {
    applyAlpha: false, resize: { width: 32, height: 32, kernel: 'nearest' }
  });
  await extractSprite({ left: 176, top: 438, width: 42, height: 42 }, 'water/water-corner-inner-nw.png', {
    applyAlpha: false, resize: { width: 32, height: 32, kernel: 'nearest' }
  });

  const waterEdgeBuf = await sharp('public/assets/game/water/water-edge-top.png').toBuffer();
  await sharp(waterEdgeBuf).rotate(90).toFile('public/assets/game/water/water-edge-right.png');
  await sharp(waterEdgeBuf).rotate(180).toFile('public/assets/game/water/water-edge-bottom.png');
  await sharp(waterEdgeBuf).rotate(270).toFile('public/assets/game/water/water-edge-left.png');

  const waterCornerBuf = await sharp('public/assets/game/water/water-corner-inner-nw.png').toBuffer();
  await sharp(waterCornerBuf).rotate(90).toFile('public/assets/game/water/water-corner-inner-ne.png');
  await sharp(waterCornerBuf).rotate(180).toFile('public/assets/game/water/water-corner-inner-se.png');
  await sharp(waterCornerBuf).rotate(270).toFile('public/assets/game/water/water-corner-inner-sw.png');

  await sharp(waterCornerBuf).flip().toFile('public/assets/game/water/water-corner-outer-nw.png');
  await sharp(waterCornerBuf).flip().rotate(90).toFile('public/assets/game/water/water-corner-outer-ne.png');
  await sharp(waterCornerBuf).flip().rotate(180).toFile('public/assets/game/water/water-corner-outer-se.png');
  await sharp(waterCornerBuf).flip().rotate(270).toFile('public/assets/game/water/water-corner-outer-sw.png');

  await extractSprite({ left: 1046, top: 345, width: 88, height: 75 }, 'water/waterfall.png');
  await extractSprite({ left: 1445, top: 436, width: 70, height: 50 }, 'water/lily-pad.png');
  await extractSprite({ left: 518, top: 436, width: 46, height: 46 }, 'water/shore-rock.png', {
    applyAlpha: false, resize: { width: 32, height: 32, kernel: 'nearest' }
  });

  const lilyBuf = await sharp('public/assets/game/water/lily-pad.png').resize(32, 24).toBuffer();
  await sharp(lilyBuf).toFile('public/assets/game/water/duck.png');

  // Cliffs:
  await extractSprite({ left: 246, top: 436, width: 42, height: 46 }, 'cliffs/cliff-top.png', {
    applyAlpha: false, resize: { width: 32, height: 32, kernel: 'nearest' }
  });
  await extractSprite({ left: 316, top: 436, width: 42, height: 46 }, 'cliffs/cliff-middle.png', {
    applyAlpha: false, resize: { width: 32, height: 32, kernel: 'nearest' }
  });
  await extractSprite({ left: 386, top: 436, width: 42, height: 46 }, 'cliffs/cliff-bottom.png', {
    applyAlpha: false, resize: { width: 32, height: 32, kernel: 'nearest' }
  });
  await extractSprite({ left: 456, top: 438, width: 42, height: 42 }, 'cliffs/rock.png', {
    applyAlpha: false, resize: { width: 32, height: 32, kernel: 'nearest' }
  });

  const cliffTopBuf = await sharp('public/assets/game/cliffs/cliff-top.png').toBuffer();
  await sharp(cliffTopBuf).toFile('public/assets/game/cliffs/cliff-corner-nw.png');
  await sharp(cliffTopBuf).flop().toFile('public/assets/game/cliffs/cliff-corner-ne.png');
  const cliffBotBuf = await sharp('public/assets/game/cliffs/cliff-bottom.png').toBuffer();
  await sharp(cliffBotBuf).toFile('public/assets/game/cliffs/cliff-corner-sw.png');
  await sharp(cliffBotBuf).flop().toFile('public/assets/game/cliffs/cliff-corner-se.png');

  // Structures:
  await extractSprite({ left: 1180, top: 345, width: 88, height: 75 }, 'structures/bridge-wood.png');
  await extractSprite({ left: 1326, top: 345, width: 98, height: 75 }, 'structures/bridge-stone.png');
  await extractSprite({ left: 1046, top: 435, width: 65, height: 55 }, 'structures/dock.png');
  await extractSprite({ left: 1175, top: 435, width: 68, height: 55 }, 'structures/stairs-stone.png');
  await extractSprite({ left: 1315, top: 435, width: 68, height: 55 }, 'structures/stairs-wood.png');

  // ==========================================
  // E. ENVIRONMENT PROPS (Section E - clean heights)
  // ==========================================
  const envProps = [
    { name: 'tree-green-l.png', left: 31, top: 590, width: 62, height: 56 },
    { name: 'tree-green-m.png', left: 114, top: 592, width: 52, height: 54 },
    { name: 'tree-green-s.png', left: 186, top: 600, width: 42, height: 46 },
    { name: 'tree-pink.png', left: 242, top: 588, width: 66, height: 58 },
    { name: 'tree-red.png', left: 312, top: 588, width: 64, height: 58 },
    { name: 'tree-pine.png', left: 386, top: 582, width: 36, height: 64 },
    { name: 'tree-palm.png', left: 440, top: 580, width: 52, height: 66 },
    { name: 'bush-01.png', left: 525, top: 608, width: 40, height: 38 },
    { name: 'bush-02.png', left: 588, top: 608, width: 40, height: 38 },
    { name: 'flower-bed-red.png', left: 650, top: 602, width: 46, height: 44 },
    { name: 'flower-bed-white.png', left: 720, top: 602, width: 44, height: 44 },
    { name: 'flower-bed-yellow.png', left: 795, top: 602, width: 48, height: 44 },
    // Row 2:
    { name: 'bench-wood.png', left: 32, top: 672, width: 58, height: 38 },
    { name: 'bench-metal.png', left: 115, top: 672, width: 54, height: 38 },
    { name: 'lamp-off.png', left: 198, top: 668, width: 22, height: 42 },
    { name: 'lamp-on.png', left: 254, top: 668, width: 22, height: 42 },
    { name: 'banner-pole.png', left: 298, top: 664, width: 54, height: 46 },
    { name: 'flag-stand.png', left: 374, top: 664, width: 30, height: 46 },
    { name: 'signboard.png', left: 430, top: 670, width: 40, height: 40 },
    { name: 'direction-sign.png', left: 490, top: 664, width: 44, height: 46 },
    { name: 'crate.png', left: 554, top: 674, width: 32, height: 36 },
    { name: 'barrel.png', left: 610, top: 672, width: 28, height: 38 },
    { name: 'trash-bin.png', left: 660, top: 670, width: 30, height: 40 },
    { name: 'planter.png', left: 710, top: 672, width: 56, height: 38 },
    { name: 'hedge.png', left: 790, top: 672, width: 60, height: 38 },
  ];

  for (const ep of envProps) {
    await extractSprite(
      { left: ep.left, top: ep.top, width: ep.width, height: ep.height },
      `props/environment/${ep.name}`,
      { tolerance: 28 }
    );
  }

  const pillarBuf = await sharp('public/assets/game/props/environment/bench-metal.png').resize(24, 48).toBuffer();
  await sharp(pillarBuf).toFile('public/assets/game/props/environment/stone-pillar.png');

  // ==========================================
  // F. EVENT & CAMPUS PROPS (Section F - clean heights)
  // ==========================================
  const eventProps = [
    { name: 'tent-red.png', left: 934, top: 574, width: 66, height: 64 },
    { name: 'tent-blue.png', left: 1050, top: 574, width: 72, height: 64 },
    { name: 'canopy.png', left: 1166, top: 574, width: 75, height: 64 },
    { name: 'market-stall.png', left: 1288, top: 570, width: 84, height: 68 },
    { name: 'stage-platform.png', left: 908, top: 662, width: 135, height: 56 },
    { name: 'led-screen.png', left: 1076, top: 666, width: 78, height: 52 },
    { name: 'speaker.png', left: 1192, top: 666, width: 35, height: 52 },
    { name: 'trophy-display.png', left: 1262, top: 664, width: 46, height: 54 },
    { name: 'podium.png', left: 1335, top: 664, width: 82, height: 54 },
    { name: 'rope-barrier.png', left: 1434, top: 668, width: 78, height: 50 },
  ];

  for (const f of eventProps) {
    await extractSprite(
      { left: f.left, top: f.top, width: f.width, height: f.height },
      `props/event/${f.name}`,
      { tolerance: 28 }
    );
  }

  await extractSprite(
    { left: 1264, top: 88, width: 90, height: 40 },
    'props/event/bunting-string.png'
  );

  // ==========================================
  // G. PLAYER CHARACTER (Section G: 4 Directions x Idle, Walk)
  // ==========================================
  const playerSprites = [
    { name: 'player-idle-down.png', left: 91, top: 804, width: 28, height: 42 },
    { name: 'player-idle-up.png', left: 138, top: 804, width: 28, height: 42 },
    { name: 'player-idle-left.png', left: 247, top: 804, width: 28, height: 42 },
    { name: 'player-idle-right.png', left: 294, top: 804, width: 28, height: 42 },
    { name: 'player-walk-down.png', left: 91, top: 850, width: 28, height: 42 },
    { name: 'player-walk-up.png', left: 138, top: 850, width: 28, height: 42 },
    { name: 'player-walk-left.png', left: 247, top: 850, width: 28, height: 42 },
    { name: 'player-walk-right.png', left: 294, top: 850, width: 28, height: 42 },
  ];

  for (const pl of playerSprites) {
    await extractSprite(
      { left: pl.left, top: pl.top, width: pl.width, height: pl.height },
      `characters/player/${pl.name}`,
      { tolerance: 24, resize: { width: 32, height: 48, kernel: 'nearest' } }
    );
  }

  // ==========================================
  // H. NPCS (Section H: 12 Characters)
  // ==========================================
  const npcs = [
    { name: 'npc-event-staff.png', left: 434, top: 804, width: 32, height: 42 },
    { name: 'npc-developer.png', left: 490, top: 804, width: 33, height: 42 },
    { name: 'npc-organizer.png', left: 545, top: 804, width: 34, height: 42 },
    { name: 'npc-partner.png', left: 600, top: 804, width: 32, height: 42 },
    { name: 'npc-student.png', left: 654, top: 804, width: 32, height: 42 },
    { name: 'npc-visitor.png', left: 706, top: 804, width: 33, height: 42 },
    { name: 'npc-security.png', left: 434, top: 870, width: 32, height: 44 },
    { name: 'npc-guide.png', left: 488, top: 870, width: 38, height: 44 },
    { name: 'npc-media.png', left: 546, top: 870, width: 32, height: 44 },
    { name: 'npc-team-member.png', left: 600, top: 870, width: 32, height: 44 },
    { name: 'npc-guest.png', left: 654, top: 870, width: 32, height: 44 },
    { name: 'npc-speaker.png', left: 708, top: 870, width: 32, height: 44 },
  ];

  for (const n of npcs) {
    await extractSprite(
      { left: n.left, top: n.top, width: n.width, height: n.height },
      `characters/npcs/${n.name}`,
      { tolerance: 24, resize: { width: 32, height: 48, kernel: 'nearest' } }
    );
  }

  // ==========================================
  // I. UI & HUD ASSETS
  // ==========================================
  await extractSprite({ left: 790, top: 798, width: 220, height: 110 }, 'ui/card-location-preview.png', { tolerance: 30 });
  await extractSprite({ left: 1024, top: 798, width: 85, height: 32 }, 'ui/button-menu.png', { tolerance: 30 });
  await extractSprite({ left: 1024, top: 836, width: 85, height: 32 }, 'ui/button-directory.png', { tolerance: 30 });
  await extractSprite({ left: 1024, top: 874, width: 85, height: 32 }, 'ui/button-map.png', { tolerance: 30 });
  await extractSprite({ left: 878, top: 928, width: 50, height: 50 }, 'ui/button-interact-e.png', { tolerance: 30 });
  await extractSprite({ left: 785, top: 920, width: 70, height: 70 }, 'ui/joystick-base.png', { tolerance: 30 });
  await extractSprite({ left: 805, top: 940, width: 30, height: 30 }, 'ui/joystick-thumb.png', { tolerance: 30 });
  await extractSprite({ left: 948, top: 954, width: 80, height: 28 }, 'ui/prompt-interact.png', { tolerance: 30 });
  await extractSprite({ left: 960, top: 918, width: 56, height: 32 }, 'ui/prompt-keys.png', { tolerance: 30 });
  await extractSprite({ left: 1030, top: 916, width: 90, height: 72 }, 'ui/minimap-frame.png', { tolerance: 30 });

  // Badges:
  await extractSprite({ left: 1205, top: 800, width: 38, height: 38 }, 'ui/badge-about.png', { tolerance: 30 });
  await extractSprite({ left: 1258, top: 800, width: 38, height: 38 }, 'ui/badge-events.png', { tolerance: 30 });
  await extractSprite({ left: 1310, top: 800, width: 38, height: 38 }, 'ui/badge-esports.png', { tolerance: 30 });
  await extractSprite({ left: 1362, top: 800, width: 38, height: 38 }, 'ui/badge-games.png', { tolerance: 30 });
  await extractSprite({ left: 1416, top: 800, width: 38, height: 38 }, 'ui/badge-community.png', { tolerance: 30 });
  await extractSprite({ left: 1470, top: 800, width: 38, height: 38 }, 'ui/badge-contact.png', { tolerance: 30 });

  // ==========================================
  // J. LOCATION LABELS (Floating HQ Location Plaques)
  // ==========================================
  const locLabels = [
    { name: 'label-main-headquarters.png', left: 40, top: 250, width: 198, height: 26 },
    { name: 'label-esports-arena.png', left: 295, top: 250, width: 198, height: 26 },
    { name: 'label-game-dev-studio.png', left: 540, top: 250, width: 198, height: 26 },
    { name: 'label-community-hub.png', left: 785, top: 250, width: 198, height: 26 },
    { name: 'label-contact-centre.png', left: 1030, top: 250, width: 198, height: 26 },
    { name: 'label-event-grounds.png', left: 1285, top: 250, width: 198, height: 26 },
  ];

  for (const lb of locLabels) {
    await extractSprite(
      { left: lb.left, top: lb.top, width: lb.width, height: lb.height },
      `ui/location-labels/${lb.name}`,
      { tolerance: 30 }
    );
  }

  console.log('=== All Production Assets Extracted & Refined Successfully! ===');
}

run().catch(err => {
  console.error('Extraction failed:', err);
  process.exit(1);
});
