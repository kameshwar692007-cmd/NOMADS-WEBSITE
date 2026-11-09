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
 assert.ok(!about.includes('Collegiate & Community Marshals</h3>'));
});
test('Partner carousel uses all real partner records and existing logos without fake placeholders',()=>{
 const jsx=read('src/game/components/PinnedPartnersShowcase.jsx');
 assert.equal(PARTNERS.length,14);
 assert.equal(new Set(PARTNERS.map(p=>p.id)).size,PARTNERS.length);
 assert.ok(PARTNERS.some(p=>p.id==='huddle-global'));
 for(const partner of PARTNERS){
   assert.ok(partner.id&&partner.category&&partner.name&&partner.desc,partner.id);
   const asset=partner.image1x1||partner.image;
   assert.ok(existsSync(new URL('../public'+asset,import.meta.url)),partner.id);
 }
 assert.ok(jsx.includes('partners.filter(matcher)'));
 assert.ok(jsx.includes('active.image1x1 || active.image'));
 assert.ok(jsx.includes('aria-label="Previous partner"'));
 assert.ok(jsx.includes('aria-label="Next partner"'));
 assert.ok(jsx.includes('onTouchStart='));
 assert.ok(jsx.includes('onTouchEnd='));
 assert.ok(jsx.includes('onFocusCapture='));
 assert.ok(jsx.includes('prefers-reduced-motion: reduce'));
 assert.ok(jsx.includes('window.clearInterval(timer)'));
});
test('Partner carousel is compact and supports mobile / keyboard focus',()=>{
 const css=read('src/pages/AboutExplore.css');
 assert.ok(css.includes('.hq-partner-slide'));
 assert.ok(css.includes('.hq-operations-compact'));
 assert.ok(css.includes('max-width:520px'));
 assert.ok(css.includes('focus-visible'));
 assert.ok(css.includes('prefers-reduced-motion:reduce'));
});
