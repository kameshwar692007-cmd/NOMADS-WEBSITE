import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ORG_INFO } from '../src/game/data/campusContent.js';
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

test('contact page enforces strict three-section order, verified channels and accessible FAQ',()=>{
 const p=read('src/pages/ContactPage.jsx');
 
 // Enforce client requirement: exactly three main sections in order: 1. Form, 2. Direct Channels, 3. FAQ
 const formPos = p.indexOf('id="contact-form-heading"');
 const channelsPos = p.indexOf('id="contact-channels-heading"');
 const faqPos = p.indexOf('id="contact-faq-heading"');
 
 assert.ok(formPos !== -1, 'Section 1 (Contact Form) must exist');
 assert.ok(channelsPos !== -1, 'Section 2 (Direct Channels) must exist');
 assert.ok(faqPos !== -1, 'Section 3 (FAQ) must exist');
 assert.ok(formPos < channelsPos, 'Contact Form must precede Direct Channels');
 assert.ok(channelsPos < faqPos, 'Direct Channels must precede FAQ');

 // Ensure Quest Board and redundant destination navigation are removed
 assert.ok(!p.includes('contact-journey-links'), 'Quest Board links must be removed per client specification');
 assert.ok(!p.includes('QUEST BOARD'), 'Quest Board header must be removed');

 // Verified channels and direct communication links preserved
 assert.ok(p.includes('href={ORG_INFO.whatsapp}'));
 assert.ok(p.includes('href={ORG_INFO.instagram}'));
 assert.ok(p.includes(`mailto:\${ORG_INFO.email}`));
 assert.ok(p.includes('{ORG_INFO.location}'));

 // Accessible FAQ and form interaction preserved
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
