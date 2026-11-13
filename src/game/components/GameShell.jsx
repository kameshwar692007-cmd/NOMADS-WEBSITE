// Nomad's Province — Interactive Gamified Page Shell
// Clean themed vector icons, animated HUD, warp navigation, cyber scanlines & scroll reveals
// Responsive sandwich drawer menu for tablet & mobile navigation

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import '../../pages/MobileExperience.css';
import { sound } from '../systems/soundFx.js';
import StitchCursorBuilder from './StitchCursorBuilder.jsx';
import { ORG_INFO } from '../data/campusContent.js';
import {
  IconHQ,
  IconEsports,
  IconStudio,
  IconEvents,
  IconCommunity,
  IconContact,
  IconSoundOn,
  IconSoundOff,
  IconMenu,
  IconClose
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
  const [muted, setMuted] = useState(() => sound.isMuted());

  // Keep muted state synchronized across route transitions
  useEffect(() => {
    setMuted(sound.isMuted());
  }, [location.pathname]);
  const [warping, setWarping] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll to top & trigger sleek page entrance loader
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setPageLoaded(false);
    setMobileMenuOpen(false);
    const timer = setTimeout(() => setPageLoaded(true), 120);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Progressive, one-shot scroll reveals for initially rendered and async/tabbed content.
  // Never hide anything for reduced-motion visitors or browsers without the API.
  useEffect(() => {
    const content = document.querySelector('.gamified-shell .shell-main-content');
    if (!content || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
        typeof IntersectionObserver === 'undefined') return;

    const selector = '.gamified-card, .section-title-wrap, .pipeline-step, .tech-node, .province-explore-intro';
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

    const observeNewContent = (root) => {
      const candidates = root.matches?.(selector)
        ? [root, ...root.querySelectorAll(selector)]
        : root.querySelectorAll?.(selector) || [];
      for (const element of candidates) {
        // Reattach existing hidden elements after pageLoaded triggers an effect rerun.
        // Previously they retained the class but lost their observer permanently.
        if (element.classList.contains('revealed')) continue;
        element.classList.add('scroll-reveal');
        observer.observe(element);
      }
    };
    observeNewContent(content);

    // Event listings and About tabs mount content after initial page rendering.
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType === 1) observeNewContent(node);
        }
      }
    });
    mutations.observe(content, { childList: true, subtree: true });
    return () => { mutations.disconnect(); observer.disconnect(); };
  }, [location.pathname, pageLoaded]);

  const handleNav = (targetPath) => {
    if (location.pathname === targetPath) {
      setMobileMenuOpen(false);
      return;
    }
    sound.playWarp();
    setWarping(true);
    setMobileMenuOpen(false);
    setTimeout(() => {
      navigate(targetPath);
      setWarping(false);
    }, 240);
  };

  const handleReturnToCampus = () => {
    sound.playWarp();
    setWarping(true);
    setMobileMenuOpen(false);
    setTimeout(() => {
      navigate('/');
      setWarping(false);
    }, 240);
  };

  const toggleAudio = () => {
    const nextState = !sound.isMuted();
    sound.setMuted(nextState);
    setMuted(nextState);
    if (!nextState) sound.playSelect();
  };

  return (
    <div className={`gamified-shell ${warping ? 'shell-warping' : ''}`} style={{ '--accent-color': accentColor }}>
      {/* Stitch AI Cursor Page Builder */}
      <StitchCursorBuilder accentColor={accentColor} />

      {/* Cyber Ambient Grid & Background Orbs */}
      <div className="shell-grid-bg" />
      <div className="shell-scanlines" />
      <div className="shell-glow-orb" style={{ backgroundColor: `${accentColor}18` }} />

      {/* 1. Fixed Top HUD Navigation Bar */}
      <header className="shell-hud-bar">
        <div className="hud-left">
          <button className="hud-return-btn" onClick={handleReturnToCampus} onMouseEnter={() => sound.playBlip()}>
            <span className="return-arrow">◀</span>
            <span className="return-text">RETURN TO CAMPUS</span>
          </button>
        </div>

        {/* Desktop Destination Quick Travel Ports */}
        <nav className="hud-center-nav">
          {DESTINATIONS.map((dest) => {
            const isActive = location.pathname === dest.path;
            const Icon = dest.Icon;
            return (
              <button
                key={dest.path}
                className={`hud-dest-btn ${isActive ? 'active' : ''}`}
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

        {/* Audio FX Toggle & Tablet/Mobile Sandwich Menu Button */}
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

          {/* Sandwich Button for Tablet & Mobile Users */}
          <button
            className={`hud-sandwich-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => {
              sound.playSelect();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            aria-label="Toggle Navigation Menu"
            title="Warp Navigation Menu"
          >
            {mobileMenuOpen ? (
              <IconClose size={20} color="#38bdf8" />
            ) : (
              <IconMenu size={20} color="#38bdf8" />
            )}
            <span className="sandwich-label">{mobileMenuOpen ? 'CLOSE' : 'MENU'}</span>
          </button>
        </div>
      </header>

      {/* Cyber Mobile/Tablet Sandwich Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="hud-mobile-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <div className="hud-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-title">
                <span className="drawer-title-dot" />
                <span>DESTINATION WARP CONSOLE</span>
              </div>
              <button
                className="mobile-drawer-close-btn"
                onClick={() => {
                  sound.playBlip();
                  setMobileMenuOpen(false);
                }}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="mobile-dest-list">
              {DESTINATIONS.map((dest) => {
                const isActive = location.pathname === dest.path;
                const Icon = dest.Icon;
                return (
                  <button
                    key={dest.path}
                    className={`mobile-dest-btn ${isActive ? 'active' : ''}`}
                    style={{ '--dest-color': dest.color }}
                    onClick={() => handleNav(dest.path)}
                  >
                    <span className="mobile-dest-icon-frame" style={{ borderColor: dest.color }}>
                      <Icon size={18} color={dest.color} />
                    </span>
                    <div className="mobile-dest-info">
                      <span className="mobile-dest-name">{dest.label}</span>
                      <span className="mobile-dest-sub">{dest.path}</span>
                    </div>
                    {isActive ? (
                      <span className="mobile-active-chip" style={{ backgroundColor: dest.color }}>
                        ACTIVE
                      </span>
                    ) : (
                      <span className="mobile-warp-arrow">→</span>
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}

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

      {/* 4. Page Inner Body */}
      <main className="shell-main-content">
        {children}
      </main>

      {/* 5. Cyber Footer */}
      <footer className="shell-footer">
        <div className="footer-inner">
          <div className="footer-meta">
            <span className="footer-diamond" style={{ color: accentColor }}>◆</span>
            <span className="footer-name">NOMAD'S PROVINCE</span>
            <span className="footer-version">ESPORTS & GAME DEV ECOSYSTEM • CHENNAI, INDIA</span>
          </div>

          <div className="footer-links">
            <a href={ORG_INFO.whatsapp} target="_blank" rel="noreferrer" onMouseEnter={() => sound.playBlip()}>
              WhatsApp ({ORG_INFO.whatsappNumber || '+91 97897 20897'})
            </a>
            <a href="https://www.instagram.com/nomadsprovince?cplk=MWxzbHM3bWNrdXJ3Ng==" target="_blank" rel="noreferrer" onMouseEnter={() => sound.playBlip()}>
              Instagram (@nomadsprovince)
            </a>
            <a href="mailto:nomadsprovince@gmail.com" onMouseEnter={() => sound.playBlip()}>
              nomadsprovince@gmail.com
            </a>
            <Link to="/admin" className="footer-admin-link" onMouseEnter={() => sound.playBlip()}>Staff login</Link>
          </div>


        </div>
      </footer>
    </div>
  );
}
