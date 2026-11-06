// Nomad's Province — Game Development Studio (/studio)
// Showcasing original games, prototypes, and GDAI partnerships

import { useState } from 'react';
import GameShell from '../game/components/GameShell.jsx';
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

      {/* 2. Featured Projects Grid */}
      <div className="section-title-wrap">
        <h3 className="section-title">ORIGINAL CREATIONS & STUDIO PORTFOLIO</h3>
        <span className="section-badge" style={{ borderColor: '#38bdf8', color: '#38bdf8' }}>STUDIO SHOWCASE</span>
      </div>

      <div className="studio-projects-grid">
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
      </div>

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
              <IconZap size={22} color="#eab308" />
            </div>
            <div className="node-title">Unity & Godot Engines</div>
            <div className="node-sub">Cross-platform 2D mechanics, physics scripting, and prototype development.</div>
          </div>

          <div className="tech-node" onMouseEnter={() => sound.playBlip()}>
            <div className="node-icon-frame">
              <IconSparkles size={22} color="#a855f7" />
            </div>
            <div className="node-title">Handcrafted 2D Pixel Art</div>
            <div className="node-sub">Custom tilemap design, character sprites, and retro game environments.</div>
          </div>

          <div className="tech-node" onMouseEnter={() => sound.playBlip()}>
            <div className="node-icon-frame">
              <IconGlobe size={22} color="#10b981" />
            </div>
            <div className="node-title">GDAI Industry Mentorship</div>
            <div className="node-sub">Guidance from veteran Indian game developers on mechanics, art, and publishing.</div>
          </div>
        </div>
      </section>

      {/* 4. Pitch Your Game / Collab Terminal */}
      <section className="gamified-card pitch-card">
        <h3 className="section-title">COLLABORATE WITH NOMAD'S STUDIO</h3>
        <p className="pitch-intro">
          Are you a student game developer, pixel artist, programmer, or audio composer? 
          Collaborate with our studio on game jam hackathons and indie prototypes.
        </p>

        {pitchSent ? (
          <div className="pitch-success-msg">
            <span className="success-icon"><IconCheck size={18} /></span>
            <div>SUBMISSION RECEIVED: Our game development team will connect with you via email / WhatsApp!</div>
          </div>
        ) : (
          <form className="pitch-form" onSubmit={handlePitchSubmit}>
            <div className="form-row">
              <input 
                type="text" 
                placeholder="Your Name / Developer Handle" 
                className="retro-input"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <select 
                className="retro-input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Developer">Game Developer / Programmer</option>
                <option value="Pixel Artist">Pixel Artist / 2D Animator</option>
                <option value="Sound Designer">Sound Designer / Composer</option>
                <option value="Game Designer">Game Designer / Level Designer</option>
              </select>
            </div>
            <textarea 
              placeholder="Tell us about your game idea, engine experience, or link to your portfolio/itch.io..." 
              className="retro-input textarea"
              required
              rows={3}
              value={formData.pitch}
              onChange={(e) => setFormData({ ...formData, pitch: e.target.value })}
            />
            <button type="submit" className="gamified-btn pitch-submit-btn" onMouseEnter={() => sound.playBlip()}>
              <IconRocket size={16} />
              <span>SUBMIT COLLABORATION INQUIRY</span>
            </button>
          </form>
        )}
      </section>
    </GameShell>
  );
}
