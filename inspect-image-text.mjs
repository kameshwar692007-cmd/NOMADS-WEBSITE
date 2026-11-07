import sharp from 'sharp';
import fs from 'fs';

async function check() {
  const dir = 'public/assets/events-and-logos';
  const files = fs.readdirSync(dir);
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const full = `${dir}/${f}`;
    const meta = await sharp(full).metadata();
    console.log(`[#${i+1}] ${f}: ${meta.width}x${meta.height}`);
  }
}
check();
