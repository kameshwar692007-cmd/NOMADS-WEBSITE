import sharp from 'sharp';
import fs from 'fs';

async function inspectLayout() {
  // Let's inspect image 5 in sections:
  // image 5 has 1536x1024 dimensions.
  // Let's see what is at top, middle, bottom.
  console.log('Inspecting image 5...');
  // Let's find bounding boxes of non-background objects or sections
  const { data, info } = await sharp('../images/image 5.png').raw().toBuffer({ resolveWithObject: true });
  
  // Find background color: top-left corner
  const bgR = data[0], bgG = data[1], bgB = data[2];
  console.log(`Background color estimate: rgb(${bgR}, ${bgG}, ${bgB})`);

  // Let's divide image 5 into rows and columns and check visual entropy / activity
  const cellW = 128;
  const cellH = 128;
  const cols = Math.floor(info.width / cellW);
  const rows = Math.floor(info.height / cellH);

  console.log(`Grid of ${cols} x ${rows} (${cellW}x${cellH} blocks):`);
  for (let r = 0; r < rows; r++) {
    let rowStr = `R${r.toString().padStart(2, '0')}: `;
    for (let c = 0; c < cols; c++) {
      let diffSum = 0;
      for (let y = r * cellH; y < (r + 1) * cellH; y += 4) {
        for (let x = c * cellW; x < (c + 1) * cellW; x += 4) {
          const idx = (y * info.width + x) * info.channels;
          const diff = Math.abs(data[idx] - bgR) + Math.abs(data[idx+1] - bgG) + Math.abs(data[idx+2] - bgB);
          if (diff > 40) diffSum++;
        }
      }
      rowStr += diffSum > 50 ? ' #' : ' .';
    }
    console.log(rowStr);
  }
}

inspectLayout();
