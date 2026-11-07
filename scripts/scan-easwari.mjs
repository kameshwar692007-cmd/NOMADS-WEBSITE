import sharp from 'sharp';

async function scanEaswari() {
  const { data, info } = await sharp('public/assets/events-and-logos/img_1_2026-11-05_at_10.30.08_AM.jpeg').raw().toBuffer({ resolveWithObject: true });
  const getP = (x, y) => {
    const idx = (y * info.width + x) * info.channels;
    return [data[idx], data[idx+1], data[idx+2]];
  };
  console.log('Top edge (y=0):');
  for (let x = 0; x < info.width; x += 50) {
    console.log(`x=${x}: [${getP(x, 0)}]`);
  }
  console.log('Bottom edge (y=135):');
  for (let x = 0; x < info.width; x += 50) {
    console.log(`x=${x}: [${getP(x, 135)}]`);
  }
}
scanEaswari();
