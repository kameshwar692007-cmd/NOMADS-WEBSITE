// Foreground objects traced from the user's red obstacle dots on the 1090×612 map.
// Screen annotation coordinates are transformed to the native 1672×941 scene.
const xx = x => (x-4)*1672/1090;
const yy = y => (y-64)*941/612;
const objects = [
 // label, screen center, canopy radius, ground-contact y, solid foot radii.
 ['pink tree',118,324,30,37,373,11,7],
 ['west sapling',174,407,18,27,434,9,7],
 ['left shrub',165,353,13,17,366,10,7],
 ['studio lawn shrub',300,357,17,19,373,9,7],
 ['studio entry tree',377,301,18,29,334,9,7],
 ['studio bench',421,324,25,12,337,19,6],
 ['headquarters west tree',378,297,17,27,327,9,7],
 ['hq lamp west',498,318,8,30,344,6,7],
 ['hq banner west',467,344,12,30,370,7,8],
 ['hq banner east',634,345,12,30,371,7,8],
 ['hq lamp east',607,319,8,30,344,6,7],
 ['arena west tree',718,296,20,30,327,9,7],
 ['arena lawn shrub',870,361,18,19,376,10,7],
 ['arena east shrub',1017,346,18,22,366,10,7],
 ['arena south bush',808,376,22,18,389,12,7],
 ['west courtyard tree',397,390,24,31,418,11,8],
 ['east courtyard tree',699,385,24,31,417,11,8],
 ['central garden shrub',705,400,19,20,411,9,7],
 ['central banner west',467,409,11,30,435,7,8],
 ['central banner east',635,407,11,30,436,7,8],
 ['courtyard west lamp',438,435,7,25,457,6,6],
 ['courtyard east lamp',665,432,7,25,456,6,6],
 ['west coast tree',110,433,28,33,467,11,8],
 ['west flower patch',129,475,20,12,485,11,6],
 ['community flower patch',194,557,23,13,567,10,6],
 ['southwest tree',241,550,33,39,584,12,8],
 ['southwest second tree',277,569,25,27,592,11,7],
 ['east south tree',779,545,30,39,579,12,8],
 ['east south flowers',827,552,20,14,565,10,6],
 ['contact flowers',927,550,23,14,563,10,6],
 ['contact coastal tree',1032,465,27,32,491,12,8],
 ['contact door shrub',838,479,18,15,492,8,6],
 ['upper right bushes',1007,304,16,18,319,9,6],
];
export const SCENE_OBJECTS=objects.map(([id,sx,sy,rx,ry,base,solidRx,solidRy])=>({
 id,x:xx(sx),y:yy(sy),rx:rx*1672/1090,ry:ry*941/612,
 baseY:yy(base),solidRx:solidRx*1672/1090,solidRy:solidRy*941/612
}));

// Solid contact points only. The tree canopy remains a visual foreground
// rather than a giant rectangular collider that would block an entire pathway.
export function hitsSceneObject(x,y,w,h){
 for(const o of SCENE_OBJECTS){
  const cx=Math.max(x,Math.min(o.x,x+w)),cy=Math.max(y,Math.min(o.baseY,y+h));
  if(((cx-o.x)/o.solidRx)**2+((cy-o.baseY)/o.solidRy)**2<1)return true;
 }
 return false;
}

// The campus is one flattened image, so restore each object from its original
// world pixels only if the player's FEET are behind its ground contact.
// When the player is in front, the player renders after the background normally.
export function drawForegroundForPlayer(ctx,campus,footX,footY,playerWidth=32,playerHeight=48){
 if(!campus?.width)return;
 for(const o of SCENE_OBJECTS){
  if(footY>=o.baseY-2)continue;
  const withinX=Math.abs(footX-o.x)<o.rx+playerWidth/2;
  const withinY=footY>o.y-o.ry-playerHeight&&footY<o.y+o.ry+playerHeight;
  if(!withinX||!withinY)continue;
  ctx.save();ctx.beginPath();
  ctx.ellipse(o.x,o.y,o.rx,o.ry,0,0,Math.PI*2);
  ctx.clip();
  const left=Math.max(0,Math.floor(o.x-o.rx)-2);
  const top=Math.max(0,Math.floor(o.y-o.ry)-2);
  const right=Math.min(1672,Math.ceil(o.x+o.rx)+2);
  const bottom=Math.min(941,Math.ceil(o.y+o.ry)+2);
  ctx.drawImage(campus,left,top,right-left,bottom-top,left,top,right-left,bottom-top);
  ctx.restore();
 }
}
