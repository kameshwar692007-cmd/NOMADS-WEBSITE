// One source of truth for each campus character, their complete game sprite,
// matching portrait, clickable location and existing destination route.
const PORTRAIT_ATLAS='/assets/onboarding/npc-portraits-atlas.webp';
export const NPC_SPRITE_ATLAS='/assets/onboarding/npc-complete-atlas.png';
export const NPC_SPRITE_WIDTH=32, NPC_SPRITE_HEIGHT=48;

const npc=(id,name,title,portraitIndex,spriteIndex,x,y,message,actionLabel,route)=>
  Object.freeze({id,name,title,portraitIndex,spriteIndex,x,y,message,actionLabel,route,
    portraitAtlas:PORTRAIT_ATLAS});

export const CAMPUS_NPCS=Object.freeze([
  npc('receptionist','Aiden','Headquarters Receptionist',6,5,785,398,
    "Welcome to Nomad's Province! Meet our team and discover the world we're building together.",
    'Discover Our Story','/about'),
  npc('arena-host','Rex','Esports Arena Host',2,2,1494,415,
    "Ready to compete? Explore tournaments, esports events and our champions.",
    'Explore Esports','/esports'),
  npc('developer','Kai','Game Studio Developer',3,1,499,386,
    'We turn ideas into playable worlds. Explore our original games and development projects.',
    'View Our Games','/studio'),
  npc('event-coordinator','Nova','Event Coordinator',4,3,745,808,
    'Something exciting is always happening! Discover upcoming events and our best moments.',
    'View Events','/events'),
  npc('community-manager','Ari','Community Manager',5,4,535,625,
    'This is where gamers, creators, colleges and collaborators become a community.',
    'Explore Community','/community'),
  npc('partnership-rep','Ezra','Partnership Representative',1,0,1170,706,
    'Interested in partnering, sponsoring or collaborating? Get in touch with our team.',
    'Contact Us','/contact')
]);

export const HERO_GUIDE=Object.freeze({
  id:'hero-guide',name:'Your Guide',title:'Campus Explorer',portraitIndex:0,
  portraitAtlas:PORTRAIT_ATLAS,
  message:"Hey! Welcome to Nomad's Province Headquarters. Ready to explore the campus?",
  note:'Desktop: WASD, arrow keys or click to move. Mobile: hold the four arrow buttons or tap a location. Click an NPC or press E nearby to talk.',
  actionLabel:"Let's Explore",route:null
});

// NPC hitboxes are foot-based. The floating interaction marker is centered 56px above.
export function getNpcAtWorldPoint(x,y,radius=32){
  if(!Number.isFinite(x)||!Number.isFinite(y))return null;
  return CAMPUS_NPCS.find(n=>
    Math.abs(x-n.x)<=radius && y>=n.y-50-radius*.30 && y<=n.y+radius*.25 ||
    Math.hypot(x-n.x,y-(n.y-60))<=Math.min(radius,17)
  )||null;
}
export function getNearbyNpc(x,y,radius=55){
  if(!Number.isFinite(x)||!Number.isFinite(y))return null;
  return CAMPUS_NPCS.find(n=>Math.hypot(x-n.x,y-n.y)<=radius)||null;
}
export function dialogueForLocation(location){
  if(!location)return null;
  const npc=CAMPUS_NPCS.find(n=>n.route===location.route);
  return npc?{...npc,id:location.id,locationName:location.displayName}:null;
}
