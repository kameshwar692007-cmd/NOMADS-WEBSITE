import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function extract() {
  const imgPath = 'C:/Users/asus/.gemini/antigravity/brain/7f041f0f-7a9e-4147-b408-505a9cc40807/.user_uploaded/media_1793890025771_0c81e0e6.png';
  const outDir = 'public/assets/game/characters/player';
  const previewDir = 'public/debug-anime-boy';

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir, { recursive: true });

  const { data, info } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Exact detected row spans:
  const rows = [
    { name: 'down', rowIdx: 0, minY: 47, maxY: 118 },   // FRONT = down
    { name: 'up', rowIdx: 1, minY: 153, maxY: 223 },     // BACK = up
    { name: 'left', rowIdx: 2, minY: 260, maxY: 335 },   // LEFT
    { name: 'right', rowIdx: 3, minY: 375, maxY: 445 }   // RIGHT
  ];

  // Exact detected col spans:
  const cols = [
    { type: 'idle', colIdx: 0, minX: 94, maxX: 142 },
    { type: 'step1', colIdx: 1, minX: 174, maxX: 220 },
    { type: 'step2', colIdx: 2, minX: 253, maxX: 302 },
    { type: 'step3', colIdx: 3, minX: 331, maxX: 379 }
  ];

  // Canvas size for player sprites: 32 wide x 48 high, or 48x64?
  // Let's check original sprite height:
  // The original player sprites were 32x48.
  // The raw sprites here are w ≈ 45-49, h ≈ 71-76.
  // If we scale to height 48, width becomes ~30-32 (ratio: 48 / 72 ≈ 0.667).
  // Perfect 32x48 pixel art scale!

  function isBg(r, g, b) {
    if (r > 205 && g > 205 && b > 205 && Math.abs(r - g) <= 8 && Math.abs(g - b) <= 8) return true;
    return false;
  }

  for (const rw of rows) {
    for (const cl of cols) {
      const cropW = cl.maxX - cl.minX + 1;
      const cropH = rw.maxY - rw.minY + 1;

      // Create raw buffer
      const buf = Buffer.alloc(cropW * cropH * 4);

      // Flood fill from borders to remove background accurately
      // 1: Marked background, 0: unvisited
      const bgMap = new Uint8Array(cropW * cropH);

      // Check pixel background predicate
      for (let y = 0; y < cropH; y++) {
        for (let x = 0; x < cropW; x++) {
          const sIdx = ((rw.minY + y) * width + (cl.minX + x)) * channels;
          const r = data[sIdx], g = data[sIdx+1], b = data[sIdx+2];
          if (isBg(r, g, b)) {
            bgMap[y * cropW + x] = 1;
          }
        }
      }

      // Flood fill from all 4 borders to only remove connected background
      const queue = [];
      const visited = new Uint8Array(cropW * cropH);

      // Add border background pixels
      for (let x = 0; x < cropW; x++) {
        if (bgMap[x] === 1) { queue.push(x); visited[x] = 1; }
        const btm = (cropH - 1) * cropW + x;
        if (bgMap[btm] === 1) { queue.push(btm); visited[btm] = 1; }
      }
      for (let y = 0; y < cropH; y++) {
        const left = y * cropW;
        if (bgMap[left] === 1 && !visited[left]) { queue.push(left); visited[left] = 1; }
        const right = y * cropW + (cropW - 1);
        if (bgMap[right] === 1 && !visited[right]) { queue.push(right); visited[right] = 1; }
      }

      while (queue.length > 0) {
        const idx = queue.pop();
        const qx = idx % cropW;
        const qy = Math.floor(idx / cropW);

        const neighbors = [
          [qx + 1, qy], [qx - 1, qy],
          [qx, qy + 1], [qx, qy - 1]
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < cropW && ny >= 0 && ny < cropH) {
            const nIdx = ny * cropW + nx;
            if (!visited[nIdx] && bgMap[nIdx] === 1) {
              visited[nIdx] = 1;
              queue.push(nIdx);
            }
          }
        }
      }

      // Write to buffer with alpha
      for (let y = 0; y < cropH; y++) {
        for (let x = 0; x < cropW; x++) {
          const sIdx = ((rw.minY + y) * width + (cl.minX + x)) * channels;
          const dIdx = (y * cropW + x) * 4;
          const idx = y * cropW + x;
          const isBorderBg = visited[idx] === 1;

          buf[dIdx] = data[sIdx];
          buf[dIdx+1] = data[sIdx+1];
          buf[dIdx+2] = data[sIdx+2];
          buf[dIdx+3] = isBorderBg ? 0 : 255;
        }
      }

      // Save full-res crop to previewDir
      const rawName = `${rw.name}_${cl.type}.png`;
      await sharp(buf, { raw: { width: cropW, height: cropH, channels: 4 } })
        .png()
        .toFile(path.join(previewDir, rawName));

      // Resize sprite cleanly to fit within 32x48, preserving pixel-art nearest neighbor
      const resized = await sharp(buf, { raw: { width: cropW, height: cropH, channels: 4 } })
        .resize({
          width: 32,
          height: 48,
          kernel: 'nearest',
          fit: 'inside'
        })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const targetW = 32;
      const targetH = 48;
      const rW = Math.min(targetW, resized.info.width);
      const rH = Math.min(targetH, resized.info.height);
      const leftPad = Math.max(0, Math.floor((targetW - rW) / 2));
      const topPad = Math.max(0, targetH - rH);

      const finalSprite = await sharp({
        create: {
          width: targetW,
          height: targetH,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
      .composite([{
        input: resized.data,
        raw: {
          width: resized.info.width,
          height: resized.info.height,
          channels: 4
        },
        left: leftPad,
        top: topPad
      }])
      .png()
      .toBuffer();

      // Output files for player:
      // If idle (col 0): player-idle-{dir}.png
      // If step1: player-walk-{dir}-1.png AND player-walk-{dir}.png (fallback)
      // If step2: player-walk-{dir}-2.png
      // If step3: player-walk-{dir}-3.png
      if (cl.type === 'idle') {
        const outPath = path.join(outDir, `player-idle-${rw.name}.png`);
        fs.writeFileSync(outPath, finalSprite);
        console.log('Saved:', outPath);
      } else {
        const stepNum = cl.type.replace('step', '');
        const outPathStep = path.join(outDir, `player-walk-${rw.name}-${stepNum}.png`);
        fs.writeFileSync(outPathStep, finalSprite);
        console.log('Saved:', outPathStep);

        // Also save primary player-walk-{dir}.png as step 2 (good mid-stride pose)
        if (cl.type === 'step2' || cl.type === 'step1') {
          const outPathMain = path.join(outDir, `player-walk-${rw.name}.png`);
          fs.writeFileSync(outPathMain, finalSprite);
          console.log('Saved main walk:', outPathMain);
        }
      }
    }
  }

  console.log('ALL PLAYER SPRITES EXTRACTED SUCCESSFULLY!');
}

extract().catch(console.error);
