import sharp from 'sharp';

async function inspectImg13() {
  const meta = await sharp('public/assets/events-and-logos/img_13_2026-11-05_at_10.30.15_AM__1_.jpeg').metadata();
  console.log('GDAI meta:', meta);
  const meta1 = await sharp('public/assets/events-and-logos/img_1_2026-11-05_at_10.30.08_AM.jpeg').metadata();
  console.log('Easwari meta:', meta1);
  const meta3 = await sharp('public/assets/events-and-logos/img_3_2026-11-05_at_10.30.09_AM.jpeg').metadata();
  console.log('Incubator meta:', meta3);
}
inspectImg13();
