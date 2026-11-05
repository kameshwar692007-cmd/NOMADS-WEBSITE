import fs from 'fs';
import path from 'path';

const BASE = 'public/assets/game';

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(full));
    } else if (file.endsWith('.png')) {
      results.push(full.replace('public/', '/'));
    }
  });
  return results;
}

const allFiles = getFiles(BASE);

// Group by category
const groups = {};
for (const f of allFiles) {
  const parts = f.replace('/assets/game/', '').split('/');
  const group = parts.length > 1 ? parts[0] + (parts.length > 2 ? '/' + parts[1] : '') : 'root';
  if (!groups[group]) groups[group] = [];
  groups[group].push(f);
}

let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nomad's Province — Production Assets Gallery</title>
  <style>
    body {
      background: #091226;
      color: #e2e8f0;
      font-family: 'Segoe UI', system-ui, sans-serif;
      padding: 30px;
      margin: 0;
    }
    h1 {
      color: #f8fafc;
      font-size: 26px;
      border-bottom: 2px solid #c83246;
      padding-bottom: 10px;
    }
    h2 {
      color: #ffb86c;
      margin-top: 35px;
      text-transform: uppercase;
      font-size: 16px;
      letter-spacing: 1px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 16px;
      margin-top: 14px;
    }
    .grid-large {
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    }
    .card {
      background: #111a33;
      border: 1px solid #233559;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }
    .img-box {
      width: 100%;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%) 50% / 16px 16px;
      border-radius: 6px;
      overflow: hidden;
    }
    .grid-large .img-box {
      height: 180px;
    }
    img {
      max-width: 90%;
      max-height: 90%;
      image-rendering: pixelated;
    }
    .label {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 8px;
      word-break: break-all;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <h1>Nomad's Province &mdash; Production Asset Gallery (${allFiles.length} Assets)</h1>
`;

for (const [group, files] of Object.entries(groups)) {
  const isLarge = group.includes('building') || group.includes('stage') || group.includes('preview');
  html += `<h2>${group} (${files.length})</h2>\n`;
  html += `<div class="grid ${isLarge ? 'grid-large' : ''}">\n`;
  for (const f of files) {
    const basename = path.basename(f);
    html += `  <div class="card">
    <div class="img-box"><img src="${f}" alt="${basename}" /></div>
    <div class="label">${basename}</div>
  </div>\n`;
  }
  html += `</div>\n`;
}

html += `</body>\n</html>`;

fs.writeFileSync('public/assets-gallery.html', html, 'utf8');
console.log('Saved public/assets-gallery.html with', allFiles.length, 'assets');
