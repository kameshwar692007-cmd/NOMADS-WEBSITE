import fs from 'fs';

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Crops &amp; Assets Inspector</title>
  <style>
    body { background: #0f172a; color: #f8fafc; font-family: sans-serif; padding: 20px; }
    h2 { color: #38bdf8; border-bottom: 1px solid #334155; padding-bottom: 8px; }
    .grid { display: grid; gap: 10px; margin-bottom: 30px; }
    .grid-4x4 { grid-template-columns: repeat(4, 1fr); }
    .grid-4x3 { grid-template-columns: repeat(4, 1fr); }
    .card { background: #1e293b; border: 1px solid #475569; border-radius: 6px; padding: 8px; text-align: center; }
    img { max-width: 100%; height: auto; image-rendering: pixelated; }
    .label { font-size: 11px; color: #94a3b8; margin-top: 4px; }
  </style>
</head>
<body>
  <h1>Reference Sheet Crops Inspector</h1>

  <h2>Image 1: Final Target Composition (4x3 Crops)</h2>
  <div class="grid grid-4x3">
    ${Array.from({length: 12}, (_, i) => {
      const r = Math.floor(i / 4);
      const c = i % 4;
      return `
        <div class="card">
          <img src="/debug-crops/img1/img1_r${r}_c${c}.png" />
          <div class="label">Row ${r}, Col ${c}</div>
        </div>
      `;
    }).join('')}
  </div>

  <h2>Image 5: Production Asset Source (4x4 Crops)</h2>
  <div class="grid grid-4x4">
    ${Array.from({length: 16}, (_, i) => {
      const r = Math.floor(i / 4);
      const c = i % 4;
      return `
        <div class="card">
          <img src="/debug-crops/img5/img5_r${r}_c${c}.png" />
          <div class="label">Row ${r}, Col ${c}</div>
        </div>
      `;
    }).join('')}
  </div>
</body>
</html>`;

fs.writeFileSync('public/inspect.html', html, 'utf8');
console.log('inspect.html written successfully');
