// Nomad's Province — Main Headquarters (/about)
// Clean, verified information aligned with official organization profile & partner network
// Modernized single-page narrative with Pinned Split-Screen Partners Showcase

import { Link } from 'react-router-dom';
import GameShell from '../game/components/GameShell.jsx';
import { PARTNERS, TEAM_STRUCTURE, ORG_INFO } from '../game/data/campusContent.js';
import { LOCATIONS } from '../game/data/locationData.js';
import { sound } from '../game/systems/soundFx.js';
import { ThemedIcon, IconTrophy, IconCode, IconZap, IconGraduation, IconSparkles, IconRocket, IconWhatsApp } from '../game/components/Icons.jsx';
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

      {/* 2. Core Ecosystem Pillars Matrix */}
      <section className="about-section-block" aria-label="Ecosystem Pillars">
        <div className="section-narrative-header">
          <div className="narrative-tag-row">
            <span className="live-radar-dot" style={{ backgroundColor: '#38bdf8' }} />
            <span className="narrative-tag">FOUNDATIONAL PILLARS</span>
          </div>
          <h2 className="narrative-title">Ecosystem Governance & Operation Verticals</h2>
          <p className="narrative-desc">
            Six interconnected operational divisions driving collegiate tournaments, indie development hackathons, sports turf crossovers, and student creator incubation.
          </p>
        </div>

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
            Organized into dedicated operational divisions spanning strategy, studio engineering, tournament operations, and grassroots outreach.
          </p>
        </div>

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
      <PinnedPartnersShowcase partners={PARTNERS} />

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
        <p className="province-explore-map-note">
          Prefer exploring on foot? <Link to="/" onMouseEnter={() => sound.playBlip()}>Return to the campus map</Link>.
        </p>
      </section>
    </GameShell>
  );
}
