import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const partners = [
  { id: 'gdai', name: 'GDAI', img: 'public/assets/events-and-logos/img_13_2026-11-05_at_10.30.15_AM__1_.jpeg' },
  { id: 'decathlon', name: 'Decathlon Kilambakkam', img: 'public/assets/events-and-logos/img_15_2026-11-05_at_10.30.15_AM__3_.jpeg' },
  { id: 'playo', name: 'Playo', img: 'public/assets/events-and-logos/img_8_2026-11-05_at_10.30.13_AM__1_.jpeg' },
  { id: 'srm-easwari', name: 'Easwari Engineering College', img: 'public/assets/events-and-logos/img_1_2026-11-05_at_10.30.08_AM.jpeg' },
  { id: 'srmist', name: 'SRMIST Ramapuram', img: 'public/assets/events-and-logos/img_4_2026-11-05_at_10.30.10_AM__1_.jpeg' },
  { id: 'huddle-global', name: 'Huddle Global', img: 'public/assets/events-and-logos/img_6_2026-11-05_at_10.30.10_AM.jpeg' },
  { id: 'vit-ap', name: 'VIT-AP University', img: 'public/assets/events-and-logos/img_9_2026-11-05_at_10.30.13_AM.jpeg' },
  { id: 'crescent', name: 'Crescent Institute', img: 'public/assets/events-and-logos/img_12_2026-11-05_at_10.30.14_AM.jpeg' },
  { id: 'chennai-anime-club', name: 'Chennai Anime Club', img: 'public/assets/events-and-logos/img_16_2026-11-05_at_10.30.15_AM.jpeg' },
  { id: 'otaku-nadu', name: 'Otaku Nadu', img: 'public/assets/events-and-logos/img_11_2026-11-05_at_10.30.14_AM__2_.jpeg' },
  { id: 'game-com', name: 'Game Com', img: 'public/assets/events-and-logos/img_5_2026-11-05_at_10.30.10_AM__2_.jpeg' },
  { id: 'drushya-dag', name: 'DAG - Drushya', img: 'public/assets/events-and-logos/img_14_2026-11-05_at_10.30.15_AM__2_.jpeg' },
  { id: 'st-lourdes', name: 'St. Lourdes Engineering College', img: 'public/assets/events-and-logos/img_10_2026-11-05_at_10.30.14_AM__1_.jpeg' },
  { id: 'easwari-incubator', name: 'Easwari Startup Peravai', img: 'public/assets/events-and-logos/img_3_2026-11-05_at_10.30.09_AM.jpeg' }
];

async function inspect() {
  console.log('Inspecting 14 partner logo source files:\n');
  for (const p of partners) {
    const fullPath = path.resolve(p.img);
    if (!fs.existsSync(fullPath)) {
      console.log('MISSING:', p.id, fullPath);
      continue;
    }
    const meta = await sharp(fullPath).metadata();
    const { data, info } = await sharp(fullPath).raw().toBuffer({ resolveWithObject: true });
    const getPixel = (x, y) => {
      const idx = (y * info.width + x) * info.channels;
      return [data[idx], data[idx+1], data[idx+2]];
    };
    const tl = getPixel(2, 2);
    const tr = getPixel(info.width - 3, 2);
    const bl = getPixel(2, info.height - 3);
    const br = getPixel(info.width - 3, info.height - 3);
    console.log(
      `${p.id.padEnd(20)} | Dims: ${String(meta.width).padStart(4)}x${String(meta.height).padEnd(4)} | Ratio: ${(meta.width/meta.height).toFixed(2)}:1 | ` +
      `TL:[${tl}] TR:[${tr}] BL:[${bl}] BR:[${br}]`
    );
  }
}
inspect();
