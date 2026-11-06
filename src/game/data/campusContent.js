// Nomad's Province — Master Content Data Store
// Powers the 6 interactive building destination pages

export const ORG_INFO = {
  name: "Nomad's Province",
  tagline: "We Organize, We Compete • Esports & Game Development Ecosystem",
  location: "Chennai, India",
  email: "nomadsprovince@gmail.com",
  instagram: "https://www.instagram.com/nomadsprovince?cplk=MWxzbHM3bWNrdXJ3Ng==",
  instagramHandle: "@nomadsprovince",
  whatsapp: "https://whatsapp.com/channel/0029VbCLLDiAjPXQTWkJP00f",
  stats: [
    { label: "Tournaments Hosted", value: 12, suffix: "+" },
    { label: "Competitive Players", value: 250, suffix: "+" },
    { label: "Partner Communities", value: 30, suffix: "+" },
    { label: "Collegiate Chapters", value: 10, suffix: "+" },
  ]
};

export const PARTNERS = [
  {
    id: 'gdai',
    name: 'GDAI',
    fullName: 'Game Developers Association of India',
    category: 'Game Development Partner',
    desc: 'National game dev mentorship, developer showcase, and official Game Jam Partner for GameJam X Esports.',
    accent: '#38bdf8',
    icon: '💻',
    image: '/assets/events-and-logos/img_3_2026-11-05_at_10.30.09_AM.jpeg'
  },
  {
    id: 'decathlon',
    name: 'Decathlon',
    fullName: 'Decathlon Sports India',
    category: 'Sports & Venue Partner',
    desc: 'Physical sports venue activations, community sporting culture, and active lifestyle crossovers.',
    accent: '#0284c7',
    icon: '⚡',
    image: '/assets/events-and-logos/img_1_2026-11-05_at_10.30.08_AM.jpeg'
  },
  {
    id: 'playo',
    name: 'Playo',
    fullName: 'Playo Sports App',
    category: 'Sports Tech Partner',
    desc: 'Sports venue bookings, community turf tournaments, and collegiate sports integrations.',
    accent: '#10b981',
    icon: '🎯',
    image: '/assets/events-and-logos/img_15_2026-11-05_at_10.30.15_AM__3_.jpeg'
  },
  {
    id: 'srm',
    name: 'SRMIST Ramapuram',
    fullName: 'SRM Institute of Science and Technology',
    category: 'Academic & Event Host',
    desc: 'Flagship host for GameJam X Esports 24-hr hackathon and intercollegiate gaming tournaments.',
    accent: '#f59e0b',
    icon: '🏛️',
    image: '/assets/events-and-logos/img_2_2026-11-05_at_10.30.09_AM__1_.jpeg'
  },
  {
    id: 'huddle-global',
    name: 'Huddle Global',
    fullName: 'Huddle Global (KSUM)',
    category: 'Tech Summit Partner',
    desc: 'Asia premier beachside startup festival connecting esports innovation and creator ecosystems.',
    accent: '#ec4899',
    icon: '🌐',
    image: '/assets/events-and-logos/img_14_2026-11-05_at_10.30.15_AM__2_.jpeg'
  },
  {
    id: 'freefire-community',
    name: 'Free Fire Community',
    fullName: 'Free Fire Esports Network',
    category: 'Esports Network Partner',
    desc: 'Dedicated custom lobby scrims, collegiate showdowns, and competitive ranking brackets.',
    accent: '#f97316',
    icon: '🔥',
    image: '/assets/events-and-logos/img_4_2026-11-05_at_10.30.10_AM__1_.jpeg'
  },
  {
    id: 'chennai-anime-club',
    name: 'Chennai Anime Club',
    fullName: 'Chennai Anime Club',
    category: 'Community & Culture',
    desc: 'Youth pop-culture, anime watch parties, cosplay fests, and casual gaming crossovers.',
    accent: '#a855f7',
    icon: '✨',
    image: '/assets/events-and-logos/img_11_2026-11-05_at_10.30.14_AM__2_.jpeg'
  },
  {
    id: 'otaku-nadu',
    name: 'Otaku Nadu',
    fullName: 'Otaku Nadu Community',
    category: 'Community & Culture',
    desc: 'Regional manga, gaming, and anime community organizing interactive grassroots fan conventions.',
    accent: '#e11d48',
    icon: '🎌',
    image: '/assets/events-and-logos/img_5_2026-11-05_at_10.30.10_AM__2_.jpeg'
  }
];

