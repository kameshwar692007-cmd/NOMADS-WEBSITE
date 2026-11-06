// Nomad's Province — Main Headquarters (/about)
// Clean, verified information aligned with official organization profile & partner network

import { useState } from 'react';
import GameShell from '../game/components/GameShell.jsx';
import { ORG_INFO, PARTNERS, TEAM_STRUCTURE } from '../game/data/campusContent.js';
import { sound } from '../game/systems/soundFx.js';
import { ThemedIcon, IconTrophy, IconCode, IconZap, IconGraduation, IconSparkles, IconRocket, IconWhatsApp } from '../game/components/Icons.jsx';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('lore');

  return (
    <GameShell
      title="MAIN HEADQUARTERS"
      subtitle="Vision, Ecosystem Governance & Core Provincial Guild"
      accentColor="#e84537"
    >
      {/* 1. Core Mission Hologram Card (Stitch Target) */}
      <section className="gamified-card hero-citadel-card stitch-target" data-stitch-label="Constructing Citadel Headquarters...">
        <div className="card-glitch-border" />
        <div className="citadel-grid">
          <div className="citadel-text">
            <span className="quest-code">ABOUT NOMAD'S PROVINCE • CHENNAI</span>
            <h2 className="citadel-heading">Building a Unified Esports & Game Development Ecosystem</h2>
            <p className="citadel-desc">
              <strong>Nomad's Province</strong> is an organization working across <strong>Sports, Esports, and Game Development</strong>. 
              We organize competitive tournaments, gaming events, college festivals, grassroots initiatives, community programs, and industry collaborations. 
              Our primary focus moving forward is expanding our dedicated <strong>Game Development Studio</strong> and organizing structured <strong>Esports competitions</strong>.
            </p>
            <div className="citadel-stats-row">
              {ORG_INFO.stats.map((s, idx) => (
                <div key={idx} className="hud-metric-box">
                  <div className="metric-number">{s.value}</div>
                  <div className="metric-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="citadel-badge-col">
            <div className="hologram-emblem">
              {/* Gamified Nomad's Province Cyber Shield */}
              <svg viewBox="0 0 120 120" className="emblem-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="60,10 108,35 108,85 60,110 12,85 12,35" stroke="#e84537" strokeWidth="4" fill="rgba(232, 69, 55, 0.12)" />
                <polygon points="60,22 96,42 96,80 60,98 24,80 24,42" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" fill="none" />
                <path d="M42 45 L60 35 L78 45 L78 72 L60 85 L42 72 Z" fill="#e84537" opacity="0.8" />
                <text x="60" y="66" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold" fontFamily="monospace">NP</text>
                <circle cx="60" cy="60" r="38" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
              </svg>
              <div className="hologram-ring" />
            </div>
            <div className="emblem-caption">NOMAD'S PROVINCE CITADEL</div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Navigation Tabs (Stitch Target on Button) */}
      <div className="gamified-tabs-bar">
        <button
          className={`tab-btn stitch-target ${activeTab === 'lore' ? 'active' : ''}`}
          data-stitch-label="Compiling Mission Tab Button..."
          onClick={() => { sound.playSelect(); setActiveTab('lore'); }}
          onMouseEnter={() => sound.playBlip()}
        >
          <span className="tab-glyph">◈</span> MISSION & PILLARS
        </button>
        <button
          className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => { sound.playSelect(); setActiveTab('team'); }}
          onMouseEnter={() => sound.playBlip()}
        >
          <span className="tab-glyph">◆</span> CORE TEAM & ROLES
        </button>
        <button
          className={`tab-btn ${activeTab === 'allies' ? 'active' : ''}`}
          onClick={() => { sound.playSelect(); setActiveTab('allies'); }}
          onMouseEnter={() => sound.playBlip()}
        >
          <span className="tab-glyph">✦</span> STRATEGIC PARTNERS ({PARTNERS.length})
        </button>
      </div>

      {/* Tab 1: Mission & 4 Pillars */}
      {activeTab === 'lore' && (
        <div className="tab-pane fade-in">
          <div className="grid-3-col">
            <div className="gamified-card pillar-card" onMouseEnter={() => sound.playBlip()}>
              <div className="pillar-icon-box">
                <IconTrophy size={26} color="#f59e0b" />
              </div>
              <h3 className="pillar-title">Esports & Tournaments</h3>
              <p className="pillar-text">
                Orchestrating competitive tournament circuits, collegiate scrims, and live-streamed matches across Free Fire Max, CODM, Indus, and BGMI.
              </p>
              <div className="pillar-tag">COMPETITIVE CIRCUITS</div>
            </div>

            <div className="gamified-card pillar-card" onMouseEnter={() => sound.playBlip()}>
              <div className="pillar-icon-box">
                <IconCode size={26} color="#38bdf8" />
              </div>
              <h3 className="pillar-title">Game Development Studio</h3>
              <p className="pillar-text">
                Creating original indie games, interactive WebGL experiences, and hosting 24-hr game dev hackathons in partnership with GDAI.
              </p>
              <div className="pillar-tag">GDAI ALLIANCE</div>
            </div>

            <div className="gamified-card pillar-card" onMouseEnter={() => sound.playBlip()}>
              <div className="pillar-icon-box">
                <IconZap size={26} color="#10b981" />
              </div>
              <h3 className="pillar-title">Sports & Active Gaming</h3>
              <p className="pillar-text">
                Combining physical turf sports activations and digital gaming tournaments in partnership with Decathlon and Playo.
              </p>
              <div className="pillar-tag">DECATHLON & PLAYO</div>
            </div>

            <div className="gamified-card pillar-card" onMouseEnter={() => sound.playBlip()}>
              <div className="pillar-icon-box">
                <IconGraduation size={26} color="#f97316" />
              </div>
              <h3 className="pillar-title">Collegiate Network</h3>
              <p className="pillar-text">
                Partnering with institutions like SRMIST, Easwari Engineering, VIT-AP, Crescent, and St. Lourdes to nurture campus talent.
              </p>
              <div className="pillar-tag">COLLEGE CHAPTERS</div>
            </div>

            <div className="gamified-card pillar-card" onMouseEnter={() => sound.playBlip()}>
              <div className="pillar-icon-box">
                <IconSparkles size={26} color="#a855f7" />
              </div>
              <h3 className="pillar-title">Pop-Culture Communities</h3>
              <p className="pillar-text">
                Collaborating with regional cultural groups like Chennai Anime Club and Otaku Nadu for anime screenings, cosplay, and gaming fests.
              </p>
              <div className="pillar-tag">CULTURE CROSSOVERS</div>
            </div>

            <div className="gamified-card pillar-card" onMouseEnter={() => sound.playBlip()}>
              <div className="pillar-icon-box">
                <IconRocket size={26} color="#ef4444" />
              </div>
              <h3 className="pillar-title">Startup & Innovation</h3>
              <p className="pillar-text">
                Supported by Huddle Global (KSUM) and Easwari Startup Incubator to connect gaming creators with industry and venture opportunities.
              </p>
              <div className="pillar-tag">HUDDLE GLOBAL & KSUM</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Core Team Showcase */}
      {activeTab === 'team' && (
        <div className="tab-pane fade-in">
          <div className="grid-2-col">
            {TEAM_STRUCTURE.map((group, idx) => (
              <div key={idx} className="gamified-card team-group-card" onMouseEnter={() => sound.playBlip()}>
                <div className="team-group-header">
                  <span className="role-chip">{group.roleCategory}</span>
                  <h3 className="group-title">{group.title}</h3>
                </div>
                <p className="group-desc">{group.desc}</p>
                <div className="members-subgrid">
                  {group.members.map((m, mIdx) => (
                    <div key={mIdx} className="member-role-row">
                      <div className="role-bullet">▸</div>
                      <div className="member-info">
                        <strong className="member-role-title">{m.role}</strong>
                        <div className="member-area">{m.area}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="gamified-card join-team-callout">
            <h4>JOIN THE NOMAD'S PROVINCE TEAM</h4>
            <p>We are always expanding our team with student developers, tournament referees, casters, and collegiate ambassadors.</p>
            <a
              href="https://whatsapp.com/channel/0029VbCLLDiAjPXQTWkJP00f"
              target="_blank"
              rel="noreferrer"
              className="gamified-btn stitch-target"
              data-stitch-label="Compiling WhatsApp Connect Button..."
              onMouseEnter={() => sound.playBlip()}
            >
              <IconWhatsApp size={16} /> CONNECT WITH OUR TEAM ON WHATSAPP
            </a>
          </div>
        </div>
      )}

      {/* Tab 3: Strategic Partners Showcase (14 Verified Partners) */}
      {activeTab === 'allies' && (
        <div className="tab-pane fade-in">
          <div className="partners-grid">
            {PARTNERS.map((p) => (
              <div key={p.id} className="gamified-card partner-card" style={{ '--partner-accent': p.accent }} onMouseEnter={() => sound.playBlip()}>
                <div className="partner-header">
                  <span className="partner-icon-frame">
                    <ThemedIcon name={p.iconType} size={20} color={p.accent} />
                  </span>
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
