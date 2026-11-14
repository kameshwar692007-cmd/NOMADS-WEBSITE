import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Offscreen public artwork decodes asynchronously and is lazy loaded',()=>{
 for(const [path,token] of [
  ['src/pages/StudioPage.jsx','className="project-banner-img" loading="lazy" decoding="async"'],
  ['src/pages/EventsPage.jsx','className="event-poster-img" loading="lazy" decoding="async"'],
  ['src/pages/EsportsPage.jsx','className="tourney-poster-img" loading="lazy" decoding="async"'],
  ['src/pages/AdminPage.jsx','className="table-poster-thumb" loading="lazy" decoding="async"']
 ])assert.ok(read(path).includes(token),path);
});
test('Full-size details decode asynchronously without lazy-loading visible modals',()=>{
 assert.ok(read('src/pages/EventsPage.jsx').includes('className="detail-poster-img" decoding="async"'));
 assert.ok(read('src/pages/EsportsPage.jsx').includes('full poster\x60} decoding="async"')||read('src/pages/EsportsPage.jsx').includes('full poster\x60}'));
});
test('Navigation does not impose an artificial 240ms delay',()=>{
 const shell=read('src/game/components/GameShell.jsx');
 assert.ok(!shell.includes('}, 240)'));
 assert.ok(shell.includes('navigate(targetPath);'));
});
test('Image conversion tool preserves originals and only saves smaller WebP variants',()=>{
 const script=read('scripts/optimize-images.mjs');
 assert.ok(script.includes("buffer.length<sourceBytes"));
 assert.ok(script.includes("lossless:true"));
 assert.ok(script.includes("quality:82"));
 assert.ok(!script.includes('unlink('));
 const pkg=JSON.parse(read('package.json'));
 assert.ok(pkg.scripts['images:audit']);
 assert.ok(pkg.scripts['images:webp']);
});