export const TOURNAMENTS = [
  {
    id: 'freefire-showdown',
    title: 'Free Fire Max Campus Showdown',
    game: 'Free Fire Max',
    prizePool: '₹15,000 + Trophies',
    date: 'Monthly Series',
    format: 'Battle Royale Squads • 48 Teams',
    status: 'ACTIVE REGISTRATION',
    accent: '#f97316',
    badge: 'FLAGSHIP ESPORTS',
    image: '/assets/events-and-logos/img_6_2026-11-05_at_10.30.10_AM.jpeg',
    desc: 'High-octane collegiate clash featuring custom private lobbies, live casters, and streaming broadcast.'
  },
  {
    id: 'codm-squad-cup',
    title: 'CODM Squad Battle Cup',
    game: 'Call of Duty: Mobile',
    prizePool: '₹20,000 Pool',
    date: 'Bi-Weekly Weekend',
    format: 'Search & Destroy + Hardpoint • 32 Teams',
    status: 'ACTIVE REGISTRATION',
    accent: '#eab308',
    badge: 'TACTICAL SQUADS',
    image: '/assets/events-and-logos/img_12_2026-11-05_at_10.30.14_AM.jpeg',
    desc: 'High-intensity multi-regional championship with seeded brackets and broadcasted grand finals.'
  },
  {
    id: 'indus-weekly',
    title: 'Indus Battle Royale Weekly Clash',
    game: 'Indus Battle Royale',
    prizePool: 'Community Swag + ₹10,000',
    date: 'Every Saturday',
    format: 'Custom Room BR • Solo & Squads',
    status: 'WEEKLY LOBBIES',
    accent: '#06b6d4',
    badge: 'MADE IN INDIA',
    image: '/assets/events-and-logos/img_10_2026-11-05_at_10.30.14_AM__1_.jpeg',
    desc: 'Fast-paced weekly community scrims and custom rooms in the world of Virlok.'
  },
  {
    id: 'bgmi-pro-am',
    title: 'BGMI Provincial Pro-Am League',
    game: 'BGMI',
    prizePool: '₹25,000 + Medals',
    date: 'Upcoming Season',
    format: 'Erangel / Miramar / Sanhok • 64 Teams',
    status: 'UPCOMING',
    accent: '#22c55e',
    badge: 'TIER 1 SCRIMS',
    image: '/assets/events-and-logos/img_16_2026-11-05_at_10.30.15_AM.jpeg',
    desc: 'Tiered scrims elevating grassroots collegiate teams into high-stakes streamed tournaments.'
  }
];

export const STUDIO_PROJECTS = [
  {
    id: 'nomads-headquarters',
    title: "Nomad's Province 2D Virtual Campus",
    genre: 'Retro Top-Down Adventure / Interactive Web World',
    engine: 'WebGL / HTML5 Canvas + React 19',
    status: 'LIVE PROD',
    accent: '#38bdf8',
    badge: 'FLAGSHIP PROJECT',
    image: '/assets/game/campus-world.png',
    desc: 'A gamified virtual headquarters featuring real-time camera tracking, dynamic waypoints, collision maps, and nearest-neighbor pixel rendering.'
  },
  {
    id: 'project-crimson-quest',
    title: 'Project Crimson: Provincial Chronicles',
    genre: '16-bit Action RPG',
    engine: 'Godot Engine 4',
    status: 'IN ACTIVE DEV',
    accent: '#e84537',
    badge: 'INDIE RPG',
    image: '/assets/events-and-logos/img_8_2026-11-05_at_10.30.13_AM__1_.jpeg',
    desc: 'A top-down pixel action adventure exploring ancient provincial kingdoms, fast-paced dungeon crawling, and guild boss encounters.'
  },
  {
    id: 'gamejam-x-showcase',
    title: 'GameJam X Esports 24-Hr Prototypes',
    genre: 'Game Jam Experimental Prototypes',
    engine: 'Unity / WebGL',
    status: 'COMPLETED JAM',
    accent: '#f59e0b',
    badge: 'GDAI HACKATHON',
    image: '/assets/events-and-logos/img_7_2026-11-05_at_10.30.12_AM.jpeg',
    desc: 'A series of innovative mechanic prototypes built over 24 continuous hours in collaboration with SRMIST and GDAI.'
  }
];

