import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ORG_INFO } from '../src/game/data/campusContent.js';
import { LOCATIONS } from '../src/game/data/locationData.js';
const read = p => readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('contact handoff keeps form contents until visitor explicitly sends',()=>{
 const p=read('src/pages/ContactPage.jsx');
 assert.ok(p.includes('const [draftReady, setDraftReady] = useState(false)'));
 assert.ok(p.includes('setDraftReady(true)'));
 assert.ok(p.includes('setDraftReady(false)'));
 assert.ok(p.includes('mailto:${ORG_INFO.email}?subject='));
 assert.ok(p.includes('encodeURIComponent(messageSubject)'));
 assert.ok(p.includes('encodeURIComponent(messageBody)'));
 assert.ok(p.includes('https://api.whatsapp.com/send?text=${encodeURIComponent(messageBody)}'));
 assert.ok(p.includes('href={emailUrl}'));
 assert.ok(p.includes('href={whatsappShareUrl}'));
 assert.ok(p.includes('Choose the recipient yourself'));
 assert.ok(p.includes('It has <strong>not been sent</strong>'));
 assert.ok(!p.includes('setSubmitted(true)'));
 assert.ok(!p.includes('INQUIRY TRANSMITTED'));
 assert.ok(!p.includes('setFormData({ name:'));
 assert.ok(ORG_INFO.email.includes('@'));
});
test('contact guide follows real campus destinations and keeps FAQ and verified channels',()=>{
 const p=read('src/pages/ContactPage.jsx');
 for(const route of ['/events','/studio','/community']){
   assert.ok(LOCATIONS.some(l=>l.route===route));
   assert.ok(p.includes('to="'+route+'"'));
 }
 assert.ok(p.includes('href={ORG_INFO.whatsapp}'));
 assert.ok(p.includes('href={ORG_INFO.instagram}'));
 assert.ok(p.includes('aria-expanded={activeFaq === idx}'));
 assert.ok(p.includes('aria-controls={`contact-faq-answer-${idx}`}'));
 assert.ok(p.includes('id={`contact-faq-answer-${idx}`}'));
 assert.ok(p.includes('onSubmit={handleSubmit}'));
 assert.ok(p.includes('aria-pressed={dispatchMethod ==='));
});
test('contact UI remains mobile and keyboard friendly',()=>{
 const css=read('src/pages/ContactJourney.css');
 assert.ok(css.includes('@media(max-width:480px)'));
 assert.ok(css.includes('focus-visible'));
 assert.ok(css.includes('prefers-reduced-motion'));
});
