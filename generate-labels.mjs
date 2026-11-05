import sharp from 'sharp';

async function generateLocationLabels() {
  const labels = [
    {
      file: 'label-main-headquarters.png',
      title: 'Main Headquarters',
      svgIcon: `<path d="M4 10 L12 4 L20 10 L20 12 L4 12 Z M6 13 L8 13 L8 19 L6 19 Z M11 13 L13 13 L13 19 L11 19 Z M16 13 L18 13 L18 19 L16 19 Z M4 20 L20 20 L20 22 L4 22 Z" fill="#f8fafc"/>`
    },
    {
      file: 'label-esports-arena.png',
      title: 'Esports Arena',
      svgIcon: `<path d="M5 5 L19 5 L19 9 C19 13 15 15 12 15 C9 15 5 13 5 9 Z M3 6 L5 6 L5 10 C4 10 3 9 3 8 Z M19 6 L21 6 L21 8 C21 9 20 10 19 10 Z M11 15 L13 15 L13 19 L15 19 L15 21 L9 21 L9 19 L11 19 Z" fill="#ffb86c"/>`
    },
    {
      file: 'label-game-dev-studio.png',
      title: 'Game Dev Studio',
      svgIcon: `<path d="M6 8 L18 8 C20 8 21 10 21 12 L20 18 C19 20 17 21 15 19 L13 17 L11 17 L9 19 C7 21 5 20 4 18 L3 12 C3 10 4 8 6 8 Z M8 11 L10 11 L10 13 L12 13 L12 15 L10 15 L10 17 L8 17 L8 15 L6 15 L6 13 L8 13 Z M15 12 A1.5 1.5 0 1 0 15 15 A1.5 1.5 0 1 0 15 12 Z M17 14 A1.5 1.5 0 1 0 17 17 A1.5 1.5 0 1 0 17 14 Z" fill="#38bdf8"/>`
    },
    {
      file: 'label-community-hub.png',
      title: 'Community Hub',
      svgIcon: `<path d="M8 8 A3 3 0 1 0 8 14 A3 3 0 1 0 8 8 Z M16 8 A3 3 0 1 0 16 14 A3 3 0 1 0 16 8 Z M4 20 C4 17 6 15 8 15 C10 15 12 17 12 20 Z M12 20 C12 17 14 15 16 15 C18 15 20 17 20 20 Z" fill="#4ade80"/>`
    },
    {
      file: 'label-contact-centre.png',
      title: 'Contact Centre',
      svgIcon: `<path d="M12 4 C7.5 4 4 7.5 4 12 L4 18 C4 19.5 5.5 21 7 21 L8 21 L8 15 L6 15 L6 12 C6 8.7 8.7 6 12 6 C15.3 6 18 8.7 18 12 L18 15 L16 15 L16 21 L17 21 C18.5 21 20 19.5 20 18 L20 12 C20 7.5 16.5 4 12 4 Z" fill="#f43f5e"/>`
    },
    {
      file: 'label-event-grounds.png',
      title: 'Event Grounds',
      svgIcon: `<path d="M12 4 L20 10 L20 20 L4 20 L4 10 Z M12 4 L12 20 M8 10 L8 20 M16 10 L16 20" stroke="#fb923c" stroke-width="1.8" fill="none" stroke-linejoin="round"/>`
    },
  ];

  for (const lb of labels) {
    const svg = `<svg width="220" height="36" viewBox="0 0 220 36" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.75"/>
        </filter>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#16223b"/>
          <stop offset="100%" stop-color="#0a101d"/>
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="212" height="28" rx="14" fill="url(#bg)" stroke="#f1f5f9" stroke-width="1.5" filter="url(#shadow)"/>
      <g transform="translate(14, 6) scale(0.95)">
        ${lb.svgIcon}
      </g>
      <text x="46" y="22" font-size="12" font-weight="700" font-family="'Segoe UI', -apple-system, sans-serif" fill="#ffffff" letter-spacing="0.4">${lb.title}</text>
    </svg>`;

    await sharp(Buffer.from(svg))
      .png()
      .toFile('public/assets/game/ui/location-labels/' + lb.file);
    console.log('Saved ' + lb.file);
  }
}
generateLocationLabels();
