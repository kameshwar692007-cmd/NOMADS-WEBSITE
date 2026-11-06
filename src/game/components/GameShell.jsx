// Nomad's Province — Interactive Gamified Page Shell
// Clean themed vector icons, animated HUD, warp navigation, cyber scanlines & scroll reveals

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sound } from '../systems/soundFx.js';
import {
  IconHQ,
  IconEsports,
  IconStudio,
  IconEvents,
  IconCommunity,
  IconContact,
  IconSoundOn,
  IconSoundOff
} from './Icons.jsx';

const DESTINATIONS = [
  { path: '/about', label: 'Main HQ', Icon: IconHQ, color: '#e84537' },
  { path: '/esports', label: 'Esports Arena', Icon: IconEsports, color: '#ff4444' },
  { path: '/studio', label: 'Game Studio', Icon: IconStudio, color: '#38bdf8' },
  { path: '/events', label: 'Event Grounds', Icon: IconEvents, color: '#fdbe53' },
  { path: '/community', label: 'Community Hub', Icon: IconCommunity, color: '#84c669' },
  { path: '/contact', label: 'Contact Centre', Icon: IconContact, color: '#c0cbdc' },
];

export default function GameShell({ title, subtitle, accentColor = '#e84537', children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [muted, setMuted] = useState(sound.isMuted());
  const [warping, setWarping] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  // Scroll to top & trigger sleek page entrance loader
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPageLoaded(false);
    const timer = setTimeout(() => setPageLoaded(true), 120);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Automated Scroll Reveal using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.gamified-card, .section-title-wrap, .pipeline-step, .tech-node');
    elements.forEach((el) => {
      el.classList.add('scroll-reveal');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [location.pathname, pageLoaded]);

  const handleNav = (targetPath) => {
    if (location.pathname === targetPath) return;
    sound.playWarp();
    setWarping(true);
    setTimeout(() => {
      navigate(targetPath);
      setWarping(false);
    }, 240);
  };

  const handleReturnToCampus = () => {
    sound.playWarp();
    setWarping(true);
    setTimeout(() => {
      navigate('/');
      setWarping(false);
    }, 240);
  };

  const toggleAudio = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <div className={`gamified-shell ${warping ? 'shell-warping' : ''} ${pageLoaded ? 'shell-ready' : 'shell-loading'}`}>
      {/* 1. Cyber Ambient Background & Scanlines */}
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
            title="Return to 2D Campus Map"
          >
            <span className="hud-btn-arrow">◀</span>
            <span className="hud-btn-text">RETURN TO CAMPUS</span>
          </button>
        </div>

        {/* Warp Switcher Navigation */}
        <nav className="hud-warp-nav">
          {DESTINATIONS.map((dest) => {
            const isActive = location.pathname === dest.path;
            const Icon = dest.Icon;
            return (
              <button
                key={dest.path}
                className={`hud-warp-btn ${isActive ? 'active' : ''}`}
                style={{ '--dest-color': dest.color }}
                onClick={() => handleNav(dest.path)}
                onMouseEnter={() => sound.playBlip()}
              >
                <span className="hud-dest-icon">
                  <Icon size={15} color={isActive ? dest.color : '#94a3b8'} />
                </span>
                <span className="hud-dest-label">{dest.label}</span>
                {isActive && <span className="hud-dest-beacon" style={{ backgroundColor: dest.color }} />}
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
            title={muted ? 'Unmute Audio' : 'Mute Sound FX'}
          >
            <span className="sound-icon-wrap">
              {muted ? <IconSoundOff size={15} color="#64748b" /> : <IconSoundOn size={15} color="#38bdf8" />}
            </span>
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

      {/* Cyber Beam Loading Line */}
      <div className="cyber-loading-line" style={{ '--accent-glow': accentColor }} />

      {/* 3. Hero Header Banner */}
      <div className="shell-hero-banner" style={{ borderBottomColor: `${accentColor}33` }}>
        <div className="hero-banner-inner">
          <div className="hero-corner corner-tl">┌</div>
          <div className="hero-corner corner-tr">┐</div>
          <div className="hero-corner corner-bl">└</div>
          <div className="hero-corner corner-br">┘</div>

          <h1 className="hero-main-title">{title}</h1>
          {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        </div>
      </div>

      {/* 4. Page Dynamic Content Area */}
      <main className="shell-content-container">
        {children}
      </main>

      {/* 5. Sleek Cyber Footer */}
      <footer className="shell-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-diamond" style={{ color: accentColor }}>◆</span>
            <span className="footer-name">NOMAD'S PROVINCE</span>
            <span className="footer-version">ESPORTS & GAME DEV ECOSYSTEM • CHENNAI, INDIA</span>
          </div>

          <div className="footer-links">
            <a href="https://whatsapp.com/channel/0029VbCLLDiAjPXQTWkJP00f" target="_blank" rel="noreferrer" onMouseEnter={() => sound.playBlip()}>
              WhatsApp Channel
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
