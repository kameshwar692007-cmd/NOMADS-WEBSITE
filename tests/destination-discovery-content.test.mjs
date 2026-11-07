import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { LOCATIONS } from '../src/game/data/locationData.js';

const read = path => readFileSync(new URL('../'+path, import.meta.url),'utf8');

test('each inner destination has real field notes and valid neighboring destinations',()=>{
 const other = LOCATIONS.filter(item=>item.route!=='/about');
 assert.equal(other.length,5);
 for(const location of other){
  assert.ok(location.sectionDetails?.highlights?.length>=3,location.id);
  assert.ok(location.sectionDetails.highlights.every(x=>typeof x==='string'&&x.length>4),location.id);
  assert.ok(existsSync(new URL('../public'+location.badgeAsset,import.meta.url)),location.id);
 }
 const shell=read('src/game/components/GameShell.jsx');
 for(const route of ['/esports','/studio','/events','/community','/contact']){
  assert.ok(shell.includes("'"+route+"'"),route);
 }
 assert.ok(shell.includes('campusLocation.sectionDetails.highlights.map'));
 assert.ok(shell.includes('onClick={() => handleNav(nextLocation.route)}'));
 assert.ok(shell.includes("campusLocation.route !== '/about'"));
});
test('destination notes are responsive and preserve shared content shell',()=>{
 const shell=read('src/game/components/GameShell.jsx');
 const css=read('src/game/components/DestinationDiscovery.css');
 assert.ok(shell.includes("import './DestinationDiscovery.css';"));
 assert.ok(shell.includes('<main className="shell-main-content">'));
 assert.ok(shell.includes('campus-discover-list'));
 assert.ok(css.includes('max-width:760px'));
 assert.ok(css.includes('focus-visible'));
 assert.ok(css.includes('prefers-reduced-motion'));
});
