import { LOCATION_MAP } from './locationData.js';
export const PLAZA_CENTER = { x: 835, y: 555 };
const LOCATION_WAYPOINTS = {
  'main-headquarters': [{x:835,y:500},{x:835,y:430},{x:835,y:355}],
  'esports-arena': [{x:940,y:540},{x:1080,y:500},{x:1210,y:455},{x:1370,y:410}],
  'game-dev-studio': [{x:730,y:540},{x:600,y:500},{x:480,y:455},{x:355,y:410}],
  'community-hub': [{x:720,y:590},{x:590,y:630},{x:470,y:670},{x:345,y:710}],
  'contact-centre': [{x:950,y:590},{x:1080,y:630},{x:1210,y:670},{x:1380,y:712}],
  'event-grounds': [{x:835,y:620},{x:835,y:700},{x:835,y:770},{x:835,y:835}]
};
export function buildTravelPath(fromX,fromY,destinationId){
  const dest=LOCATION_MAP[destinationId];
  const waypoints=LOCATION_WAYPOINTS[destinationId];
  if(!dest||!waypoints) return [];
  if(Math.hypot(fromX-dest.entranceX,fromY-dest.entranceY)<48) return [];
  const path=[];
  if(Math.hypot(fromX-PLAZA_CENTER.x,fromY-PLAZA_CENTER.y)>90) path.push({...PLAZA_CENTER});
  return path.concat(waypoints.map(p=>({...p})));
}
export function getSpawnPoint(){return {x:PLAZA_CENTER.x,y:PLAZA_CENTER.y};}
