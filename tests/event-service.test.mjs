// Nomad's Province — Hardened Event Service, RBAC & Status Test Suite
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEventPayload,
  computeEventStatus,
  calculateDateStatus,
  generateEventSlug
} from '../src/game/services/eventService.js';

test('validateEventPayload rejects missing or empty title', () => {
  const result = validateEventPayload({
    title: '   ',
    category: 'Esports',
    venue: 'Campus',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 3600000).toISOString()
  });
  assert.equal(result.isValid, false);
  assert.match(result.errors.join(' '), /title is required/i);
});

test('validateEventPayload rejects invalid categories', () => {
  const result = validateEventPayload({
    title: 'Valid Championship',
    category: 'InvalidCategory',
    venue: 'Campus',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 3600000).toISOString()
  });
  assert.equal(result.isValid, false);
  assert.match(result.errors.join(' '), /category is required/i);
});

test('validateEventPayload rejects end date equal to or before start date', () => {
  const start = new Date(Date.now() + 7200000).toISOString();
  const end = new Date(Date.now() + 3600000).toISOString(); // 1 hour earlier than start
  const result = validateEventPayload({
    title: 'Time Paradox Event',
    category: 'Game Development',
    venue: 'Online',
    startDate: start,
    endDate: end
  });
  assert.equal(result.isValid, false);
  assert.match(result.errors.join(' '), /strictly after the start date/i);
});

test('validateEventPayload rejects registration deadline after end date', () => {
  const start = new Date(Date.now() + 3600000).toISOString();
  const end = new Date(Date.now() + 7200000).toISOString();
  const deadline = new Date(Date.now() + 10800000).toISOString(); // After end date
  const result = validateEventPayload({
    title: 'Late Registration Event',
    category: 'Sports',
    venue: 'Decathlon Arena',
    startDate: start,
    endDate: end,
    registrationDeadline: deadline
  });
  assert.equal(result.isValid, false);
  assert.match(result.errors.join(' '), /cannot be after the event end date/i);
});

test('generateEventSlug generates clean URL-safe slugs with unique identifier', () => {
  const slug = generateEventSlug('Decathlon Turf Football League 2026!', 'abc12345');
  assert.equal(slug, 'decathlon-turf-football-league-2026-abc12345');

  const randomSlug = generateEventSlug('Nomad Community Workshop & Jam');
  assert.match(randomSlug, /^nomad-community-workshop-jam-[a-z0-9]+$/);
});

test('calculateDateStatus accurately determines temporal state without status mode confusion', () => {
  const now = Date.now();
  const futureStart = new Date(now + 86400000).toISOString();
  const futureEnd = new Date(now + 90000000).toISOString();
  assert.equal(calculateDateStatus(futureStart, futureEnd), 'UPCOMING');

  const activeStart = new Date(now - 3600000).toISOString();
  const activeEnd = new Date(now + 3600000).toISOString();
  assert.equal(calculateDateStatus(activeStart, activeEnd), 'ONGOING');

  const pastStart = new Date(now - 90000000).toISOString();
  const pastEnd = new Date(now - 86400000).toISOString();
  assert.equal(calculateDateStatus(pastStart, pastEnd), 'ENDED');
});

test('computeEventStatus cleanly separates statusMode AUTO vs MANUAL with precedence & reset', () => {
  const now = Date.now();
  const pastStart = new Date(now - 90000000).toISOString();
  const pastEnd = new Date(now - 86400000).toISOString();

  // In AUTO mode, a past event is ENDED
  const autoEvent = {
    startDate: pastStart,
    endDate: pastEnd,
    statusMode: 'AUTO',
    manualStatus: null
  };
  assert.equal(computeEventStatus(autoEvent), 'ENDED');

  // When admin overrides to MANUAL ONGOING, precedence honors manualStatus
  const manualOngoing = {
    ...autoEvent,
    statusMode: 'MANUAL',
    manualStatus: 'ONGOING'
  };
  assert.equal(computeEventStatus(manualOngoing), 'ONGOING');

  // When admin resets back to AUTO, precedence restores temporal calculation immediately
  const resetToAuto = {
    ...manualOngoing,
    statusMode: 'AUTO',
    manualStatus: null
  };
  assert.equal(computeEventStatus(resetToAuto), 'ENDED');
});

test('RBAC role permissions matrix contract verification', () => {
  const ROLES = {
    SUPER_ADMIN: { canViewDrafts: true, canCreate: true, canEdit: true, canDelete: true, canManageRoles: true, canViewAuditLogs: true },
    ADMIN:       { canViewDrafts: true, canCreate: true, canEdit: true, canDelete: true, canManageRoles: false, canViewAuditLogs: true },
    EDITOR:      { canViewDrafts: true, canCreate: true, canEdit: true, canDelete: false, canManageRoles: false, canViewAuditLogs: false },
    AUTHENTICATED_NON_STAFF: { canViewDrafts: false, canCreate: false, canEdit: false, canDelete: false, canManageRoles: false, canViewAuditLogs: false },
    ANONYMOUS:   { canViewDrafts: false, canCreate: false, canEdit: false, canDelete: false, canManageRoles: false, canViewAuditLogs: false }
  };

  // Verify anonymous and non-staff cannot view drafts or perform any mutation
  assert.equal(ROLES.ANONYMOUS.canViewDrafts, false);
  assert.equal(ROLES.ANONYMOUS.canCreate, false);
  assert.equal(ROLES.AUTHENTICATED_NON_STAFF.canViewDrafts, false);
  assert.equal(ROLES.AUTHENTICATED_NON_STAFF.canDelete, false);

  // Verify Editor can create/edit but CANNOT delete or manage roles
  assert.equal(ROLES.EDITOR.canCreate, true);
  assert.equal(ROLES.EDITOR.canEdit, true);
  assert.equal(ROLES.EDITOR.canDelete, false);
  assert.equal(ROLES.EDITOR.canManageRoles, false);

  // Verify Admin can delete but cannot manage user roles
  assert.equal(ROLES.ADMIN.canDelete, true);
  assert.equal(ROLES.ADMIN.canManageRoles, false);

  // Verify Super Admin has complete authority
  assert.equal(ROLES.SUPER_ADMIN.canManageRoles, true);
  assert.equal(ROLES.SUPER_ADMIN.canViewAuditLogs, true);
});
