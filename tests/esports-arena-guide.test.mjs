import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TOURNAMENTS, ORG_INFO } from '../src/game/data/campusContent.js';

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

test('esports carousel supports responsive horizontal navigation, swipe and accessible controls',()=>{
  const page=read('src/pages/EsportsPage.jsx');
  const style=read('src/pages/EsportsArenaGuide.css');

  // Horizontal carousel container and swipe controls
  assert.ok(page.includes('esports-carousel-wrapper'), 'Carousel wrapper must be rendered');
  assert.ok(page.includes('esports-carousel-track'), 'Horizontal carousel track must exist');
  assert.ok(page.includes('handlePrev'), 'Previous navigation handler must exist');
  assert.ok(page.includes('handleNext'), 'Next navigation handler must exist');
  assert.ok(page.includes('handleTouchStart'), 'Touch swipe start must be wired');
  assert.ok(page.includes('handleTouchEnd'), 'Touch swipe end must be wired');
  assert.ok(page.includes('aria-label="Previous tournament"'), 'Accessible previous button');
  assert.ok(page.includes('aria-label="Next tournament"'), 'Accessible next button');

  // Accessible filter controls
  assert.ok(page.includes('aria-pressed={activeGame ==='));
  assert.ok(page.includes('aria-live="polite"'));

  // Ensure oversized vertical promotional anchors are replaced
  assert.ok(!page.includes('href="#arena-circuits"'), 'Old redundant anchor links must be removed');
  assert.ok(!page.includes('href="#arena-progression"'), 'Progression anchor links must be removed');

  // CSS accessibility, responsive and snap requirements
  assert.ok(style.includes('@media(max-width:760px)'));
  assert.ok(style.includes('prefers-reduced-motion'));
  assert.ok(style.includes('focus-visible'));
  assert.ok(style.includes('scroll-snap-type: x mandatory'));
});
