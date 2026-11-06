// Pixel-classified walkable turf, roads and event sand from the APPROVED 1672×941 campus.
// Derived at 8px from the clean original artwork, bounded by the user's red shoreline.
// This supplements the cement-only mask; the detailed solid props/buildings remain separate.
const CELL=8,COLS=209,ROWS=118;
const ENCODED="||||||||||||b4-b9|aa-ba|a0-ba|9a-bb|98-bb|98-9a,9f-bc|94-94,98-9a,9f-bc|92-9a,9f-a2,ad-bc|90-9f,b0-bd|8e-9c,b2-be|8e-9c,b3-bf|8e-9c,b3-bf|8e-96,9c-9c,b3-b4,b9-bf|8e-96,9c-9d,a4-aa,b3-b3,b9-be|8c-96,9c-ae,b2-b3,b9-be|8b-97,9c-b3,b8-be|8b-a0,a7-a9,b0-b4,b8-be|8b-9e,a7-a9,b1-be|8a-94,98-9e,a7-a9,b1-b7,bb-be|8a-94,98-9e,a7-ac,b1-b7,bb-c2|89-94,98-9e,a4-a8,ac-ac,b1-b7,bb-c4|80-9e,a7-a8,b1-c4|56-5c,60-97,9d-9e,b1-b3,b8-c5|2e-2e,3e-57,5b-5c,60-77,7b-97,9d-a1,ae-b3,b8-c5|15-22,2c-2e,3e-57,5b-5c,60-77,7b-86,8a-97,9d-a1,ae-b3,b8-c6|12-22,27-27,2c-2e,3d-57,5b-5c,60-77,7b-86,8a-97,9d-b3,b8-c6|e-38,42-5c,60-77,7b-86,8a-b6,ba-c6|b-38,42-97,9d-b3,ba-c7|9-12,17-39,42-97,9d-b3,ba-c7|7-9,d-12,17-39,42-97,9d-b3,ba-c0,c4-c8|6-9,d-11,17-3a,42-55,5c-76,7a-97,9d-b3,b9-c0,c4-c8|6-9,16-3d,41-55,5c-76,7a-c0,c4-c9|6-9,16-3d,41-55,5c-76,7a-c9|6-b,14-55,5c-76,7a-9f,a3-ca|6-e,12-99,9d-9f,a3-ca|4-e,12-1f,2a-31,3a-56,5b-77,7c-99,9d-9f,a3-cb|4-e,12-1f,2a-2f,3a-47,4b-56,5b-77,7c-99,9e-9e,a5-a8,ad-ca|4-1f,2a-2f,3a-47,4b-56,5b-77,7c-9a,9e-9e,a5-a8,ad-c8|4-1f,2a-2f,39-47,4b-78,7c-9a,9e-9e,a5-a8,ad-c8|5-c8|b-c8|c-65,69-c8|c-65,69-69,6d-c8|d-65,69-69,6d-c7|f-64,69-69,6e-c5|10-64,6e-c5|10-22,26-26,2a-64,6e-c5|10-21,26-26,2b-65,6d-b0,b4-c5|f-19,1e-1f,26-26,3d-a1,ab-b0,b5-c6|f-19,1e-1f,26-26,3e-a1,ab-b0,b5-c7|f-19,1e-1f,26-26,3e-a1,ab-b0,b5-c7|f-19,26-26,3e-a1,ab-c6|f-19,25-27,3e-a7,ab-c6|f-18,24-28,3e-c6|e-18,23-29,3e-75,79-96,9b-9b,9f-a6,ab-af,b3-c7|d-18,22-2a,30-58,5c-75,7a-96,9f-a6,ab-af,b3-c9|d-18,20-2b,30-58,5c-66,6b-75,7a-96,9f-a6,ab-af,b3-bc,c0-ca|d-19,20-2c,30-58,5c-66,6b-76,7a-96,a0-a6,ab-ad,b3-bc,c0-ca|b-1b,20-2b,2f-66,6b-96,a0-a6,ab-ad,b3-bc,c0-ca|a-2b,2f-96,a0-ad,b1-ca|8-26,2a-2b,2f-66,6b-96,a0-ae,b2-ca|a-26,2a-2b,2f-66,6b-96,a0-a6,b3-ca|a-26,2a-2b,2f-66,6b-a6,b3-ca|b-2b,30-a6,b3-ca|d-2b,30-a6,b3-cb|7-7,d-2c,30-95,9a-cb|7-7,d-95,9a-cb|9-9,d-95,9a-c3,c7-cb|d-44,48-c3,c7-cb|f-44,48-96,9a-a0,a4-c3,c7-cb|f-44,48-96,9a-a0,ab-ae,b2-c3,c7-cb|f-25,2a-39,3e-96,9a-a0,ab-ae,b2-cb|a-b,f-25,2a-39,3e-65,69-6a,6f-a3,ab-ae,b2-cb|a-b,f-24,2a-39,3e-65,69-6a,6f-a3,a8-ac,b2-b2,b7-cc|4-20,24-24,2a-2f,33-35,39-39,3d-65,69-6a,6f-a3,a8-ac,b2-b2,b7-cc|4-20,24-24,2a-2f,33-35,39-a3,a8-ac,b2-b2,b7-c8|4-20,24-2f,33-35,39-63,69-6b,71-c8|6-5b,61-61,6a-6a,74-c7|a-a,f-5a,61-61,74-7b,7f-c6|a-a,13-5a,61-61,70-70,75-7a,7f-c6|13-5a,61-61,70-70,79-7a,7f-bf,c3-c6|13-4e,56-5a,61-61,70-70,79-7a,80-80,86-bc|10-4e,56-5a,61-73,79-7c,86-bc|11-4e,56-7a,87-bc|13-4e,56-7a,87-bb|15-4c,50-50,56-7a,87-b8|17-4c,50-50,55-b8|19-4c,50-50,55-5b,5f-b1,b5-b6|1b-4c,51-5b,5f-ae|1e-4b,51-5b,5f-9b,a3-ac|21-4b,51-9b,a3-aa|24-4b,4f-9a,a3-a8|28-83,87-95,a3-a6|2b-83,87-95|2e-5b,64-83,87-95|31-5a,64-75,79-95|34-5a,64-75,79-94|38-5a,64-75,79-8f,94-94|3c-5c,64-8f,94-94|40-8f|44-8e|48-8d|4c-88|50-51,58-58,5c-5c,62-67,6b-71,75-7a|";
const grid=new Uint8Array(COLS*ROWS);
ENCODED.split('|').forEach((row,y)=>{
 if(y>=ROWS||!row)return;
 row.split(',').forEach(segment=>{
  const [a,b]=segment.split('-').map(n=>parseInt(n,16));
  for(let x=a;x<=b&&x<COLS;x++)grid[y*COLS+x]=1;
 });
});
export function isGroundPixel(x,y){
 if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||y<0)return false;
 const cx=Math.floor(x/CELL),cy=Math.floor(y/CELL);
 return cx<COLS&&cy<ROWS&&!!grid[cy*COLS+cx];
}
export const GROUND_GRID={cell:CELL,cols:COLS,rows:ROWS};