export const EVENTS = [
  {
    id: 'gamejam-x-srm',
    title: 'GameJam X Esports 2026',
    category: 'Game Development & Esports',
    venue: 'SRMIST Ramapuram Campus, Chennai',
    date: 'August 28 - 29, 2026',
    endDate: '2026-08-29T20:00:00',
    status: 'CONCLUDED',
    partner: 'SRMIST • GDAI • GameCom',
    image: '/assets/events-and-logos/img_7_2026-11-05_at_10.30.12_AM.jpeg',
    accent: '#38bdf8',
    desc: 'Two-day flagship gaming expo featuring a 24-hour game development hackathon, collegiate LAN esports brackets, and game industry masterclasses.'
  },
  {
    id: 'nomads-nexxus-bits',
    title: "Nomad's Nexxus @ BITS Pilani Hyderabad",
    category: 'Intercollegiate Esports Championship',
    venue: 'BITS Pilani Hyderabad Campus & Virtual',
    date: 'Multi-Stage Championship',
    endDate: '2026-05-15T22:00:00',
    status: 'CONCLUDED',
    partner: 'BITS Pilani • Streaming Partners',
    image: '/assets/events-and-logos/img_9_2026-11-05_at_10.30.13_AM.jpeg',
    accent: '#e84537',
    desc: 'Over 500 participants across 10+ colleges competing in high-intensity gaming battles and live-streamed matches.'
  },
  {
    id: 'huddle-global-esports',
    title: 'Huddle Global Gaming Track',
    category: 'Tech & Esports Innovation Summit',
    venue: 'Kovalam, Kerala (KSUM)',
    date: 'Annual Beachside Summit',
    endDate: '2026-11-20T18:00:00',
    status: 'UPCOMING',
    partner: 'Kerala Startup Mission • Huddle Global',
    image: '/assets/events-and-logos/img_14_2026-11-05_at_10.30.15_AM__2_.jpeg',
    accent: '#ec4899',
    desc: 'Nomad\'s Province showcasing the future of collegiate esports, indie game development, and youth creator platforms.'
  },
  {
    id: 'decathlon-active-gaming',
    title: 'Decathlon Active Arena & Gaming Fest',
    category: 'Sports & Active Gaming Activation',
    venue: 'Decathlon Sports Arena, Chennai',
    date: 'Community Weekend',
    endDate: '2026-12-05T19:00:00',
    status: 'UPCOMING',
    partner: 'Decathlon • Playo',
    image: '/assets/events-and-logos/img_13_2026-11-05_at_10.30.15_AM__1_.jpeg',
    accent: '#0284c7',
    desc: 'Hybrid sports and digital gaming tournament combining turf football, badminton, and mobile esports showdowns.'
  }
];

export const AMBASSADOR_PERKS = [
  { icon: '🎖️', title: 'Official Provincial Credentials', desc: 'Verified title and certificate from Nomad\'s Province leadership.' },
  { icon: '🎟️', title: 'VIP Tournament Access', desc: 'Free entry and priority squad slots in all scrims and championships.' },
  { icon: '🤝', title: 'Campus Event Backing', desc: 'Direct financial, promotional, and logistical support to host LANs at your college.' },
  { icon: '🚀', title: 'Internship Pipeline', desc: 'Fast-track consideration for paid marketing, game dev, and event management roles.' },
  { icon: '📦', title: 'Official Merch & Swag', desc: 'Exclusive jersey, badges, and sponsor perks from Decathlon and Playo.' },
  { icon: '🎙️', title: 'Creator Network Access', desc: 'Direct mentorship with casters, GDAI studio developers, and pro teams.' },
];
