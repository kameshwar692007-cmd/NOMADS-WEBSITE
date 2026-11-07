import fs from 'fs';

const file = 'src/game/data/campusContent.js';
let content = fs.readFileSync(file, 'utf8');

const partner1x1Map = {
  gdai: { image1x1: '/assets/partners-1x1/partner-gdai-1x1.webp', bgColor: '#080808' },
  decathlon: { image1x1: '/assets/partners-1x1/partner-decathlon-1x1.webp', bgColor: '#ffffff' },
  playo: { image1x1: '/assets/partners-1x1/partner-playo-1x1.webp', bgColor: '#000000' },
  'srm-easwari': { image1x1: '/assets/partners-1x1/partner-easwari-1x1.webp', bgColor: '#f7f7f7' },
  srmist: { image1x1: '/assets/partners-1x1/partner-srmist-1x1.webp', bgColor: '#000000' },
  'huddle-global': { image1x1: '/assets/partners-1x1/partner-huddle-1x1.webp', bgColor: '#000000' },
  'vit-ap': { image1x1: '/assets/partners-1x1/partner-vit-1x1.webp', bgColor: '#000000' },
  crescent: { image1x1: '/assets/partners-1x1/partner-crescent-1x1.webp', bgColor: '#000000' },
  'chennai-anime-club': { image1x1: '/assets/partners-1x1/partner-cac-1x1.webp', bgColor: '#000000' },
  'otaku-nadu': { image1x1: '/assets/partners-1x1/partner-otaku-1x1.webp', bgColor: '#000000' },
  'game-com': { image1x1: '/assets/partners-1x1/partner-gamecom-1x1.webp', bgColor: '#f4f4f4' },
  'drushya-dag': { image1x1: '/assets/partners-1x1/partner-dag-1x1.webp', bgColor: '#000000' },
  'st-lourdes': { image1x1: '/assets/partners-1x1/partner-stlourdes-1x1.webp', bgColor: '#000000' },
  'easwari-incubator': { image1x1: '/assets/partners-1x1/partner-incubator-1x1.webp', bgColor: '#f7f7f7' }
};

for (const [id, data] of Object.entries(partner1x1Map)) {
  const target = `id: '${id}',`;
  const idx = content.indexOf(target);
  if (idx !== -1) {
    const nextPartnerIdx = content.indexOf('image:', idx);
    const endLine = content.indexOf('\n', nextPartnerIdx);
    const currentLine = content.slice(nextPartnerIdx, endLine).replace(/\r$/, '');
    const replacement = `${currentLine},\n    image1x1: '${data.image1x1}',\n    bgColor: '${data.bgColor}'`;
    content = content.slice(0, nextPartnerIdx) + replacement + content.slice(endLine);
  }
}

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated campusContent.js with 1x1 image paths and bgColor');
