import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Admin login belongs to shared footer, not public events callout',()=>{
 const shell=read('src/game/components/GameShell.jsx');
 const events=read('src/pages/EventsPage.jsx');
 const admin=read('src/pages/AdminPage.jsx');
 assert.ok(shell.includes('className="footer-admin-link"'));
 assert.ok(shell.includes("navigate('/admin')"));
 assert.ok(!events.includes('to="/admin"'));
 assert.ok(!events.includes('admin-portal-link'));
 assert.ok(!admin.includes('owner@nomadsprovince.com'));
 assert.ok(!shell.includes('owner@nomadsprovince.com'));
});

test('event and tournament dialogs remain labeled and closeable on narrow screens',()=>{
 const events=read('src/pages/EventsPage.jsx');
 const esports=read('src/pages/EsportsPage.jsx');
 const css=read('src/GamifiedPages.css');
 assert.ok(events.includes('mobile-detail-dialog'));
 assert.ok(events.includes('aria-modal="true"'));
 assert.ok(events.includes('aria-label="Close event details"'));
 assert.ok(esports.includes('tournament-detail-dialog mobile-detail-dialog'));
 assert.ok(esports.includes('aria-label="Close registration dialog"'));
 for(const term of ['height:100dvh','max-height:100dvh','overflow-y:auto','grid-template-columns:minmax(0,1fr)!important',
  '.event-detail-page-grid','.tournament-detail-content .modal-specs-summary p',
  'object-fit:contain','.event-detail-modal.mobile-detail-dialog .detail-content-wrap']){
   assert.ok(css.includes(term),term);
 }
});

test('Studio details and footer tap targets are optimized for mobile',()=>{
 const studio=read('src/pages/StudioPage.jsx');
 const css=read('src/GamifiedPages.css');
 assert.ok(studio.includes('aria-expanded={expandedProject === proj.id}'));
 assert.ok(css.includes('.studio-project-detail strong{text-align:left'));
 assert.ok(css.includes('.footer-admin-link'));
 assert.ok(css.includes('min-height:44px'));
 assert.ok(css.includes('@media(max-width:380px)'));
 assert.ok(css.includes('prefers-reduced-motion'));
});

test('all six public destination routes share the footer with admin link',()=>{
 const app=read('src/App.jsx');
 const shell=read('src/game/components/GameShell.jsx');
 for(const path of ['/about','/esports','/studio','/events','/community','/contact'])
   assert.ok(app.includes('path="'+path+'"'),path);
 assert.ok(shell.includes('<footer className="shell-footer">'));
 assert.ok(shell.includes('Admin Login'));
});
