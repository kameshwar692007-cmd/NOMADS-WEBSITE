// Nomad's Province — Admin Command Center (/admin)
// Comprehensive event management, status mode overrides, poster uploads, results & draft controls
// Genuine RBAC enforcement: SUPER_ADMIN, ADMIN, EDITOR with database-verified session check

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
  const [userRoleState, setUserRoleState] = useState({
    role: 'SUPER_ADMIN',
    email: 'admin@nomadsprovince.com',
    isStaff: true,
    isAdmin: true,
    isSuperAdmin: true,
    isSimulated: true
  });
  const [analyticsData, setAnalyticsData] = useState({});
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modal states
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [selectedForResults, setSelectedForResults] = useState(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    category: 'Esports',
    venue: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    registrationUrl: '',
    partner: "Nomad's Province",
    posterUrl: '',
    description: '',
    statusMode: 'AUTO',
    manualStatus: 'UPCOMING',
    isDraft: false
  });

  const [resultsData, setResultsData] = useState({
    champion: '',
    runnerUp: '',
    highlights: '',
    trophy_notes: ''
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [uploadingPoster, setUploadingPoster] = useState(false);

  // Authentication states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    sound.playSelect();
    try {
      await eventService.login(loginEmail, loginPassword);
      sound.playArrival();
      await loadEventsAndRole();
    } catch (err) {
      sound.playCancel();
      setLoginError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    sound.playCancel();
    try {
      await eventService.logout();
      await loadEventsAndRole();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Load events and user role
  const loadEventsAndRole = async () => {
    setLoading(true);
    try {
      const [eventsData, roleData] = await Promise.all([
        eventService.getAllEventsForAdmin(),
        eventService.getCurrentUserRole()
      ]);
      setEvents(eventsData);
      setUserRoleState(roleData);
      setAnalyticsData(eventService.getAnalyticsSummary());
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventsAndRole();
  }, []);

  // For offline / local development simulation: switch simulated role
  const handleSimulateRoleSwitch = (newRole) => {
    sound.playSelect();
    eventService.setSimulatedRole(newRole);
    setUserRoleState((prev) => ({
      ...prev,
      role: newRole,
      isStaff: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(newRole),
      isAdmin: ['SUPER_ADMIN', 'ADMIN'].includes(newRole),
      isSuperAdmin: newRole === 'SUPER_ADMIN'
    }));
  };

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
      registrationDeadline: '',
      registrationUrl: 'https://whatsapp.com/channel/0029VbCLLDiAjPXQTWkJP00f',
      partner: "Nomad's Province",
      posterUrl: '/assets/events-and-logos/img_1_2026-11-05_at_10.30.08_AM.jpeg',
      description: '',
      statusMode: 'AUTO',
      manualStatus: 'UPCOMING',
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
      registrationDeadline: ev.registrationDeadline ? new Date(ev.registrationDeadline).toISOString().slice(0, 16) : '',
      registrationUrl: ev.registrationUrl || '',
      partner: ev.partner || '',
      posterUrl: ev.posterUrl || '',
      description: ev.description || '',
      statusMode: ev.statusMode || 'AUTO',
      manualStatus: ev.manualStatus || 'UPCOMING',
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
        setFormSuccess('Event updated and audit logged!');
      } else {
        await eventService.createEvent(formData);
        sound.playSelect();
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
        setFormSuccess('New event created and registered!');
      }

      await loadEventsAndRole();
      setTimeout(() => {
        setEditorOpen(false);
      }, 1200);
    } catch (err) {
      sound.playCancel();
      setFormError(err.message || 'Failed to save event.');
    }
  };

  // Delete event (Guarded by RBAC)
  const handleDelete = async (id, title) => {
    if (!userRoleState.isAdmin && !userRoleState.isSuperAdmin) {
      alert('Access Denied: Only Admins and Super Admins can delete events. Editors have edit-only access.');
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }
    sound.playCancel();
    try {
      await eventService.deleteEvent(id);
      await loadEventsAndRole();
    } catch (err) {
      alert(err.message || 'Failed to delete event.');
    }
  };

  // Status Mode and Override toggle
  const handleStatusChange = async (id, modeOrStatus) => {
    sound.playSelect();
    try {
      await eventService.setStatusOverride(id, modeOrStatus);
      await loadEventsAndRole();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    }
  };

  // Toggle draft state
  const handleToggleDraft = async (id) => {
    sound.playSelect();
    try {
      await eventService.toggleDraft(id);
      await loadEventsAndRole();
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
      highlights: ev.results?.highlights || '',
      trophy_notes: ev.results?.trophy_notes || ''
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
      await loadEventsAndRole();
      setResultsModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to record results.');
    }
  };

  // Open Audit Log Drawer
  const handleOpenAuditLogs = async () => {
    sound.playSelect();
    const logs = await eventService.getAuditLogs();
    setAuditLogs(logs);
    setAuditModalOpen(true);
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
  const totalClicks = Object.values(analyticsData).reduce((sum, item) => sum + (item.clicks || 0), 0);

  // If not authenticated as staff in cloud-connected production mode
  if (!userRoleState.isStaff) {
    return (
      <GameShell
        title="ADMIN COMMAND CENTER"
        subtitle="Internal Staff Authentication Gateway"
        accentColor="#ef4444"
      >
        <section className="gamified-card admin-telemetry-card" style={{ maxWidth: '480px', margin: '40px auto 60px', padding: '32px' }}>
          <div className="terminal-header" style={{ marginBottom: '20px' }}>
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">STAFF AUTHENTICATION GATEWAY</span>
          </div>

          <h3 className="section-title" style={{ color: '#f8fafc', marginBottom: '8px' }}>INTERNAL ACCESS ONLY</h3>
          <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5', marginBottom: '24px' }}>
            Sign in with your authorized Nomad's Province Super Admin credentials to access event management, tournament brackets, and telemetry.
          </p>

          {loginError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '18px' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="retro-label">ADMIN EMAIL</label>
              <input
                type="email"
                required
                className="retro-input"
                placeholder="owner@nomadsprovince.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="retro-label">PASSWORD</label>
              <input
                type="password"
                required
                className="retro-input"
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loggingIn}
              className="gamified-btn"
              style={{ width: '100%', marginTop: '8px', background: '#e84537', color: '#fff', padding: '12px', fontWeight: 'bold' }}
            >
              {loggingIn ? 'VERIFYING CREDENTIALS...' : 'ACCESS COMMAND CENTER →'}
            </button>
          </form>
        </section>
      </GameShell>
    );
  }

  return (
    <GameShell
      title="ADMIN COMMAND CENTER"
      subtitle="Super Admin Operations, Event Lifecycles, Status Overrides, Tournament Results & Media"
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
              <span className="telemetry-env" style={{ background: '#ffd700', color: '#090d16', fontWeight: 'bold' }}>
                SINGLE SUPER ADMIN
              </span>
            </div>
            <h2 className="telemetry-heading">Nomad's Province Event Governance</h2>
            <p className="telemetry-desc">
              Manage tournament brackets, collegiate hackathons, live game days, and active sports activations. 
              Changes sync in real-time to the public <strong>Event Grounds (/events)</strong> and dedicated pages.
            </p>
          </div>

          {/* Super Admin Single-Owner Access Badge */}
          <div className="telemetry-role-box">
            <span className="role-box-label">GOVERNANCE LEVEL</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>👑</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#ffd700', fontSize: '14px', fontFamily: 'monospace' }}>
                    SUPER ADMIN (OWNER)
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {userRoleState.email || 'Complete CRUD & Media Authority'}
                  </div>
                </div>
              </div>
              {!userRoleState.isSimulated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginLeft: '8px'
                  }}
                >
                  LOGOUT
                </button>
              )}
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
          <div className="admin-metric-card" style={{ borderColor: '#38bdf8' }}>
            <span className="metric-val" style={{ color: '#38bdf8' }}>{totalClicks}</span>
            <span className="metric-lbl">REGISTRATION CLICKS</span>
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

        <div style={{ display: 'flex', gap: '10px' }}>
          {(userRoleState.isAdmin || userRoleState.isSuperAdmin) && (
            <button
              className="gamified-btn secondary"
              style={{ background: '#1e293b', border: '1px solid #475569' }}
              onClick={handleOpenAuditLogs}
            >
              <IconShield size={16} />
              <span>AUDIT TRAIL</span>
            </button>
          )}

          {userRoleState.isStaff && (
            <button className="gamified-btn create-event-btn" onClick={handleOpenCreate} onMouseEnter={() => sound.playBlip()}>
              <IconRocket size={16} />
              <span>+ CREATE NEW EVENT</span>
            </button>
          )}
        </div>
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
            {userRoleState.isStaff && (
              <button className="gamified-btn" onClick={handleOpenCreate}>CREATE AN EVENT</button>
            )}
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
                      {ev.slug && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
                          slug: {ev.slug}
                        </div>
                      )}
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

                        {ev.statusMode === 'MANUAL' && (
                          <span className="manual-override-tag">MANUAL LOCK ({ev.manualStatus})</span>
                        )}
                      </div>

                      {/* Quick One-Click Status Mode Controller */}
                      <div className="quick-status-actions">
                        <button 
                          className="status-action-pill" 
                          title="Lock status to Live Ongoing"
                          onClick={() => handleStatusChange(ev.id, 'ONGOING')}
                        >
                          ● Live
                        </button>
                        <button 
                          className="status-action-pill" 
                          title="Lock status to Concluded / Ended"
                          onClick={() => handleStatusChange(ev.id, 'ENDED')}
                        >
                          ✓ End
                        </button>
                        <button 
                          className="status-action-pill" 
                          title="Reset to Date-based Auto Calculation"
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

                        {(userRoleState.isAdmin || userRoleState.isSuperAdmin) && (
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
                  <label className="retro-label">REGISTRATION DEADLINE (Optional)</label>
                  <input
                    type="datetime-local"
                    className="retro-input"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
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
                  <label className="retro-label">STATUS MODE (Temporal vs Manual Lock)</label>
                  <select
                    className="retro-input"
                    value={formData.statusMode === 'MANUAL' ? formData.manualStatus : 'AUTO'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'AUTO') {
                        setFormData({ ...formData, statusMode: 'AUTO', manualStatus: null });
                      } else {
                        setFormData({ ...formData, statusMode: 'MANUAL', manualStatus: val });
                      }
                    }}
                  >
                    <option value="AUTO">Auto Mode (Date & Time Calculation)</option>
                    <option value="UPCOMING">Manual Mode (Force UPCOMING)</option>
                    <option value="ONGOING">Manual Mode (Force ONGOING)</option>
                    <option value="ENDED">Manual Mode (Force ENDED)</option>
                  </select>
                </div>

                <div className="form-group span-2">
                  <label className="retro-label">EVENT POSTER IMAGE (Upload or URL)</label>
                  <div className="poster-upload-row">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="poster-file-input"
                      onChange={handleFileUpload}
                      disabled={uploadingPoster}
                    />
                    {uploadingPoster && <span className="upload-indicator">UPLOADING...</span>}
                  </div>
                  <input
                    type="text"
                    placeholder="/assets/events-and-logos/..."
                    className="retro-input"
                    style={{ marginTop: '8px' }}
                    value={formData.posterUrl}
                    onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                  />
                  {formData.posterUrl && (
                    <div className="poster-preview-box">
                      <img src={formData.posterUrl} alt="Poster Preview" className="poster-preview-img" />
                    </div>
                  )}
                </div>

                <div className="form-group span-2">
                  <label className="retro-label">DESCRIPTION & BRACKET DETAILS</label>
                  <textarea
                    rows={4}
                    placeholder="Describe game rules, format, prize pools, and entry eligibility..."
                    className="retro-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="form-group span-2 draft-toggle-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isDraft}
                      onChange={(e) => setFormData({ ...formData, isDraft: e.target.checked })}
                    />
                    <span>Save as Draft (Hidden from public Event Grounds until published)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="gamified-btn cancel-btn" onClick={() => setEditorOpen(false)}>
                  CANCEL
                </button>
                <button type="submit" className="gamified-btn save-btn">
                  {editingEvent ? 'UPDATE EVENT' : 'REGISTER EVENT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Results & Trophy Modal */}
      {resultsModalOpen && selectedForResults && (
        <div className="retro-modal-backdrop" onClick={() => setResultsModalOpen(false)}>
          <div className="retro-modal-card results-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>RECORD TOURNAMENT RESULTS — {selectedForResults.title}</h3>
              <button className="modal-close-btn" onClick={() => setResultsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveResults} className="modal-body-form">
              <div className="form-group">
                <label className="retro-label">🥇 1ST PLACE / CHAMPION</label>
                <input
                  type="text"
                  placeholder="e.g. Team Phoenix or SRM Elite"
                  className="retro-input"
                  value={resultsData.champion}
                  onChange={(e) => setResultsData({ ...resultsData, champion: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="retro-label">🥈 2ND PLACE / RUNNER-UP</label>
                <input
                  type="text"
                  placeholder="e.g. Hyperion Gaming"
                  className="retro-input"
                  value={resultsData.runnerUp}
                  onChange={(e) => setResultsData({ ...resultsData, runnerUp: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="retro-label">MATCH HIGHLIGHTS & SUMMARY</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Thrilling 5-map final concluded in overtime. Decathlon sports kits awarded."
                  className="retro-input"
                  value={resultsData.highlights}
                  onChange={(e) => setResultsData({ ...resultsData, highlights: e.target.value })}
                />
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="gamified-btn cancel-btn" onClick={() => setResultsModalOpen(false)}>
                  CANCEL
                </button>
                <button type="submit" className="gamified-btn save-btn">
                  SAVE PODIUM RESULTS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Tamper-Resistant Audit Trail Modal */}
      {auditModalOpen && (
        <div className="retro-modal-backdrop" onClick={() => setAuditModalOpen(false)}>
          <div className="retro-modal-card admin-form-modal" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>SECURITY AUDIT TRAIL (IMMUTABLE DATABASE LOGS)</h3>
              <button className="modal-close-btn" onClick={() => setAuditModalOpen(false)}>✕</button>
            </div>

            <div style={{ padding: '16px', maxHeight: '450px', overflowY: 'auto' }}>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
                All mutations on the <code>events</code> table trigger immutable server-side logging. Direct client modifications or deletions of audit entries are permanently forbidden by database RLS.
              </p>

              {auditLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No audit log entries found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {auditLogs.map((log) => (
                    <div key={log.id} style={{
                      background: '#0d1322',
                      border: '1px solid #1e293b',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                      fontFamily: 'monospace'
                    }}>
                      <div>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          background: log.action === 'INSERT' ? '#059669' : log.action === 'DELETE' ? '#dc2626' : '#2563eb',
                          color: '#fff',
                          marginRight: '10px'
                        }}>
                          {log.action}
                        </span>
                        <span style={{ color: '#e2e8f0' }}>Target: {log.target_table || log.targetTable || 'events'}</span>
                        <span style={{ color: '#64748b', marginLeft: '12px' }}>Role: {log.actor_role || log.actorRole}</span>
                      </div>
                      <div style={{ color: '#94a3b8' }}>
                        {new Date(log.created_at || log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer-actions">
              <button type="button" className="gamified-btn save-btn" onClick={() => setAuditModalOpen(false)}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </GameShell>
  );
}
