import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('demo tournaments are safe and rerunnable without fake registration', () => {
  const sql = read('supabase/seeds/20261113_demo_esports_tournaments.sql');
  const slugs = ['demo-bgmi-campus-cup', 'demo-valorant-open', 'demo-free-fire-showdown', 'demo-rocket-league-duos'];
  for (const slug of slugs) assert.ok(sql.includes(slug));
  assert.ok(sql.includes('on conflict (slug) do nothing'));
  assert.ok(sql.includes("'TOURNAMENT'"));
  assert.ok(sql.includes("'AUTO', false, null, null"));
  assert.ok(sql.includes('DEMO DATA ONLY'));
  assert.equal((sql.match(/'TOURNAMENT'/g) || []).length, 4);
});

test('Esports Arena clearly marks demos and disables registration for them', () => {
  const source = read('src/pages/EsportsPage.jsx');
  assert.ok(source.includes("isDemo: ev.slug?.startsWith('demo-')"));
  assert.ok(source.includes('DEMO / NOT A REAL EVENT'));
  assert.ok(source.includes('VIEW DEMO DETAILS'));
  assert.ok(source.includes("!selectedTournament?.isDemo && <div className=\"modal-links\""));
  assert.ok(source.includes('Registration is disabled'));
});
