// Nomad's Province — Main Headquarters (/about)
// Clean, verified information aligned with official organization profile & partner network
// Compact organizational overview with accessible Allies carousel

import GameShell from '../game/components/GameShell.jsx';
import { PARTNERS, TEAM_STRUCTURE, ORG_INFO } from '../game/data/campusContent.js';
import { LOCATIONS } from '../game/data/locationData.js';
import { sound } from '../game/systems/soundFx.js';
import { ThemedIcon, IconTrophy, IconCode, IconWhatsApp } from '../game/components/Icons.jsx';
import PinnedPartnersShowcase from '../game/components/PinnedPartnersShowcase.jsx';
import ProvinceSlider from './ProvinceSlider.jsx';
import './AboutExplore.css';

export default function AboutPage() {
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
              {[
                { label: "Core Pillars", value: "Esports & Game Dev", icon: "trophy", accent: "#ff4444" },
                { label: "Base Operations", value: "Chennai, India", icon: "pin", accent: "#38bdf8" },
                { label: "Partner Network", value: "12+ Colleges & Brands", icon: "graduation", accent: "#fdbe53" },
                { label: "Active Sectors", value: "Sports • Esports • Studio", icon: "rocket", accent: "#10b981" },
              ].map((s, idx) => (
                <div
                  key={idx}
                  className="hud-metric-box"
                  style={{ '--metric-accent': s.accent }}
                  onMouseEnter={() => sound.playBlip()}
                >
                  <div className="metric-icon-wrap" style={{ color: s.accent, borderColor: `${s.accent}55`, backgroundColor: `${s.accent}15` }}>
                    <ThemedIcon name={s.icon} size={18} color={s.accent} />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">{s.label}</span>
                    <strong className="metric-number">{s.value}</strong>
                  </div>
                  <span className="metric-corner-bracket">┘</span>
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
                <image
                  href="/assets/game/np-emblem.webp"
                  xlinkHref="/assets/game/np-emblem.png"
                  x="43"
                  y="47.5"
                  width="34"
                  height="26.3"
                  preserveAspectRatio="xMidYMid meet"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.7))' }}
                />
                <circle cx="60" cy="60" r="38" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
              </svg>
              <div className="hologram-ring" />
            </div>
            <div className="emblem-caption">NOMAD'S PROVINCE CITADEL</div>
          </div>
        </div>
      </section>

      {/* Compact overview: details and real organizations belong in Allies below. */}
      <section className="about-section-block hq-pillars-section" aria-labelledby="hq-pillars-title">
        <div className="section-narrative-header">
          <span className="narrative-tag">WHAT WE DO</span>
          <h2 id="hq-pillars-title" className="narrative-title">Esports, Games & Community</h2>
          <p className="narrative-desc">Three connected areas, one creative ecosystem.</p>
        </div>
        <div className="hq-pillars-grid">
          <article className="gamified-card hq-pillar-card">
            <IconTrophy size={24} color="#f59e0b" />
            <h3>Competitive Esports</h3>
            <p>Tournament operations, collegiate competitions and gaming events.</p>
          </article>
          <article className="gamified-card hq-pillar-card">
            <IconCode size={24} color="#38bdf8" />
            <h3>Game Development</h3>
            <p>Original games, creative projects and developer collaboration.</p>
          </article>
          <article className="gamified-card hq-pillar-card">
            <ThemedIcon name="graduation" size={24} color="#84c669" />
            <h3>Campus & Community</h3>
            <p>Student chapters, pop-culture communities and partner programs.</p>
          </article>
        </div>
      </section>

      {/* 3. Core Provincial Guild & Leadership Team */}
      <section className="about-section-block" aria-label="Core Team & Leadership">
        <div className="section-narrative-header">
          <div className="narrative-tag-row">
            <span className="live-radar-dot" style={{ backgroundColor: '#10b981' }} />
            <span className="narrative-tag">ORGANIZATIONAL STRUCTURE</span>
          </div>
          <h2 className="narrative-title">Core Guild Leadership & Department Heads</h2>
          <p className="narrative-desc">
            Leadership and studio teams, with tournament and community operations summarized in the Allies section.
          </p>
        </div>

        <div className="grid-2-col">
          {TEAM_STRUCTURE.slice(0, 2).map((group, idx) => (
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

        {/* Join Guild Callout */}
        <div className="gamified-card join-team-callout" style={{ marginTop: '24px' }}>
          <h4>JOIN THE NOMAD'S PROVINCE TEAM</h4>
          <p>We are always expanding our team with student developers, tournament referees, casters, and collegiate ambassadors.</p>
          <a
            href={ORG_INFO.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="gamified-btn stitch-target"
            data-stitch-label="Compiling WhatsApp Connect Button..."
            onMouseEnter={() => sound.playBlip()}
          >
            <IconWhatsApp size={16} /> CONNECT WITH OUR TEAM ON WHATSAPP
          </a>
        </div>
      </section>

      {/* 4. Strategic Partners & Sponsors Showcase (Pinned Split-Screen Mask Reveal) */}
      <PinnedPartnersShowcase partners={PARTNERS} operations={TEAM_STRUCTURE.slice(2)} />

      {/* 5. Connected Province Exploration */}
      <section className="province-explore-section" aria-labelledby="province-explore-title">
        <div className="province-explore-intro">
          <span className="quest-code">YOUR ADVENTURE CONTINUES</span>
          <h2 id="province-explore-title">Explore the Province</h2>
          <p>
            Headquarters is the starting point. Step inside the other campus destinations to
            discover our competitions, games, events, community, and collaboration opportunities.
          </p>
        </div>
        <ProvinceSlider destinations={LOCATIONS.filter(destination => destination.route !== '/about')} />
      </section>
    </GameShell>
  );
}
