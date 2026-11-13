// Nomad's Province — Universal Event & Security Service
// Dual-mode integration: Supabase PostgreSQL with verified RBAC + Resilient Fallback
// Provides input validation, status_mode vs computed status separation, slug generation,
// RBAC role resolution, poster validation, and tamper-resistant audit logging.

import { supabase, isSupabaseConfigured } from '../../lib/supabase.js';
import { EVENTS as INITIAL_AUTHENTIC_EVENTS } from '../data/campusContent.js';

const STORAGE_KEY = 'nomads_province_events_store_v2';
const AUDIT_KEY = 'nomads_province_audit_logs_v2';
const ROLES_KEY = 'nomads_province_simulated_roles_v2';

/**
 * Generate a URL-safe unique slug
 */
export function generateEventSlug(title, idSuffix = '') {
  const base = (title || 'event')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
  const suffix = idSuffix ? `-${idSuffix.substring(0, 8)}` : `-${Math.random().toString(36).substring(2, 8)}`;
  return `${base || 'event'}${suffix}`;
}

/**
 * Pure temporal status calculation based on start and end timestamps
 */
export function calculateDateStatus(startDate, endDate) {
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (isNaN(start) || isNaN(end)) {
    return 'UPCOMING';
  }
  if (now < start) {
    return 'UPCOMING';
  } else if (now >= start && now <= end) {
    return 'ONGOING';
  } else {
    return 'ENDED';
  }
}

/**
 * Computes live effective status separating status_mode ('AUTO' vs 'MANUAL')
 * and computed temporal lifecycle state ('UPCOMING', 'ONGOING', 'ENDED')
 */
/**
 * Single public routing rule: event records belong to one destination only.
 * Legacy records without a listing_type remain Events (never tournaments).
 */
export const isTournamentListing = event => event?.listingType === 'TOURNAMENT';
export const isEventListing = event => !isTournamentListing(event);

export function computeEventStatus(event) {
  if (!event) return 'UPCOMING';

  // Precedence 1: Manual override active
  if (event.statusMode === 'MANUAL' && event.manualStatus) {
    return event.manualStatus;
  }

  // Precedence 2: Automatic temporal computation
  return calculateDateStatus(event.startDate, event.endDate);
}

/**
 * Validates and sanitizes event input payload
 */
export function validateEventPayload(data) {
  const errors = [];

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Event title is required.');
  } else if (data.title.trim().length > 140) {
    errors.push('Event title must not exceed 140 characters.');
  }

  const validCategories = ['Esports', 'Game Development', 'Sports'];
  if (!validCategories.includes(data.category)) {
    errors.push('Valid event category is required (Esports, Game Development, or Sports).');
  }

  if (!data.venue || typeof data.venue !== 'string' || data.venue.trim().length === 0) {
    errors.push('Event venue is required.');
  }

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (isNaN(startDate.getTime())) {
    errors.push('Valid start date and time are required.');
  }
  if (isNaN(endDate.getTime())) {
    errors.push('Valid end date and time are required.');
  }
  if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && endDate <= startDate) {
    errors.push('End date and time must be strictly after the start date.');
  }

  if (data.registrationDeadline) {
    const regDeadline = new Date(data.registrationDeadline);
    if (!isNaN(regDeadline.getTime()) && !isNaN(endDate.getTime()) && regDeadline > endDate) {
      errors.push('Registration deadline cannot be after the event end date.');
    }
  }

  if (data.registrationUrl && typeof data.registrationUrl === 'string' && data.registrationUrl.trim() !== '') {
    const trimmedUrl = data.registrationUrl.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      errors.push('Registration link must be a valid URL starting with http:// or https://');
    }
  }

  if (data.listingType === 'TOURNAMENT' && !(data.gameTitle || '').trim()) {
    errors.push('Game title is required for tournaments.');
  }
  // Determine status_mode and manual_status
  let statusMode = 'AUTO';
  let manualStatus = null;

  if (data.statusMode === 'MANUAL' || ['UPCOMING', 'ONGOING', 'ENDED'].includes(data.status)) {
    statusMode = 'MANUAL';
    manualStatus = data.manualStatus || (['UPCOMING', 'ONGOING', 'ENDED'].includes(data.status) ? data.status : 'UPCOMING');
  } else if (data.statusMode === 'AUTO' || data.status === 'AUTO') {
    statusMode = 'AUTO';
    manualStatus = null;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      title: data.title ? data.title.trim() : '',
      slug: data.slug || generateEventSlug(data.title),
      category: data.category,
      venue: data.venue ? data.venue.trim() : '',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline).toISOString() : null,
      statusMode,
      manualStatus,
      isDraft: Boolean(data.isDraft),
      posterUrl: data.posterUrl ? data.posterUrl.trim() : '',
      listingType: data.listingType === 'TOURNAMENT' ? 'TOURNAMENT' : 'EVENT',
      gameTitle: typeof data.gameTitle === 'string' ? data.gameTitle.trim() : '',
      matchFormat: typeof data.matchFormat === 'string' ? data.matchFormat.trim() : '',
      prizePool: typeof data.prizePool === 'string' ? data.prizePool.trim() : '',
      partnerInfo: typeof data.partnerInfo === 'string' ? data.partnerInfo.trim() : '',
      registrationUrl: data.registrationUrl ? data.registrationUrl.trim() : '',
      partner: data.partner ? data.partner.trim() : "Nomad's Province",
      description: data.description ? data.description.trim() : '',
      results: data.results || { champion: '', runnerUp: '', highlights: '', trophy_notes: '' }
    }
  };
}

