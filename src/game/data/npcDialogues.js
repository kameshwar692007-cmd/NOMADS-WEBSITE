// NPCs occupy existing characters and building entrances in the approved campus art.
// Keep this data independent of AGY's page content and routing.
const dialogue = (id, name, title, portrait, x, y, message, actionLabel, route) =>
  Object.freeze({id,name,title,portrait,x,y,message,actionLabel,route});

export const CAMPUS_NPCS = Object.freeze([
  dialogue('receptionist','Mira','Headquarters Receptionist','receptionist',836,375,
    "Welcome to Nomad's Province! Discover our story, the people behind it, and what we're building together.",
    'Discover Our Story','/about'),
  dialogue('arena-host','Rex','Esports Arena Host','arena-host',1453,444,
    'Ready for competition? Explore our tournaments, gaming events and esports community.',
    'Explore Esports','/esports'),
  dialogue('developer','Kai','Game Studio Developer','developer',505,440,
    'This is where ideas become playable worlds. Check out our game projects and development studio.',
    'View Our Games','/studio'),
  dialogue('event-coordinator','Nova','Event Coordinator','event-coordinator',723,801,
    'Something exciting is always happening here! Discover upcoming events and past highlights.',
    'View Events','/events'),
  dialogue('community-manager','Ari','Community Manager','community-manager',486,685,
    'Our community connects gamers, creators, colleges and industry collaborators. Come meet everyone!',
    'Explore Community','/community'),
  dialogue('partnership-rep','Ezra','Partnership Representative','partnership-rep',1122,686,
    'Want to partner, sponsor, collaborate or get in touch? We would love to hear from you.',
    'Contact Us','/contact')
]);

export const HERO_GUIDE = Object.freeze({
  id:'hero-guide',name:'Your Guide',title:'Campus Explorer',portrait:'hero-guide',
  message:"Hey there! Welcome to Nomad's Province Headquarters. Explore the campus and meet our team!",
  note:'Desktop: WASD or arrow keys, or click to walk. Mobile: hold the directional buttons or tap a destination. Tap an NPC to talk.',
  actionLabel:"Let's Explore",route:null
});

export function getNpcAtWorldPoint(x,y,radius=31){
  if(!Number.isFinite(x)||!Number.isFinite(y))return null;
  return CAMPUS_NPCS.find(npc=>Math.hypot(npc.x-x,npc.y-y)<=radius)||null;
}
export function getNearbyNpc(x,y,radius=54){
  return getNpcAtWorldPoint(x,y,radius);
}
export function dialogueForLocation(location){
  if(!location)return null;
  const match=CAMPUS_NPCS.find(npc=>npc.route===location.route);
  if(!match)return null;
  return {...match, id:location.id, locationName:location.displayName};
}
