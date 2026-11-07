// Nomad's Province — Pinned Partners & Sponsors Split-Screen Showcase
// Based on Pinned Split-Screen Aperture Mask Reveal Architecture
// Verified 1:1 square assets, fluid CSS mask reveals, responsive & accessible

import { useState, useEffect, useRef, useCallback } from 'react';
import { PARTNERS } from '../data/campusContent.js';
import { sound } from '../systems/soundFx.js';

export default function PinnedPartnersShowcase({ partners = PARTNERS }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const trackRef = useRef(null);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const handler = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const selectPartner = useCallback((index, playSfx = false) => {
    if (playSfx) {
      sound.playSelect();
    }
    setActiveIndex(index);
  }, []);

  const handlePrev = useCallback(() => {
    const nextIdx = (activeIndex - 1 + partners.length) % partners.length;
    selectPartner(nextIdx, true);
  }, [activeIndex, partners.length, selectPartner]);

  const handleNext = useCallback(() => {
    const nextIdx = (activeIndex + 1) % partners.length;
    selectPartner(nextIdx, true);
  }, [activeIndex, partners.length, selectPartner]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      handlePrev();
    }
  }, [handleNext, handlePrev]);

  // High-performance scroll listener on desktop for pinned track progression
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.innerWidth > 860 && trackRef.current) {
            const rect = trackRef.current.getBoundingClientRect();
            const totalScrollable = rect.height - window.innerHeight;
            if (totalScrollable > 0) {
              const progress = Math.min(1, Math.max(0, -rect.top / totalScrollable));
              const targetIdx = Math.min(partners.length - 1, Math.floor(progress * partners.length));
              setActiveIndex((prev) => (prev !== targetIdx ? targetIdx : prev));
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [partners.length]);

  const activePartner = partners[activeIndex] || partners[0];

  return (
    <section
      className="pinned-partners-showcase-section"
      aria-label="Strategic Partners & Sponsors Showcase"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Section Header with verified badge, title & description */}
      <div className="showcase-header">
        <div className="badge-pill">
          <span className="live-radar-dot" style={{ backgroundColor: '#e84537' }} />
          <span>OFFICIAL ALLIANCE NETWORK</span>
          <span className="badge-sep">•</span>
          <span>{partners.length} VERIFIED PARTNERS</span>
        </div>
        <h2 className="showcase-title">Strategic Partners & Guild Allies</h2>
        <p className="showcase-desc">
          Collaborating with industry pioneers, national esports associations, leading collegiate institutes, and regional gaming communities.
        </p>
      </div>

      {/* Pinned Split-Screen Showcase Track */}
      <div className="showcase-pinned-track" ref={trackRef}>
        <div
          className="split-card"
          style={{
            '--accent-color': activePartner.accent,
            '--bg-color': activePartner.bgColor || '#000000',
            '--card-glow': `${activePartner.accent}33`
          }}
        >
          {/* Left: 1:1 Logo Stage with Aperture Mask Reveal */}
          <div className="stage-wrapper">
            <div className="stage-box">
              <span className="stage-corner tl" />
              <span className="stage-corner tr" />
              <span className="stage-corner bl" />
              <span className="stage-corner br" />
              <img
                key={activePartner.id}
                src={activePartner.image1x1 || activePartner.image}
                alt={activePartner.name}
                className={`stage-img ${isReducedMotion ? 'reduced-motion' : ''}`}
                loading="eager"
              />
            </div>
          </div>

          {/* Right: Partner Information with Synchronized Details */}
          <div key={activePartner.id} className="details-box">
            <div className="meta-row">
              <span className="cat-badge">{activePartner.category}</span>
              <span className="partner-index">
                {String(activeIndex + 1).padStart(2, '0')} / {String(partners.length).padStart(2, '0')}
              </span>
            </div>

            <h3 className="partner-title">{activePartner.name}</h3>
            <div className="partner-fullname">{activePartner.fullName}</div>
            <div className="accent-bar" />

            <p className="partner-desc">{activePartner.desc}</p>

            {/* Navigation Bar with 14 Interactive Dots and Arrow Buttons */}
            <div className="nav-bar">
              <div className="dots-group" role="tablist" aria-label="Partner Selection Dots">
                {partners.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === activeIndex}
                    aria-label={`Select ${p.name}`}
                    title={p.name}
                    className={`dot ${idx === activeIndex ? 'active' : ''}`}
                    onClick={() => selectPartner(idx, true)}
                  />
                ))}
              </div>

              <div className="arrows-group">
                <button
                  type="button"
                  className="arrow-btn"
                  onClick={handlePrev}
                  aria-label="Previous Partner"
                  title="Previous Partner"
                >
                  ◀ PREV
                </button>
                <button
                  type="button"
                  className="arrow-btn"
                  onClick={handleNext}
                  aria-label="Next Partner"
                  title="Next Partner"
                >
                  NEXT ▶
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
