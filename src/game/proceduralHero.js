// Procedural Nomad Protagonist Sprite Generator (Phaser / Canvas Graphic Fallback)
// Adheres strictly to the Nomad's Province Art Direction:
// - Crimson cowl/cloak (#e84537 / #763b36)
// - Platinum pauldrons and detailing (#c0cbdc / #8b9bb4)
// - Deep navy trousers and boots (#262b44 / #3f2631)
// - Warm natural skin (#fec99c)

export function renderHeroToCanvas(direction = 'down', frame = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const C = {
    OUTLINE: '#3f2631',
    NAVY_SHADOW: '#262b44',
    CRIMSON: '#e84537',
    CRIMSON_DARK: '#763b36',
    CRIMSON_LIGHT: '#ff706d',
    PLATINUM: '#c0cbdc',
    PLATINUM_SHADOW: '#8b9bb4',
    SKIN: '#fec99c',
    SKIN_SHADOW: '#eaa56c',
    LEATHER: '#bd6c4a'
  };

  const drawPixel = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  };

  const drawBox = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };

  // Base shadow beneath feet
  drawBox(4, 14, 8, 2, 'rgba(38, 43, 68, 0.45)');

  const bob = frame % 2 === 1 ? 1 : 0;

  if (direction === 'down') {
    // Hood / Cowl (Crimson with platinum brooch)
    drawBox(5, 1 + bob, 6, 2, C.CRIMSON);
    drawBox(4, 3 + bob, 8, 4, C.CRIMSON);
    drawBox(4, 3 + bob, 1, 4, C.CRIMSON_DARK);
    drawBox(11, 3 + bob, 1, 4, C.CRIMSON_DARK);

    // Face Opening
    drawBox(6, 4 + bob, 4, 3, C.SKIN);
    drawPixel(6, 5 + bob, C.OUTLINE); // Left eye
    drawPixel(9, 5 + bob, C.OUTLINE); // Right eye

    // Platinum Brooch / Clasp
    drawBox(7, 7 + bob, 2, 1, C.PLATINUM);

    // Cloak Body
    drawBox(4, 8 + bob, 8, 4, C.CRIMSON);
    drawBox(3, 8 + bob, 1, 3, C.CRIMSON_DARK);
    drawBox(12, 8 + bob, 1, 3, C.CRIMSON_DARK);
    drawBox(5, 9 + bob, 6, 2, C.CRIMSON_LIGHT); // Center fold highlight

    // Platinum Belt Buckle & Sword Hilt
    drawPixel(7, 11 + bob, C.PLATINUM);
    drawPixel(8, 11 + bob, C.PLATINUM);
    drawPixel(3, 10 + bob, C.PLATINUM_SHADOW);

    // Deep Navy Trousers & Boots
    if (frame === 1) {
      drawBox(5, 12, 2, 3, C.NAVY_SHADOW);
      drawBox(9, 13, 2, 2, C.NAVY_SHADOW);
    } else if (frame === 2) {
      drawBox(5, 13, 2, 2, C.NAVY_SHADOW);
      drawBox(9, 12, 2, 3, C.NAVY_SHADOW);
    } else {
      drawBox(5, 12 + bob, 2, 3, C.NAVY_SHADOW);
      drawBox(9, 12 + bob, 2, 3, C.NAVY_SHADOW);
    }
    drawBox(5, 14, 2, 1, C.OUTLINE);
    drawBox(9, 14, 2, 1, C.OUTLINE);
  } else if (direction === 'up') {
    // Back of Hood
    drawBox(5, 1 + bob, 6, 3, C.CRIMSON);
    drawBox(4, 3 + bob, 8, 4, C.CRIMSON);
    drawBox(4, 3 + bob, 1, 4, C.CRIMSON_DARK);
    drawBox(11, 3 + bob, 1, 4, C.CRIMSON_DARK);

    // Platinum Back Gorget / Shoulders
    drawBox(4, 7 + bob, 2, 1, C.PLATINUM);
    drawBox(10, 7 + bob, 2, 1, C.PLATINUM);

    // Flowing Cape Back
    drawBox(4, 8 + bob, 8, 4, C.CRIMSON_DARK);
    drawBox(6, 8 + bob, 4, 4, C.CRIMSON);

    // Boots
    drawBox(5, 12 + bob, 2, 3, C.NAVY_SHADOW);
    drawBox(9, 12 + bob, 2, 3, C.NAVY_SHADOW);
  } else if (direction === 'left') {
    // Side Hood Profile
    drawBox(5, 1 + bob, 5, 2, C.CRIMSON);
    drawBox(4, 3 + bob, 6, 4, C.CRIMSON);
    drawPixel(4, 5 + bob, C.SKIN); // Nose / profile
    drawPixel(5, 5 + bob, C.OUTLINE); // Eye

    // Platinum Pauldron
    drawBox(6, 7 + bob, 2, 2, C.PLATINUM);

    // Cloak Side
    drawBox(4, 8 + bob, 6, 4, C.CRIMSON);
    drawBox(8, 8 + bob, 2, 4, C.CRIMSON_DARK);

    // Boots walking
    drawBox(5, 12 + bob, 3, 3, C.NAVY_SHADOW);
  } else if (direction === 'right') {
    // Side Hood Profile (Right)
    drawBox(6, 1 + bob, 5, 2, C.CRIMSON);
    drawBox(6, 3 + bob, 6, 4, C.CRIMSON);
    drawPixel(11, 5 + bob, C.SKIN);
    drawPixel(10, 5 + bob, C.OUTLINE);

    // Platinum Pauldron
    drawBox(8, 7 + bob, 2, 2, C.PLATINUM);

    // Cloak Side
    drawBox(6, 8 + bob, 6, 4, C.CRIMSON);
    drawBox(6, 8 + bob, 2, 4, C.CRIMSON_DARK);

    // Boots walking
    drawBox(8, 12 + bob, 3, 3, C.NAVY_SHADOW);
  }

  return canvas;
}
