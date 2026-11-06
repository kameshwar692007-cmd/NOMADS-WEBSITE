// Nomad's Province — Main Headquarters (/about)
// Rich gamified layout with interactive stats, guild lore, and partner networks

import { useState } from 'react';
import GameShell from '../game/components/GameShell.jsx';
import { ORG_INFO, PARTNERS } from '../game/data/campusContent.js';
import { sound } from '../game/systems/soundFx.js';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('lore');

  return (
    <GameShell
      title="MAIN HEADQUARTERS"
      subtitle="Vision, Operational Governance & Provincial Heritage"
      accentColor="#e84537"
    >
      {/* 1. Core Mission Hologram Card */}
      <section className="gamified-card hero-citadel-card">
        <div className="card-glitch-border" />
        <div className="citadel-grid">
          <div className="citadel-text">
            <span className="quest-code">QUEST OBJECTIVE: ECOSYSTEM EXPANSION</span>
            <h2 className="citadel-heading">Building India's Premier Gaming & Esports Bastion</h2>
            <p className="citadel-desc">
              Nomad's Province is an integrated ecosystem operating across <strong>Competitive Esports, Collegiate Tournaments, and Indie Game Development</strong>. 
              We connect passionate players, student creators, indie game developers, and visionary brands under one unified platform.
            </p>
            <div className="citadel-stats-row">
              {ORG_INFO.stats.map((s, idx) => (
                <div key={idx} className="hud-metric-box">
                  <div className="metric-number">{s.value}{s.suffix}</div>
                  <div className="metric-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="citadel-badge-col">
            <div className="hologram-emblem">
              <img src="/assets/events-and-logos/img_14_2026-11-05_at_10.30.15_AM__2_.jpeg" alt="Nomad's Province Emblem" className="emblem-img" />
              <div className="hologram-ring" />
            </div>
            <div className="emblem-caption">NOMAD'S PROVINCE CORE CITADEL</div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Navigation Tabs */}
      <div className="gamified-tabs-bar">
        <button
          className={`tab-btn ${activeTab === 'lore' ? 'active' : ''}`}
          onClick={() => { sound.playSelect(); setActiveTab('lore'); }}
          onMouseEnter={() => sound.playBlip()}
        >
          📜 CHRONICLES & PILLARS
        </button>
        <button
          className={`tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => { sound.playSelect(); setActiveTab('matrix'); }}
          onMouseEnter={() => sound.playBlip()}
        >
          ⚔️ PROVINCE STANDARD
        </button>
        <button
          className={`tab-btn ${activeTab === 'allies' ? 'active' : ''}`}
          onClick={() => { sound.playSelect(); setActiveTab('allies'); }}
          onMouseEnter={() => sound.playBlip()}
        >
          🛡️ STRATEGIC ALLIES ({PARTNERS.length})
        </button>
      </div>

      {/* Tab 1: Chronicles & Pillars */}
      {activeTab === 'lore' && (
        <div className="tab-pane fade-in">
          <div className="grid-3-col">
            <div className="gamified-card pillar-card" onMouseEnter={() => sound.playBlip()}>
              <div className="pillar-icon">🏆</div>
              <h3 className="pillar-title">Competitive Esports</h3>
              <p className="pillar-text">
                Hosting tiered scrims, collegiate showdowns, and live-streamed tournament circuits across Free Fire Max, CODM, Indus, and BGMI.
              </p>
              <div className="pillar-tag">10+ TOURNAMENTS HOSTED</div>
            </div>

            <div className="gamified-card pillar-card" onMouseEnter={() => sound.playBlip()}>
              <div className="pillar-icon">🎮</div>
              <h3 className="pillar-title">Game Development Studio</h3>
              <p className="pillar-text">
                Expanding into original indie titles, technical game jam prototypes, and interactive WebGL experiences in partnership with GDAI.
              </p>
              <div className="pillar-tag">ORIGINAL IP DEVELOPMENT</div>
            </div>

            <div className="gamified-card pillar-card" onMouseEnter={() => sound.playBlip()}>
              <div className="pillar-icon">🎓</div>
              <h3 className="pillar-title">Collegiate Network</h3>
              <p className="pillar-text">
                Empowering student leaders through our Campus Ambassador Program across BITS Pilani, SRMIST, Crescent, and universities across India.
              </p>
              <div className="pillar-tag">30+ PARTNER INSTITUTIONS</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Comparison Matrix */}
      {activeTab === 'matrix' && (
        <div className="tab-pane fade-in">
          <div className="gamified-card matrix-card">
            <h3 className="section-title">WHY PLAYERS & COMMUNITIES CHOOSE US</h3>
            <div className="comparison-table-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Ecosystem Feature</th>
                    <th>Typical Casual Communities</th>
                    <th className="highlight-col">Nomad's Province Standard</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Tournament Schedules</td>
                    <td className="status-bad">Inconsistent, frequent cancellations</td>
                    <td className="status-good">Structured monthly leagues & guaranteed weekend scrims</td>
                  </tr>
                  <tr>
                    <td>Career & Talent Pathway</td>
                    <td className="status-bad">Dead-end brackets with no progression</td>
                    <td className="status-good">Campus-to-Pro progression & verified certificates</td>
                  </tr>
                  <tr>
                    <td>Live Broadcast Production</td>
                    <td className="status-bad">Unstructured matches, zero casting</td>
                    <td className="status-good">Multi-cam spectator streams, casters & highlight reels</td>
                  </tr>
                  <tr>
                    <td>Industry Backing</td>
                    <td className="status-bad">Isolated with no brand partnerships</td>
                    <td className="status-good">Backed by Decathlon, Playo, GDAI, and premier universities</td>
                  </tr>
                  <tr>
                    <td>Game Development Integration</td>
                    <td className="status-bad">Zero game creation capabilities</td>
                    <td className="status-good">In-house studio crafting original games and prototypes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Strategic Allies Showcase */}
      {activeTab === 'allies' && (
        <div className="tab-pane fade-in">
          <div className="partners-grid">
            {PARTNERS.map((p) => (
              <div key={p.id} className="gamified-card partner-card" style={{ '--partner-accent': p.accent }} onMouseEnter={() => sound.playBlip()}>
                <div className="partner-header">
                  <span className="partner-emoji">{p.icon}</span>
                  <div className="partner-badge" style={{ borderColor: p.accent, color: p.accent }}>{p.category}</div>
                </div>
                <h4 className="partner-name">{p.name}</h4>
                <div className="partner-full-name">{p.fullName}</div>
                <p className="partner-desc">{p.desc}</p>
                {p.image && (
                  <div className="partner-img-frame">
                    <img src={p.image} alt={p.name} className="partner-thumb" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}
