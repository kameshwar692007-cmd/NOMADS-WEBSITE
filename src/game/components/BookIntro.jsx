import { useEffect, useState } from 'react';
import { sound } from '../systems/soundFx.js';
import './BookIntro.css';

export default function BookIntro({ onComplete }) {
  const [stage, setStage] = useState('arrival');

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setStage('ready');
      return;
    }
    const timers = [
      window.setTimeout(() => {
        setStage('illuminate');
        sound.playBlip();
      }, 500),
      window.setTimeout(() => {
        setStage('open');
        sound.playLaserScan();
      }, 1500),
      window.setTimeout(() => {
        setStage('story');
        sound.playLaserSwoop();
      }, 3200),
      window.setTimeout(() => {
        setStage('ready');
        sound.playSelect();
      }, 4350)
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key==='Escape') {
        e.preventDefault();
        sound.playCancel();
        onComplete();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onComplete]);

  const handleSkip = () => {
    sound.playCancel();
    onComplete();
  };

  const handleEnter = () => {
    sound.playDoorEnter();
    onComplete();
  };

  return (
    <div
      className={'np-cinematic np-cinematic-' + stage}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Nomad's Province"
    >
      {/* Background Ambience & Ethereal Rays */}
      <div className="np-cinematic-grid" aria-hidden="true" />
      <div className="np-cinematic-aurora" aria-hidden="true" />
      <div className="np-cinematic-beam np-cinematic-beam-left" aria-hidden="true" />
      <div className="np-cinematic-beam np-cinematic-beam-right" aria-hidden="true" />

      {/* Floating Arcane Mana Sparks */}
      <div className="np-magic-particles" aria-hidden="true">
        {[...Array(14)].map((_, i) => (
          <span key={i} className={`np-magic-particle particle-${i + 1}`} />
        ))}
      </div>

      {/* Skip Button */}
      <button
        type="button"
        className="np-cinematic-skip"
        onClick={handleSkip}
        onMouseEnter={() => sound.playBlip()}
      >
        SKIP INTRO <span aria-hidden="true">→</span>
      </button>

      {/* Illuminated Header Banner */}
      <div className="np-cinematic-logo">
        <img src="/assets/game/headquarters-banner.webp" alt="Nomad's Province Headquarters" />
        <p>YOUR NEXT ADVENTURE BEGINS HERE</p>
      </div>

      {/* Arcane Summoning Platform with Concentric Glyph Circles */}
      <div className="np-cinematic-platform" aria-hidden="true">
        <div className="np-cinematic-platform-ring" />
        <div className="np-cinematic-platform-ring np-cinematic-platform-ring-second" />
        <div className="np-magic-circle-rune-ring">
          <span>᚛</span><span>ᚠ</span><span>ᚢ</span><span>ᚦ</span><span>ᚨ</span><span>ᚱ</span>
          <span>ᚲ</span><span>ᚷ</span><span>ᚹ</span><span>ᚺ</span><span>ᚾ</span><span>᚜</span>
        </div>
        <div className="np-magic-circle-star" />
        <div className="np-platform-mana-pool" />
      </div>

      {/* 3D Perspective Stage for the Magical Tome */}
      <div className="np-book-perspective">
        {/* Volumetric Light Shafts Erupting from inside the Tome */}
        <div className="np-book-magic-burst" aria-hidden="true">
          <div className="np-burst-beam np-burst-beam-center" />
          <div className="np-burst-beam np-burst-beam-left" />
          <div className="np-burst-beam np-burst-beam-right" />
          <div className="np-burst-glow-core" />
        </div>

        {/* Floating 3D Book Container */}
        <div className="np-book-object" aria-label="A glowing book opens to reveal the headquarters">
          {/* Tome Spine */}
          <div className="np-book-spine" />

          {/* Left Page Base (Foundational Parchment) */}
          <div className="np-book-paper np-book-paper-left">
            <span className="np-book-ornament">✦</span>
            <div className="np-book-seal">
              <img
                src="/assets/game/np-emblem.webp"
                alt="NP"
                style={{ width: '28px', height: 'auto', display: 'inline-block', verticalAlign: 'middle' }}
              />
            </div>
            <div className="np-book-small">THE WORLD AWAITS</div>
            <div className="np-book-rule" />
            <div className="np-book-mini-art" aria-hidden="true">✧ ✧ ✧</div>
          </div>

          {/* Right Page Base (Chapter 1 - Revealed under the turning page) */}
          <div className="np-book-paper np-book-paper-right">
            <div className="np-book-small">CHAPTER I</div>
            <h1>WELCOME TO<br />NOMAD'S PROVINCE</h1>
            <div className="np-book-rule" />
            <h2>HEADQUARTERS CAMPUS</h2>
            <p>Where gamers, creators and innovators come together.</p>
            <div className="np-book-star">✦</div>
          </div>

          {/* True Double-Sided 3D Turning Page with Continuous Physics */}
          <div className="np-book-turn-page" aria-hidden="true">
            {/* Front Face: Shown as page starts peeling and arching up (0° to -90°) */}
            <div className="np-book-turn-face np-book-turn-front">
              <span className="np-book-turn-flourish">✧</span>
              <div className="np-book-small">PROVINCIAL CHRONICLES</div>
              <div className="np-book-rule" />
              <p className="np-book-script-lore">
                "Across the digital frontier, architects and champions forge a shared destiny."
              </p>
              <div className="np-book-mini-art">᚛ ᚠ ᚜</div>
            </div>

            {/* Back Face: Shown as page lands and settles on the left (at -180°) */}
            <div className="np-book-turn-face np-book-turn-back">
              <span className="np-book-ornament">✦</span>
              <div className="np-book-seal">
                <img
                  src="/assets/game/np-emblem.webp"
                  alt="NP"
                  style={{ width: '28px', height: 'auto', display: 'inline-block', verticalAlign: 'middle' }}
                />
              </div>
              <div className="np-book-small">GUILD DECREE</div>
              <div className="np-book-rule" />
              <div className="np-book-mini-art" aria-hidden="true">✧ ✧ ✧</div>
            </div>
          </div>

          {/* True Double-Sided 3D Hardcover (Opens from 0° to -180°) */}
          <div className="np-book-hardcover" aria-hidden="true">
            {/* Front Cover Outside (Ancient Tome Face) */}
            <div className="np-book-hardcover-face np-book-hardcover-outside">
              <div className="np-book-hardcover-rim-glow" />
              <div className="np-book-hardcover-label">
                <span className="np-book-hardcover-emblem">
                  <img
                    src="/assets/game/np-emblem.webp"
                    alt="NP"
                    style={{ width: '34px', height: 'auto', display: 'inline-block', verticalAlign: 'middle' }}
                  />
                </span>
                <strong>NOMAD'S<br />PROVINCE</strong>
                <small>HEADQUARTERS</small>
                <div className="np-book-runic-clasp">᚛ ᚠ ᚢ ᚦ ᚜</div>
              </div>
              <span className="np-corner-bracket tl">┌</span>
              <span className="np-corner-bracket tr">┐</span>
              <span className="np-corner-bracket bl">└</span>
              <span className="np-corner-bracket br">┘</span>
            </div>

            {/* Front Cover Inside (Marbled Endpaper Liner on the Left) */}
            <div className="np-book-hardcover-face np-book-hardcover-inside">
              <div className="np-inside-cover-marbled">
                <div className="np-inside-crest">
                  <span className="np-inside-star">✦</span>
                  <div className="np-inside-title">ARCHIVES OF THE CITADEL</div>
                  <div className="np-book-rule" />
                  <div className="np-inside-motto">ESTABLISHED IN CHENNAI · FOR GAMERS & CREATORS</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Illuminated Action Console */}
      <div className="np-cinematic-bottom">
        <div className="np-cinematic-eyebrow">ENTER THE WORLD · DISCOVER YOUR COMMUNITY</div>
        <button
          type="button"
          className="np-cinematic-enter"
          onClick={handleEnter}
          onMouseEnter={() => sound.playBlip()}
        >
          <span>Enter Headquarters</span><span aria-hidden="true">→</span>
        </button>
        <p>Explore the world. Meet the people. Discover what's next.</p>
      </div>

      {/* Cinematic Timeline Bar */}
      <div className="np-cinematic-progress" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}
