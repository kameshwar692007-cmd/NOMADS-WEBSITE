import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Esports revamp keeps real tournament filtering, carousel and admin data',()=>{
 const page=read('src/pages/EsportsPage.jsx');
 assert.ok(page.includes('arena-revamp-hero'));
 assert.ok(page.includes('allTournaments.length'));
 assert.ok(page.includes('visibleTournaments.map('));
 assert.ok(page.includes('handleFilterChange'));
 assert.ok(page.includes('handleRegisterClick'));
 assert.ok(!page.includes('Structured Esports & Collegiate Tournaments</h2>'));
});
test('Esports hero is compact on mobile and accessible',()=>{
 const css=read('src/pages/EsportsArenaGuide.css');
 const page=read('src/pages/EsportsPage.jsx');
 assert.ok(css.includes('@media(max-width:760px)'));
 assert.ok(css.includes('grid-template-columns:1fr'));
 assert.ok(css.includes('prefers-reduced-motion:reduce'));
 assert.ok(page.includes('href="#esports-circuits-heading"'));
 assert.ok(css.includes('.arena-revamp-link:focus-visible'));
});
