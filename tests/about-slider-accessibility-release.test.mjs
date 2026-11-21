import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('About destination slider exists on main and retains navigation',()=>{
 const page=read('src/pages/AboutPage.jsx');
 const slider=read('src/pages/ProvinceSlider.jsx');
 assert.ok(page.includes('<ProvinceSlider destinations='));
 assert.ok(slider.includes('SLIDE_INTERVAL_MS = 5500'));
 assert.ok(slider.includes('aria-label="Previous destination"'));
 assert.ok(slider.includes('aria-label="Next destination"'));
});
test('Automatic slides stop on focus, hover, hidden tab and reduced motion',()=>{
 const slider=read('src/pages/ProvinceSlider.jsx');
 for(const token of ['hovered || focused || paused || reducedMotion','pageVisible, count, hovered, focused, paused, reducedMotion','visibilitychange','prefers-reduced-motion: reduce','window.clearInterval(timer)','aria-pressed={paused}'])assert.ok(slider.includes(token),token);
});
