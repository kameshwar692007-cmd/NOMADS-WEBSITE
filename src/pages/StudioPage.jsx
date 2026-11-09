// Nomad's Province — Game Development Studio (/studio)
// Showcasing original games, prototypes, and GDAI partnerships
// Featured studio creations are immediately visible without assembly controls.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import './StudioJourney.css';
import GameShell from '../game/components/GameShell.jsx';
import { STUDIO_PROJECTS, ORG_INFO } from '../game/data/campusContent.js';
import { sound } from '../game/systems/soundFx.js';
import { IconCode, IconZap, IconSparkles, IconGlobe, IconRocket } from '../game/components/Icons.jsx';

export default function StudioPage() {
  const [pitchDraftReady, setPitchDraftReady] = useState(false);
  const [expandedProject, setExpandedProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', role: 'Developer', pitch: '' });

  const handlePitchSubmit = (e) => {
    e.preventDefault();
    sound.playSelect();
    // No backend receives this form. The visitor must send the email draft.
    setPitchDraftReady(true);
  };

  const pitchBody = [
    "Nomad's Province Game Studio — Project Pitch",
    '',
    'Creator / Team: ' + formData.name.trim(),
    'Primary role: ' + formData.role,
    '',
    'Project brief:',
    formData.pitch.trim(),
  ].join('\n');
  const pitchMailto = `mailto:${ORG_INFO.email}?subject=${encodeURIComponent('Studio Project Pitch — ' + formData.name.trim())}&body=${encodeURIComponent(pitchBody)}`;

  return (
    <GameShell
      title="GAME DEVELOPMENT STUDIO"
      subtitle="Original Games, Interactive Experiences & Tech Prototypes"
      accentColor="#38bdf8"
    >
      {/* 1. Studio Holo Header (Stitch Target) */}
      <section
        className="gamified-card studio-hero-card stitch-target"
        data-stitch-label="Constructing Studio Alliance Hub..."
        onMouseEnter={() => sound.playBlip()}
      >
        <div className="studio-alliance-badge" onMouseEnter={() => sound.playBlip()}>
          <span>PARTNERED WITH GDAI (GAME DEVELOPERS ASSOCIATION OF INDIA)</span>
        </div>
        <h2 className="studio-headline">Forging Original Games & Interactive Experiences</h2>
        <p className="studio-desc">
          Nomad's Province is expanding into our own dedicated Game Development Studio. 
          We focus on creating original indie games, interactive WebGL experiences, and gaming-related products 
          while mentoring student creators through 24-hour game development hackathons with GDAI.
        </p>
      </section>

      <section className="studio-journey-intro gamified-card" aria-labelledby="studio-journey-title">
        <span className="studio-journey-overline">STUDIO FIELD GUIDE / PROJECT ARCHIVE</span>
        <h2 id="studio-journey-title">From concept to playable worlds</h2>
        <p>Explore our existing campus experience, creative programs, and developing work.
          Open each project for its current focus and status — no fictional releases or placeholder download links.</p>
        <div className="studio-journey-navigation">
          <a href="#studio-projects" onMouseEnter={() => sound.playBlip()}>Explore projects <span aria-hidden="true">↓</span></a>
          <a href="#studio-capabilities" onMouseEnter={() => sound.playBlip()}>Studio capabilities <span aria-hidden="true">↓</span></a>
          <Link to="/events" onMouseEnter={() => sound.playBlip()}>Explore game jams <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      {/* 2. Featured Projects — direct, accessible project grid */}
      <div id="studio-projects" className="section-title-wrap studio-anchor">
        <h3 className="section-title">ORIGINAL CREATIONS & STUDIO PORTFOLIO</h3>
      </div>

      <div className="studio-project-grid">
        {STUDIO_PROJECTS.map((proj) => (
          <div
            key={proj.id}
            className="gamified-card project-card"
            style={{ '--proj-accent': proj.accent }}
            onMouseEnter={() => sound.playBlip()}
          >
            <div className="project-banner-wrap">
              <img src={proj.image} alt={proj.title} className="project-banner-img" />
              <div className="project-overlay">
                <span className="project-badge" style={{ backgroundColor: proj.accent }}>{proj.status}</span>
                <span className="project-engine">{proj.engine}</span>
              </div>
            </div>

            <div className="project-body">
              <h4 className="project-title">{proj.title}</h4>
              <div className="project-genre">{proj.genre}</div>
              <p className="project-desc">{proj.desc}</p>
              <button type="button" className="studio-project-expand"
                aria-expanded={expandedProject === proj.id}
                aria-controls={`studio-project-detail-${proj.id}`}
                onClick={() => { sound.playSelect(); setExpandedProject(expandedProject === proj.id ? null : proj.id); }}>
                {expandedProject === proj.id ? 'Hide details' : 'View More'}
                <span aria-hidden="true">{expandedProject === proj.id ? '−' : '+'}</span>
              </button>
              {expandedProject === proj.id && (
                <div id={`studio-project-detail-${proj.id}`} className="studio-project-detail">
                  <div><span>PROJECT STATUS</span><strong>{proj.status}</strong></div>
                  <div><span>FORMAT / TOOLS</span><strong>{proj.engine}</strong></div>
                  <div><span>CREATIVE FOCUS</span><strong>{proj.genre}</strong></div>
                  {proj.id === 'nomads-headquarters' && (
                    <Link to="/" onMouseEnter={() => sound.playBlip()}>Explore the playable campus <span aria-hidden="true">→</span></Link>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Studio Capabilities & Pipeline */}
      <section id="studio-capabilities" className="gamified-card tech-tree-card studio-anchor">
        <h3 className="section-title">STUDIO CAPABILITIES & TECH STACK</h3>
        <div className="tech-tree-grid">
          <div className="tech-node" onMouseEnter={() => sound.playBlip()}>
            <div className="node-icon-frame">
              <IconCode size={22} color="#38bdf8" />
            </div>
            <div className="node-title">WebGL & HTML5 Canvas</div>
            <div className="node-sub">Zero-install, browser-based interactive virtual worlds running at 60fps.</div>
          </div>

          <div className="tech-node" onMouseEnter={() => sound.playBlip()}>
            <div className="node-icon-frame">
              <IconZap size={22} color="#e84537" />
            </div>
            <div className="node-title">Unity & Godot Engine</div>
            <div className="node-sub">Multi-platform game development targeting mobile, desktop, and interactive installations.</div>
          </div>

          <div className="tech-node" onMouseEnter={() => sound.playBlip()}>
            <div className="node-icon-frame">
              <IconSparkles size={22} color="#f59e0b" />
            </div>
            <div className="node-title">24-Hour Game Jams</div>
            <div className="node-sub">Rapid prototyping hackathons organized with collegiate partners and GDAI mentors.</div>
          </div>

          <div className="tech-node" onMouseEnter={() => sound.playBlip()}>
            <div className="node-icon-frame">
              <IconGlobe size={22} color="#10b981" />
            </div>
            <div className="node-title">Indie Game Incubation</div>
            <div className="node-sub">Mentorship, production support, and industry pathways for aspiring student game developers.</div>
          </div>
        </div>
      </section>

      <section className="studio-pathway gamified-card" aria-labelledby="studio-pathway-title">
        <div className="studio-pathway-head">
          <span className="studio-journey-overline">THE CREATOR'S ROUTE</span>
          <h3 id="studio-pathway-title">How a game idea takes shape</h3>
          <p>A practical creative workflow, from an early concept through a working prototype and feedback.</p>
        </div>
        <ol className="studio-pathway-steps">
          <li><span>01</span><strong>Discover</strong><p>Identify the player, core experience, and the problem the game should solve.</p></li>
          <li><span>02</span><strong>Prototype</strong><p>Test the game loop with simple mechanics, controls, and placeholder visuals.</p></li>
          <li><span>03</span><strong>Playtest</strong><p>Gather feedback on usability, pacing, and what players find enjoyable.</p></li>
          <li><span>04</span><strong>Refine</strong><p>Polish the strongest ideas and share progress through the creator community.</p></li>
        </ol>
        <p className="studio-pathway-note">These are creative stages, not claims that every listed project has reached a particular milestone.</p>
      </section>

      {/* 4. Pitch & Collaborate Terminal */}
      <section className="gamified-card pitch-card">
        <div className="terminal-header">
          <span className="terminal-dot red" />
          <span className="terminal-dot yellow" />
          <span className="terminal-dot green" />
          <span className="terminal-title">CREATOR SUBMISSION CONSOLE</span>
        </div>

        <h3 className="section-title">HAVE A GAME CONCEPT OR TECH PROTOTYPE?</h3>
        <p className="pitch-desc">
          Nomad's Province Studio collaborates with student creators, indie devs, and university clubs. 
          Pitch your project to gain development mentorship, showcase opportunities at GameJam X, and technical collaboration.
        </p>

        {pitchDraftReady ? (
          <div className="studio-pitch-draft" role="status">
            <h4>Your project pitch is ready for review</h4>
            <p>Nothing has been submitted yet. Open the prepared email in your mail app,
              check the details, and press Send to contact Nomad's Province.</p>
            <div className="studio-pitch-draft-actions">
              <a href={pitchMailto} onClick={() => sound.playSelect()}>
                Open pitch email <span aria-hidden="true">↗</span>
              </a>
              <button type="button" onClick={() => { sound.playSelect(); setPitchDraftReady(false); }}>
                Edit pitch
              </button>
            </div>
            <p>If your mail app doesn't open, send your pitch to
              <a href={`mailto:${ORG_INFO.email}`}>{ORG_INFO.email}</a>.</p>
          </div>
        ) : (
          <form className="pitch-form" onSubmit={handlePitchSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="retro-label">CREATOR / TEAM NAME</label>
                <input 
                  type="text" 
                  placeholder="Your Name or Studio Squad" 
                  className="retro-input"
                  required
                  value={formData.name}
                  onFocus={() => sound.playBlip()}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="retro-label">PRIMARY ROLE</label>
                <select 
                  className="retro-input"
                  value={formData.role}
                  onFocus={() => sound.playBlip()}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="Game Developer">Game Developer (Code / Engine)</option>
                  <option value="Game Designer">Game Designer (Mechanics / Lore)</option>
                  <option value="Pixel / 3D Artist">Artist (Pixel Art, 3D, UI/UX)</option>
                  <option value="Audio Composer">Audio Composer / Sound Designer</option>
                  <option value="College Club">Collegiate Game Dev Club</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="retro-label">GAME CONCEPT / PROTOTYPE BRIEF</label>
              <textarea 
                placeholder="Describe your game mechanics, genre, engine, or collaboration proposal..." 
                className="retro-input textarea"
                required
                rows={3}
                value={formData.pitch}
                onFocus={() => sound.playBlip()}
                onChange={(e) => setFormData({ ...formData, pitch: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="gamified-btn submit-pitch-btn stitch-target"
              data-stitch-label="Compiling Studio Submission CTA..."
              onMouseEnter={() => sound.playBlip()}
            >
              <IconRocket size={16} />
              <span>PREPARE STUDIO PITCH EMAIL</span>
            </button>
          </form>
        )}
      </section>
    </GameShell>
  );
}
