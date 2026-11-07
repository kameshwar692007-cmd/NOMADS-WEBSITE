// Nomad's Province — Esports Arena (/esports)
// High-energy competitive tournament dashboard with verified titles & authentic registration

import { useState } from 'react';
import { Link } from 'react-router-dom';
import './EsportsArenaGuide.css';
import GameShell from '../game/components/GameShell.jsx';
import { TOURNAMENTS, ORG_INFO } from '../game/data/campusContent.js';
import { sound } from '../game/systems/soundFx.js';
import { IconCrosshair, IconWhatsApp, IconInstagram } from '../game/components/Icons.jsx';

export default function EsportsPage() {
  const [selectedTournament, setSelectedTournament] = useState(TOURNAMENTS[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeGame, setActiveGame] = useState('all');
  const visibleTournaments = activeGame === 'all'
    ? TOURNAMENTS
    : TOURNAMENTS.filter(tourney => tourney.id === activeGame);

  const handleRegisterClick = (tourney) => {
    sound.playSelect();
    setSelectedTournament(tourney);
    setModalOpen(true);
  };

  return (
    <GameShell
      title="ESPORTS ARENA"
      subtitle="Competitive Tournament Circuits, Collegiate Scrims & Community Showdowns"
      accentColor="#ff4444"
    >
      {/* 1. Arena Live Radar Banner (Stitch Target) */}
      <section className="gamified-card arena-hero-card stitch-target" data-stitch-label="Constructing Esports Radar Hub...">
        <div className="arena-pulse-header">
          <div className="arena-status-pill">
            <span className="live-radar-dot" />
            <span>COLLEGIATE & COMMUNITY CIRCUITS ACTIVE</span>
          </div>
          <div className="arena-scrim-alert">REGISTRATIONS OPEN VIA OFFICIAL CHANNELS</div>
        </div>

        <div className="arena-headline-wrap">
          <h2 className="arena-headline">Where Competitors Battle Across Premier Mobile & PC Titles</h2>
          <p className="arena-sub">
            Nomad's Province organizes structured esports tournaments, collegiate scrims, and community showdowns 
            across India's top competitive titles including Free Fire Max, Call of Duty: Mobile, Indus Battle Royale, and BGMI.
          </p>
        </div>
      </section>

      {/* A playable-looking briefing, backed by the existing real tournament list. */}
      <section className="arena-field-guide gamified-card" aria-labelledby="arena-guide-title">
        <div className="arena-guide-heading">
          <span className="arena-guide-kicker">ARENA FIELD GUIDE / START HERE</span>
          <h2 id="arena-guide-title">Choose your game. Find your circuit.</h2>
          <p>
            Browse the formats below, open a tournament to find its official contact channels,
            or explore current event announcements before joining a competition.
          </p>
        </div>
        <nav className="arena-guide-links" aria-label="Arena quick navigation">
          <a href="#arena-circuits" onMouseEnter={() => sound.playBlip()}>
            <span aria-hidden="true">01</span> Tournament circuits
          </a>
          <a href="#arena-progression" onMouseEnter={() => sound.playBlip()}>
            <span aria-hidden="true">02</span> Competitive pathway
          </a>
          <Link to="/events" onMouseEnter={() => sound.playBlip()}>
            <span aria-hidden="true">↗</span> Event announcements
          </Link>
        </nav>
      </section>

      {/* 2. Active Tournaments Battle Grid */}
      <div id="arena-circuits" className="section-title-wrap arena-circuit-anchor">
        <h3 className="section-title">FEATURED TOURNAMENT CIRCUITS</h3>
        <span className="section-badge">TOURNAMENT BRACKETS</span>
      </div>

      <div className="arena-game-filters" role="group" aria-label="Filter by game">
        <button type="button" className={`arena-game-filter ${activeGame === 'all' ? 'active' : ''}`}
          aria-pressed={activeGame === 'all'} onClick={() => { sound.playSelect(); setActiveGame('all'); }}>
          All games
        </button>
        {TOURNAMENTS.map(tourney => (
          <button type="button" key={tourney.id}
            className={`arena-game-filter ${activeGame === tourney.id ? 'active' : ''}`}
            aria-pressed={activeGame === tourney.id}
            onClick={() => { sound.playSelect(); setActiveGame(tourney.id); }}>
            {tourney.game}
          </button>
        ))}
      </div>
      <p className="arena-filter-count" aria-live="polite">
        Showing {visibleTournaments.length} of {TOURNAMENTS.length} tournament circuits
      </p>
      <div className="tournaments-grid">
        {visibleTournaments.map((t, idx) => (
          <div 
            key={t.id} 
            className="gamified-card tournament-card"
            style={{ '--tourney-accent': t.accent }}
            onMouseEnter={() => sound.playBlip()}
          >
            <div className="tourney-header-chip-wrap">
              <span className="tourney-status-chip" style={{ backgroundColor: t.accent }}>{t.status}</span>
              <span className="tourney-game-badge">{t.game}</span>
            </div>

            <div className="tourney-body">
              <div className="tourney-badge-sub" style={{ color: t.accent }}>{t.badge}</div>
              <h4 className="tourney-title">{t.title}</h4>
              <p className="tourney-desc">{t.desc}</p>

              <div className="tourney-partner-tag">
                <span className="partner-bullet">●</span> {t.partnerInfo}
              </div>

              <div className="tourney-specs-grid">
                <div className="spec-box">
                  <span className="spec-label">AWARDS & RECOGNITION</span>
                  <span className="spec-val" style={{ color: t.accent }}>{t.prizePool}</span>
                </div>
                <div className="spec-box">
                  <span className="spec-label">MATCH FORMAT</span>
                  <span className="spec-val">{t.format}</span>
                </div>
              </div>

              <button
                className={`gamified-btn tourney-btn ${idx === 0 ? 'stitch-target' : ''}`}
                data-stitch-label={idx === 0 ? "Compiling Tournament Register CTA..." : undefined}
                style={{ backgroundColor: t.accent }}
                onClick={() => handleRegisterClick(t)}
                onMouseEnter={() => sound.playBlip()}
              >
                <IconCrosshair size={16} />
                <span>REGISTER FOR TOURNAMENT</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Three-Tier Progression Matrix */}
      <section id="arena-progression" className="gamified-card progression-card">
        <h3 className="section-title">THE THREE-TIER COMPETITIVE PIPELINE</h3>
        <div className="pipeline-steps-grid">
          <div className="pipeline-step" onMouseEnter={() => sound.playBlip()}>
            <div className="step-num">01</div>
            <h4 className="step-title">Community Scrims</h4>
            <p className="step-desc">Regular practice rooms and custom lobbies for squads to build team chemistry and match discipline.</p>
          </div>
          <div className="pipeline-step" onMouseEnter={() => sound.playBlip()}>
            <div className="step-num">02</div>
            <h4 className="step-title">Collegiate Cups</h4>
            <p className="step-desc">Bracketed tournaments across partner colleges with verified team rosters and certificate recognition.</p>
          </div>
          <div className="pipeline-step" onMouseEnter={() => sound.playBlip()}>
            <div className="step-num">03</div>
            <h4 className="step-title">Broadcasted Finals</h4>
            <p className="step-desc">Live-streamed showdowns featuring caster commentary, spectator replays, and MVP highlights.</p>
          </div>
        </div>
      </section>

      <section className="arena-next-step gamified-card" aria-labelledby="arena-next-title">
        <div>
          <span className="arena-guide-kicker">BEYOND THE ARENA</span>
          <h3 id="arena-next-title">Part of a bigger province</h3>
          <p>
            Competitive events are one part of Nomad's Province. Visit the Event Grounds for
            event updates or the Community Hub to discover ways to connect with other gamers.
          </p>
        </div>
        <div className="arena-next-actions">
          <Link to="/events" onMouseEnter={() => sound.playBlip()}>Explore Event Grounds <span aria-hidden="true">→</span></Link>
          <Link to="/community" onMouseEnter={() => sound.playBlip()}>Visit Community Hub <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      {/* 4. Registration Modal with Official Channels */}
      {modalOpen && (
        <div className="retro-modal-backdrop" onClick={() => { sound.playCancel(); setModalOpen(false); }}>
          <div className="retro-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderColor: selectedTournament?.accent }}>
              <h3>ENTER {selectedTournament?.title}</h3>
              <button className="modal-close-btn" onClick={() => { sound.playCancel(); setModalOpen(false); }}>✕</button>
            </div>
            <div className="modal-body">
              <p>Squad check-ins and external registration forms are coordinated via our official channels:</p>
              <div className="modal-links">
                <a 
                  href={ORG_INFO.whatsapp} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="modal-action-btn whatsapp-btn"
                  onClick={() => sound.playSelect()}
                >
                  <IconWhatsApp size={18} />
                  <span>Register via WhatsApp Channel</span>
                </a>
                <a 
                  href={ORG_INFO.instagram} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="modal-action-btn insta-btn"
                  onClick={() => sound.playSelect()}
                >
                  <IconInstagram size={18} />
                  <span>View Updates on Instagram (@nomadsprovince)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </GameShell>
  );
}
