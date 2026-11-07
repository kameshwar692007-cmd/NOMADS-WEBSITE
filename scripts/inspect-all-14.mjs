import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const partners = [
  { id: 'gdai', name: 'GDAI', file: 'img_13_2026-11-05_at_10.30.15_AM__1_.jpeg' },
  { id: 'decathlon', name: 'Decathlon Kilambakkam', file: 'img_15_2026-11-05_at_10.30.15_AM__3_.jpeg' },
  { id: 'playo', name: 'Playo', file: 'img_8_2026-11-05_at_10.30.13_AM__1_.jpeg' },
  { id: 'srm-easwari', name: 'Easwari Engineering College', file: 'img_1_2026-11-05_at_10.30.08_AM.jpeg' },
  { id: 'srmist', name: 'SRMIST Ramapuram', file: 'img_4_2026-11-05_at_10.30.10_AM__1_.jpeg' },
  { id: 'huddle-global', name: 'Huddle Global', file: 'img_6_2026-11-05_at_10.30.10_AM.jpeg' },
  { id: 'vit-ap', name: 'VIT-AP University', file: 'img_9_2026-11-05_at_10.30.13_AM.jpeg' },
  { id: 'crescent', name: 'Crescent Institute', file: 'img_12_2026-11-05_at_10.30.14_AM.jpeg' },
  { id: 'chennai-anime-club', name: 'Chennai Anime Club', file: 'img_16_2026-11-05_at_10.30.15_AM.jpeg' },
  { id: 'otaku-nadu', name: 'Otaku Nadu', file: 'img_11_2026-11-05_at_10.30.14_AM__2_.jpeg' },
  { id: 'game-com', name: 'Game Com', file: 'img_5_2026-11-05_at_10.30.10_AM__2_.jpeg' },
  { id: 'drushya-dag', name: 'DAG - Drushya', file: 'img_14_2026-11-05_at_10.30.15_AM__2_.jpeg' },
  { id: 'st-lourdes', name: 'St. Lourdes Engineering College', file: 'img_10_2026-11-05_at_10.30.14_AM__1_.jpeg' },
  { id: 'easwari-incubator', name: 'Easwari Startup Peravai', file: 'img_3_2026-11-05_at_10.30.09_AM.jpeg' }
];

async function run() {
  const reports = [];
  for (const p of partners) {
    const srcPath = path.join('public/assets/events-and-logos', p.file);
    const meta = await sharp(srcPath).metadata();
    reports.push({
      ...p,
      srcPath,
      webPath: `/assets/events-and-logos/${p.file}`,
      width: meta.width,
      height: meta.height,
      aspect: (meta.width / meta.height).toFixed(2),
      isSquare: meta.width === meta.height
    });
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Partner Logos Visual Inspection</title>
  <style>
    body { background: #070e1b; color: #f1f5f9; font-family: monospace; padding: 24px; }
    h1 { color: #e84537; font-size: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .card { background: #0e172a; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; }
    .preview-box { width: 100%; height: 200px; display: flex; align-items: center; justify-content: center; background: #000; border-radius: 6px; overflow: hidden; margin-bottom: 12px; border: 1px solid #334155; }
    img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .info { font-size: 12px; line-height: 1.6; color: #94a3b8; }
    .title { color: #38bdf8; font-weight: bold; font-size: 14px; margin-bottom: 4px; }
    .tag { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
    .tag.sq { background: #059669; color: #fff; }
    .tag.rect { background: #d97706; color: #fff; }
  </style>
</head>
<body>
  <h1>Nomad's Province — 14 Partner Logos Inspection</h1>
  <div class="grid">
    ${reports.map((r, i) => `
      <div class="card">
        <div class="title">#${i+1} ${r.name} (${r.id})</div>
        <div class="preview-box">
          <img src="${r.webPath}" alt="${r.name}">
        </div>
        <div class="info">
          <div>File: <code>${r.file}</code></div>
          <div>Dimensions: <strong>${r.width} × ${r.height}</strong> (Ratio: ${r.aspect}:1)</div>
          <div>Status: <span class="tag ${r.isSquare ? 'sq' : 'rect'}">${r.isSquare ? '1:1 SQUARE' : 'RECTANGULAR (Needs 1:1 Padding)'}</span></div>
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync('public/partner-logos-preview.html', html);
  console.log('Saved public/partner-logos-preview.html');
}

run();
