import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {PARTNERS,TEAM_STRUCTURE} from '../src/game/data/campusContent.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Main HQ keeps leaders and studio roles while consolidating operational teams into Allies',()=>{
 const about=read('src/pages/AboutPage.jsx');
 const allies=read('src/game/components/PinnedPartnersShowcase.jsx');
 assert.equal(TEAM_STRUCTURE.length,4);
 assert.ok(about.includes('TEAM_STRUCTURE.slice(0, 2).map'));
 assert.ok(about.includes('operations={TEAM_STRUCTURE.slice(2)}'));
 assert.ok(allies.includes('operations.map(group =>'));
 assert.ok(allies.includes('group.members.map(member =>'));
 assert.ok(allies.includes('<details'));
});

test('carousel uses the original video design and authentic partner data',()=>{
 const jsx=read('src/game/components/PinnedPartnersShowcase.jsx');
 const css=read('src/pages/AboutExplore.css');
 assert.equal(PARTNERS.length,14);
 assert.equal(new Set(PARTNERS.map(p=>p.id)).size,14);
 for(const partner of PARTNERS){
   assert.ok(partner.id&&partner.category&&partner.name&&partner.desc,partner.id);
   assert.ok(existsSync(new URL('../public'+(partner.image1x1||partner.image),import.meta.url)),partner.id);
 }
 for(const exact of ['className="showcase-pinned-track"','className="split-card"',
   'className="stage-wrapper"','className="stage-box"',
   'className={`stage-img','className="details-box"','className="meta-row"',
   'className="cat-badge"','className="accent-bar"','className="nav-bar"',
   'className="dots-group"','className="arrow-btn"']){
   assert.ok(jsx.includes(exact),exact);
 }
 assert.ok(jsx.includes('◀ PREV'));
 assert.ok(jsx.includes('NEXT ▶'));
 assert.ok(css.includes('@keyframes maskReveal'));
 assert.ok(css.includes('.stage-corner.tl'));
 assert.ok(css.includes('.split-card'));
 assert.ok(css.includes('.stage-wrapper'));
 assert.ok(css.includes('.showcase-pinned-track'));
 assert.ok(!jsx.includes('Pause partner carousel'));
});

test('featured video-style partner carousel automatically advances with safe controls',()=>{
 const jsx=read('src/game/components/PinnedPartnersShowcase.jsx');
 const css=read('src/pages/AboutExplore.css');
 assert.ok(jsx.includes('window.setInterval('));
 assert.ok(jsx.includes('ALLY_HOLD_MS = 4000'));
 assert.ok(jsx.includes('filteredPartners.length), ALLY_HOLD_MS)'));
 assert.ok(jsx.includes('window.clearInterval(timer)'));
 assert.ok(!jsx.includes('setHovered(true)'));
 assert.ok(jsx.includes('ALLY_HOLD_MS = 4000'));
 assert.ok(jsx.includes('if (focused || isReducedMotion || !pageVisible'));

 assert.ok(jsx.includes('onFocusCapture={() => setFocused(true)}'));
 assert.ok(jsx.includes('onTouchStart='));
 assert.ok(jsx.includes('onTouchEnd='));
 assert.ok(jsx.includes("prefers-reduced-motion: reduce"));
 assert.ok(jsx.includes('visibilitychange'));
 assert.ok(jsx.includes('onKeyDown={handleKeyDown}'));
 assert.ok(css.includes('.showcase-pinned-track {min-height:0;}'));
 assert.ok(css.includes('.split-card {position:relative;top:auto;}'));
});

test('only automatic Allies carousel remains; repetitive 14-logo overview is removed',()=>{
 const jsx=read('src/game/components/PinnedPartnersShowcase.jsx');
 assert.ok(jsx.includes('className="split-card"'));
 assert.ok(jsx.includes('className="dots-group"'));
 assert.ok(!jsx.includes('showcase-allies-grid'));
 assert.ok(!jsx.includes('showcase-allies-overview'));
 assert.ok(!jsx.includes('showcase-ally-tile'));
});

test('full Huddle Global wordmark remains exact user-supplied square WebP',()=>{
 const partner=PARTNERS.find(p=>p.id==='huddle-global');
 assert.ok(partner);
 assert.equal(partner.image,'/assets/partners-1x1/huddle-global-original-square.webp');
 assert.equal(partner.image1x1,partner.image);
 const data=readFileSync(new URL('../public'+partner.image,import.meta.url));
 assert.equal(data.toString('ascii',0,4),'RIFF');
 assert.equal(data.toString('ascii',8,12),'WEBP');
 assert.equal(data.toString('ascii',12,16),'VP8 ');
 assert.equal(data.readUInt16LE(26)&0x3fff,409);
 assert.equal(data.readUInt16LE(28)&0x3fff,409);
});
