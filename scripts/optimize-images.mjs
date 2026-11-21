// Audit static images and optionally create optimized WebP counterparts.
// Usage: node scripts/optimize-images.mjs --report
//        node scripts/optimize-images.mjs --convert
// Conversion does not delete originals or rewrite application references.
import {readdir,stat,mkdir,writeFile} from 'node:fs/promises';
import {join,extname,relative,dirname} from 'node:path';
import sharp from 'sharp';

const root='public';
const convert=process.argv.includes('--convert');
const eligible=new Set(['.jpg','.jpeg','.png']);
const rows=[];
async function walk(dir){
 for(const ent of await readdir(dir,{withFileTypes:true})){
  const full=join(dir,ent.name);
  if(ent.isDirectory()) {await walk(full);continue;}
  if(!ent.isFile()||!eligible.has(extname(ent.name).toLowerCase()))continue;
  const sourceBytes=(await stat(full)).size;
  const metadata=await sharp(full).metadata();
  const target=full.replace(/\.(jpe?g|png)$/i,'.webp');
  // Lossless for transparency / pixel art; use quality 82 for photographs.
  const isPixelArt=/sprite|tile|pixel|character|npc/i.test(full);
  const pipeline=sharp(full).webp(isPixelArt?{lossless:true,effort:5}:{quality:82,effort:5});
  let webpBytes=null;
  if(convert){
   const buffer=await pipeline.toBuffer();
   webpBytes=buffer.length;
   // Avoid introducing larger files; preserve the source as fallback.
   if(buffer.length<sourceBytes){
    await mkdir(dirname(target),{recursive:true});
    await writeFile(target,buffer);
   }
  }
  rows.push({file:relative(root,full),width:metadata.width,height:metadata.height,
   originalKB:Math.round(sourceBytes/1024),webpKB:webpBytes===null?null:Math.round(webpBytes/1024),
   savedPercent:webpBytes===null?null:Math.round(100*(1-webpBytes/sourceBytes)),
   output:convert&&webpBytes<sourceBytes?relative(root,target):null});
 }
}
await walk(root);
rows.sort((a,b)=>b.originalKB-a.originalKB);
console.table(rows.slice(0,40));
console.log('Total static PNG/JPEG:',rows.length,'Original KB:',rows.reduce((a,x)=>a+x.originalKB,0));
if(convert)console.log('WebP variants written when smaller. Review image fidelity and update references explicitly before removing originals.');
