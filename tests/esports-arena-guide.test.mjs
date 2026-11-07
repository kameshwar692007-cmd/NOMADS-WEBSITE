import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TOURNAMENTS, ORG_INFO } from '../src/game/data/campusContent.js';
import { LOCATIONS } from '../src/game/data/locationData.js';

const read = p => readFileSync(new URL('../' + p, import.meta.url),'utf8');

test('esports guide filters only known tournament objects while preserving the registration interaction',()=>{
  const page=read('src/pages/EsportsPage.jsx');
  assert.ok(page.includes("const [activeGame, setActiveGame] = useState('all')"));
  assert.ok(page.includes('TOURNAMENTS.filter(tourney => tourney.id === activeGame)'));
  assert.ok(page.includes('visibleTournaments.map((t, idx)'));
  assert.ok(page.includes('onClick={() => handleRegisterClick(t)}'));
  assert.ok(page.includes('setSelectedTournament(tourney)'));
  assert.ok(page.includes('setModalOpen(true)'));
  assert.ok(page.includes('href={ORG_INFO.whatsapp}'));
  assert.ok(page.includes('href={ORG_INFO.instagram}'));
  assert.equal(new Set(TOURNAMENTS.map(t=>t.id)).size,TOURNAMENTS.length);
  assert.ok(TOURNAMENTS.every(t=>t.id&&t.game&&t.title&&t.format));
  assert.ok(ORG_INFO.whatsapp.startsWith('https://'));
  assert.ok(ORG_INFO.instagram.startsWith('https://'));
});

test('esports visitor journey uses actual supported destination paths and accessible controls',()=>{
  const page=read('src/pages/EsportsPage.jsx');
  const style=read('src/pages/EsportsArenaGuide.css');
  const routes=new Set(LOCATIONS.map(loc=>loc.route));
  for(const route of ['/events','/community']) {
    assert.ok(routes.has(route));
    assert.ok(page.includes('to="'+route+'"'));
  }
  assert.ok(page.includes('aria-pressed={activeGame ==='));
  assert.ok(page.includes('aria-live="polite"'));
  assert.ok(page.includes('href="#arena-circuits"'));
  assert.ok(page.includes('href="#arena-progression"'));
  assert.ok(page.includes('id="arena-circuits"'));
  assert.ok(page.includes('id="arena-progression"'));
  assert.ok(style.includes('@media(max-width:760px)'));
  assert.ok(style.includes('prefers-reduced-motion'));
  assert.ok(style.includes('focus-visible'));
});
