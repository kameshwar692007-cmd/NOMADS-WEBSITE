import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Studio cards keep description and expand action separate without empty flex fill',()=>{
 const css=read('src/pages/StudioJourney.css');
 const page=read('src/pages/StudioPage.jsx');
 assert.ok(page.includes('className="project-desc"'));
 assert.ok(page.includes('className="studio-project-expand"'));
 for(const value of ['.studio-project-grid .project-desc{','margin:0 0 20px','flex:none','margin-top:0','align-items:start','height:auto','margin-bottom:22px'])
   assert.ok(css.includes(value),value);
});
test('Event cards provide safe CTA gap on phones',()=>{
 const css=read('src/pages/EventGroundsGuide.css');
 const page=read('src/pages/EventsPage.jsx');
 assert.ok(page.includes('className="event-card-action"'));
 assert.ok(page.includes('className="event-card-desc"'));
 for(const value of ['.events-grid .event-card-action{','margin-top:22px!important','min-height:46px','line-height:1.7'])
   assert.ok(css.includes(value),value);
});
test('Tournament cards retain readable spacing and mobile tap targets',()=>{
 const css=read('src/pages/EsportsArenaGuide.css');
 const page=read('src/pages/EsportsPage.jsx');
 assert.ok(page.includes('className="tourney-desc"'));
 for(const value of ['.esports-carousel-card .tourney-desc{','margin-bottom:20px','min-height:50px','overflow-wrap:anywhere'])
   assert.ok(css.includes(value),value);
});
