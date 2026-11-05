import sharp from 'sharp';

async function findBBoxes() {
  const meta = await sharp('../images/image 5.png').metadata();
  console.log('image 5 width:', meta.width, 'height:', meta.height);
  
  // Section A: Buildings
  // In image 5, Row 1 (top): "A. MAIN BUILDINGS (6 Locations) - Transparent PNG"
  // It spans from y: ~60 to y: ~300.
  // There are 6 buildings horizontally across x: 10 to 1520.
  // Building 1: Main Headquarters (~250px wide)
  // Building 2: Esports Arena (~250px wide)
  // Building 3: Game Dev Studio (~220px wide)
  // Building 4: Community Hub (~220px wide)
  // Building 5: Contact Centre (~240px wide)
  // Building 6: Event Grounds (~240px wide)
  
  // Let's create an automated coordinate finder that crops test slices of the 6 buildings to check!
  const buildings = [
    { name: 'main-headquarters', left: 24, top: 100, width: 235, height: 160 },
    { name: 'esports-arena', left: 275, top: 100, width: 235, height: 160 },
    { name: 'game-dev-studio', left: 520, top: 100, width: 235, height: 160 },
    { name: 'community-hub', left: 770, top: 100, width: 235, height: 160 },
    { name: 'contact-centre', left: 1020, top: 100, width: 235, height: 160 },
    { name: 'event-grounds', left: 1270, top: 100, width: 235, height: 160 },
  ];

  for (const b of buildings) {
    await sharp('../images/image 5.png')
      .extract({ left: b.left, top: b.top, width: b.width, height: b.height })
      .toFile(`public/debug-crops/test_${b.name}.png`);
    console.log(`Extracted test_${b.name}.png`);
  }
}

findBBoxes();
