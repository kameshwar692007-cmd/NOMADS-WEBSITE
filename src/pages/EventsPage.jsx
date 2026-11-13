// Nomad's Province — Event Grounds (/events)
// Real-time event grounds connected to eventService (Supabase & resilient fallback)
// Dynamic status filtering, auto-archiving, winner podiums & dedicated detail modal

import { useState, useEffect } from 'react';
import './EventGroundsGuide.css';
import { Link } from 'react-router-dom';
import GameShell from '../game/components/GameShell.jsx';
import { eventService, isEventListing } from '../game/services/eventService.js';
import { ORG_INFO } from '../game/data/campusContent.js';
import { sound } from '../game/systems/soundFx.js';
import { IconMapPin, IconEvents, IconWhatsApp, IconTrophy, IconRocket, IconShield } from '../game/components/Icons.jsx';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Load public events (excludes drafts)
  const loadEvents = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await eventService.getPublicEvents();
      setEvents(data.filter(isEventListing));
    } catch (err) {
      console.error('Failed to load events:', err);
      setEvents([]);
      setLoadError('Published events could not be loaded. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const categories = [...new Set(events.map(ev => ev.category).filter(Boolean))].sort();
  const filteredEvents = events.filter((ev) => {
    if (filter !== 'ALL' && ev.computedStatus !== filter) return false;
    if (category !== 'ALL' && ev.category !== category) return false;
    const query = search.trim().toLocaleLowerCase();
    if (query && ![ev.title, ev.description, ev.venue, ev.partner, ev.category]
      .some(field => String(field || '').toLocaleLowerCase().includes(query))) return false;
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
      <section className="events-field-guide gamified-card" aria-labelledby="event-guide-title">
        <span className="events-field-kicker">EVENT GROUNDS / EXPLORER'S GUIDE</span>
        <h2 id="event-guide-title">Your next adventure starts with an event</h2>
        <p>Explore actual event announcements, check schedules, and open the details of competitions,
          creative jams, and community experiences. Filters use the published event list, so results
          reflect the latest entries available to visitors.</p>
        <div className="events-guide-links">
          <a href="#event-listings" onMouseEnter={() => sound.playBlip()}>Browse event listings <span aria-hidden="true">↓</span></a>
          <Link to="/esports" onMouseEnter={() => sound.playBlip()}>Explore Esports Arena <span aria-hidden="true">→</span></Link>
          <Link to="/studio" onMouseEnter={() => sound.playBlip()}>Discover Game Studio <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      {/* 1. Event Grounds Festival Hero */}
      <section className="gamified-card events-hero-card stitch-target" data-stitch-label="Synthesizing Event Grounds Festival Hub...">
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
              aria-pressed={filter === cat.id}
              onClick={() => { sound.playSelect(); setFilter(cat.id); }}
              onMouseEnter={() => sound.playBlip()}
            >
              <span className="filter-glyph">{cat.glyph}</span> {cat.label}
            </button>
          ))}
        </div>
      </section>

      <section id="event-listings" className="events-search-panel" aria-label="Explore event listings">
        <div className="events-search-input-wrap">
          <label htmlFor="events-search">Find an event</label>
          <input id="events-search" type="search" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event, venue, or organizer..." />
        </div>
        <div className="events-category-select-wrap">
          <label htmlFor="events-category">Event category</label>
          <select id="events-category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="ALL">All categories</option>
            {categories.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <p className="events-filter-summary" role="status" aria-live="polite">
          {loading ? 'Loading published events…' : `Showing ${filteredEvents.length} of ${events.length} published events`}
        </p>
      </section>

      {loadError && (
        <div role="alert" className="gamified-card events-empty-pane">
          <p>{loadError}</p>
          <button type="button" className="events-clear-filters" onClick={loadEvents}>Retry loading</button>
        </div>
      )}

      {/* 2. Events Grid */}
      {loading ? (
        <div className="events-loading-pane">
          <span className="pulse-beacon" />
          <p>LOADING FESTIVAL SCHEDULE...</p>
        </div>
      ) : loadError ? null : filteredEvents.length === 0 ? (
        <div className="events-empty-pane">
          <IconEvents size={40} color="#64748b" />
          <p>No published events match the selected filters.</p>
          {(filter !== 'ALL' || category !== 'ALL' || search.trim()) && (
            <button type="button" className="events-clear-filters"
              onClick={() => { setFilter('ALL'); setCategory('ALL'); setSearch(''); sound.playSelect(); }}>
              Clear filters
            </button>
          )}
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
              </div>

              <div className="event-card-body">
                <div className={`event-status-badge event-status-card ${ev.computedStatus.toLowerCase()}`}>
                  {ev.computedStatus === 'ONGOING' && <span className="live-dot" />}
                  {ev.computedStatus === 'ONGOING' ? 'LIVE NOW' : ev.computedStatus === 'UPCOMING' ? 'UPCOMING' : 'CONCLUDED'}
                </div>
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
          <div className="retro-modal-card event-detail-modal mobile-detail-dialog" role="dialog" aria-modal="true" aria-label={`Details for ${selectedEvent.title}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className={`status-pill ${selectedEvent.computedStatus.toLowerCase()}`}>
                {selectedEvent.computedStatus === 'ONGOING' ? '● LIVE NOW' : selectedEvent.computedStatus}
              </span>
              <button type="button" className="modal-close-btn" aria-label="Close event details" onClick={() => setSelectedEvent(null)}>✕</button>
            </div>

            <div className="event-detail-body">
              {selectedEvent.posterUrl && <div className="detail-poster-wrap">
                <img src={selectedEvent.posterUrl} alt={selectedEvent.title} className="detail-poster-img" />
              </div>}

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

      <section className="events-visitor-notes gamified-card" aria-labelledby="events-visitor-title">
        <span className="events-field-kicker">BEFORE YOU JOIN</span>
        <h3 id="events-visitor-title">Plan your visit to Event Grounds</h3>
        <ol>
          <li><strong>Find your event.</strong> Browse by status, category, or title above.</li>
          <li><strong>Read the details.</strong> Check the published venue, schedule, and organizer information.</li>
          <li><strong>Use official links.</strong> If registration is available, follow the event's listed registration link.</li>
        </ol>
        <p>Dates, availability and registration instructions are provided by individual event listings.
          Confirm the latest announcements before making travel plans.</p>
      </section>

      {/* 4. Host an Event CTA */}
      <section className="gamified-card host-event-card">
        <h3 className="section-title">CO-HOST A GAMING OR ESPORTS EVENT</h3>
        <p className="host-desc">
          Are you a college fest coordinator, gaming club president, or community organizer? 
          Partner with Nomad's Province for complete tournament operations, rulebooks, live streaming, and verified certificates.
        </p>
        <div className="host-actions">
          <a href={ORG_INFO.whatsapp} target="_blank" rel="noreferrer" className="gamified-btn host-btn stitch-target" data-stitch-label="Compiling Co-Host Action Button..." onMouseEnter={() => sound.playBlip()}>
            <IconWhatsApp size={16} />
            <span>CO-HOST AN EVENT VIA WHATSAPP</span>
          </a>

        </div>
      </section>
    </GameShell>
  );
}
