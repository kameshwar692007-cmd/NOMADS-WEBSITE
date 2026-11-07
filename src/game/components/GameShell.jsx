// Nomad's Province — Interactive Gamified Page Shell
// Clean themed vector icons, animated HUD, warp navigation, cyber scanlines & scroll reveals
// Responsive sandwich drawer menu for tablet & mobile navigation

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sound } from '../systems/soundFx.js';
import StitchCursorBuilder from './StitchCursorBuilder.jsx';
import { LOCATIONS } from '../data/locationData.js';
import { CAMPUS_NPCS } from '../data/npcDialogues.js';
import NpcDialogue, { NpcPortrait } from './NpcDialogue.jsx';
import './CampusContinuity.css';
import './DestinationDiscovery.css';
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

const NEXT_DESTINATION = {
  '/esports': '/events',
  '/studio': '/community',
  '/events': '/esports',
  '/community': '/studio',
  '/contact': '/about',
};

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
  const campusLocation = LOCATIONS.find((item) => item.route === location.pathname);
  const chapterNumber = campusLocation ? String(LOCATIONS.indexOf(campusLocation) + 1).padStart(2, '0') : null;
  const nextLocation = LOCATIONS.find(item => item.route === NEXT_DESTINATION[location.pathname]);
  const chapterNpc = CAMPUS_NPCS.find(npc => npc.route === campusLocation?.route);
  const nextNpc = CAMPUS_NPCS.find(npc => npc.route === nextLocation?.route);
  const [speakingNpc, setSpeakingNpc] = useState(null);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPageLoaded(false);
    setMobileMenuOpen(false);
    setSpeakingNpc(null);
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

  const talkToNpc = (npc, stayOnPage = false) => {
    if (!npc) return;
    sound.playInteract();
    setSpeakingNpc(stayOnPage ? { ...npc, route: null, actionLabel: 'Keep Exploring' } : npc);
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

            {/* Mobile Footer Actions */}
            <div className="mobile-drawer-footer">
              <button
                className="hud-return-btn mobile-return-btn"
                onClick={handleReturnToCampus}
              >
                <span className="return-arrow">◀</span>
                <span>RETURN TO CAMPUS MAP</span>
              </button>

              <button
                className={`hud-sound-btn mobile-sound-btn ${muted ? 'muted' : 'active'}`}
                onClick={toggleAudio}
              >
                {muted ? <IconSoundOff size={16} color="#64748b" /> : <IconSoundOn size={16} color="#38bdf8" />}
                <span>{muted ? 'SOUND EFFECTS: OFF' : 'SOUND EFFECTS: ACTIVE'}</span>
              </button>
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

      {/* One location in the same campus world; the game remains the primary map. */}
      {campusLocation && (
        <section className="campus-chapter-bridge gamified-card" aria-label="Campus destination">
          {chapterNpc && (
            <button type="button" className="campus-chapter-character"
              onClick={() => talkToNpc(chapterNpc, true)}
              aria-label={`Talk to ${chapterNpc.name}, ${chapterNpc.title}`}
              title={`Talk to ${chapterNpc.name}`}>
              <NpcPortrait portraitIndex={chapterNpc.portraitIndex} name={chapterNpc.name} />
              <span className="campus-character-hint">TALK TO {chapterNpc.name.toUpperCase()} <span aria-hidden="true">↗</span></span>
            </button>
          )}
          <div className="campus-chapter-copy">
            <span className="campus-chapter-eyebrow">NOMAD'S PROVINCE / DESTINATION {chapterNumber}</span>
            <h2>{campusLocation.displayName}</h2>
            <p>{campusLocation.description}</p>
            {chapterNpc && <span className="campus-chapter-quest">
              <strong>{chapterNpc.name}</strong> · {chapterNpc.title} — {chapterNpc.message}
            </span>}
          </div>
          <button type="button" className="campus-chapter-map-link"
            onClick={handleReturnToCampus} onMouseEnter={() => sound.playBlip()}>
            <span aria-hidden="true">⌖</span> BACK TO CAMPUS MAP
          </button>
        </section>
      )}

      {/* 4. Page Inner Body */}
      <main className="shell-main-content">
        {children}
      </main>

      {/* The same explorable destinations, expanded as useful page-specific information. */}
      {campusLocation && campusLocation.route !== '/about' && campusLocation.sectionDetails && (
        <aside className="campus-discover gamified-card" aria-labelledby="campus-discover-title">
          <div className="campus-discover-heading">
            <span className="campus-discover-eyebrow">DESTINATION FIELD NOTES</span>
            <h2 id="campus-discover-title">What you can explore here</h2>
            <p>Discover the different ways to get involved with {campusLocation.displayName}.</p>
          </div>
          <ul className="campus-discover-list">
            {campusLocation.sectionDetails.highlights.map(highlight => (
              <li key={highlight}><span aria-hidden="true">✦</span> {highlight}</li>
            ))}
          </ul>
          {nextLocation && (
            <div className="campus-discover-next">
              {nextNpc && (
                <button type="button" className="campus-next-character"
                  onClick={() => talkToNpc(nextNpc)}
                  title={`Talk to ${nextNpc.name}`}
                  aria-label={`Talk to ${nextNpc.name} from ${nextLocation.displayName}`}>
                  <NpcPortrait portraitIndex={nextNpc.portraitIndex} name={nextNpc.name} />
                  <span className="campus-next-character-hint">TALK <span aria-hidden="true">↗</span></span>
                </button>
              )}
              <div className="campus-discover-next-copy">
                <span>CONTINUE YOUR JOURNEY</span>
                <strong>{nextLocation.displayName}</strong>
                {nextNpc && <p>Meet {nextNpc.name}, your {nextNpc.title.toLowerCase()}.</p>}
              </div>
              <button type="button" className="campus-next-view-more" onClick={() => handleNav(nextLocation.route)} onMouseEnter={() => sound.playBlip()}>
                View More <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </aside>
      )}

      <NpcDialogue npc={speakingNpc} onClose={() => setSpeakingNpc(null)} />

      {/* 5. Cyber Footer */}
      <footer className="shell-footer">
        <div className="footer-inner">
          <div className="footer-meta">
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
