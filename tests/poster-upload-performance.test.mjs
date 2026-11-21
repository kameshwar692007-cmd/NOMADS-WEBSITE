import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Poster compression is loss-aware, dimension-preserving and GIF-safe',async()=>{
 const {optimizePosterUpload}=await import('../src/lib/optimizePosterUpload.js');
 const png={type:'image/png',size:800,name:'test.png'};
 const gif={type:'image/gif',size:800,name:'animated.gif'};
 assert.equal(await optimizePosterUpload(png),png); // node lacks browser canvas
 assert.equal(await optimizePosterUpload(gif),gif);
 const source=read('src/lib/optimizePosterUpload.js');
 assert.ok(source.includes('canvas.width=bitmap.width'));
 assert.ok(source.includes('canvas.height=bitmap.height'));
 assert.ok(source.includes('blob.size>=file.size'));
 assert.ok(source.includes("image/webp"));
 assert.ok(!source.includes("image/gif'"));
});
test('Both upload services optimize before Supabase upload and preserve accurate MIME',()=>{
 for(const path of ['src/game/services/eventService.js','src/game/services/studioService.js']){
  const source=read(path);
  assert.ok(source.includes('await optimizePosterUpload(file)'),path);
  assert.ok(source.includes('contentType: optimized.type'),path);
  assert.ok(source.includes("cacheControl: '31536000'"),path);
  assert.match(source,/optimized\.size\s*>\s*5\s*\*/);
 }
});
test('Vercel cache policy targets only static assets, not HTML or API data',()=>{
 const config=JSON.parse(read('vercel.json'));
 assert.equal(config.headers.length,1);
 assert.equal(config.headers[0].source,'/assets/(.*)');
 assert.ok(config.headers[0].headers[0].value.includes('stale-while-revalidate'));
});
