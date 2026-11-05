import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function buildHero() {
  const imgPath = 'C:/Users/asus/.gemini/antigravity/brain/7f041f0f-7a9e-4147-b408-505a9cc40807/.user_uploaded/media_1793893088091_0b2d1a20.png';
  const outPath = 'public/assets/game/characters/player/uploaded-hero.png';
  const previewPath = 'public/debug-anime-boy/uploaded-hero-preview.png';

  const img = sharp(imgPath);

  // Engine direction to source row mapping:
  // 0: DOWN  <- Source Row 0 (Down/Front)
  // 1: UP    <- Source Row 3 (Up/Back)
  // 2: LEFT  <- Source Row 1 (Left)
  // 3: RIGHT <- Source Row 2 (Right)
  const sourceRowForEngine = [0, 3, 1, 2];

  // Each cell is 256x256.
  // The character is centered at x=130, height from 16 to 232 (144x216).
  // Aspect ratio 144:216 is exactly 2:3, matching 28:42 in the game renderer.
  const CROP_X = 58;
  const CROP_Y = 16;
  const CROP_W = 144;
  const CROP_H = 216;

  // Frame resolution: 48x72 (total 192x288)
  const FW = 48;
  const FH = 72;
  const SHEET_W = FW * 4;
  const SHEET_H = FH * 4;

  const composites = [];

  for (let engineRow = 0; engineRow < 4; engineRow++) {
    const srcRow = sourceRowForEngine[engineRow];
    for (let col = 0; col < 4; col++) {
      const left = col * 256 + CROP_X;
      const top = srcRow * 256 + CROP_Y;

      const cellBuf = await img.clone()
        .extract({ left, top, width: CROP_W, height: CROP_H })
        .resize(FW, FH, {
          kernel: 'lanczos3',
          fit: 'fill'
        })
        .png()
        .toBuffer();

      composites.push({
        input: cellBuf,
        left: col * FW,
        top: engineRow * FH
      });
    }
  }

  const finalSheet = sharp({
    create: {
      width: SHEET_W,
      height: SHEET_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  }).composite(composites);

  await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
  await finalSheet.png().toFile(outPath);
  console.log(`Saved new hero sprite sheet to ${outPath} (${SHEET_W}x${SHEET_H})`);

  // Also save a preview
  await fs.promises.mkdir(path.dirname(previewPath), { recursive: true });
  await sharp(outPath)
    .resize(SHEET_W * 2, SHEET_H * 2, { kernel: 'nearest' })
    .png()
    .toFile(previewPath);
  console.log(`Saved 2x preview to ${previewPath}`);
}

buildHero().catch(console.error);
