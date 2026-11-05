import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function cropGrid(imagePath, prefix, cols, rows) {
  const outDir = path.join('public', 'debug-crops', prefix);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const meta = await sharp(imagePath).metadata();
  const cw = Math.floor(meta.width / cols);
  const ch = Math.floor(meta.height / rows);

  console.log(`Cropping ${imagePath} into ${cols}x${rows} grid (${cw}x${ch} each)...`);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const left = c * cw;
      const top = r * ch;
      const filename = `${prefix}_r${r}_c${c}.png`;
      await sharp(imagePath)
        .extract({ left, top, width: cw, height: ch })
        .toFile(path.join(outDir, filename));
    }
  }
}

async function run() {
  await cropGrid('../images/image 5.png', 'img5', 4, 4);
  await cropGrid('../images/image1.png', 'img1', 4, 3);
  console.log('All crops generated.');
}

run();
