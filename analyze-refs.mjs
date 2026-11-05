import sharp from 'sharp';
import fs from 'fs';

async function analyze() {
  const meta5 = await sharp('../images/image 5.png').metadata();
  console.log('image 5 metadata:', meta5);

  const meta1 = await sharp('../images/image1.png').metadata();
  console.log('image 1 metadata:', meta1);

  const meta2 = await sharp('../images/imadge 2.png').metadata();
  console.log('image 2 metadata:', meta2);

  const meta3 = await sharp('../images/image 3.png').metadata();
  console.log('image 3 metadata:', meta3);

  const meta4 = await sharp('../images/image 4.png').metadata();
  console.log('image 4 metadata:', meta4);
}

analyze();
