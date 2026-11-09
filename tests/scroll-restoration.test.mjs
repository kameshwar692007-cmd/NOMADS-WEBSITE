import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('html/body allow normal wheel and touch scrolling sitewide', () => {
 const css=read('src/App.css');
 const global=css.match(/html, body\s*\{([^}]*)\}/s)?.[1];
 assert.ok(global,'global html body styles missing');
 assert.ok(global.includes('overflow-y: auto;'));
 assert.ok(global.includes('touch-action: auto;'));
 assert.ok(!global.includes('overflow: hidden;'));
 assert.ok(!global.includes('touch-action: none;'));
});
test('interactive campus still isolates game gestures and leaves dialogs scrollable', () => {
 const css=read('src/App.css');
 const home=read('src/pages/HomePage.jsx');
 assert.ok(css.includes('.game-viewport {'));
 assert.match(css,/\.game-viewport\s*\{[^}]*touch-action: none;/s);
 assert.ok(css.includes('.world-canvas{touch-action:none;'));
 assert.ok(!home.includes("document.addEventListener('touchmove'"));
 assert.ok(!home.includes('e.preventDefault();'));
});
test('inner pages preserve native scrolling and keyboard arrows', () => {
 const shell=read('src/GamifiedPages.css');
 const game=read('src/game/components/GameCanvas.jsx');
 assert.ok(shell.includes('overflow-y:visible'));
 assert.ok(game.includes("ArrowDown:'down'"),'campus arrow keys should move player');
 assert.ok(game.includes("window.addEventListener('keydown',onKeyDown)"));
});

test('Stitch cursor effect never deadlocks user scroll', () => {
 const component=read('src/game/components/StitchCursorBuilder.jsx');
 const styles=read('src/GamifiedPages.css');
 assert.ok(component.includes('syncPositionWithScroll'));
 assert.ok(!component.includes('setPageScrollLocked('));
 assert.ok(!component.includes("classList.add('stitch-scroll-locked')"));
 assert.ok(!styles.includes('html.stitch-scroll-locked'));
});
