import path from 'path';
import sharp from 'sharp';

const partners = [
  { id: 'gdai', file: 'img_13_2026-11-05_at_10.30.15_AM__1_.jpeg' },
  { id: 'decathlon', file: 'img_15_2026-11-05_at_10.30.15_AM__3_.jpeg' },
  { id: 'playo', file: 'img_8_2026-11-05_at_10.30.13_AM__1_.jpeg' },
  { id: 'srm-easwari', file: 'img_1_2026-11-05_at_10.30.08_AM.jpeg' },
  { id: 'srmist', file: 'img_4_2026-11-05_at_10.30.10_AM__1_.jpeg' },
  { id: 'huddle-global', file: 'img_6_2026-11-05_at_10.30.10_AM.jpeg' },
  { id: 'vit-ap', file: 'img_9_2026-11-05_at_10.30.13_AM.jpeg' },
  { id: 'crescent', file: 'img_12_2026-11-05_at_10.30.14_AM.jpeg' },
  { id: 'chennai-anime-club', file: 'img_16_2026-11-05_at_10.30.15_AM.jpeg' },
  { id: 'otaku-nadu', file: 'img_11_2026-11-05_at_10.30.14_AM__2_.jpeg' },
  { id: 'game-com', file: 'img_5_2026-11-05_at_10.30.10_AM__2_.jpeg' },
  { id: 'drushya-dag', file: 'img_14_2026-11-05_at_10.30.15_AM__2_.jpeg' },
  { id: 'st-lourdes', file: 'img_10_2026-11-05_at_10.30.14_AM__1_.jpeg' },
  { id: 'easwari-incubator', file: 'img_3_2026-11-05_at_10.30.09_AM.jpeg' }
];

async function samplePerimeter() {
  for (const p of partners) {
    const src = path.join('public/assets/events-and-logos', p.file);
    const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
    
    // Sample along top and bottom border (every 20th pixel)
    let topR = 0, topG = 0, topB = 0, topCount = 0;
    for (let x = 0; x < info.width; x += 10) {
      const idx = x * info.channels;
      topR += data[idx]; topG += data[idx+1]; topB += data[idx+2];
      topCount++;
    }
    const avgTop = [Math.round(topR/topCount), Math.round(topG/topCount), Math.round(topB/topCount)];

    let botR = 0, botG = 0, botB = 0, botCount = 0;
    const botY = info.height - 1;
    for (let x = 0; x < info.width; x += 10) {
      const idx = (botY * info.width + x) * info.channels;
      botR += data[idx]; botG += data[idx+1]; botB += data[idx+2];
      botCount++;
    }
    const avgBot = [Math.round(botR/botCount), Math.round(botG/botCount), Math.round(botB/botCount)];

    let leftR = 0, leftG = 0, leftB = 0, leftCount = 0;
    for (let y = 0; y < info.height; y += 10) {
      const idx = (y * info.width) * info.channels;
      leftR += data[idx]; leftG += data[idx+1]; leftB += data[idx+2];
      leftCount++;
    }
    const avgLeft = [Math.round(leftR/leftCount), Math.round(leftG/leftCount), Math.round(leftB/leftCount)];

    let rightR = 0, rightG = 0, rightB = 0, rightCount = 0;
    const rightX = info.width - 1;
    for (let y = 0; y < info.height; y += 10) {
      const idx = (y * info.width + rightX) * info.channels;
      rightR += data[idx]; rightG += data[idx+1]; rightB += data[idx+2];
      rightCount++;
    }
    const avgRight = [Math.round(rightR/rightCount), Math.round(rightG/rightCount), Math.round(rightB/rightCount)];

    const toHex = ([r, g, b]) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    console.log(
      `${p.id.padEnd(20)} | Dims: ${info.width}x${info.height} | ` +
      `TopAvg: ${toHex(avgTop)} | BotAvg: ${toHex(avgBot)} | LeftAvg: ${toHex(avgLeft)} | RightAvg: ${toHex(avgRight)}`
    );
  }
}

samplePerimeter();
