import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { LOCATIONS } from '../src/game/data/locationData.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('all six campus destinations map to unique functional routes and checked-in icons', () => {
  assert.equal(LOCATIONS.length, 6);
  assert.equal(new Set(LOCATIONS.map(loc => loc.route)).size, 6);
  for (const location of LOCATIONS) {
    assert.ok(location.displayName && location.description && location.tagline, location.id);
    assert.ok(location.badgeAsset.startsWith('/assets/game/ui/'), location.id);
    assert.ok(existsSync(new URL('../public' + location.badgeAsset, import.meta.url)), location.id);
  }
});

test('shared destination bridge uses the existing campus data and preserves navigation', () => {
  const shell = read('src/game/components/GameShell.jsx');
  const style = read('src/game/components/CampusContinuity.css');
  assert.match(shell, /LOCATIONS\.find\(\(item\) => item\.route === location\.pathname\)/);
  assert.match(shell, /className="campus-chapter-bridge"/);
  assert.match(shell, /campusLocation\.displayName/);
  assert.match(shell, /campusLocation\.description/);
  assert.match(shell, /chapterNpc\.portraitIndex/);
  assert.match(shell, /campus-chapter-character/);
  assert.match(shell, /talkToNpc\(chapterNpc, true\)/);
  assert.match(shell, /onClick=\{handleReturnToCampus\}/);
  assert.match(shell, /onClick=\{\(\) => handleNav\(dest\.path\)\}/);
  assert.match(shell, /<main className="shell-main-content">/);
  assert.match(style, /prefers-reduced-motion/);
  assert.match(style, /max-width:800px/);
});
