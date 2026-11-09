import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { LOCATIONS } from '../src/game/data/locationData.js';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('all six campus destinations retain unique routes and actual building assets', () => {
 assert.equal(LOCATIONS.length,6);
 assert.equal(new Set(LOCATIONS.map(x=>x.route)).size,6);
 for(const location of LOCATIONS){
  assert.ok(location.displayName && location.description && location.tagline,location.id);
  assert.ok(existsSync(new URL('../public'+location.badgeAsset,import.meta.url)),location.id);
 }
});
test('single persistent Campus control remains in shared navigation, not repeated in page cards',()=>{
 const shell=read('src/game/components/GameShell.jsx');
 assert.ok(shell.includes('className="hud-return-btn"'));
 assert.ok(shell.includes('onClick={handleReturnToCampus}'));
 assert.ok(shell.includes('onClick={() => handleNav(dest.path)}'));
 assert.ok(shell.includes('<main className="shell-main-content">'));
 assert.ok(!shell.includes('campus-chapter-bridge'));
 assert.ok(!shell.includes('campus-chapter-map-link'));
 assert.ok(!shell.includes('campus-discover'));
 assert.ok(!shell.includes('footer-warp-top'));
 assert.ok(shell.includes('<div className="shell-hero-banner"'));
});