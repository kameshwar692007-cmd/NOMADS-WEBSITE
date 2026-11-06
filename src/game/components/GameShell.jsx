// Nomad's Province — Interactive Gamified Page Shell
// Features retro sound effects, animated HUD, warp navigation, and cyber particles

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sound } from '../systems/soundFx.js';

const DESTINATIONS = [
  { path: '/about', label: 'Main HQ', icon: '🏛️', color: '#e84537' },
  { path: '/esports', label: 'Esports Arena', icon: '🏆', color: '#ff4444' },
  { path: '/studio', label: 'Game Studio', icon: '🎮', color: '#38bdf8' },
  { path: '/events', label: 'Event Grounds', icon: '📅', color: '#fdbe53' },
  { path: '/community', label: 'Community Hub', icon: '👥', color: '#84c669' },
  { path: '/contact', label: 'Contact Centre', icon: '🎧', color: '#c0cbdc' },
];

export default function GameShell({ title, subtitle, accentColor = '#e84537', children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [muted, setMuted] = useState(sound.isMuted());
  const [warping, setWarping] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleNav = (targetPath) => {
    if (location.pathname === targetPath) return;
    sound.playWarp();
    setWarping(true);
    setTimeout(() => {
      navigate(targetPath);
      setWarping(false);
    }, 280);
  };

  const handleReturnToCampus = () => {
    sound.playWarp();
    setWarping(true);
    setTimeout(() => {
      navigate('/');
      setWarping(false);
    }, 280);
  };

  const toggleAudio = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <div className={`gamified-shell ${warping ? 'shell-warping' : ''}`}>
      {/* 1. Cyber Ambient Background */}
      <div className="shell-grid-bg" />
      <div className="shell-scanlines" />
      <div className="shell-glow-orb" style={{ background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)` }} />

      {/* 2. Top Interactive Game HUD */}
      <header className="shell-hud-bar">
        <div className="hud-left">
          <button 
            className="hud-return-btn"
            onClick={handleReturnToCampus}
            onMouseEnter={() => sound.playBlip()}
            title="Return to the 2D Virtual Campus Map"
          >
            <span className="hud-btn-bracket">[</span>
            <span className="hud-btn-icon">◀</span>
            <span className="hud-btn-text">RETURN TO CAMPUS</span>
            <span className="hud-btn-bracket">]</span>
          </button>

          <div className="hud-player-stats">
            <div className="hud-avatar-box">
              <span className="hud-avatar-dot" />
              <span className="hud-rank">LVL 99</span>
            </div>
            <div className="hud-stat-bars">
              <div className="hud-stat-label">OPERATIVE ONLINE</div>
              <div className="hud-bar-track">
                <div className="hud-bar-fill" style={{ width: '85%', backgroundColor: accentColor }} />
              </div>
            </div>
          </div>
        </div>

        {/* Warp Switcher Pills */}
        <nav className="hud-warp-nav">
          {DESTINATIONS.map((dest) => {
            const isActive = location.pathname === dest.path;
            return (
              <button
                key={dest.path}
                className={`hud-warp-btn ${isActive ? 'active' : ''}`}
                style={{ '--dest-color': dest.color }}
                onClick={() => handleNav(dest.path)}
                onMouseEnter={() => sound.playBlip()}
              >
                <span className="hud-dest-icon">{dest.icon}</span>
                <span className="hud-dest-label">{dest.label}</span>
                {isActive && <span className="hud-dest-beacon" />}
              </button>
            );
          })}
        </nav>

        {/* Audio FX Toggle */}
        <div className="hud-right">
          <button
            className={`hud-sound-btn ${muted ? 'muted' : 'active'}`}
            onClick={toggleAudio}
            onMouseEnter={() => sound.playBlip()}
            title={muted ? 'Unmute 8-Bit Audio' : 'Mute Sound FX'}
          >
            <span className="sound-icon">{muted ? '🔇' : '🔊'}</span>
            <span className="sound-label">{muted ? 'SFX: OFF' : 'SFX: ON'}</span>
            {!muted && (
              <div className="sound-visualizer">
                <span className="v-bar v1" />
                <span className="v-bar v2" />
                <span className="v-bar v3" />
              </div>
            )}
          </button>
        </div>
      </header>

      {/* 3. Hero Quest Banner */}
      <div className="shell-hero-banner" style={{ borderBottomColor: `${accentColor}44` }}>
        <div className="hero-banner-inner">
          <div className="hero-corner corner-tl">┌</div>
          <div className="hero-corner corner-tr">┐</div>
          <div className="hero-corner corner-bl">└</div>
          <div className="hero-corner corner-br">┘</div>

          <div className="hero-tag-badge" style={{ backgroundColor: `${accentColor}1e`, borderColor: accentColor, color: accentColor }}>
            <span className="pulse-beacon" style={{ backgroundColor: accentColor }} />
            SECTOR ENGAGED
          </div>

          <h1 className="hero-main-title">{title}</h1>
          {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        </div>
      </div>

      {/* 4. Page Dynamic Content Area */}
      <main className="shell-content-container">
        {children}
      </main>

      {/* 5. Retro Game Footer */}
      <footer className="shell-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-diamond" style={{ color: accentColor }}>◆</span>
            <span className="footer-name">NOMAD'S PROVINCE</span>
            <span className="footer-version">BUILD v2.4.0 • CHENNAI, IN</span>
          </div>

          <div className="footer-links">
            <a href="https://whatsapp.com/channel/0029VbCLLDiAjPXQTWkJP00f" target="_blank" rel="noreferrer" onMouseEnter={() => sound.playBlip()}>
              WhatsApp Community
            </a>
            <a href="https://www.instagram.com/nomadsprovince?cplk=MWxzbHM3bWNrdXJ3Ng==" target="_blank" rel="noreferrer" onMouseEnter={() => sound.playBlip()}>
              Instagram (@nomadsprovince)
            </a>
            <a href="mailto:nomadsprovince@gmail.com" onMouseEnter={() => sound.playBlip()}>
              nomadsprovince@gmail.com
            </a>
          </div>

          <button className="footer-warp-top" onClick={handleReturnToCampus} onMouseEnter={() => sound.playBlip()}>
            ▲ RETURN TO MAP
          </button>
        </div>
      </footer>
    </div>
  );
}
