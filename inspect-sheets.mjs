import sharp from 'sharp';

async function scanGrid() {
  // Let's create an HTML visual index with scaled previews of all 5 images
  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #111; color: #eee; font-family: sans-serif; padding: 20px; }
    h2 { color: #f97316; }
    .img-container { margin-bottom: 40px; }
    img { max-width: 100%; border: 1px solid #444; }
  </style>
</head>
<body>
  <h1>Reference Sheets Inspector</h1>
  <div class="img-container">
    <h2>Image 1: Target Composition</h2>
    <img src="/images/image1.png" />
  </div>
  <div class="img-container">
    <h2>Image 5: Production Ready Asset Source</h2>
    <img src="/images/image 5.png" />
  </div>
  <div class="img-container">
    <h2>Image 2: Campus + UI + Character Reference</h2>
    <img src="/images/imadge 2.png" />
  </div>
  <div class="img-container">
    <h2>Image 3: Asset Pack V1</h2>
    <img src="/images/image 3.png" />
  </div>
  <div class="img-container">
    <h2>Image 4: Complete Library Reference</h2>
    <img src="/images/image 4.png" />
  </div>
</body>
</html>`;

  // Also let's check color statistics and transparent areas across image 5
  const { data, info } = await sharp('../images/image 5.png').raw().toBuffer({ resolveWithObject: true });
  console.log('image 5 raw buffer length:', data.length, 'width:', info.width, 'height:', info.height, 'channels:', info.channels);

  // Sample top left, top right, center, bottom left, bottom right
  const samplePixel = (x, y) => {
    const idx = (y * info.width + x) * info.channels;
    return [data[idx], data[idx+1], data[idx+2], data[idx+3]];
  };

  console.log('Pixel at (0,0):', samplePixel(0,0));
  console.log('Pixel at (100,100):', samplePixel(100,100));
  console.log('Pixel at (500,500):', samplePixel(500,500));
}

scanGrid();
