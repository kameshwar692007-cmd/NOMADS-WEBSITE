// Nomad's Province — Game Development Studio (/studio)
// Showcasing original games, prototypes, and GDAI partnerships

import { useState } from 'react';
import GameShell from '../game/components/GameShell.jsx';
import { STUDIO_PROJECTS, ORG_INFO } from '../game/data/campusContent.js';
import { sound } from '../game/systems/soundFx.js';

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
      subtitle="Original Games, Interactive Experiments & Tech Prototypes"
      accentColor="#38bdf8"
    >
      {/* 1. Studio Holo Header */}
      <section className="gamified-card studio-hero-card">
        <div className="studio-alliance-badge">
          <span>PARTNERED WITH GDAI (GAME DEVELOPERS ASSOCIATION OF INDIA)</span>
        </div>
        <h2 className="studio-headline">Forging Original Worlds from Code & Pixels</h2>
        <p className="studio-desc">
          Nomad's Studio expands our gaming ecosystem from competitive play into original game design. 
          We craft retro-inspired indie games, WebGL interactive experiences, and 24-hour game jam experiments.
        </p>
      </section>

      {/* 2. Featured Projects Grid */}
      <div className="section-title-wrap">
        <h3 className="section-title">ORIGINAL TITLES & ACTIVE PRODUCTION</h3>
        <span className="section-badge" style={{ borderColor: '#38bdf8', color: '#38bdf8' }}>STUDIO PORTFOLIO</span>
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

      {/* 3. Studio Tech Tree / Engine Matrix */}
      <section className="gamified-card tech-tree-card">
        <h3 className="section-title">ENGINE & PRODUCTION PIPELINE</h3>
        <div className="tech-tree-grid">
          <div className="tech-node" onMouseEnter={() => sound.playBlip()}>
            <div className="node-icon">👾</div>
            <div className="node-title">WebGL & Canvas</div>
            <div className="node-sub">Zero-lag, 60fps browser rendering, nearest-neighbor scaling.</div>
          </div>

          <div className="tech-node" onMouseEnter={() => sound.playBlip()}>
            <div className="node-icon">⚙️</div>
            <div className="node-title">Godot & Unity</div>
            <div className="node-sub">Multi-platform indie pipeline for 2D top-down & 3D mechanics.</div>
          </div>

          <div className="tech-node" onMouseEnter={() => sound.playBlip()}>
            <div className="node-icon">🎨</div>
            <div className="node-title">Handcrafted Pixel Art</div>
            <div className="node-sub">Authored tilemaps, multi-directional sprites & fluid frame cycles.</div>
          </div>

          <div className="tech-node" onMouseEnter={() => sound.playBlip()}>
            <div className="node-icon">🎵</div>
            <div className="node-title">Chiptune & Adaptive Audio</div>
            <div className="node-sub">Dynamic synthesizers and retro ambient audio programming.</div>
          </div>
        </div>
      </section>

      {/* 4. Pitch Your Game / Collab Terminal */}
      <section className="gamified-card pitch-card">
        <h3 className="section-title">PITCH A PROTOTYPE / JOIN THE STUDIO</h3>
        <p className="pitch-intro">
          Are you a pixel artist, gameplay programmer, or sound designer? Connect with Nomad's Studio to collaborate on upcoming game jam entries and commercial titles.
        </p>

        {pitchSent ? (
          <div className="pitch-success-msg">
            <span className="success-icon">✓</span>
            <div>TRANSMISSION RECEIVED: We will review your prototype via email / WhatsApp!</div>
          </div>
        ) : (
          <form className="pitch-form" onSubmit={handlePitchSubmit}>
            <div className="form-row">
              <input 
                type="text" 
                placeholder="Your Name / Handle" 
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
                <option value="Pixel Artist">Pixel Artist / Animator</option>
                <option value="Sound Designer">Sound Designer / Composer</option>
                <option value="Game Designer">Game Designer / Writer</option>
              </select>
            </div>
            <textarea 
              placeholder="Tell us about your prototype, game engine, or links to your portfolio..." 
              className="retro-input textarea"
              required
              rows={3}
              value={formData.pitch}
              onChange={(e) => setFormData({ ...formData, pitch: e.target.value })}
            />
            <button type="submit" className="gamified-btn pitch-submit-btn" onMouseEnter={() => sound.playBlip()}>
              TRANSMIT COLLABORATION PITCH 🚀
            </button>
          </form>
        )}
      </section>
    </GameShell>
  );
}
