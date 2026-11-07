import sharp from 'sharp';

async function checkDetails() {
  for (const file of [
    'public/assets/events-and-logos/img_13_2026-11-05_at_10.30.15_AM__1_.jpeg',
    'public/assets/events-and-logos/img_1_2026-11-05_at_10.30.08_AM.jpeg'
  ]) {
    const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
    console.log(file, info.width, info.height);
    // sample top edge center, left edge center, bottom edge center, right edge center
    const getP = (x, y) => {
      const idx = (y * info.width + x) * info.channels;
      return [data[idx], data[idx+1], data[idx+2]];
    };
    console.log('Top mid:', getP(Math.floor(info.width / 2), 2));
    console.log('Bottom mid:', getP(Math.floor(info.width / 2), info.height - 3));
    console.log('Left mid:', getP(2, Math.floor(info.height / 2)));
    console.log('Right mid:', getP(info.width - 3, Math.floor(info.height / 2)));
  }
}
checkDetails();
