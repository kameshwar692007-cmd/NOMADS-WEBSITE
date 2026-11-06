// Nomad's Province — Game Development Studio (/studio)
// Showcasing original games, prototypes, and GDAI partnerships
// Progressive blueprint assembly animation on featured studio creations

import { useState } from 'react';
import GameShell from '../game/components/GameShell.jsx';
import BlueprintAssembler from '../game/components/BlueprintAssembler.jsx';
import { STUDIO_PROJECTS, ORG_INFO } from '../game/data/campusContent.js';
import { sound } from '../game/systems/soundFx.js';
import { IconCode, IconZap, IconSparkles, IconGlobe, IconRocket, IconCheck } from '../game/components/Icons.jsx';

export default function StudioPage() {
  const [pitchSent, setPitchSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'Developer', pitch: '' });

  const handlePitchSubmit = (e) => {
    e.preventDefault();
    sound.playSelect();
    setPitchSent(true);
    setTimeout(() => setPitchSent(false), 4000);
    setFormData({ name: '', role: 'Developer', pitch: '' });
  };

  return (
    <GameShell
      title="GAME DEVELOPMENT STUDIO"
      subtitle="Original Games, Interactive Experiences & Tech Prototypes"
      accentColor="#38bdf8"
    >
      {/* 1. Studio Holo Header */}
      <section className="gamified-card studio-hero-card">
        <div className="studio-alliance-badge">
          <span>PARTNERED WITH GDAI (GAME DEVELOPERS ASSOCIATION OF INDIA)</span>
        </div>
        <h2 className="studio-headline">Forging Original Games & Interactive Experiences</h2>
        <p className="studio-desc">
          Nomad's Province is expanding into our own dedicated Game Development Studio. 
          We focus on creating original indie games, interactive WebGL experiences, and gaming-related products 
          while mentoring student creators through 24-hour game development hackathons with GDAI.
        </p>
      </section>

      {/* 2. Featured Projects Blueprint Assembly Showcase */}
      <div className="section-title-wrap">
        <h3 className="section-title">ORIGINAL CREATIONS & STUDIO PORTFOLIO</h3>
        <span className="section-badge" style={{ borderColor: '#38bdf8', color: '#38bdf8' }}>BLUEPRINT ASSEMBLY</span>
      </div>

      <BlueprintAssembler
        promptText="Construct Nomad's Province original creations, WebGL game engines, and hackathon prototypes..."
        moduleTag="studio_engine.sh"
        accentColor="#38bdf8"
        layout="grid"
      >
        {STUDIO_PROJECTS.map((proj) => (
          <div key={proj.id} className="gamified-card project-card" style={{ '--proj-accent': proj.accent }} onMouseEnter={() => sound.playBlip()}>
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
            </div>
          </div>
        ))}
      </BlueprintAssembler>

      {/* 3. Studio Capabilities & Pipeline */}
      <section className="gamified-card tech-tree-card">
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

        {pitchSent ? (
          <div className="pitch-success-msg">
            <span className="success-icon"><IconCheck size={18} /></span>
            <div>TRANSMISSION LOGGED: Our studio leads will review your concept and reach out via official channels!</div>
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="retro-label">PRIMARY ROLE</label>
                <select 
                  className="retro-input"
                  value={formData.role}
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
                onChange={(e) => setFormData({ ...formData, pitch: e.target.value })}
              />
            </div>

            <button type="submit" className="gamified-btn submit-pitch-btn" onMouseEnter={() => sound.playBlip()}>
              <IconRocket size={16} />
              <span>TRANSMIT STUDIO PITCH</span>
            </button>
          </form>
        )}
      </section>
    </GameShell>
  );
}
