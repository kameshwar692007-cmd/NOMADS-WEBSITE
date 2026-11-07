import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { LOCATIONS } from '../src/game/data/locationData.js';
import { CAMPUS_NPCS } from '../src/game/data/npcDialogues.js';

const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

test('About uses one carousel for all five real destinations', () => {
  const about = read('src/pages/AboutPage.jsx');
  const slider = read('src/pages/ProvinceSlider.jsx');
  const other = LOCATIONS.filter(item => item.route !== '/about');
  assert.equal(other.length, 5);
  assert.ok(about.includes('destinations={LOCATIONS.filter(destination => destination.route !=='));
  assert.ok(about.includes('<ProvinceSlider'));
  assert.ok(!about.includes('province-explore-grid'));
  assert.ok(slider.includes('destinations[activeIndex % count]'));
  assert.ok(slider.includes('to={destination.route}'));
  assert.ok(slider.includes('destination.description'));
  assert.ok(slider.includes("aria-label={'View more about ' + destination.displayName}"));
  assert.ok(about.includes('to="/"'));
  for (const item of other) {
    assert.ok(CAMPUS_NPCS.some(npc => npc.route === item.route), item.route);
    assert.ok(existsSync(new URL('../public' + item.badgeAsset, import.meta.url)), item.id);
  }
});

test('slider auto-advances and supports navigation, pause and reduced motion', () => {
  const slider = read('src/pages/ProvinceSlider.jsx');
  assert.ok(slider.includes('SLIDE_INTERVAL_MS = 5500'));
  assert.ok(slider.includes('window.setInterval('));
  assert.ok(slider.includes('window.clearInterval(timer)'));
  assert.ok(slider.includes('setActiveIndex(index => (index + 1) % count)'));
  assert.ok(slider.includes('onMouseEnter={() => setHovered(true)}'));
  assert.ok(slider.includes('onMouseLeave={() => setHovered(false)}'));
  assert.ok(slider.includes('onFocusCapture={() => setFocused(true)}'));
  assert.ok(slider.includes('prefers-reduced-motion: reduce'));
  assert.ok(slider.includes('visibilitychange'));
  assert.ok(slider.includes('aria-label="Previous destination"'));
  assert.ok(slider.includes('aria-label="Next destination"'));
  assert.ok(slider.includes('aria-pressed={manualPause}'));
  assert.ok(slider.includes('<NpcPortrait portraitIndex={npc.portraitIndex}'));
});

test('slider has mobile layouts and spacing matches shared content cards', () => {
  const css = read('src/pages/AboutExplore.css');
  const shared = read('src/GamifiedPages.css');
  assert.match(css, /max-width:760px/);
  assert.match(css, /max-width:520px/);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.ok(css.includes('province-slider-card.gamified-card'));
  assert.ok(css.includes('padding: clamp(22px, 3.5vw, 40px)'));
  assert.ok(shared.includes('Consistent content breathing room across inner pages'));
  assert.ok(shared.includes('.shell-main-content > .gamified-card'));
  assert.ok(shared.includes('margin-top: max(32px, 3vw)'));
});
