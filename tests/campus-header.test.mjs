import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';

const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const size = path => statSync(new URL('../'+path,import.meta.url)).size;

test('official badge is a valid WebP and bundled',()=>{
 const path='public/assets/game/headquarters-banner.webp';
 const data=readFileSync(new URL('../'+path,import.meta.url));
 assert.equal(data.toString('ascii',0,4),'RIFF');
 assert.equal(data.toString('ascii',8,12),'WEBP');
 assert.ok(size(path)>2000,'banner file should not be empty');
});
test('old logo removed from canvas and replaced with clean terrain',()=>{
 const r=read('src/game/systems/renderer.js');
 const a=read('src/game/systems/assetLoader.js');
 assert.ok(r.includes("world/header-left"));
 assert.ok(r.includes("world/header-right"));
 assert.ok(!r.includes('drawWorldDirectory'));
 assert.ok(a.includes('header-clean-left.webp'));
 assert.ok(a.includes('header-clean-right.webp'));
 assert.ok(size('public/assets/game/header-clean-left.webp')>500);
 assert.ok(size('public/assets/game/header-clean-right.webp')>500);
});
test('all header controls are fixed and accessible',()=>{
 const header=read('src/game/components/Header.jsx');
 const page=read('src/pages/HomePage.jsx');
 const css=read('src/App.css');
 for(const event of ['onDirectoryOpen','onMapOpen','onMenuOpen']){
  assert.ok(header.includes('onClick={'+event+'}'),event+' should be clickable');
  assert.ok(page.includes(event));
 }
 assert.ok(css.includes('.campus-fixed-header'));
 assert.match(css,/\.campus-fixed-header\s*\{[^}]*position:fixed/s);
 assert.match(css,/\.campus-fixed-header\s*\{[^}]*z-index:60/s);
 assert.ok(!page.includes('isMobile && <Header'),'header must exist at every viewport size');
});

test('enhanced logo is a self-contained scalable SVG used by the campus header',()=>{
 const svg=read('public/assets/game/headquarters-banner-hd.svg');
 assert.ok(svg.includes('viewBox="0 0 900 260"'));
 assert.ok(svg.includes('NOMAD’S PROVINCE'));
 assert.ok(svg.includes('HEADQUARTERS'));
 assert.ok(svg.includes('linearGradient'));
 assert.ok(!svg.includes('<image '),'SVG should be self-contained and never depend on external bitmap files');
 const header=read('src/game/components/Header.jsx');
 assert.ok(header.includes('src="/assets/game/headquarters-banner-hd.svg"'));
 assert.ok(header.includes("image.src = '/assets/game/headquarters-banner.webp'"));
 assert.ok(!header.includes('src="/assets/game/headquarters-banner-hd.png"'));
});