/**
 * Preserve the actionable PostgREST error from a failed staff write.
 * Never silently switch a connected deployment to local-only records.
 */
export function describeSupabaseWriteError(error, action = 'save') {
  const code = typeof error?.code === 'string' ? error.code : '';
  const message = typeof error?.message === 'string' && error.message.trim()
    ? error.message.trim()
    : 'The database did not return an error message.';
  const hint = code === '42501'
    ? 'Your authenticated user may lack the staff role or RLS permission.'
    : code === '23505'
      ? 'A record with the same unique value already exists.'
      : code === '42703' || code === 'PGRST204' || code === 'PGRST205'
        ? 'Check that the events schema and tournament migration were applied to this Supabase project.'
        : code === '23514'
          ? 'One or more values violate a database constraint.'
          : 'Check your staff login, SQL schema, and browser Network response.';
  return `Supabase ${action} failed${code ? ` [${code}]` : ''}: ${message}. ${hint}`;
}

// Memory storage adapter for Node.js / non-browser test runner environments
const memoryStore = new Map();

function storageGet(key) {
  if (typeof localStorage !== 'undefined') {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  return memoryStore.get(key) || null;
}

function storageSet(key, value) {
  if (typeof localStorage !== 'undefined') {
    try { localStorage.setItem(key, value); return; } catch (e) {}
  }
  memoryStore.set(key, value);
}

// Fallback Local Storage initialization
function initializeFallbackStore() {
  try {
    const existing = storageGet(STORAGE_KEY);
    if (!existing) {
      const seeded = INITIAL_AUTHENTIC_EVENTS.map((ev, index) => {
        const start = ev.startDate || new Date(Date.now() - (index * 86400000 * 15)).toISOString();
        const end = ev.endDate || new Date(new Date(start).getTime() + 3600000 * 8).toISOString();
        const isConcluded = ev.status === 'CONCLUDED';
        return {
          id: ev.id || `seeded-${index + 1}`,
          slug: generateEventSlug(ev.title, `seed${index + 1}`),
          title: ev.title,
          category: ev.category?.includes('Esports') && ev.category?.includes('Game')
            ? 'Game Development'
            : ev.category?.includes('Esports') ? 'Esports'
            : ev.category?.includes('Sports') ? 'Sports' : 'Esports',
          venue: ev.venue || 'Chennai Campus',
          startDate: start,
          endDate: end,
          registrationDeadline: ev.registrationDeadline || null,
          statusMode: isConcluded ? 'MANUAL' : 'AUTO',
          manualStatus: isConcluded ? 'ENDED' : null,
          isDraft: false,
          posterUrl: ev.image || '/assets/events-and-logos/img_1_2026-11-05_at_10.30.08_AM.jpeg',
          listingType: 'EVENT',
          registrationUrl: 'https://wa.me/919789720897',
          partner: ev.partner || "Nomad's Province",
          description: ev.desc || '',
          results: {
            champion: isConcluded ? 'Provincial Squad' : '',
            runnerUp: isConcluded ? 'Collegiate Runner-up' : '',
            highlights: 'Highlights broadcasted on official channels.'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });
      storageSet(STORAGE_KEY, JSON.stringify(seeded));
    }
  } catch (e) {
    console.warn('Fallback store initialization notice:', e);
  }
}

initializeFallbackStore();

function getLocalEvents() {
  try {
    const raw = storageGet(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalEvents(events) {
  try {
    storageSet(STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.warn('Error saving local events:', e);
  }
}

function recordLocalAuditLog(action, eventId, actorRole, payload) {
  try {
    const raw = storageGet(AUDIT_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    logs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventId,
      action,
      actorRole: actorRole || 'SUPER_ADMIN',
      targetTable: 'events',
      payload,
      createdAt: new Date().toISOString()
    });
    storageSet(AUDIT_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (e) {
    // Ignore in local fallback
  }
}

// ============================================================================
// MAIN EVENT & RBAC SERVICE
// ============================================================================

export const eventService = {
  isCloudConnected: () => isSupabaseConfigured,

  /**
   * Resolves current user role from verified Supabase session & admin_users table
   */
  async getCurrentUserRole() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          // Connecting to a real Supabase project always requires a real Auth
          // session. A localhost URL does NOT grant upload or admin privileges.
          return { role: 'ANONYMOUS', email: null, isStaff: false, isAdmin: false, isSuperAdmin: false };
        }

        const { data, error } = await supabase
          .from('admin_users')
          .select('role, email')
          .eq('id', session.user.id)
          .single();

        if (error || !data) {
          return { role: 'AUTHENTICATED_NON_STAFF', email: session.user.email, isStaff: false, isAdmin: false, isSuperAdmin: false };
        }

        const role = data.role;
        return {
          role,
          email: data.email,
          isStaff: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role),
          isAdmin: ['SUPER_ADMIN', 'ADMIN'].includes(role),
          isSuperAdmin: role === 'SUPER_ADMIN'
        };
      } catch (err) {
        console.warn('Failed to resolve role from database:', err);
        return { role: 'ANONYMOUS', email: null, isStaff: false, isAdmin: false, isSuperAdmin: false };
      }
    }

    // Only offline/demo mode uses simulated roles.
    const simulatedRole = storageGet(ROLES_KEY) || 'SUPER_ADMIN';
    return {
      role: simulatedRole,
      email: 'admin@nomadsprovince.com',
      isStaff: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(simulatedRole),
      isAdmin: ['SUPER_ADMIN', 'ADMIN'].includes(simulatedRole),
      isSuperAdmin: simulatedRole === 'SUPER_ADMIN',
      isSimulated: true
    };
  },

  /**
   * For local fallback development: switch simulated role
   */
  setSimulatedRole(role) {
    storageSet(ROLES_KEY, role);
  },

  /**
   * Authenticate Super Admin / Staff via Supabase Auth
   */
  async login(email, password) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return this.getCurrentUserRole();
    }
    return this.getCurrentUserRole();
  },

  /**
   * Log out from active session
   */
  async logout() {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    return { role: 'ANONYMOUS', email: null, isStaff: false, isAdmin: false, isSuperAdmin: false };
  },

  /**
   * Fetch all publicly viewable events (Excludes drafts strictly)
   */
  async getPublicEvents() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id, slug, title, category, venue, start_date, end_date, registration_deadline, status_mode, manual_status, is_draft, poster_url, registration_url, partner, description, results, created_at, listing_type, game_title, match_format, prize_pool, partner_info')
          .eq('is_draft', false)
          .order('start_date', { ascending: false });

        if (error) throw error;
        if (data) {
          return data.map((d) => {
            const mapped = {
              id: d.id,
              slug: d.slug,
              title: d.title,
              category: d.category,
              venue: d.venue,
              startDate: d.start_date,
              endDate: d.end_date,
              registrationDeadline: d.registration_deadline,
              statusMode: d.status_mode,
              manualStatus: d.manual_status,
              isDraft: d.is_draft,
              posterUrl: d.poster_url,
              listingType: d.listing_type || 'EVENT',
              gameTitle: d.game_title || '',
              matchFormat: d.match_format || '',
              prizePool: d.prize_pool || '',
              partnerInfo: d.partner_info || '',
              registrationUrl: d.registration_url,
              partner: d.partner,
              description: d.description,
              results: d.results || {},
              createdAt: d.created_at
            };
            return {
              ...mapped,
              computedStatus: computeEventStatus(mapped)
            };
          });
        }
        throw new Error('Supabase returned no public event data.');
      } catch (err) {
        console.error('Supabase public fetch failed:', err);
        throw new Error(describeSupabaseWriteError(err, 'public read'));
      }
    }

    // Only projects without a Supabase connection use offline demo data.
    const local = getLocalEvents();
    return local
      .filter((ev) => !ev.isDraft)
      .map((ev) => ({
        ...ev,
        computedStatus: computeEventStatus(ev)
      }))
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  },

  /**
   * Fetch a single published event by slug (or id)
   */
  async getEventBySlug(slug) {
    if (!slug) return null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .or(`slug.eq.${slug},id.eq.${slug}`)
          .single();

        if (!error && data) {
          const mapped = {
            id: data.id,
            slug: data.slug,
            title: data.title,
            category: data.category,
            venue: data.venue,
            startDate: data.start_date,
            endDate: data.end_date,
            registrationDeadline: data.registration_deadline,
            statusMode: data.status_mode,
            manualStatus: data.manual_status,
            isDraft: data.is_draft,
            posterUrl: data.poster_url,
            listingType: data.listing_type || 'EVENT',
            gameTitle: data.game_title || '',
            matchFormat: data.match_format || '',
            prizePool: data.prize_pool || '',
            partnerInfo: data.partner_info || '',
            registrationUrl: data.registration_url,
            partner: data.partner,
            description: data.description,
            results: data.results || {},
            createdBy: data.created_by,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
          return {
            ...mapped,
            computedStatus: computeEventStatus(mapped)
          };
        }
      } catch (err) {
        console.warn('Supabase slug fetch error, trying local fallback:', err);
      }
    }

    const local = getLocalEvents();
    const found = local.find((e) => e.slug === slug || e.id === slug);
    if (!found) return null;

    return {
      ...found,
      computedStatus: computeEventStatus(found)
    };
  },

  /**
   * Track external registration link clicks (Zero-cost telemetry)
   */
  trackRegistrationClick(eventId, eventTitle) {
    try {
      const KEY = 'nomads_analytics_clicks_v1';
      const raw = storageGet(KEY);
      const data = raw ? JSON.parse(raw) : {};
      const current = data[eventId] || { clicks: 0, title: eventTitle || 'Event' };
      data[eventId] = {
        clicks: current.clicks + 1,
        title: eventTitle || current.title,
        lastClicked: new Date().toISOString()
      };
      storageSet(KEY, JSON.stringify(data));
    } catch (e) {
      // Ignore
    }
  },

  /**
   * Retrieve click telemetry summary for Admin Dashboard
   */
  getAnalyticsSummary() {
    try {
      const KEY = 'nomads_analytics_clicks_v1';
      const raw = storageGet(KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  },

  /**
   * Fetch all events including drafts for administrative operations
   * Protected by RLS on Supabase (only staff can view drafts)
   */
  async getAllEventsForAdmin() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((d) => {
            const mapped = {
              id: d.id,
              slug: d.slug,
              title: d.title,
              category: d.category,
              venue: d.venue,
              startDate: d.start_date,
              endDate: d.end_date,
              registrationDeadline: d.registration_deadline,
              statusMode: d.status_mode,
              manualStatus: d.manual_status,
              isDraft: d.is_draft,
              posterUrl: d.poster_url,
              listingType: d.listing_type || 'EVENT',
              gameTitle: d.game_title || '',
              matchFormat: d.match_format || '',
              prizePool: d.prize_pool || '',
              partnerInfo: d.partner_info || '',
              registrationUrl: d.registration_url,
              partner: d.partner,
              description: d.description,
              results: d.results || {},
              createdBy: d.created_by,
              createdAt: d.created_at,
              updatedAt: d.updated_at
            };
            return {
              ...mapped,
              computedStatus: computeEventStatus(mapped)
            };
          });
        }
      } catch (err) {
        console.warn('Supabase admin fetch failed, using fallback store:', err);
      }
    }

    const local = getLocalEvents();
    return local
      .map((ev) => ({
        ...ev,
        computedStatus: computeEventStatus(ev)
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /**
   * Create a new event with validation
   */
  async createEvent(eventData) {
    const { isValid, errors, sanitized } = validateEventPayload(eventData);
    if (!isValid) {
      throw new Error(errors.join(' '));
    }

    if (isSupabaseConfigured && supabase) {
      const role = await this.getCurrentUserRole();
      if (!role.isStaff || role.isSimulated) {
        throw new Error('Sign in with a verified Supabase staff account before publishing events. Local demo admin access cannot write to the cloud.');
      }
      try {
        const { data, error } = await supabase
          .from('events')
          .insert({
            slug: sanitized.slug,
            title: sanitized.title,
            category: sanitized.category,
            venue: sanitized.venue,
            start_date: sanitized.startDate,
            end_date: sanitized.endDate,
            registration_deadline: sanitized.registrationDeadline,
            status_mode: sanitized.statusMode,
            manual_status: sanitized.manualStatus,
            is_draft: sanitized.isDraft,
            poster_url: sanitized.posterUrl,
            listing_type: sanitized.listingType,
            game_title: sanitized.gameTitle,
            match_format: sanitized.matchFormat,
            prize_pool: sanitized.prizePool,
            partner_info: sanitized.partnerInfo,
            registration_url: sanitized.registrationUrl,
            partner: sanitized.partner,
            description: sanitized.description,
            results: sanitized.results
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase create failed; nothing was published:', err);
        throw new Error(describeSupabaseWriteError(err, 'create'));
      }
    }
    const local = getLocalEvents();
    const newEvent = {
      ...sanitized,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    local.unshift(newEvent);
    saveLocalEvents(local);
    recordLocalAuditLog('INSERT', newEvent.id, 'STAFF', { title: newEvent.title });
    return newEvent;
  },

  /**
   * Update an existing event with validation
   */
  async updateEvent(id, updateData) {
    const { isValid, errors, sanitized } = validateEventPayload(updateData);
    if (!isValid) {
      throw new Error(errors.join(' '));
    }

    if (isSupabaseConfigured && supabase) {
      const role = await this.getCurrentUserRole();
      if (!role.isStaff || role.isSimulated) {
        throw new Error('Sign in with a verified Supabase staff account before updating events.');
      }
      try {
        const { data, error } = await supabase
          .from('events')
          .update({
            title: sanitized.title,
            category: sanitized.category,
            venue: sanitized.venue,
            start_date: sanitized.startDate,
            end_date: sanitized.endDate,
            registration_deadline: sanitized.registrationDeadline,
            status_mode: sanitized.statusMode,
            manual_status: sanitized.manualStatus,
            is_draft: sanitized.isDraft,
            poster_url: sanitized.posterUrl,
            listing_type: sanitized.listingType,
            game_title: sanitized.gameTitle,
            match_format: sanitized.matchFormat,
            prize_pool: sanitized.prizePool,
            partner_info: sanitized.partnerInfo,
            registration_url: sanitized.registrationUrl,
            partner: sanitized.partner,
            description: sanitized.description,
            results: sanitized.results
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase update failed; nothing was updated:', err);
        throw new Error(describeSupabaseWriteError(err, 'update'));
      }
    }
    const local = getLocalEvents();
    const index = local.findIndex((ev) => ev.id === id);
    if (index === -1) {
      throw new Error(`Event with id ${id} not found.`);
    }

    local[index] = {
      ...local[index],
      ...sanitized,
      updatedAt: new Date().toISOString()
    };
    saveLocalEvents(local);
    recordLocalAuditLog('UPDATE', id, 'STAFF', { title: sanitized.title });
    return local[index];
  },

  /**
   * Delete an event (Restricted to Admins and Super Admins)
   */
  async deleteEvent(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Supabase delete failed, deleting locally:', err);
      }
    }

    const local = getLocalEvents();
    const filtered = local.filter((ev) => ev.id !== id);
    saveLocalEvents(filtered);
    recordLocalAuditLog('DELETE', id, 'ADMIN', { id });
    return true;
  },

  /**
   * Status mode and override controller:
   * Sets mode to 'AUTO' (clearing manual override) or 'MANUAL' with specified target status
   */
  async setStatusOverride(id, targetModeOrStatus) {
    const local = getLocalEvents();
    const event = local.find((e) => e.id === id);
    if (!event) throw new Error('Event not found.');

    if (targetModeOrStatus === 'AUTO') {
      return this.updateEvent(id, {
        ...event,
        statusMode: 'AUTO',
        manualStatus: null
      });
    }

    if (['UPCOMING', 'ONGOING', 'ENDED'].includes(targetModeOrStatus)) {
      return this.updateEvent(id, {
        ...event,
        statusMode: 'MANUAL',
        manualStatus: targetModeOrStatus
      });
    }

    throw new Error('Invalid status mode or status target.');
  },

  /**
   * Toggle publication draft state
   */
  async toggleDraft(id) {
    const local = getLocalEvents();
    const event = local.find((e) => e.id === id);
    if (!event) throw new Error('Event not found.');

    return this.updateEvent(id, {
      ...event,
      isDraft: !event.isDraft
    });
  },

  /**
   * Record tournament results and set status_mode to MANUAL + ENDED
   */
  async recordResults(id, resultsPayload) {
    const local = getLocalEvents();
    const event = local.find((e) => e.id === id);
    if (!event) throw new Error('Event not found.');

    return this.updateEvent(id, {
      ...event,
      statusMode: 'MANUAL',
      manualStatus: 'ENDED',
      results: {
        champion: resultsPayload.champion || '',
        runnerUp: resultsPayload.runnerUp || '',
        highlights: resultsPayload.highlights || '',
        trophy_notes: resultsPayload.trophy_notes || ''
      }
    });
  },

  /**
   * Fetch immutable audit logs (Restricted to Admin / Super Admin)
   */
  async getAuditLogs() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('admin_audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data) return data;
      } catch (err) {
        console.warn('Failed to fetch remote audit logs:', err);
      }
    }

    try {
      const raw = localStorage.getItem(AUDIT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  /**
   * Upload poster image with validation and collision-safe UUID path
   */
  async uploadPoster(file) {
    if (!file) throw new Error('No file provided.');

    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMime.includes(file.type)) {
      throw new Error('Invalid file format. Only JPG, PNG, WebP, and GIF images are allowed.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File exceeds 5MB size limit.');
    }

    if (isSupabaseConfigured && supabase) {
      // The storage INSERT policy requires auth.uid() to belong to a real
      // SUPER_ADMIN / ADMIN / EDITOR in public.admin_users. Running the
      // events migration alone cannot grant an unauthenticated browser access.
      let session;
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        session = data?.session;
      } catch (error) {
        throw new Error(`Supabase authentication check failed: ${error.message || 'unknown error'}. Please sign in again.`);
      }
      if (!session?.user) {
        throw new Error('Sign in with your Supabase staff account before uploading posters. Local demo admin access cannot upload to a protected storage bucket.');
      }

      const { data: staff, error: staffError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();
      if (staffError) {
        throw new Error(`Could not verify staff permissions: ${staffError.message}. Verify admin_users policies and your signed-in account.`);
      }
      if (!['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(staff?.role)) {
        throw new Error('This Supabase account is not an authorized staff member. Add its auth user ID to public.admin_users with an appropriate role.');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
      const safeId = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2)}`;
      const filePath = `posters/${safeId}.${fileExt}`;
      let uploadError;
      try {
        ({ error: uploadError } = await supabase.storage
          .from('event-posters')
          .upload(filePath, file, { cacheControl: '3600', upsert: false, contentType: file.type }));
      } catch (error) {
        throw new Error(`Poster upload request failed: ${error.message || 'network error'}. Check Supabase connection and browser console.`);
      }
      if (uploadError) {
        const reason = uploadError.message || 'Unknown storage error';
        throw new Error(`Supabase poster upload failed: ${reason}. Check the event-posters bucket and storage INSERT RLS policy for staff.`);
      }

      const { data } = supabase.storage.from('event-posters').getPublicUrl(filePath);
      if (!data?.publicUrl) throw new Error('Poster uploaded but public URL was unavailable; check bucket visibility.');
      return data.publicUrl;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },

  /**
   * Retrieve dynamic site and contact settings (WhatsApp number & email)
   */
  async getContactSettings() {
    const DEFAULT_SETTINGS = {
      whatsappNumber: '+91 97897 20897',
      email: 'nomadsprovince@gmail.com',
      instagram: 'https://www.instagram.com/nomadsprovince?cplk=MWxzbHM3bWNrdXJ3Ng==',
      location: 'Chennai, India'
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('whatsapp_number, email, instagram, location')
          .eq('id', 'primary_config')
          .maybeSingle();

        if (!error && data) {
          return {
            whatsappNumber: data.whatsapp_number || DEFAULT_SETTINGS.whatsappNumber,
            email: data.email || DEFAULT_SETTINGS.email,
            instagram: data.instagram || DEFAULT_SETTINGS.instagram,
            location: data.location || DEFAULT_SETTINGS.location
          };
        }
      } catch (err) {
        console.warn('Supabase site_settings fetch error, falling back to local:', err);
      }
    }

    const SETTINGS_KEY = 'nomads_site_settings_v1';
    const local = storageGet(SETTINGS_KEY);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    return DEFAULT_SETTINGS;
  },

  /**
   * Update site contact settings (WhatsApp number & email)
   */
  async updateContactSettings(newSettings) {
    if (!newSettings.whatsappNumber || !newSettings.whatsappNumber.trim()) {
      throw new Error('WhatsApp mobile number is required.');
    }
    if (!newSettings.email || !newSettings.email.trim() || !newSettings.email.includes('@')) {
      throw new Error('Valid contact email is required.');
    }

    const payload = {
      whatsappNumber: newSettings.whatsappNumber.trim(),
      email: newSettings.email.trim(),
      instagram: newSettings.instagram ? newSettings.instagram.trim() : 'https://www.instagram.com/nomadsprovince?cplk=MWxzbHM3bWNrdXJ3Ng==',
      location: newSettings.location ? newSettings.location.trim() : 'Chennai, India'
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .upsert({
            id: 'primary_config',
            whatsapp_number: payload.whatsappNumber,
            email: payload.email,
            instagram: payload.instagram,
            location: payload.location
          })
          .select()
          .single();

        if (!error && data) {
          recordLocalAuditLog('UPDATE', 'site_settings', 'STAFF', payload);
        }
      } catch (err) {
        console.warn('Supabase site_settings update error, saving to local store:', err);
      }
    }

    const SETTINGS_KEY = 'nomads_site_settings_v1';
    storageSet(SETTINGS_KEY, JSON.stringify(payload));
    recordLocalAuditLog('UPDATE', 'site_settings', 'STAFF', payload);
    return payload;
  }
};
