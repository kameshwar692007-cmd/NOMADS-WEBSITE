// Walkability sampled from the real 1672x941 campus art, aligned to 8px cells.
// Generated from pale cement pixels, cleaned where banner/shadows obscure paving.
// Unlike hand-wavy geometric circles, this mask excludes grassy shortcuts.
const CELL = 8;
const COLS = 209;
const ROWS = 118;
const ENCODED = "||||||||||||||||||||||||||||||||||||||65-6b|64-6c|63-6d|62-6d|62-6e|3a-41,62-6e,96-96|39-42,62-6e|39-42,62-6e,91-94|3a-42,62-6e,90-98|3a-42,58-58,5e-5e,62-6e,72-74,79-79,90-98|3a-42,57-57,5e-6e,71-74,79-79,90-98|3d-42,5e-74,79-7a,90-96|3e-42,53-53,5d-75,90-94|3e-42,53-53,5b-77,90-94|3e-42,51-52,59-77,81-82,90-94|39-39,3e-42,51-52,59-63,66-79,81-82,90-94|38-39,3e-43,4e-53,58-5f,64-66,6c-6e,73-7a,7e-83,8f-94|38-39,3e-5f,64-66,6c-6e,73-94|3e-68,6e-94|3e-63,66-66,6f-94|3f-49,4d-63,66-66,6e-72,75-84,88-97|39-3b,40-48,4f-67,6b-71,75-83,8a-92,95-97|55-71,75-7a,95-96|56-5f,63-6f,73-7a|56-5f,66-6d,73-7b|56-5f,66-6c,73-76|59-60,66-6c,71-76|59-63,66-6c,70-78|59-79|5c-79|5c-78|53-53,58-59,5d-74,7f-7f|5f-73|60-72,8c-8c|46-46,60-72,8c-8d|45-45,60-72,8d-8d|45-45,53-7f|4e-87|4d-88|4c-89|42-42,4b-8a|41-42,47-47,4a-76,7a-8b|4a-50,64-6e,85-8b|3d-3e,4a-4f,65-6d,86-8b,95-9a|19-19,1d-33,3c-3e,41-41,4a-4f,86-8b,95-9a,9f-b1|1d-1d,1f-1f,22-25,29-29,33-33,36-37,3d-41,4a-4f,60-60,86-8b,95-9a,a1-a3,a7-a7,af-b1|1f-1f,22-25,29-29,33-33,36-37,3d-3d,49-4f,5f-60,6c-6d,81-81,86-8c,95-9a,a3-a3,a7-a7,af-b1|1f-1f,22-25,29-3a,3d-3d,46-4f,60-61,64-66,69-6a,6e-6e,86-9d,a0-a0,a3-a3,a7-b7|1f-25,29-39,44-4e,61-66,69-6a,6e-6f,87-9d,a0-a3,a7-b7|13-25,29-39,43-4c,63-66,69-6b,88-a3,a7-b8|13-49,66-6a,8a-b9|13-48,8c-91,95-b9|13-47,98-b9|13-24,28-28,2b-2c,2f-46,9e-9f,a5-b1,b5-b5,b8-b8|1c-1d,36-36,39-45,9e-9f,a5-ab,ae-b0,b5-b5,b8-b8|1b-1d,39-41,9c-9f,a5-ab,ae-ae|18-1b,39-40,9a-a0,a4-ae|3b-40,99-9b|3b-40|3b-40|3b-40|3b-40|3b-40|3b-40|3b-40|3b-40|3b-40|3b-41|3b-45|39-42|39-40|3a-40|3d-40|||||||";
const grid = new Uint8Array(COLS*ROWS);
const rowStrings = ENCODED.split('|');
if (rowStrings.length !== ROWS) throw new Error('Cement mask is malformed: '+rowStrings.length+' rows');
for (let y=0; y<ROWS; y++) {
  if (!rowStrings[y]) continue;
  for (const segment of rowStrings[y].split(',')) {
    const [left,right]=segment.split('-').map(v=>parseInt(v,16));
    for(let x=left; x<=right; x++) grid[y*COLS+x]=1;
  }
}
// Restore a 3-cell-wide join on the original stone paving northwest of
// the fountain. The texture's dark edge obscures this tiny connection;
// without it HQ is isolated from the plaza for cardinal navigation.
for(let y=49;y<=51;y++)for(let x=93;x<=95;x++)grid[y*COLS+x]=1;
export function isCementPixel(x,y) {
  if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||y<0)return false;
  const cx=Math.floor(x/CELL),cy=Math.floor(y/CELL);
  return cx>=0&&cy>=0&&cx<COLS&&cy<ROWS&&grid[cy*COLS+cx]===1;
}
export const CEMENT_MASK_GRID={cell:CELL,cols:COLS,rows:ROWS};
