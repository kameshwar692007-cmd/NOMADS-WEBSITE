// Nomad's Province — Universal Event Service
// Provides real Supabase PostgreSQL integration with resilient local fallback
// Handles validation, auto-status calculations, manual overrides, drafts, and audit logging.

import { supabase, isSupabaseConfigured } from '../../lib/supabase.js';
import { EVENTS as INITIAL_AUTHENTIC_EVENTS } from '../data/campusContent.js';

const STORAGE_KEY = 'nomads_province_events_store_v1';
const AUDIT_KEY = 'nomads_province_audit_logs_v1';

// Seed initial authentic events into fallback store if empty
function initializeFallbackStore() {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      const seeded = INITIAL_AUTHENTIC_EVENTS.map((ev, index) => ({
        id: ev.id || `seeded-${index + 1}`,
        title: ev.title,
        category: ev.category?.includes('Esports') && ev.category?.includes('Game') 
          ? 'Game Development' 
          : ev.category?.includes('Esports') ? 'Esports' 
          : ev.category?.includes('Sports') ? 'Sports' : 'Esports',
        venue: ev.venue || 'Chennai Campus',
        startDate: ev.startDate || new Date(Date.now() - (index * 86400000 * 15)).toISOString(),
        endDate: ev.endDate || new Date(Date.now() - (index * 86400000 * 15) + 3600000 * 8).toISOString(),
        registrationDeadline: ev.registrationDeadline || null,
        status: ev.status === 'CONCLUDED' ? 'ENDED' : 'AUTO',
        isDraft: false,
        posterUrl: ev.image || '/assets/events-and-logos/img_1_2026-11-05_at_10.30.08_AM.jpeg',
        registrationUrl: 'https://whatsapp.com/channel/0029VbCLLDiAjPXQTWkJP00f',
        partner: ev.partner || "Nomad's Province",
        description: ev.desc || '',
        results: {
          champion: ev.status === 'CONCLUDED' ? 'Provincial Squad' : '',
          runnerUp: ev.status === 'CONCLUDED' ? 'Collegiate Runner-up' : '',
          highlights: 'Highlights broadcasted on official channels.'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    }
  } catch (e) {
    console.warn('LocalStorage unavailable for event initialization:', e);
  }
}

// Ensure store is ready
if (typeof window !== 'undefined') {
  initializeFallbackStore();
}

/**
 * Computes live status based on start/end dates and manual status overrides
 */
export function computeEventStatus(event) {
  if (event.status && event.status !== 'AUTO') {
    return event.status; // 'UPCOMING', 'ONGOING', or 'ENDED'
  }

  const now = new Date().getTime();
  const start = new Date(event.startDate).getTime();
  const end = new Date(event.endDate).getTime();

  if (now < start) {
    return 'UPCOMING';
  } else if (now >= start && now <= end) {
    return 'ONGOING';
  } else {
    return 'ENDED';
  }
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
  if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && endDate < startDate) {
    errors.push('End date and time must be after the start date.');
  }

  if (data.registrationUrl && typeof data.registrationUrl === 'string' && data.registrationUrl.trim() !== '') {
    const trimmedUrl = data.registrationUrl.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      errors.push('Registration link must be a valid URL starting with http:// or https://');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      title: data.title ? data.title.trim() : '',
      category: data.category,
      venue: data.venue ? data.venue.trim() : '',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline).toISOString() : null,
      status: ['AUTO', 'UPCOMING', 'ONGOING', 'ENDED'].includes(data.status) ? data.status : 'AUTO',
      isDraft: Boolean(data.isDraft),
      posterUrl: data.posterUrl ? data.posterUrl.trim() : '',
      registrationUrl: data.registrationUrl ? data.registrationUrl.trim() : '',
      partner: data.partner ? data.partner.trim() : "Nomad's Province",
      description: data.description ? data.description.trim() : '',
      results: data.results || { champion: '', runnerUp: '', highlights: '' }
    }
  };
}

// Fallback Local Storage CRUD Helpers
function getLocalEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Error reading local events:', e);
    return [];
  }
}

function saveLocalEvents(events) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.warn('Error saving local events:', e);
  }
}

