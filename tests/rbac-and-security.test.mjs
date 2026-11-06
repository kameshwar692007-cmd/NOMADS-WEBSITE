// Nomad's Province — RBAC, Security & Draft Isolation Automated Verification
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  eventService,
  validateEventPayload,
  computeEventStatus,
  generateEventSlug
} from '../src/game/services/eventService.js';

test('1. Anonymous/Public event retrieval strictly excludes draft events', async () => {
  const publicEvents = await eventService.getPublicEvents();
  assert.ok(Array.isArray(publicEvents), 'Expected array of events');
  for (const ev of publicEvents) {
    assert.equal(ev.isDraft, false, `Event "${ev.title}" is a draft but was returned in public events!`);
  }
});

test('2. Staff/Admin view retrieves all events including drafts', async () => {
  const allEvents = await eventService.getAllEventsForAdmin();
  assert.ok(Array.isArray(allEvents), 'Expected array of events');
  assert.ok(allEvents.length >= 1, 'Should have events loaded in admin view');
});

test('3. RBAC role resolution and permission matrix check', async () => {
  // Test Super Admin
  eventService.setSimulatedRole('SUPER_ADMIN');
  const superAdmin = await eventService.getCurrentUserRole();
  assert.equal(superAdmin.role, 'SUPER_ADMIN');
  assert.equal(superAdmin.isSuperAdmin, true);
  assert.equal(superAdmin.isAdmin, true);
  assert.equal(superAdmin.isStaff, true);

  // Test Admin
  eventService.setSimulatedRole('ADMIN');
  const admin = await eventService.getCurrentUserRole();
  assert.equal(admin.role, 'ADMIN');
  assert.equal(admin.isSuperAdmin, false);
  assert.equal(admin.isAdmin, true);
  assert.equal(admin.isStaff, true);

  // Test Editor
  eventService.setSimulatedRole('EDITOR');
  const editor = await eventService.getCurrentUserRole();
  assert.equal(editor.role, 'EDITOR');
  assert.equal(editor.isSuperAdmin, false);
  assert.equal(editor.isAdmin, false);
  assert.equal(editor.isStaff, true);
});

test('4. Event creation with validation & auto-slug generation', async () => {
  const payload = {
    title: 'GDAI Indie Hackathon Chennai 2026',
    category: 'Game Development',
    venue: 'SRM Easwari Campus',
    startDate: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    registrationUrl: 'https://whatsapp.com/channel/0029VbCLLDiAjPXQTWkJP00f',
    isDraft: true
  };

  const created = await eventService.createEvent(payload);
  assert.ok(created.id, 'Created event must have an ID');
  assert.match(created.slug, /^gdai-indie-hackathon-chennai-2026-[a-z0-9]+$/);
  assert.equal(created.isDraft, true);

  // Verify that because it is a draft, it does NOT appear in public events
  const publicEvents = await eventService.getPublicEvents();
  assert.equal(publicEvents.some(e => e.id === created.id), false, 'Draft event must not appear in public query');
});

test('5. Event draft publication toggle', async () => {
  const all = await eventService.getAllEventsForAdmin();
  const target = all[0];
  const initialDraftState = target.isDraft;

  const toggled = await eventService.toggleDraft(target.id);
  assert.equal(toggled.isDraft, !initialDraftState);

  // Toggle back
  const restored = await eventService.toggleDraft(target.id);
  assert.equal(restored.isDraft, initialDraftState);
});

test('6. Event status mode separation: AUTO vs MANUAL lock and reset', async () => {
  const all = await eventService.getAllEventsForAdmin();
  const target = all[0];

  // Set manual override to ENDED
  const overridden = await eventService.setStatusOverride(target.id, 'ENDED');
  assert.equal(overridden.statusMode, 'MANUAL');
  assert.equal(overridden.manualStatus, 'ENDED');
  assert.equal(computeEventStatus(overridden), 'ENDED');

  // Reset to AUTO
  const reset = await eventService.setStatusOverride(target.id, 'AUTO');
  assert.equal(reset.statusMode, 'AUTO');
  assert.equal(reset.manualStatus, null);
});

test('7. Tournament results recording triggers ENDED status', async () => {
  const all = await eventService.getAllEventsForAdmin();
  const target = all[0];

  const withResults = await eventService.recordResults(target.id, {
    champion: 'Alpha Squad',
    runnerUp: 'Beta Squad',
    highlights: 'Final round clutch victory in Decathlon arena'
  });

  assert.equal(withResults.statusMode, 'MANUAL');
  assert.equal(withResults.manualStatus, 'ENDED');
  assert.equal(withResults.results.champion, 'Alpha Squad');
});

test('8. Poster upload validation rejects invalid types and oversized files', async () => {
  // Reject missing file
  await assert.rejects(
    () => eventService.uploadPoster(null),
    /no file provided/i
  );

  // Reject invalid mime type (e.g. text/html, application/pdf)
  await assert.rejects(
    () => eventService.uploadPoster({ type: 'application/pdf', size: 1024 }),
    /invalid file format/i
  );

  // Reject oversized file (>5MB)
  await assert.rejects(
    () => eventService.uploadPoster({ type: 'image/png', size: 6 * 1024 * 1024 }),
    /exceeds 5mb size limit/i
  );
});

test('9. getEventBySlug resolves dedicated event page by slug or id', async () => {
  const publicEvents = await eventService.getPublicEvents();
  assert.ok(publicEvents.length > 0);
  const target = publicEvents[0];

  const fetched = await eventService.getEventBySlug(target.slug);
  assert.ok(fetched, 'Must locate event by slug');
  assert.equal(fetched.id, target.id);
  assert.equal(fetched.title, target.title);
  assert.ok(fetched.computedStatus);

  // Non-existent slug returns null
  const missing = await eventService.getEventBySlug('non-existent-event-slug-12345');
  assert.equal(missing, null);
});

test('10. trackRegistrationClick records telemetry for external registration links', async () => {
  eventService.trackRegistrationClick('test-event-id-101', 'Test Tournament League');
  eventService.trackRegistrationClick('test-event-id-101', 'Test Tournament League');

  const summary = eventService.getAnalyticsSummary();
  assert.ok(summary['test-event-id-101']);
  assert.ok(summary['test-event-id-101'].clicks >= 2);
  assert.equal(summary['test-event-id-101'].title, 'Test Tournament League');
});
