import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {STUDIO_PROJECTS} from '../src/game/data/campusContent.js';
import {LOCATIONS} from '../src/game/data/locationData.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('studio showcases genuine records with accessible expandable details',()=>{
 const page=read('src/pages/StudioPage.jsx');
 assert.ok(STUDIO_PROJECTS.length>=1);
 assert.equal(new Set(STUDIO_PROJECTS.map(p=>p.id)).size,STUDIO_PROJECTS.length);
 for(const p of STUDIO_PROJECTS){
  assert.ok(p.id&&p.title&&p.genre&&p.engine&&p.status&&p.desc);
  assert.ok(existsSync(new URL('../public'+p.image,import.meta.url)),p.id+' image');
 }
 assert.ok(page.includes("STUDIO_PROJECTS.map((proj)"));
 assert.ok(page.includes("aria-expanded={expandedProject === proj.id}"));
 assert.ok(page.includes("aria-controls={`studio-project-detail-${proj.id}`}"));
 assert.ok(page.includes("id={`studio-project-detail-${proj.id}`}"));
 assert.ok(page.includes("setExpandedProject(expandedProject === proj.id ? null : proj.id)"));
 assert.ok(page.includes("proj.id === 'nomads-headquarters'"));
});
test('studio field guide retains pitch terminal and connects to existing campus routes',()=>{
 const page=read('src/pages/StudioPage.jsx'),css=read('src/pages/StudioJourney.css');
 assert.ok(page.includes("onSubmit={handlePitchSubmit}"));
 assert.ok(page.includes("setFormData({ name: '', role: 'Developer', pitch: '' })"));
 assert.ok(page.includes("pitchSent ?"));
 assert.ok(page.includes("to=\"/\""));
 assert.ok(page.includes("to=\"/events\""));
 assert.ok(LOCATIONS.some(loc=>loc.route==='/events'));
 assert.ok(page.includes("id=\"studio-projects\""));
 assert.ok(page.includes("id=\"studio-capabilities\""));
 assert.ok(css.includes("@media(max-width:600px)"));
 assert.ok(css.includes("prefers-reduced-motion"));
 assert.ok(css.includes("focus-visible"));
});
