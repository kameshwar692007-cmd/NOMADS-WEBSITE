import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LOCATIONS } from '../src/game/data/locationData.js';
import { ORG_INFO, AMBASSADOR_PERKS } from '../src/game/data/campusContent.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('community guild routes connect to real campus destinations and preserve existing perks',()=>{
 const page=read('src/pages/CommunityPage.jsx');
 assert.ok(page.includes('className="community-journey gamified-card"'));
 for (const route of ['/esports','/studio','/events']){
   assert.ok(LOCATIONS.some(location=>location.route===route), route);
   assert.ok(page.includes("to: '"+route+"'"));
 }
 assert.ok(page.includes('AMBASSADOR_PERKS.map'));
 assert.ok(AMBASSADOR_PERKS.length>3);
 assert.ok(page.includes('href={ORG_INFO.whatsapp}'));
 assert.ok(page.includes('href={ORG_INFO.instagram}'));
});
test('ambassador form creates a prefilled email draft, never claiming backend delivery',()=>{
 const page=read('src/pages/CommunityPage.jsx');
 assert.ok(ORG_INFO.email.includes('@'));
 assert.ok(page.includes('setApplicationReady(true)'));
 assert.ok(page.includes('applicationMailto = `mailto:${ORG_INFO.email}?subject='));
 assert.ok(page.includes('encodeURIComponent(applicationBody)'));
 assert.ok(page.includes('formData.name.trim()'));
 assert.ok(page.includes('formData.college.trim()'));
 assert.ok(page.includes('formData.email.trim()'));
 assert.ok(page.includes('formData.phone.trim()'));
 assert.ok(page.includes('formData.reason.trim()'));
 assert.ok(page.includes('href={applicationMailto}'));
 assert.ok(page.includes('No application has been sent yet.'));
 assert.ok(page.includes('Edit application'));
 assert.ok(page.includes('onSubmit={handleAmbassadorSubmit}'));
 assert.ok(!page.includes('APPLICATION SUBMITTED:'));
 assert.ok(page.includes('PREPARE APPLICATION EMAIL'));
 assert.ok(!page.includes('setTimeout(() => setApplied'));
});
test('new community interactions support small screens, keyboard focus, and reduced motion',()=>{
 const page=read('src/pages/CommunityPage.jsx');
 const css=read('src/pages/CommunityJourney.css');
 assert.ok(page.includes('htmlFor')===false || page.includes('community-journey'));
 assert.ok(page.includes('aria-labelledby="community-journey-title"'));
 assert.ok(page.includes('id="community-apply"'));
 assert.ok(css.includes('@media(max-width:820px)'));
 assert.ok(css.includes('focus-visible'));
 assert.ok(css.includes('prefers-reduced-motion'));
});
