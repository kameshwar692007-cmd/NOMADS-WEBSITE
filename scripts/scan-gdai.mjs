import sharp from 'sharp';

async function scanGdai() {
  const { data, info } = await sharp('public/assets/events-and-logos/img_13_2026-11-05_at_10.30.15_AM__1_.jpeg').raw().toBuffer({ resolveWithObject: true });
  const getP = (x, y) => {
    const idx = (y * info.width + x) * info.channels;
    return [data[idx], data[idx+1], data[idx+2]];
  };
  console.log('Top edge (y=0):');
  for (let x = 0; x < info.width; x += 100) {
    console.log(`x=${x}: [${getP(x, 0)}]`);
  }
  console.log('Bottom edge (y=409):');
  for (let x = 0; x < info.width; x += 100) {
    console.log(`x=${x}: [${getP(x, 409)}]`);
  }
}
scanGdai();
