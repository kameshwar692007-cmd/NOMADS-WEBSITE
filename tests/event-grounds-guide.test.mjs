import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LOCATIONS} from '../src/game/data/locationData.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Event Grounds search operates on published data and preserves status filters',()=>{
 const page=read('src/pages/EventsPage.jsx');
 assert.ok(page.includes('eventService.getPublicEvents()'));
 assert.ok(page.includes('const categories = [...new Set(events.map(ev => ev.category).filter(Boolean))].sort()'));
 assert.ok(page.includes("filter !== 'ALL' && ev.computedStatus !== filter"));
 assert.ok(page.includes("category !== 'ALL' && ev.category !== category"));
 assert.ok(page.includes('search.trim().toLocaleLowerCase()'));
 assert.ok(page.includes('filteredEvents.map((ev)'));
 assert.ok(page.includes('aria-pressed={filter === cat.id}'));
 assert.ok(page.includes('aria-live="polite"'));
 assert.ok(page.includes("setFilter('ALL'); setCategory('ALL'); setSearch('')"));
});
test('existing event details, real registration and admin links remain functional',()=>{
 const page=read('src/pages/EventsPage.jsx');
 assert.ok(page.includes('setSelectedEvent(ev)'));
 assert.ok(page.includes("selectedEvent.registrationUrl && selectedEvent.computedStatus !== 'ENDED'"));
 assert.ok(page.includes('eventService.trackRegistrationClick(selectedEvent.id, selectedEvent.title)'));
 assert.ok(page.includes('to={`/events/${ev.slug || ev.id}`}'));
 assert.ok(!page.includes('to="/admin"'));
 const footer=read('src/game/components/GameShell.jsx');
 assert.ok(footer.includes("navigate('/admin')"));
 assert.ok(page.includes('href={ORG_INFO.whatsapp}'));
 for(const route of ['/studio','/esports']){
  assert.ok(LOCATIONS.some(item=>item.route===route));
  assert.ok(page.includes('to="'+route+'"'));
 }
});
test('Event Grounds filters and field guide are responsive and accessible',()=>{
 const page=read('src/pages/EventsPage.jsx');
 const css=read('src/pages/EventGroundsGuide.css');
 assert.ok(page.includes('id="event-listings"'));
 assert.ok(page.includes('htmlFor="events-search"'));
 assert.ok(page.includes('htmlFor="events-category"'));
 assert.ok(css.includes('@media(max-width:750px)'));
 assert.ok(css.includes('focus-visible'));
 assert.ok(css.includes('prefers-reduced-motion'));
});
