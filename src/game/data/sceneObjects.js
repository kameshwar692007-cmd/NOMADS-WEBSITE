// Ground-contact collisions and foreground crops traced against the ORIGINAL
// 1672×941 campus painting. Never infer props from the 1090px UI screenshot.
// A small solid footprint blocks feet; the 2px transparent alpha mask is
// applied to foreground artwork separately, never used as a giant hitbox.
const RAW=[["pink-tree",72,278,105,112,125,375,12,8],["studio-sapling",139,381,66,83,174,441,10,7],["studio-approach-tree",540,324,67,84,571,389,10,7],["arena-approach-tree",1055,327,72,85,1090,390,11,7],["arena-outer-tree",1462,301,70,68,1494,354,9,7],["arena-south-bush",1280,432,78,64,1318,485,17,8],["arena-side-flower",1172,448,83,54,1215,490,16,6],["west-courtyard-tree",543,452,98,113,595,555,13,8],["east-courtyard-tree",1014,447,102,119,1063,556,13,8],["community-coast-tree",113,518,98,117,168,622,12,8],["community-small-bush",193,574,60,78,220,642,10,7],["community-flower",161,613,80,51,204,648,17,7],["southwest-tree-west",310,716,93,110,358,809,13,8],["southwest-tree-east",379,722,96,112,426,811,13,8],["event-west-bush",506,732,74,116,548,838,13,8],["event-east-tree",1109,701,103,114,1165,802,13,8],["event-east-flowers",1201,729,90,61,1250,776,17,7],["contact-coast-flowers",1379,717,78,53,1417,759,18,7],["contact-shrub-one",1255,608,42,41,1276,641,11,6],["contact-shrub-two",1290,602,44,46,1310,642,11,6],["contact-east-flower",1424,608,79,53,1464,645,17,6],["contact-east-tree",1517,545,92,116,1570,643,14,9],["contact-garden-flower",1082,558,80,53,1122,604,15,7],["studio-garden-flower",415,420,72,50,452,467,15,7],["northwest-bench",610,391,62,48,641,421,22,6],["northeast-bench",991,390,66,49,1025,421,23,6],["northwest-flag",683,330,45,98,704,410,6,8],["northeast-flag",938,328,47,98,962,412,6,8],["plaza-west-flag",686,481,46,104,709,569,7,8],["plaza-east-flag",937,480,43,104,960,567,7,8],["northwest-lamp",722,316,46,77,744,380,7,6],["northeast-lamp",899,314,44,79,920,378,7,6],["southwest-lamp",641,526,41,69,660,585,7,6],["southeast-lamp",987,526,39,69,1006,583,7,6]];
export const SCENE_OBJECTS=Object.freeze(RAW.map(([id,x,y,w,h,footX,baseY,solidRx,solidRy])=>
 Object.freeze({id,x,y,w,h,footX,baseY,solidRx,solidRy})
));
export function hitsSceneObject(x,y,w,h){
 for(const o of SCENE_OBJECTS){
   // Edge-inclusive foot rectangle versus tiny solid foot ellipse.
   const nearX=Math.max(x,Math.min(o.footX,x+w));
   const nearY=Math.max(y,Math.min(o.baseY,y+h));
   if(((nearX-o.footX)/o.solidRx)**2+((nearY-o.baseY)/o.solidRy)**2<1)return true;
 }
 return false;
}
// The foreground image already has exact alpha per pixel. Do not apply a
// second ellipse or copy an opaque rectangle of the background as before.
export function drawForegroundForPlayer(ctx,foreground,footX,footY,playerWidth=32,playerHeight=48){
 if(!foreground?.width)return;
 const left=footX-playerWidth/2,top=footY-playerHeight;
 for(const o of SCENE_OBJECTS){
  // Foot/base ordering: behind object when actor feet are north of its base.
  if(footY>=o.baseY-2)continue;
  if(left>=o.x+o.w||left+playerWidth<=o.x||top>=o.y+o.h||footY<=o.y)continue;
  // Alpha outside the actual contour is zero in 'foreground'; transparent
  // pixels leave the hero untouched regardless of crop bounds.
  ctx.drawImage(foreground,o.x,o.y,o.w,o.h,o.x,o.y,o.w,o.h);
 }
}
