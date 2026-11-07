import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PNG } from 'pngjs';

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

test('official client logo decodes in full and is displayed in campus header', () => {
 const path = 'public/assets/game/headquarters-banner-client.png';
 const bytes = readFileSync(new URL('../'+path, import.meta.url));
 const hash = createHash('sha256').update(bytes).digest('hex');
 assert.equal(hash, 'ece30d54027a47d00a786d14da0f0aa2646f1b28c33039714757b35772c36d36');
 const decoded = PNG.sync.read(bytes);
 assert.equal(decoded.width, 600);
 assert.equal(decoded.height, 212);
 assert.ok(decoded.data.some((channel, index) => index % 4 === 3 && channel > 0), 'visible logo pixels');
 const header = read('src/game/components/Header.jsx');
 assert.ok(header.includes('src="/assets/game/headquarters-banner-client.png"'));
 assert.ok(header.includes("image.src = '/assets/game/headquarters-banner.webp'"));
});
