// Nomad's Province — Admin Command Center (/admin)
// Comprehensive event management, status overrides, poster uploads, results & draft controls

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import GameShell from '../game/components/GameShell.jsx';
import { eventService } from '../game/services/eventService.js';
import { sound } from '../game/systems/soundFx.js';
import {
  IconCrosshair,
  IconEvents,
  IconCheck,
  IconMapPin,
  IconRocket,
  IconZap,
  IconTrophy,
  IconShield
} from '../game/components/Icons.jsx';

export default function AdminPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState('SUPER_ADMIN'); // 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR'
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modal states
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [selectedForResults, setSelectedForResults] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    category: 'Esports',
    venue: '',
    startDate: '',
    endDate: '',
    registrationUrl: '',
    partner: "Nomad's Province",
    posterUrl: '',
    description: '',
    status: 'AUTO',
    isDraft: false
  });

  const [resultsData, setResultsData] = useState({
    champion: '',
    runnerUp: '',
    highlights: ''
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [uploadingPoster, setUploadingPoster] = useState(false);

  // Load events
  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getAllEventsForAdmin();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Filtered event list
  const filteredEvents = events.filter((ev) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'DRAFTS') return ev.isDraft;
    if (statusFilter === 'ONGOING') return ev.computedStatus === 'ONGOING' && !ev.isDraft;
    if (statusFilter === 'UPCOMING') return ev.computedStatus === 'UPCOMING' && !ev.isDraft;
    if (statusFilter === 'ENDED') return ev.computedStatus === 'ENDED' && !ev.isDraft;
    return true;
  });

  // Open creation modal
  const handleOpenCreate = () => {
    sound.playSelect();
    setEditingEvent(null);
    const now = new Date();
    const later = new Date(now.getTime() + 4 * 3600000);
    setFormData({
      title: '',
      category: 'Esports',
      venue: 'Chennai Campus / Online',
      startDate: now.toISOString().slice(0, 16),
      endDate: later.toISOString().slice(0, 16),
      registrationUrl: 'https://whatsapp.com/channel/0029VbCLLDiAjPXQTWkJP00f',
      partner: "Nomad's Province",
      posterUrl: '/assets/events-and-logos/img_1_2026-11-05_at_10.30.08_AM.jpeg',
      description: '',
      status: 'AUTO',
      isDraft: false
    });
    setFormError('');
    setFormSuccess('');
    setEditorOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (ev) => {
    sound.playSelect();
    setEditingEvent(ev);
    setFormData({
      title: ev.title,
      category: ev.category,
      venue: ev.venue,
      startDate: new Date(ev.startDate).toISOString().slice(0, 16),
      endDate: new Date(ev.endDate).toISOString().slice(0, 16),
      registrationUrl: ev.registrationUrl || '',
      partner: ev.partner || '',
      posterUrl: ev.posterUrl || '',
      description: ev.description || '',
      status: ev.status || 'AUTO',
      isDraft: Boolean(ev.isDraft)
    });
    setFormError('');
    setFormSuccess('');
    setEditorOpen(true);
  };

  // Save event (Create or Update)
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, formData);
        sound.playSelect();
        setFormSuccess('Event updated successfully!');
      } else {
        await eventService.createEvent(formData);
        sound.playSelect();
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
        setFormSuccess('New event created and registered!');
      }

      await loadEvents();
      setTimeout(() => {
        setEditorOpen(false);
      }, 1200);
    } catch (err) {
      sound.playCancel();
      setFormError(err.message || 'Failed to save event.');
    }
  };

  // Delete event
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }
    sound.playCancel();
    try {
      await eventService.deleteEvent(id);
      await loadEvents();
    } catch (err) {
      alert(err.message || 'Failed to delete event.');
    }
  };

  // Status toggle
  const handleStatusChange = async (id, newStatus) => {
    sound.playSelect();
    try {
      await eventService.setStatusOverride(id, newStatus);
      await loadEvents();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    }
  };

  // Toggle draft state
  const handleToggleDraft = async (id) => {
    sound.playSelect();
    try {
      await eventService.toggleDraft(id);
      await loadEvents();
    } catch (err) {
      alert(err.message || 'Failed to toggle draft status.');
    }
  };

  // Open Results Modal
  const handleOpenResults = (ev) => {
    sound.playSelect();
    setSelectedForResults(ev);
    setResultsData({
      champion: ev.results?.champion || '',
      runnerUp: ev.results?.runnerUp || '',
      highlights: ev.results?.highlights || ''
    });
    setResultsModalOpen(true);
  };

  // Save Results & trigger celebratory confetti
  const handleSaveResults = async (e) => {
    e.preventDefault();
    try {
      await eventService.recordResults(selectedForResults.id, resultsData);
      sound.playSelect();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#e84537', '#38bdf8', '#ffd700']
      });
      await loadEvents();
      setResultsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to record results.');
    }
  };

  // Poster File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPoster(true);
    sound.playBlip();
    try {
      const url = await eventService.uploadPoster(file);
      setFormData((prev) => ({ ...prev, posterUrl: url }));
      sound.playSelect();
    } catch (err) {
      sound.playCancel();
      setFormError(err.message || 'Image upload failed.');
    } finally {
      setUploadingPoster(false);
    }
  };

  // Metric counts
  const totalCount = events.length;
  const ongoingCount = events.filter((e) => e.computedStatus === 'ONGOING' && !e.isDraft).length;
  const upcomingCount = events.filter((e) => e.computedStatus === 'UPCOMING' && !e.isDraft).length;
  const endedCount = events.filter((e) => e.computedStatus === 'ENDED' && !e.isDraft).length;
  const draftCount = events.filter((e) => e.isDraft).length;

  return (
    <GameShell
      title="ADMIN COMMAND CENTER"
      subtitle="Event Operations, Live Status Overrides, Tournament Results & Media"
      accentColor="#ef4444"
    >
      {/* 1. Admin Top Control & Telemetry Bar */}
      <section className="gamified-card admin-telemetry-card">
        <div className="telemetry-grid">
          <div className="telemetry-info">
            <div className="telemetry-badge-row">
              <span className="live-radar-dot" />
              <span className="telemetry-label">
                {eventService.isCloudConnected() ? 'CONNECTED: SUPABASE POSTGRESQL' : 'STORAGE: RESILIENT LOCAL FALLBACK'}
              </span>
              <span className="telemetry-env">VERCEL FREE TIER COMPATIBLE</span>
            </div>
            <h2 className="telemetry-heading">Nomad's Province Event Governance</h2>
            <p className="telemetry-desc">
              Manage tournament brackets, collegiate hackathons, live game days, and active sports activations. 
              Changes sync in real-time to the public <strong>Event Grounds (/events)</strong>.
            </p>
          </div>

          {/* Role Access Selector */}
          <div className="telemetry-role-box">
            <span className="role-box-label">CURRENT ACCESS LEVEL</span>
            <div className="role-selector-pills">
              {[
                { id: 'SUPER_ADMIN', label: 'Super Admin', icon: '👑' },
                { id: 'ADMIN', label: 'Admin', icon: '⚡' },
                { id: 'EDITOR', label: 'Editor', icon: '✏️' }
              ].map((role) => (
                <button
                  key={role.id}
                  className={`role-pill-btn ${activeRole === role.id ? 'active' : ''}`}
                  onClick={() => { sound.playSelect(); setActiveRole(role.id); }}
                >
                  <span>{role.icon}</span> {role.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="admin-metrics-row">
          <div className="admin-metric-card" onClick={() => setStatusFilter('ALL')}>
            <span className="metric-val">{totalCount}</span>
            <span className="metric-lbl">TOTAL EVENTS</span>
          </div>
          <div className="admin-metric-card ongoing" onClick={() => setStatusFilter('ONGOING')}>
            <span className="metric-val">{ongoingCount}</span>
            <span className="metric-lbl">● ONGOING LIVE</span>
          </div>
          <div className="admin-metric-card upcoming" onClick={() => setStatusFilter('UPCOMING')}>
            <span className="metric-val">{upcomingCount}</span>
            <span className="metric-lbl">⚡ UPCOMING</span>
          </div>
          <div className="admin-metric-card ended" onClick={() => setStatusFilter('ENDED')}>
            <span className="metric-val">{endedCount}</span>
            <span className="metric-lbl">✓ ENDED / ARCHIVE</span>
          </div>
          <div className="admin-metric-card draft" onClick={() => setStatusFilter('DRAFTS')}>
            <span className="metric-val">{draftCount}</span>
            <span className="metric-lbl">DRAFTS (HIDDEN)</span>
          </div>
        </div>
      </section>

      {/* 2. Action Bar & Status Filter */}
      <div className="admin-action-bar">
        <div className="filter-buttons-group">
          {[
            { id: 'ALL', label: 'ALL EVENTS' },
            { id: 'ONGOING', label: '● LIVE ONGOING' },
            { id: 'UPCOMING', label: '⚡ UPCOMING' },
            { id: 'ENDED', label: '✓ ENDED' },
            { id: 'DRAFTS', label: 'DRAFTS' }
          ].map((f) => (
            <button
              key={f.id}
              className={`filter-btn ${statusFilter === f.id ? 'active' : ''}`}
              onClick={() => { sound.playSelect(); setStatusFilter(f.id); }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {activeRole !== 'VIEWER' && (
          <button className="gamified-btn create-event-btn" onClick={handleOpenCreate} onMouseEnter={() => sound.playBlip()}>
            <IconRocket size={16} />
            <span>+ CREATE NEW EVENT</span>
          </button>
        )}
      </div>

      {/* 3. Event Operations Table */}
      <section className="gamified-card admin-table-card">
        {loading ? (
          <div className="admin-loading-pane">
            <span className="pulse-beacon" />
            <p>ACCESSING EVENT RECORDS...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="admin-empty-pane">
            <IconEvents size={36} color="#64748b" />
            <p>No events found for category: {statusFilter}</p>
            <button className="gamified-btn" onClick={handleOpenCreate}>CREATE AN EVENT</button>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-events-table">
              <thead>
                <tr>
                  <th>POSTER</th>
                  <th>EVENT DETAILS</th>
                  <th>CATEGORY</th>
                  <th>SCHEDULE</th>
                  <th>PUBLIC STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((ev) => (
                  <tr key={ev.id} className={`event-row ${ev.isDraft ? 'row-draft' : ''}`}>
                    <td className="poster-col">
                      <div className="table-poster-wrap">
                        <img src={ev.posterUrl} alt={ev.title} className="table-poster-thumb" />
                        {ev.isDraft && <span className="table-draft-tag">DRAFT</span>}
                      </div>
                    </td>

                    <td className="details-col">
                      <div className="table-event-title">{ev.title}</div>
                      <div className="table-venue">
                        <IconMapPin size={12} color="#38bdf8" /> {ev.venue}
                      </div>
                      <div className="table-partner">
                        Partner: <strong>{ev.partner}</strong>
                      </div>
                    </td>

                    <td className="cat-col">
                      <span className={`cat-pill ${ev.category.toLowerCase().replace(/\s+/g, '-')}`}>
                        {ev.category}
                      </span>
                    </td>

                    <td className="schedule-col">
                      <div className="table-date">
                        {new Date(ev.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="table-time">
                        {new Date(ev.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="status-col">
                      <div className="status-badge-wrap">
                        <span className={`status-pill ${ev.computedStatus.toLowerCase()}`}>
                          {ev.computedStatus === 'ONGOING' && <span className="live-dot" />}
                          {ev.computedStatus}
                        </span>

                        {ev.status !== 'AUTO' && (
                          <span className="manual-override-tag">OVERRIDDEN</span>
                        )}
                      </div>

                      {/* Quick One-Click Status Override */}
                      <div className="quick-status-actions">
                        <button 
                          className="status-action-pill" 
                          title="Mark as Live Ongoing"
                          onClick={() => handleStatusChange(ev.id, 'ONGOING')}
                        >
                          ● Live
                        </button>
                        <button 
                          className="status-action-pill" 
                          title="Mark as Concluded / Ended"
                          onClick={() => handleStatusChange(ev.id, 'ENDED')}
                        >
                          ✓ End
                        </button>
                        <button 
                          className="status-action-pill" 
                          title="Reset to Date-based Auto"
                          onClick={() => handleStatusChange(ev.id, 'AUTO')}
                        >
                          ⚡ Auto
                        </button>
                      </div>
                    </td>

                    <td className="actions-col">
                      <div className="table-action-btns">
                        <button 
                          className="action-btn edit-btn" 
                          onClick={() => handleOpenEdit(ev)}
                          title="Edit Event Details"
                        >
                          Edit
                        </button>

                        <button 
                          className="action-btn results-btn" 
                          onClick={() => handleOpenResults(ev)}
                          title="Record Winners & Tournament Results"
                        >
                          🏆 Results
                        </button>

                        <button 
                          className={`action-btn draft-btn ${ev.isDraft ? 'publish' : 'unpublish'}`}
                          onClick={() => handleToggleDraft(ev.id)}
                          title={ev.isDraft ? 'Publish to Public' : 'Unpublish to Draft'}
                        >
                          {ev.isDraft ? 'Publish' : 'Draft'}
                        </button>

                        {activeRole === 'SUPER_ADMIN' && (
                          <button 
                            className="action-btn delete-btn" 
                            onClick={() => handleDelete(ev.id, ev.title)}
                            title="Delete Event"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 4. Event Creation / Edit Modal */}
      {editorOpen && (
        <div className="retro-modal-backdrop" onClick={() => setEditorOpen(false)}>
          <div className="retro-modal-card admin-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEvent ? 'EDIT EVENT DETAILS' : 'CREATE NEW NOMAD EVENT'}</h3>
              <button className="modal-close-btn" onClick={() => setEditorOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveEvent} className="modal-body-form">
              {formError && <div className="admin-form-alert error">{formError}</div>}
              {formSuccess && <div className="admin-form-alert success">{formSuccess}</div>}

              <div className="form-grid-2">
                <div className="form-group span-2">
                  <label className="retro-label">EVENT TITLE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GameJam X Esports 2026 or Free Fire Campus Cup"
                    className="retro-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="retro-label">CATEGORY</label>
                  <select
                    className="retro-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Esports">Esports (Tournaments & Scrims)</option>
                    <option value="Game Development">Game Development (Hackathons & GDAI)</option>
                    <option value="Sports">Sports (Decathlon / Playo Activations)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="retro-label">VENUE / LOCATION</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SRMIST Ramapuram or Decathlon Arena"
                    className="retro-input"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="retro-label">START DATE & TIME</label>
                  <input
                    type="datetime-local"
                    required
                    className="retro-input"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="retro-label">END DATE & TIME</label>
                  <input
                    type="datetime-local"
                    required
                    className="retro-input"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>

                <div className="form-group span-2">
                  <label className="retro-label">EXTERNAL REGISTRATION LINK (Google Form / WhatsApp)</label>
                  <input
                    type="url"
                    placeholder="https://forms.google.com/... or https://whatsapp.com/channel/..."
                    className="retro-input"
                    value={formData.registrationUrl}
                    onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="retro-label">HOST / PARTNERS</label>
                  <input
                    type="text"
                    placeholder="e.g. SRMIST • GDAI • Game Com"
                    className="retro-input"
                    value={formData.partner}
                    onChange={(e) => setFormData({ ...formData, partner: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="retro-label">STATUS BEHAVIOR</label>
                  <select
                    className="retro-input"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="AUTO">Auto (Calculate based on Date & Time)</option>
                    <option value="UPCOMING">Force Upcoming (Registrations Open)</option>
                    <option value="ONGOING">Force Ongoing (Live Event Active)</option>
                    <option value="ENDED">Force Ended (Concluded to Archive)</option>
                  </select>
                </div>

                {/* Poster upload & preview */}
                <div className="form-group span-2">
                  <label className="retro-label">EVENT POSTER IMAGE (Upload or URL)</label>
                  <div className="poster-upload-row">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="poster-file-input"
                      onChange={handleFileUpload}
                      disabled={uploadingPoster}
                    />
                    <input
                      type="text"
                      placeholder="Or paste image URL / public path"
                      className="retro-input"
                      value={formData.posterUrl}
                      onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                    />
                  </div>
                  {uploadingPoster && <span className="upload-loading-text">Uploading image...</span>}
                  {formData.posterUrl && (
                    <div className="poster-preview-box">
                      <img src={formData.posterUrl} alt="Poster preview" className="poster-preview-img" />
                    </div>
                  )}
                </div>

                <div className="form-group span-2">
                  <label className="retro-label">EVENT DESCRIPTION</label>
                  <textarea
                    rows={3}
                    placeholder="Provide tournament format, eligibility, and highlights..."
                    className="retro-input textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="form-group span-2">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isDraft}
                      onChange={(e) => setFormData({ ...formData, isDraft: e.target.checked })}
                    />
                    <span>Save as Draft (Hidden from public visitors on /events)</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions-bar">
                <button type="button" className="action-btn cancel-btn" onClick={() => setEditorOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="gamified-btn save-btn">
                  <IconCheck size={16} />
                  <span>{editingEvent ? 'SAVE CHANGES' : 'CREATE & PUBLISH'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Tournament Results Modal */}
      {resultsModalOpen && selectedForResults && (
        <div className="retro-modal-backdrop" onClick={() => setResultsModalOpen(false)}>
          <div className="retro-modal-card admin-results-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>RECORD TOURNAMENT RESULTS: {selectedForResults.title}</h3>
              <button className="modal-close-btn" onClick={() => setResultsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveResults} className="modal-body-form">
              <p className="results-intro">
                Recording results will automatically mark this event as <strong>CONCLUDED (ENDED)</strong> and show the winner podium on the public Event Grounds.
              </p>

              <div className="form-group">
                <label className="retro-label">CHAMPION / 1ST PLACE WINNER</label>
                <input
                  type="text"
                  placeholder="e.g. Team Hyperion (SRMIST)"
                  className="retro-input"
                  required
                  value={resultsData.champion}
                  onChange={(e) => setResultsData({ ...resultsData, champion: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="retro-label">RUNNER-UP / 2ND PLACE</label>
                <input
                  type="text"
                  placeholder="e.g. Team Velocity (VIT-AP)"
                  className="retro-input"
                  value={resultsData.runnerUp}
                  onChange={(e) => setResultsData({ ...resultsData, runnerUp: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="retro-label">MATCH HIGHLIGHTS & AWARDS</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Grand finals broadcasted with 1,500 live viewers; MVP awarded to..."
                  className="retro-input textarea"
                  value={resultsData.highlights}
                  onChange={(e) => setResultsData({ ...resultsData, highlights: e.target.value })}
                />
              </div>

              <div className="modal-actions-bar">
                <button type="button" className="action-btn cancel-btn" onClick={() => setResultsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="gamified-btn save-btn">
                  <IconTrophy size={16} />
                  <span>RECORD WINNERS & CELEBRATE 🎉</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </GameShell>
  );
}