function recordAuditLog(action, eventId, details) {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    logs.unshift({
      id: `log-${Date.now()}`,
      eventId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(AUDIT_KEY, JSON.stringify(logs.slice(0, 50)));
  } catch (e) {
    // Ignore audit logging errors in fallback
  }
}

// ============================================================================
// PUBLIC API SERVICE METHODS
// ============================================================================

export const eventService = {
  isCloudConnected: () => isSupabaseConfigured,

  /**
   * Fetch all publicly viewable events (Excludes drafts)
   */
  async getPublicEvents() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('is_draft', false)
          .order('start_date', { ascending: false });

        if (!error && data) {
          return data.map((d) => ({
            id: d.id,
            title: d.title,
            category: d.category,
            venue: d.venue,
            startDate: d.start_date,
            endDate: d.end_date,
            registrationDeadline: d.registration_deadline,
            status: d.status,
            computedStatus: computeEventStatus({
              startDate: d.start_date,
              endDate: d.end_date,
              status: d.status
            }),
            isDraft: d.is_draft,
            posterUrl: d.poster_url,
            registrationUrl: d.registration_url,
            partner: d.partner,
            description: d.description,
            results: d.results || {},
            createdAt: d.created_at
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed, using fallback store:', err);
      }
    }

    // Fallback store
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
   * Fetch all events including drafts for administrative operations
   */
  async getAllEventsForAdmin() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((d) => ({
            id: d.id,
            title: d.title,
            category: d.category,
            venue: d.venue,
            startDate: d.start_date,
            endDate: d.end_date,
            registrationDeadline: d.registration_deadline,
            status: d.status,
            computedStatus: computeEventStatus({
              startDate: d.start_date,
              endDate: d.end_date,
              status: d.status
            }),
            isDraft: d.is_draft,
            posterUrl: d.poster_url,
            registrationUrl: d.registration_url,
            partner: d.partner,
            description: d.description,
            results: d.results || {},
            createdAt: d.created_at
          }));
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
   * Create a new event
   */
  async createEvent(eventData) {
    const { isValid, errors, sanitized } = validateEventPayload(eventData);
    if (!isValid) {
      throw new Error(errors.join(' '));
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('events')
          .insert({
            title: sanitized.title,
            category: sanitized.category,
            venue: sanitized.venue,
            start_date: sanitized.startDate,
            end_date: sanitized.endDate,
            registration_deadline: sanitized.registrationDeadline,
            status: sanitized.status,
            is_draft: sanitized.isDraft,
            poster_url: sanitized.posterUrl,
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
        console.warn('Supabase create failed, persisting locally:', err);
      }
    }

    // Local fallback creation
    const local = getLocalEvents();
    const newEvent = {
      ...sanitized,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    local.unshift(newEvent);
    saveLocalEvents(local);
    recordAuditLog('CREATE', newEvent.id, { title: newEvent.title });
    return newEvent;
  },

  /**
   * Update an existing event
   */
  async updateEvent(id, updateData) {
    const { isValid, errors, sanitized } = validateEventPayload(updateData);
    if (!isValid) {
      throw new Error(errors.join(' '));
    }

    if (isSupabaseConfigured) {
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
            status: sanitized.status,
            is_draft: sanitized.isDraft,
            poster_url: sanitized.posterUrl,
            registration_url: sanitized.registrationUrl,
            partner: sanitized.partner,
            description: sanitized.description,
            results: sanitized.results,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase update failed, updating locally:', err);
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
    recordAuditLog('UPDATE', id, { title: sanitized.title });
    return local[index];
  },

  /**
   * Delete an event
   */
  async deleteEvent(id) {
    if (isSupabaseConfigured) {
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
    recordAuditLog('DELETE', id, { id });
    return true;
  },

  /**
   * One-click manual status toggle (e.g. mark ongoing, mark ended, or reset to auto)
   */
  async setStatusOverride(id, newStatus) {
    if (!['AUTO', 'UPCOMING', 'ONGOING', 'ENDED'].includes(newStatus)) {
      throw new Error('Invalid status override.');
    }

    const local = getLocalEvents();
    const event = local.find((e) => e.id === id);
    if (!event) throw new Error('Event not found.');

    return this.updateEvent(id, {
      ...event,
      status: newStatus
    });
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
   * Record tournament results and winner podium
   */
  async recordResults(id, resultsPayload) {
    const local = getLocalEvents();
    const event = local.find((e) => e.id === id);
    if (!event) throw new Error('Event not found.');

    return this.updateEvent(id, {
      ...event,
      status: 'ENDED', // Recording results automatically concludes the event
      results: {
        champion: resultsPayload.champion || '',
        runnerUp: resultsPayload.runnerUp || '',
        highlights: resultsPayload.highlights || ''
      }
    });
  },

  /**
   * Upload poster image with validation (Max 5MB, JPG/PNG/WebP only)
   */
  async uploadPoster(file) {
    if (!file) throw new Error('No file provided.');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file format. Only JPG, PNG, and WebP images are allowed.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File exceeds 5MB size limit.');
    }

    if (isSupabaseConfigured) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `posters/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('event-posters')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('event-posters').getPublicUrl(filePath);
        return data.publicUrl;
      } catch (err) {
        console.warn('Storage upload error, falling back to data URL:', err);
      }
    }

    // Local data URL fallback
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
};
