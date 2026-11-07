import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const OUT_DIR = 'public/assets/partners-1x1';

const PARTNER_SPECS = [
  {
    id: 'gdai',
    name: 'GDAI',
    src: 'img_13_2026-11-05_at_10.30.15_AM__1_.jpeg',
    out: 'partner-gdai-1x1.webp',
    bgColor: '#080808' // or dark cyber tone that cleanly frames the banner
  },
  {
    id: 'decathlon',
    name: 'Decathlon Kilambakkam',
    src: 'img_15_2026-11-05_at_10.30.15_AM__3_.jpeg',
    out: 'partner-decathlon-1x1.webp',
    bgColor: '#ffffff'
  },
  {
    id: 'playo',
    name: 'Playo',
    src: 'img_8_2026-11-05_at_10.30.13_AM__1_.jpeg',
    out: 'partner-playo-1x1.webp',
    bgColor: '#000000'
  },
  {
    id: 'srm-easwari',
    name: 'Easwari Engineering College',
    src: 'img_1_2026-11-05_at_10.30.08_AM.jpeg',
    out: 'partner-easwari-1x1.webp',
    bgColor: '#f7f7f7'
  },
  {
    id: 'srmist',
    name: 'SRMIST Ramapuram',
    src: 'img_4_2026-11-05_at_10.30.10_AM__1_.jpeg',
    out: 'partner-srmist-1x1.webp',
    bgColor: '#000000'
  },
  {
    id: 'huddle-global',
    name: 'Huddle Global',
    src: 'img_6_2026-11-05_at_10.30.10_AM.jpeg',
    out: 'partner-huddle-1x1.webp',
    bgColor: '#000000'
  },
  {
    id: 'vit-ap',
    name: 'VIT-AP University',
    src: 'img_9_2026-11-05_at_10.30.13_AM.jpeg',
    out: 'partner-vit-1x1.webp',
    bgColor: '#000000'
  },
  {
    id: 'crescent',
    name: 'Crescent Institute',
    src: 'img_12_2026-11-05_at_10.30.14_AM.jpeg',
    out: 'partner-crescent-1x1.webp',
    bgColor: '#000000'
  },
  {
    id: 'chennai-anime-club',
    name: 'Chennai Anime Club',
    src: 'img_16_2026-11-05_at_10.30.15_AM.jpeg',
    out: 'partner-cac-1x1.webp',
    bgColor: '#000000'
  },
  {
    id: 'otaku-nadu',
    name: 'Otaku Nadu',
    src: 'img_11_2026-11-05_at_10.30.14_AM__2_.jpeg',
    out: 'partner-otaku-1x1.webp',
    bgColor: '#000000'
  },
  {
    id: 'game-com',
    name: 'Game Com',
    src: 'img_5_2026-11-05_at_10.30.10_AM__2_.jpeg',
    out: 'partner-gamecom-1x1.webp',
    bgColor: '#f4f4f4'
  },
  {
    id: 'drushya-dag',
    name: 'DAG - Drushya',
    src: 'img_14_2026-11-05_at_10.30.15_AM__2_.jpeg',
    out: 'partner-dag-1x1.webp',
    bgColor: '#000000'
  },
  {
    id: 'st-lourdes',
    name: 'St. Lourdes Engineering College',
    src: 'img_10_2026-11-05_at_10.30.14_AM__1_.jpeg',
    out: 'partner-stlourdes-1x1.webp',
    bgColor: '#000000'
  },
  {
    id: 'easwari-incubator',
    name: 'Easwari Startup Peravai',
    src: 'img_3_2026-11-05_at_10.30.09_AM.jpeg',
    out: 'partner-incubator-1x1.webp',
    bgColor: '#f7f7f7'
  }
];

