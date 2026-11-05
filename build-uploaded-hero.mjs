import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function buildUploadedHero() {
  const imgPath = 'C:/Users/asus/.gemini/antigravity/brain/7f041f0f-7a9e-4147-b408-505a9cc40807/.user_uploaded/media_1793890025771_0c81e0e6.png';
  const outHeroPath = 'public/assets/game/characters/player/uploaded-hero.png';
  const previewPath = 'public/debug-anime-boy/uploaded-hero-preview.png';

  const { data, info } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Exact row spans:
  const rows = [
    { name: 'down', minY: 47, maxY: 118 },   // FRONT (Row 0)
    { name: 'up', minY: 153, maxY: 223 },     // BACK (Row 1)
    { name: 'left', minY: 260, maxY: 335 },   // LEFT (Row 2)
    { name: 'right', minY: 375, maxY: 445 }   // RIGHT (Row 3)
  ];

  // Exact col spans:
  const cols = [
    { name: 'standing', minX: 94, maxX: 142 }, // Col 0
    { name: 'step1', minX: 174, maxX: 220 },    // Col 1
    { name: 'step2', minX: 253, maxX: 302 },    // Col 2
    { name: 'step3', minX: 331, maxX: 379 }     // Col 3
  ];

  function isBg(r, g, b) {
    if (r > 200 && g > 200 && b > 200 && Math.abs(r - g) <= 8 && Math.abs(g - b) <= 8) return true;
    return false;
  }

  // Final sheet is 64x96 (4 cols of 16px, 4 rows of 24px)
  const SHEET_W = 64;
  const SHEET_H = 96;
  const CELL_W = 16;
  const CELL_H = 24;

  const sheetBuf = Buffer.alloc(SHEET_W * SHEET_H * 4); // All zeros = transparent

  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < cols.length; c++) {
      const rw = rows[r];
      const cl = cols[c];
      const cropW = cl.maxX - cl.minX + 1;
      const cropH = rw.maxY - rw.minY + 1;

      // Extract raw cell
      const rawCell = Buffer.alloc(cropW * cropH * 4);

      // Flood fill from borders
      const bgMap = new Uint8Array(cropW * cropH);
      for (let y = 0; y < cropH; y++) {
        for (let x = 0; x < cropW; x++) {
          const sIdx = ((rw.minY + y) * width + (cl.minX + x)) * channels;
          const pr = data[sIdx], pg = data[sIdx+1], pb = data[sIdx+2];
          if (isBg(pr, pg, pb)) {
            bgMap[y * cropW + x] = 1;
          }
        }
      }

      const queue = [];
      const visited = new Uint8Array(cropW * cropH);
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
        const neighbors = [[qx + 1, qy], [qx - 1, qy], [qx, qy + 1], [qx, qy - 1]];
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

      // Populate rawCell with alpha
      for (let y = 0; y < cropH; y++) {
        for (let x = 0; x < cropW; x++) {
          const sIdx = ((rw.minY + y) * width + (cl.minX + x)) * channels;
          const dIdx = (y * cropW + x) * 4;
          const idx = y * cropW + x;
          const isBorderBg = visited[idx] === 1;

          rawCell[dIdx] = data[sIdx];
          rawCell[dIdx+1] = data[sIdx+1];
          rawCell[dIdx+2] = data[sIdx+2];
          rawCell[dIdx+3] = isBorderBg ? 0 : 255;
        }
      }

      // Resize sprite to fit in 16x24
      // We want the character to fill height ~23px (leaving 1px headroom)
      const targetCharH = 23;
      const targetCharW = 15;

      const resized = await sharp(rawCell, { raw: { width: cropW, height: cropH, channels: 4 } })
        .resize({
          width: targetCharW,
          height: targetCharH,
          fit: 'inside',
          kernel: 'nearest'
        })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const rwW = resized.info.width;
      const rwH = resized.info.height;
      const xOffset = Math.floor((CELL_W - rwW) / 2);
      const yOffset = CELL_H - rwH; // anchor at feet bottom

      // Copy resized sprite into sheetBuf at (c * CELL_W + xOffset, r * CELL_H + yOffset)
      const baseSheetX = c * CELL_W + xOffset;
      const baseSheetY = r * CELL_H + yOffset;

      for (let py = 0; py < rwH; py++) {
        for (let px = 0; px < rwW; px++) {
          const srcIdx = (py * rwW + px) * 4;
          const destX = baseSheetX + px;
          const destY = baseSheetY + py;
          if (destX >= 0 && destX < SHEET_W && destY >= 0 && destY < SHEET_H) {
            const destIdx = (destY * SHEET_W + destX) * 4;
            sheetBuf[destIdx] = resized.data[srcIdx];
            sheetBuf[destIdx+1] = resized.data[srcIdx+1];
            sheetBuf[destIdx+2] = resized.data[srcIdx+2];
            sheetBuf[destIdx+3] = resized.data[srcIdx+3];
          }
        }
      }
    }
  }

  // Ensure directory exists
  const outDir = path.dirname(outHeroPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const previewDir = path.dirname(previewPath);
  if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir, { recursive: true });

  // Save 64x96 sheet
  await sharp(sheetBuf, { raw: { width: SHEET_W, height: SHEET_H, channels: 4 } })
    .png()
    .toFile(outHeroPath);
  console.log('Saved hero sprite sheet to:', outHeroPath);

  // Save 4x magnified preview for easy inspection
  await sharp(sheetBuf, { raw: { width: SHEET_W, height: SHEET_H, channels: 4 } })
    .resize(SHEET_W * 4, SHEET_H * 4, { kernel: 'nearest' })
    .png()
    .toFile(previewPath);
  console.log('Saved 4x magnified preview to:', previewPath);
}

buildUploadedHero().catch(console.error);
