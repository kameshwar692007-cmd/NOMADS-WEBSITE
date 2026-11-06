// Nomad's Province — Event Service & Validation Test Suite
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEventPayload, computeEventStatus } from '../src/game/services/eventService.js';

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

test('validateEventPayload rejects end date before start date', () => {
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
  assert.match(result.errors.join(' '), /after the start date/i);
});

test('computeEventStatus calculates UPCOMING, ONGOING, and ENDED correctly', () => {
  const now = Date.now();

  // 1. Future event -> UPCOMING
  const futureEvent = {
    startDate: new Date(now + 86400000).toISOString(),
    endDate: new Date(now + 90000000).toISOString(),
    status: 'AUTO'
  };
  assert.equal(computeEventStatus(futureEvent), 'UPCOMING');

  // 2. Active event -> ONGOING
  const activeEvent = {
    startDate: new Date(now - 3600000).toISOString(),
    endDate: new Date(now + 3600000).toISOString(),
    status: 'AUTO'
  };
  assert.equal(computeEventStatus(activeEvent), 'ONGOING');

  // 3. Past event -> ENDED
  const pastEvent = {
    startDate: new Date(now - 90000000).toISOString(),
    endDate: new Date(now - 86400000).toISOString(),
    status: 'AUTO'
  };
  assert.equal(computeEventStatus(pastEvent), 'ENDED');
});

test('computeEventStatus respects manual admin status overrides', () => {
  const now = Date.now();
  // An event in the past that has been manually forced to ONGOING
  const forcedOngoing = {
    startDate: new Date(now - 90000000).toISOString(),
    endDate: new Date(now - 86400000).toISOString(),
    status: 'ONGOING'
  };
  assert.equal(computeEventStatus(forcedOngoing), 'ONGOING');

  // A future event that has been manually forced to ENDED
  const forcedEnded = {
    startDate: new Date(now + 86400000).toISOString(),
    endDate: new Date(now + 90000000).toISOString(),
    status: 'ENDED'
  };
  assert.equal(computeEventStatus(forcedEnded), 'ENDED');
});
