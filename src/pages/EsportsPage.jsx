// Nomad's Province — Esports Arena (/esports)
// High-energy competitive tournament dashboard with verified titles & authentic registration

import { useState } from 'react';
import GameShell from '../game/components/GameShell.jsx';
import { TOURNAMENTS, ORG_INFO } from '../game/data/campusContent.js';
import { sound } from '../game/systems/soundFx.js';

export default function EsportsPage() {
  const [selectedTournament, setSelectedTournament] = useState(TOURNAMENTS[0]);
  const [modalOpen, setModalOpen] = useState(false);

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
      {/* 1. Arena Live Radar Banner */}
      <section className="gamified-card arena-hero-card">
        <div className="arena-pulse-header">
          <div className="arena-status-pill">
            <span className="live-radar-dot" />
            <span>COLLEGIATE & COMMUNITY CIRCUITS ACTIVE</span>
          </div>
          <div className="arena-scrim-alert">OFFICIAL SQUAD REGISTRATIONS OPEN</div>
        </div>

        <div className="arena-headline-wrap">
          <h2 className="arena-headline">Where Competitors Battle Across Premier Mobile & PC Titles</h2>
          <p className="arena-sub">
            Nomad's Province organizes structured esports tournaments, collegiate scrims, and community showdowns 
            across India's top competitive titles including Free Fire Max, Call of Duty: Mobile, Indus Battle Royale, and BGMI.
          </p>
        </div>
      </section>

      {/* 2. Active Tournaments Battle Grid */}
      <div className="section-title-wrap">
        <h3 className="section-title">FEATURED TOURNAMENT CIRCUITS</h3>
        <span className="section-badge">NOMAD'S PROVINCE BRACKETS</span>
      </div>

      <div className="tournaments-grid">
        {TOURNAMENTS.map((t) => (
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
                className="gamified-btn tourney-btn"
                style={{ backgroundColor: t.accent }}
                onClick={() => handleRegisterClick(t)}
                onMouseEnter={() => sound.playBlip()}
              >
                <span>⚔️ REGISTER FOR TOURNAMENT</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Three-Tier Progression Matrix */}
      <section className="gamified-card progression-card">
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

      {/* 4. Registration Modal with Official Free Channels */}
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
                  💬 Register via WhatsApp Channel
                </a>
                <a 
                  href={ORG_INFO.instagram} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="modal-action-btn insta-btn"
                  onClick={() => sound.playSelect()}
                >
                  📸 Check Updates on Instagram (@nomadsprovince)
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </GameShell>
  );
}
