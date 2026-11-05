import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function buildUploadedHero() {
  const imgPath = 'C:/Users/asus/.gemini/antigravity/brain/7f041f0f-7a9e-4147-b408-505a9cc40807/.user_uploaded/media_1793890025771_0c81e0e6.png';
  const outHeroPath = 'public/assets/game/characters/player/uploaded-hero.png';
  const previewPath = 'public/debug-anime-boy/uploaded-hero-preview.png';

  const { data, info } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  function isBg(r, g, b) {
    if (r > 200 && g > 200 && b > 200 && Math.abs(r - g) <= 8 && Math.abs(g - b) <= 8) return true;
    return false;
  }

  // Extract a specific cell with clean flood-filled background
  async function extractCleanCell(minX, maxX, minY, maxY, flipH = false) {
    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    const rawCell = Buffer.alloc(cropW * cropH * 4);

    const bgMap = new Uint8Array(cropW * cropH);
    for (let y = 0; y < cropH; y++) {
      for (let x = 0; x < cropW; x++) {
        const sIdx = ((minY + y) * width + (minX + x)) * channels;
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

    for (let y = 0; y < cropH; y++) {
      for (let x = 0; x < cropW; x++) {
        const sIdx = ((minY + y) * width + (minX + x)) * channels;
        const dIdx = (y * cropW + x) * 4;
        const idx = y * cropW + x;
        const isBorderBg = visited[idx] === 1;

        rawCell[dIdx] = data[sIdx];
        rawCell[dIdx+1] = data[sIdx+1];
        rawCell[dIdx+2] = data[sIdx+2];
        rawCell[dIdx+3] = isBorderBg ? 0 : 255;
      }
    }

    let pipeline = sharp(rawCell, { raw: { width: cropW, height: cropH, channels: 4 } });
    if (flipH) {
      pipeline = pipeline.flop();
    }

    const resized = await pipeline
      .resize({
        width: 15,
        height: 23,
        fit: 'inside',
        kernel: 'nearest'
      })
      .raw()
      .toBuffer({ resolveWithObject: true });

    return resized;
  }

  // Final sheet is 64x96 (4 cols of 16px, 4 rows of 24px)
  const SHEET_W = 64;
  const SHEET_H = 96;
  const CELL_W = 16;
  const CELL_H = 24;
  const sheetBuf = Buffer.alloc(SHEET_W * SHEET_H * 4);

  function stampSprite(sprite, colIdx, rowIdx) {
    const rwW = sprite.info.width;
    const rwH = sprite.info.height;
    const xOffset = Math.floor((CELL_W - rwW) / 2);
    const yOffset = CELL_H - rwH;

    const baseSheetX = colIdx * CELL_W + xOffset;
    const baseSheetY = rowIdx * CELL_H + yOffset;

    for (let py = 0; py < rwH; py++) {
      for (let px = 0; px < rwW; px++) {
        const srcIdx = (py * rwW + px) * 4;
        const destX = baseSheetX + px;
        const destY = baseSheetY + py;
        if (destX >= 0 && destX < SHEET_W && destY >= 0 && destY < SHEET_H) {
          const destIdx = (destY * SHEET_W + destX) * 4;
          sheetBuf[destIdx] = sprite.data[srcIdx];
          sheetBuf[destIdx+1] = sprite.data[srcIdx+1];
          sheetBuf[destIdx+2] = sprite.data[srcIdx+2];
          sheetBuf[destIdx+3] = sprite.data[srcIdx+3];
        }
      }
    }
  }

  // --- ROW 0: DOWN / FRONT ---
  // All 4 frames face front:
  stampSprite(await extractCleanCell(94, 142, 47, 118), 0, 0);   // Standing
  stampSprite(await extractCleanCell(174, 220, 47, 118), 1, 0);  // Step 1
  stampSprite(await extractCleanCell(253, 302, 47, 118), 2, 0);  // Step 2
  stampSprite(await extractCleanCell(331, 379, 47, 118), 3, 0);  // Step 3

  // --- ROW 1: UP / BACK ---
  // All 4 frames face back:
  stampSprite(await extractCleanCell(94, 142, 153, 223), 0, 1);  // Standing
  stampSprite(await extractCleanCell(174, 220, 153, 223), 1, 1); // Step 1
  stampSprite(await extractCleanCell(253, 302, 153, 223), 2, 1); // Step 2
  stampSprite(await extractCleanCell(331, 379, 153, 223), 3, 1); // Step 3

  // --- ROW 2: LEFT ---
  // ALL 4 FRAMES MUST FACE LEFT:
  // Col 0: Standing left profile (from Row 2 Col 2 neutral)
  stampSprite(await extractCleanCell(253, 302, 260, 335), 0, 2);
  // Col 1: Step 1 left profile (from Row 2 Col 1)
  stampSprite(await extractCleanCell(174, 220, 260, 335), 1, 2);
  // Col 2: Step 2 left neutral passing (from Row 2 Col 2)
  stampSprite(await extractCleanCell(253, 302, 260, 335), 2, 2);
  // Col 3: Step 3 left stride (mirror of Row 3 Col 3 right stride!)
  stampSprite(await extractCleanCell(331, 379, 375, 445, true), 3, 2);

  // --- ROW 3: RIGHT ---
  // ALL 4 FRAMES MUST FACE RIGHT:
  // Col 0: Standing right profile (mirror of left standing)
  stampSprite(await extractCleanCell(253, 302, 260, 335, true), 0, 3);
  // Col 1: Step 1 right profile (mirror of left step 1)
  stampSprite(await extractCleanCell(174, 220, 260, 335, true), 1, 3);
  // Col 2: Step 2 right profile (from Row 3 Col 2)
  stampSprite(await extractCleanCell(253, 302, 375, 445), 2, 3);
  // Col 3: Step 3 right stride (from Row 3 Col 3)
  stampSprite(await extractCleanCell(331, 379, 375, 445), 3, 3);

  // Ensure directories exist
  const outDir = path.dirname(outHeroPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const previewDir = path.dirname(previewPath);
  if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir, { recursive: true });

  // Save final 64x96 sheet
  await sharp(sheetBuf, { raw: { width: SHEET_W, height: SHEET_H, channels: 4 } })
    .png()
    .toFile(outHeroPath);
  console.log('Saved corrected hero sprite sheet to:', outHeroPath);

  // Save 4x magnified preview for inspection
  await sharp(sheetBuf, { raw: { width: SHEET_W, height: SHEET_H, channels: 4 } })
    .resize(SHEET_W * 4, SHEET_H * 4, { kernel: 'nearest' })
    .png()
    .toFile(previewPath);
  console.log('Saved 4x magnified preview to:', previewPath);
}

buildUploadedHero().catch(console.error);
