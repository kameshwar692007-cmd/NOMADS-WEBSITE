// Nomad's Province — Event Grounds (/events)
// Dynamic festival calendar with category filtering, posters, and automatic archiving

import { useState } from 'react';
import GameShell from '../game/components/GameShell.jsx';
import { EVENTS, ORG_INFO } from '../game/data/campusContent.js';
import { sound } from '../game/systems/soundFx.js';

export default function EventsPage() {
  const [filter, setFilter] = useState('ALL');
  const now = new Date();

  // Dynamic status evaluation: events past their endDate automatically archive into PAST
  const processedEvents = EVENTS.map((ev) => {
    const isPast = new Date(ev.endDate) < now;
    return { ...ev, computedStatus: isPast ? 'PAST' : 'UPCOMING' };
  });

  const filteredEvents = processedEvents.filter((ev) => {
    if (filter === 'ALL') return true;
    if (filter === 'UPCOMING') return ev.computedStatus === 'UPCOMING';
    if (filter === 'PAST') return ev.computedStatus === 'PAST';
    return true;
  });

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
          {['ALL', 'UPCOMING', 'PAST'].map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => { sound.playSelect(); setFilter(cat); }}
              onMouseEnter={() => sound.playBlip()}
            >
              {cat === 'ALL' ? '🎪 ALL EVENTS' : cat === 'UPCOMING' ? '⚡ UPCOMING EVENTS' : '🏆 PAST ARCHIVE'}
            </button>
          ))}
        </div>
      </section>

      {/* 2. Events Grid */}
      <div className="events-grid">
        {filteredEvents.map((ev) => (
          <div key={ev.id} className="gamified-card event-card" style={{ '--event-accent': ev.accent }} onMouseEnter={() => sound.playBlip()}>
            <div className="event-poster-frame">
              <img src={ev.image} alt={ev.title} className="event-poster-img" />
              <div className="event-status-badge" style={{ backgroundColor: ev.computedStatus === 'UPCOMING' ? '#10b981' : '#64748b' }}>
                {ev.computedStatus === 'UPCOMING' ? '● UPCOMING' : '✓ PAST EVENT'}
              </div>
            </div>

            <div className="event-card-body">
              <div className="event-meta-row">
                <span className="event-cat">{ev.category}</span>
                <span className="event-partner-tag">{ev.partner}</span>
              </div>

              <h4 className="event-card-title">{ev.title}</h4>
              <div className="event-venue-row">
                <span className="venue-icon">📍</span>
                <span className="venue-name">{ev.venue}</span>
              </div>

              <div className="event-date-row">
                <span className="date-icon">🗓️</span>
                <span className="date-str">{ev.date}</span>
              </div>

              <p className="event-card-desc">{ev.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Host an Event CTA */}
      <section className="gamified-card host-event-card">
        <h3 className="section-title">CO-HOST A GAMING OR ESPORTS EVENT</h3>
        <p className="host-desc">
          Are you a college fest coordinator, gaming club president, or community organizer? 
          Partner with Nomad's Province for complete tournament operations, rulebooks, live streaming, and verified certificates.
        </p>
        <div className="host-actions">
          <a href={ORG_INFO.whatsapp} target="_blank" rel="noreferrer" className="gamified-btn host-btn" onMouseEnter={() => sound.playBlip()}>
            CO-HOST AN EVENT VIA WHATSAPP 💬
          </a>
        </div>
      </section>
    </GameShell>
  );
}
