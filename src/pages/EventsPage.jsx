// Nomad's Province — Event Grounds (/events)
// Real-time event grounds connected to eventService (Supabase & resilient fallback)
// Dynamic status filtering, auto-archiving, winner podiums & dedicated detail modal

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GameShell from '../game/components/GameShell.jsx';
import { eventService } from '../game/services/eventService.js';
import { ORG_INFO } from '../game/data/campusContent.js';
import { sound } from '../game/systems/soundFx.js';
import { IconMapPin, IconEvents, IconWhatsApp, IconTrophy, IconRocket, IconShield } from '../game/components/Icons.jsx';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Load public events (excludes drafts)
  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getPublicEvents();
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

  const filteredEvents = events.filter((ev) => {
    if (filter === 'ALL') return true;
    if (filter === 'ONGOING') return ev.computedStatus === 'ONGOING';
    if (filter === 'UPCOMING') return ev.computedStatus === 'UPCOMING';
    if (filter === 'ENDED') return ev.computedStatus === 'ENDED';
    return true;
  });

  const handleCardClick = (ev) => {
    sound.playSelect();
    setSelectedEvent(ev);
  };

  return (
    <GameShell
      title="EVENT GROUNDS"
      subtitle="Collegiate LANs, Game Jams, Summits & Sports Festivals"
      accentColor="#fdbe53"
    >
      {/* 1. Event Grounds Festival Hero */}
      <section className="gamified-card events-hero-card">
        <div className="events-partner-strip">
          SRMIST • EASWARI • VIT-AP • CRESCENT • HUDDLE GLOBAL • DECATHLON • PLAYO • GDAI
        </div>
        <h2 className="events-headline">Where Campus Communities & Gaming Culture Unite</h2>
        <p className="events-desc">
          Nomad's Province orchestrates esports competitions, 24-hour game development hackathons, 
          and active sports fests in partnership with educational institutions and industry leaders across India.
        </p>

        {/* Filter Pills */}
        <div className="event-filters-bar">
          {[
            { id: 'ALL', label: 'ALL EVENTS', glyph: '◈' },
            { id: 'ONGOING', label: 'LIVE NOW (ONGOING)', glyph: '●' },
            { id: 'UPCOMING', label: 'UPCOMING EVENTS', glyph: '⚡' },
            { id: 'ENDED', label: 'PAST ARCHIVE', glyph: '✓' }
          ].map((cat) => (
            <button
              key={cat.id}
              className={`filter-btn ${filter === cat.id ? 'active' : ''}`}
              onClick={() => { sound.playSelect(); setFilter(cat.id); }}
              onMouseEnter={() => sound.playBlip()}
            >
              <span className="filter-glyph">{cat.glyph}</span> {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* 2. Events Grid */}
      {loading ? (
        <div className="events-loading-pane">
          <span className="pulse-beacon" />
          <p>LOADING FESTIVAL SCHEDULE...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="events-empty-pane">
          <IconEvents size={40} color="#64748b" />
          <p>No events found for this filter category.</p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((ev) => (
            <div 
              key={ev.id} 
              className={`gamified-card event-card ${ev.computedStatus.toLowerCase()}`} 
              onClick={() => handleCardClick(ev)}
              onMouseEnter={() => sound.playBlip()}
            >
              <div className="event-poster-frame">
                <img src={ev.posterUrl} alt={ev.title} className="event-poster-img" />
                <div className={`event-status-badge ${ev.computedStatus.toLowerCase()}`}>
                  {ev.computedStatus === 'ONGOING' && <span className="live-dot" />}
                  {ev.computedStatus === 'ONGOING' ? 'LIVE NOW' : ev.computedStatus === 'UPCOMING' ? 'UPCOMING' : 'CONCLUDED'}
                </div>
              </div>

              <div className="event-card-body">
                <div className="event-meta-row">
                  <span className="event-cat">{ev.category}</span>
                  <span className="event-partner-tag">{ev.partner}</span>
                </div>

                <h4 className="event-card-title">{ev.title}</h4>
                <div className="event-venue-row">
                  <IconMapPin size={14} color="#38bdf8" />
                  <span className="venue-name">{ev.venue}</span>
                </div>

                <div className="event-date-row">
                  <IconEvents size={14} color="#fdbe53" />
                  <span className="date-str">
                    {new Date(ev.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <p className="event-card-desc">{ev.description}</p>

                {/* Winner Podium Snippet for Concluded Events */}
                {ev.computedStatus === 'ENDED' && ev.results?.champion && (
                  <div className="event-winner-podium">
                    <span className="trophy-icon"><IconTrophy size={14} color="#ffd700" /></span>
                    <span className="champion-name">Champion: {ev.results.champion}</span>
                  </div>
                )}

                <div className="event-card-action" style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <button className="view-details-btn" onClick={(e) => { e.stopPropagation(); handleCardClick(ev); }}>
                    <span>QUICK VIEW</span>
                  </button>
                  <Link
                    to={`/events/${ev.slug || ev.id}`}
                    className="view-details-btn"
                    style={{ textDecoration: 'none', background: '#38bdf8', color: '#090d16', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>PAGE ↗</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Dedicated Event Detail Modal */}
      {selectedEvent && (
        <div className="retro-modal-backdrop" onClick={() => setSelectedEvent(null)}>
          <div className="retro-modal-card event-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className={`status-pill ${selectedEvent.computedStatus.toLowerCase()}`}>
                {selectedEvent.computedStatus === 'ONGOING' ? '● LIVE NOW' : selectedEvent.computedStatus}
              </span>
              <button className="modal-close-btn" onClick={() => setSelectedEvent(null)}>✕</button>
            </div>

            <div className="event-detail-body">
              <div className="detail-poster-wrap">
                <img src={selectedEvent.posterUrl} alt={selectedEvent.title} className="detail-poster-img" />
              </div>

              <div className="detail-content-wrap">
                <div className="detail-cat-badge">{selectedEvent.category}</div>
                <h3 className="detail-title">{selectedEvent.title}</h3>

                <div className="detail-meta-list">
                  <div className="meta-item">
                    <span className="meta-icon"><IconMapPin size={16} color="#38bdf8" /></span>
                    <div>
                      <div className="meta-label">VENUE</div>
                      <div className="meta-val">{selectedEvent.venue}</div>
                    </div>
                  </div>

                  <div className="meta-item">
                    <span className="meta-icon"><IconEvents size={16} color="#fdbe53" /></span>
                    <div>
                      <div className="meta-label">SCHEDULE</div>
                      <div className="meta-val">
                        {new Date(selectedEvent.startDate).toLocaleString()} — {new Date(selectedEvent.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="meta-item">
                    <span className="meta-icon"><IconShield size={16} color="#e84537" /></span>
                    <div>
                      <div className="meta-label">ORGANIZERS & PARTNERS</div>
                      <div className="meta-val">{selectedEvent.partner}</div>
                    </div>
                  </div>
                </div>

                <div className="detail-desc-box">
                  <h4>EVENT OVERVIEW</h4>
                  <p>{selectedEvent.description}</p>
                </div>

                {/* Tournament Results / Winners Podium */}
                {selectedEvent.results?.champion && (
                  <div className="detail-results-box">
                    <h4>🏆 TOURNAMENT WINNERS</h4>
                    <div className="winners-grid">
                      <div className="winner-cell gold">
                        <span className="medal">🥇 1ST PLACE</span>
                        <strong>{selectedEvent.results.champion}</strong>
                      </div>
                      {selectedEvent.results.runnerUp && (
                        <div className="winner-cell silver">
                          <span className="medal">🥈 2ND PLACE</span>
                          <strong>{selectedEvent.results.runnerUp}</strong>
                        </div>
                      )}
                    </div>
                    {selectedEvent.results.highlights && (
                      <p className="results-notes">{selectedEvent.results.highlights}</p>
                    )}
                  </div>
                )}

                {/* Registration Action */}
                {selectedEvent.registrationUrl && selectedEvent.computedStatus !== 'ENDED' && (
                  <div className="detail-cta-wrap" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <a
                      href={selectedEvent.registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="gamified-btn modal-reg-btn"
                      onClick={() => eventService.trackRegistrationClick(selectedEvent.id, selectedEvent.title)}
                    >
                      <IconRocket size={18} />
                      <span>OFFICIAL REGISTRATION LINK</span>
                    </a>
                    <Link
                      to={`/events/${selectedEvent.slug || selectedEvent.id}`}
                      className="gamified-btn"
                      style={{ background: '#1e293b', border: '1px solid #334155' }}
                      onClick={() => sound.playSelect()}
                    >
                      OPEN STANDALONE PAGE ↗
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Host an Event CTA */}
      <section className="gamified-card host-event-card">
        <h3 className="section-title">CO-HOST A GAMING OR ESPORTS EVENT</h3>
        <p className="host-desc">
          Are you a college fest coordinator, gaming club president, or community organizer? 
          Partner with Nomad's Province for complete tournament operations, rulebooks, live streaming, and verified certificates.
        </p>
        <div className="host-actions">
          <a href={ORG_INFO.whatsapp} target="_blank" rel="noreferrer" className="gamified-btn host-btn" onMouseEnter={() => sound.playBlip()}>
            <IconWhatsApp size={16} />
            <span>CO-HOST AN EVENT VIA WHATSAPP</span>
          </a>
          <Link to="/admin" className="admin-portal-link" onMouseEnter={() => sound.playBlip()}>
            Admin Command Center →
          </Link>
        </div>
      </section>
    </GameShell>
  );
}