async function generate() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const results = [];

  for (const spec of PARTNER_SPECS) {
    const srcPath = path.join('public/assets/events-and-logos', spec.src);
    if (!fs.existsSync(srcPath)) {
      throw new Error(`Source file missing: ${srcPath}`);
    }

    const meta = await sharp(srcPath).metadata();
    const origW = meta.width;
    const origH = meta.height;

    const outPath = path.join(OUT_DIR, spec.out);

    let finalW = origW;
    let finalH = origH;

    if (origW === origH) {
      // Already 1:1, save as lossless webp
      await sharp(srcPath)
        .webp({ lossless: true })
        .toFile(outPath);
    } else {
      // Rectangular: pad to square without cropping or stretching
      const squareSize = Math.max(origW, origH);
      finalW = squareSize;
      finalH = squareSize;

      const padX = Math.max(0, Math.floor((squareSize - origW) / 2));
      const padY = Math.max(0, Math.floor((squareSize - origH) / 2));
      const padRight = squareSize - origW - padX;
      const padBottom = squareSize - origH - padY;

      await sharp(srcPath)
        .extend({
          top: padY,
          bottom: padBottom,
          left: padX,
          right: padRight,
          background: spec.bgColor
        })
        .webp({ lossless: true })
        .toFile(outPath);
    }

    const outMeta = await sharp(outPath).metadata();

    results.push({
      id: spec.id,
      name: spec.name,
      srcFile: spec.src,
      outFile: spec.out,
      webPath: `/assets/partners-1x1/${spec.out}`,
      origDims: `${origW}x${origH}`,
      outDims: `${outMeta.width}x${outMeta.height}`,
      is1x1: outMeta.width === outMeta.height,
      bgColor: spec.bgColor,
      bytes: fs.statSync(outPath).size
    });
  }

  console.table(results.map(r => ({
    Partner: r.id,
    'Original Dims': r.origDims,
    '1:1 Output Dims': r.outDims,
    'Is 1:1': r.is1x1,
    'BG Color': r.bgColor,
    Output: r.outFile
  })));

  // Write comparison HTML page
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Partner Logos 1:1 Verification & Comparison</title>
  <style>
    body { background: #070e1b; color: #f1f5f9; font-family: monospace; padding: 24px; }
    h1 { color: #e84537; font-size: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(480px, 1fr)); gap: 24px; }
    .card { background: #0e172a; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; }
    .title { color: #38bdf8; font-weight: bold; font-size: 15px; margin-bottom: 12px; }
    .compare-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .box { display: flex; flex-direction: column; align-items: center; }
    .box-label { font-size: 11px; color: #94a3b8; margin-bottom: 6px; font-weight: bold; }
    .img-frame { width: 100%; aspect-ratio: 1/1; display: flex; align-items: center; justify-content: center; background: #000; border-radius: 6px; overflow: hidden; border: 1px solid #334155; }
    .img-frame img { width: 100%; height: 100%; object-fit: contain; }
    .info { margin-top: 10px; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <h1>Nomad's Province — 1:1 Partner Logo Comparison & Verification</h1>
  <div class="grid">
    ${results.map((r, i) => `
      <div class="card">
        <div class="title">#${i+1} ${r.name} (${r.id})</div>
        <div class="compare-row">
          <div class="box">
            <span class="box-label">ORIGINAL (${r.origDims})</span>
            <div class="img-frame">
              <img src="/assets/events-and-logos/${r.srcFile}" alt="${r.name} original">
            </div>
          </div>
          <div class="box">
            <span class="box-label">1:1 PADDED WEBP (${r.outDims})</span>
            <div class="img-frame" style="background: ${r.bgColor};">
              <img src="${r.webPath}" alt="${r.name} 1:1">
            </div>
          </div>
        </div>
        <div class="info">
          Output: <code>${r.outFile}</code> • Padded Color: <code>${r.bgColor}</code> • 1:1 Verified: <strong>${r.is1x1 ? 'YES' : 'NO'}</strong>
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync('public/partner-logos-comparison.html', html);
  console.log('\nGenerated public/partner-logos-comparison.html for visual verification.');
}

generate().catch(err => {
  console.error('Error generating 1:1 logos:', err);
  process.exit(1);
});
