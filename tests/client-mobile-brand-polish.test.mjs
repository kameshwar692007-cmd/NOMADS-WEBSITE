import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { PARTNERS } from '../src/game/data/campusContent.js';
const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');

test('client logo assets exist and brand intro goes straight to campus', () => {
 const brand = read('public/assets/branding/nomads-client-logo.svg');
 const huddle = read('public/assets/branding/huddle-client-logo.svg');
 assert.ok(brand.startsWith('<svg') && brand.includes('viewBox="0 0 514 410"'));
 assert.ok(huddle.startsWith('<svg') && huddle.includes('aria-label="Huddle"'));
 const intro = read('src/game/components/LogoRevolver.jsx');
 const home = read('src/pages/HomePage.jsx');
 assert.ok(intro.includes('nomads-client-logo.svg'));
 assert.ok(intro.includes('ENTER THE PROVINCE'));
 assert.ok(intro.includes('window.setTimeout(onComplete'));
 assert.ok(intro.includes('prefers-reduced-motion'));
 assert.ok(!intro.includes('BookIntro'));
 assert.ok(home.includes('onLogoReplay={replayIntro}'));
 assert.ok(home.includes('key={introReplayKey}'));
 assert.ok(!home.includes('setNpcDialogue(HERO_GUIDE)'));
});
test('Huddle Global uses the uploaded Huddle symbol instead of placeholder partner image', () => {
 const partner = PARTNERS.find(item => item.id === 'huddle-global');
 assert.ok(partner);
 assert.equal(partner.image1x1, '/assets/branding/huddle-client-logo.svg');
 assert.equal(partner.image, '/assets/branding/huddle-client-logo.svg');
 assert.ok(existsSync(new URL('../public' + partner.image, import.meta.url)));
});
test('campus logo replay and mobile menu remain accessible', () => {
 const header = read('src/game/components/Header.jsx');
 const css = read('src/App.css');
 const shellCss = read('src/GamifiedPages.css');
 assert.ok(header.includes('onClick={onLogoReplay}'));
 assert.ok(header.includes('aria-label="Open website menu"'));
 assert.ok(header.includes('campus-menu-button'));
 assert.ok(css.includes('.campus-fixed-brand'));
 assert.ok(css.includes('.campus-menu-button'));
 assert.ok(shellCss.includes('.gamified-shell{overflow-x:clip;overflow-y:visible;}'));
 assert.ok(shellCss.includes('.gamified-shell .hud-sandwich-btn{display:inline-flex!important'));
});
test('mobile joystick drives the existing movement model and Studio project cards need no re-assembly', () => {
 const game = read('src/game/components/GameCanvas.jsx');
 const controls = read('src/game/components/GameControls.css');
 const studio = read('src/pages/StudioPage.jsx');
 assert.ok(game.includes('startJoystick'));
 assert.ok(game.includes('moveJoystick'));
 assert.ok(game.includes('endJoystick'));
 assert.ok(game.includes('touchRef.current='));
 assert.ok(game.includes('campus-joystick-base'));
 assert.ok(!game.includes('campus-dpad-key'));
 assert.ok(controls.includes('touch-action:none'));
 assert.ok(!studio.includes('<BlueprintAssembler'));
 assert.ok(!studio.includes('RE-ASSEMBLE'));
 assert.ok(studio.includes('studio-project-grid'));
 assert.ok(studio.includes('STUDIO_PROJECTS.map((proj)'));
});
