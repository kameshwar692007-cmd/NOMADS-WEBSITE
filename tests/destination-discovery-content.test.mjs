import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LOCATIONS} from '../src/game/data/locationData.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('all five inner destinations keep routes without redundant shared field notes',()=>{
 const shell=read('src/game/components/GameShell.jsx');
 assert.equal(LOCATIONS.filter(x=>x.route!=='/about').length,5);
 for(const route of ['/esports','/studio','/events','/community','/contact']){
  assert.ok(LOCATIONS.some(x=>x.route===route),route);
  assert.ok(shell.includes("path: '"+route+"'"),route);
 }
 assert.ok(!shell.includes('DESTINATION FIELD NOTES'));
 assert.ok(!shell.includes('CONTINUE YOUR JOURNEY'));
 assert.ok(!shell.includes('nextLocation'));
 assert.ok(!shell.includes('campus-discover'));
 assert.ok(shell.includes('<main className="shell-main-content">'));
 assert.ok(shell.includes('footer-links'));
});
test('shared scroll reveal and reduced motion remain intact',()=>{
 const shell=read('src/game/components/GameShell.jsx');
 assert.ok(shell.includes('new IntersectionObserver('));
 assert.ok(shell.includes('new MutationObserver('));
 assert.ok(shell.includes('prefers-reduced-motion: reduce'));
});