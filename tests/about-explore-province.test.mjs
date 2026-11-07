import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { LOCATIONS } from '../src/game/data/locationData.js';

const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

test('About links to exactly the other five real campus destinations', () => {
  const code=read('src/pages/AboutPage.jsx');
  const other=LOCATIONS.filter(item => item.route !== '/about');
  assert.equal(other.length,5);
  assert.match(code, /LOCATIONS\.filter\(\(destination\) => destination\.route !== '\/about'\)/);
  assert.match(code, /to=\{destination\.route\}/);
  assert.match(code, /destination\.badgeAsset/);
  assert.match(code, /destination\.description/);
  assert.match(code, /aria-label=\{'View more about '/);
  assert.match(code, /to="\/"/);
  for (const item of other) {
    assert.ok(existsSync(new URL('../public'+item.badgeAsset, import.meta.url)), item.id);
  }
});

test('About destination cards are responsive and accessible',()=>{
  const css=read('src/pages/AboutExplore.css');
  const shell=read('src/game/components/GameShell.jsx');
  assert.match(css,/max-width:760px/);
  assert.match(css,/focus-visible/);
  assert.match(css,/prefers-reduced-motion/);
  assert.match(shell,/IntersectionObserver/);
  assert.match(shell,/\.gamified-card/);
});
