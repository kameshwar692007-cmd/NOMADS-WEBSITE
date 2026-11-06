// Nomad's Province — Location Data aligned to the approved campus artwork.
export const LOCATIONS = [
  {
    id:'main-headquarters', displayName:'Main Headquarters', shortName:'HQ',
    description:'Discover our story, vision, mission, achievements and team.', tagline:"About Nomad's Province", route:'/about', accentColor:'#e84537',
    badgeAsset:'/assets/game/ui/badge-about.png', worldX:610, worldY:48, buildingWidth:450, buildingHeight:300,
    entranceX:835, entranceY:355, interactionRadius:64, collisionBox:{x:38,y:32,w:374,h:235},
    enterLabel:'ENTER HEADQUARTERS', secondaryLabel:'MEET THE TEAM',
    sectionDetails:{highlights:['Our story and journey','Vision and mission','Founders, core team and contributors','Events, achievements and partnerships'],quickStats:[{label:'Focus',value:'Esports + Game Development'},{label:'Ecosystem',value:'Gamers • Devs • Colleges'},{label:'Network',value:'Community + Industry'}]}
  },
  {
    id:'esports-arena', displayName:'Esports Arena', shortName:'Arena',
    description:'Explore tournaments, competitions and our esports ecosystem.', tagline:'Tournaments & Gaming Events', route:'/esports', accentColor:'#e84537',
    badgeAsset:'/assets/game/ui/badge-esports.png', worldX:1180, worldY:120, buildingWidth:390, buildingHeight:285,
    entranceX:1370, entranceY:410, interactionRadius:64, collisionBox:{x:25,y:28,w:340,h:220},
    enterLabel:'ENTER ARENA', secondaryLabel:'VIEW EVENTS',
    sectionDetails:{highlights:['Upcoming tournaments and competitions','Gaming events and activations','Results, winners and highlights','Esports partnerships and achievements'],quickStats:[{label:'Category',value:'Esports'},{label:'Events',value:'Upcoming + Past'},{label:'Registration',value:'External Links'}]}
  },
  {
    id:'game-dev-studio', displayName:'Game Development Studio', shortName:'Studio',
    description:'Discover games, projects and interactive experiences built by our studio.', tagline:'Games & Projects', route:'/studio', accentColor:'#38bdf8',
    badgeAsset:'/assets/game/ui/badge-games.png', worldX:155, worldY:125, buildingWidth:395, buildingHeight:290,
    entranceX:355, entranceY:410, interactionRadius:64, collisionBox:{x:28,y:28,w:330,h:220},
    enterLabel:'ENTER STUDIO', secondaryLabel:'VIEW PROJECTS',
    sectionDetails:{highlights:['Original games and prototypes','Interactive experiences and products','Development portfolio and devlogs','Developers and contributors'],quickStats:[{label:'Focus',value:'Original Games'},{label:'Projects',value:'Studio Portfolio'},{label:'Collaboration',value:'Open'}]}
  },
  {
    id:'community-hub', displayName:'Community Hub', shortName:'Community',
    description:'Discover partnerships, collaborations and community initiatives.', tagline:'Network & Collaborations', route:'/community', accentColor:'#84c669',
    badgeAsset:'/assets/game/ui/badge-community.png', worldX:145, worldY:455, buildingWidth:395, buildingHeight:260,
    entranceX:345, entranceY:710, interactionRadius:64, collisionBox:{x:32,y:24,w:330,h:190},
    enterLabel:'ENTER HUB', secondaryLabel:'VIEW NETWORK',
    sectionDetails:{highlights:['College partnerships','Industry collaborations','Grassroots initiatives','Community programs'],quickStats:[{label:'Network',value:'Colleges + Brands'},{label:'Programs',value:'Community Initiatives'},{label:'Goal',value:'Build the Ecosystem'}]}
  },
  {
    id:'contact-centre', displayName:'Contact Centre', shortName:'Contact',
    description:'Connect with us for partnerships, sponsorships, internships and enquiries.', tagline:'Partnerships & Contact', route:'/contact', accentColor:'#c0cbdc',
    badgeAsset:'/assets/game/ui/badge-contact.png', worldX:1190, worldY:455, buildingWidth:380, buildingHeight:265,
    entranceX:1380, entranceY:712, interactionRadius:64, collisionBox:{x:30,y:24,w:320,h:195},
    enterLabel:'ENTER CENTRE', secondaryLabel:'CONTACT US',
    sectionDetails:{highlights:['Partnerships and sponsorships','College collaborations','Internships','Game development and general enquiries'],quickStats:[{label:'Channels',value:'Email + WhatsApp'},{label:'Socials',value:'Instagram • LinkedIn • YouTube'},{label:'Enquiries',value:'Open'}]}
  },
  {
    id:'event-grounds', displayName:'Event Grounds', shortName:'Events',
    description:'Explore upcoming events, past events, results and highlights.', tagline:'Upcoming & Past Events', route:'/events', accentColor:'#fdbe53',
    badgeAsset:'/assets/game/ui/badge-events.png', worldX:575, worldY:650, buildingWidth:520, buildingHeight:225,
    entranceX:550, entranceY:817, interactionRadius:68, collisionBox:{x:55,y:18,w:410,h:125},
    enterLabel:'ENTER GROUNDS', secondaryLabel:'VIEW EVENTS',
    sectionDetails:{highlights:['Upcoming and past events','Schedules and announcements','Gallery, videos and highlights','Results, winners, organizers and partners'],quickStats:[{label:'Categories',value:'Esports • Game Dev • Sports'},{label:'Status',value:'Dynamic'},{label:'Registration',value:'External'}]}
  }
];
export const LOCATION_MAP = Object.fromEntries(LOCATIONS.map(l=>[l.id,l]));
export function findNearbyLocation(px,py){
  return LOCATIONS.find(loc=>Math.hypot(px-loc.entranceX,py-loc.entranceY)<=loc.interactionRadius)||null;
}
export function findClickedBuilding(worldX,worldY){
  return LOCATIONS.find(loc=>worldX>=loc.worldX && worldX<=loc.worldX+loc.buildingWidth && worldY>=loc.worldY && worldY<=loc.worldY+loc.buildingHeight)||null;
}
