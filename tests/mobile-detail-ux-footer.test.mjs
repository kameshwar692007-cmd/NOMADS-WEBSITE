import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('staff entry is in the shared footer, not Event Grounds',()=>{
 const shell=read('src/game/components/GameShell.jsx');
 const events=read('src/pages/EventsPage.jsx');
 const admin=read('src/pages/AdminPage.jsx');
 assert.ok(shell.includes('className="footer-admin-link"'));
 assert.ok(shell.includes('to="/admin"'));
 assert.ok(!events.includes('admin-portal-link'));
 assert.ok(!admin.includes('owner@nomadsprovince.com'));
 assert.ok(!admin.includes('admin@nomadsprovince.com'));
});
test('responsive styles are installed across every shared destination',()=>{
 const shell=read('src/game/components/GameShell.jsx');
 const css=read('src/pages/MobileExperience.css');
 assert.ok(shell.includes("import '../../pages/MobileExperience.css'"));
 for(const token of [
  '.retro-modal-card','.event-detail-modal','.studio-project-detail',
  '.event-detail-page-grid','.admin-section-tabs','.shell-footer',
  '@media(max-width:900px)','@media(max-width:600px)',
  '@media(max-width:380px)','prefers-reduced-motion',
  'safe-area-inset-bottom','max-height:100dvh','overscroll-behavior:contain'
 ])assert.ok(css.includes(token),token);
});
test('event and tournament quick-view modals are accessible and scroll bounded',()=>{
 const events=read('src/pages/EventsPage.jsx');
 const esports=read('src/pages/EsportsPage.jsx');
 const css=read('src/pages/MobileExperience.css');
 assert.ok(events.includes('aria-modal="true"'));
 assert.ok(events.includes('aria-labelledby="event-quick-view-title"'));
 assert.ok(events.includes('aria-label="Close event details"'));
 assert.ok(esports.includes('aria-modal="true"'));
 assert.ok(css.includes('overflow-y:auto'));
 assert.ok(css.includes('object-fit:contain'));
});
test('dedicated event detail no longer enforces 300px column on small devices',()=>{
 const detail=read('src/pages/EventDetailPage.jsx');
 const css=read('src/pages/MobileExperience.css');
 assert.ok(!detail.includes("gridTemplateColumns: 'minmax(300px, 420px) 1fr'"));
 assert.ok(css.includes('grid-template-columns:minmax(0,1fr)!important'));
});
