// Nomad's Province — Pinned Partners & Sponsors Split-Screen Showcase
// High-performance, accessible, responsive split-screen presentation
// Uses IntersectionObserver & CSS clip-path mask reveal (no heavy scroll polling)

import { useState, useEffect, useRef } from 'react';
import { PARTNERS } from '../data/campusContent.js';
import { ThemedIcon } from './Icons.jsx';
import { sound } from '../systems/soundFx.js';

export default function PinnedPartnersShowcase({ partners = PARTNERS }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const triggersRef = useRef([]);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const handler = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Set up high-performance IntersectionObserver for scroll synchronization
  useEffect(() => {
    // Only observe on desktop / tablet where triggers are used
    if (window.innerWidth <= 860) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -20% 0px',
        threshold: 0.5
      }
    );

    triggersRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [partners.length]);

  const activePartner = partners[activeIndex] || partners[0];

  const handleSelectPartner = (index, userTriggered = false) => {
    if (userTriggered) {
      sound.playSelect();
    }
    setActiveIndex(index);

    // If on desktop, smoothly scroll corresponding trigger into view
    if (window.innerWidth > 860 && triggersRef.current[index]) {
      triggersRef.current[index].scrollIntoView({ behavior: isReducedMotion ? 'auto' : 'smooth', block: 'center' });
    }
  };

  const handlePrev = () => {
    const nextIdx = (activeIndex - 1 + partners.length) % partners.length;
    handleSelectPartner(nextIdx, true);
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % partners.length;
    handleSelectPartner(nextIdx, true);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      handlePrev();
    }
  };

  return (
    <section
      className="pinned-partners-showcase-section"
      aria-label="Strategic Partners & Sponsors Showcase"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Section Header */}
      <div className="showcase-section-header">
        <div className="showcase-badge-row">
          <span className="live-radar-dot" style={{ backgroundColor: '#e84537' }} />
          <span className="showcase-badge-label">OFFICIAL ALLIANCE NETWORK</span>
          <span className="showcase-partner-count">{partners.length} VERIFIED PARTNERS</span>
        </div>
        <h2 className="showcase-heading">Strategic Partners & Academic Guilds</h2>
        <p className="showcase-subheading">
          Collaborating with industry pioneers, national esports associations, leading collegiate institutes, and regional gaming communities.
        </p>
      </div>

      {/* Desktop & Laptop Layout: Sticky Split-Screen Stage with Trigger Track */}
      <div className="desktop-split-layout">
        {/* Sticky Visual Stage */}
        <div className="sticky-stage-col">
          <div className="sticky-stage-card gamified-card" style={{ '--active-accent': activePartner.accent }}>
            <div className="cyber-corner top-left">┌</div>
            <div className="cyber-corner top-right">┐</div>
            <div className="cyber-corner bottom-left">└</div>
            <div className="cyber-corner bottom-right">┘</div>

            {/* 1:1 Logo Frame with Mask Reveal */}
            <div className="logo-mask-viewport">
              {partners.map((p, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <div
                    key={p.id}
                    className={`logo-reveal-layer ${isActive ? 'active' : ''} ${isReducedMotion ? 'reduced-motion' : ''}`}
                    style={{
                      backgroundColor: p.bgColor || '#000000',
                      zIndex: isActive ? 2 : 1
                    }}
                    aria-hidden={!isActive}
                  >
                    <img
                      src={p.image1x1 || p.image}
                      alt={p.name}
                      className="partner-1x1-img"
                      loading="lazy"
                    />
                  </div>
                );
              })}
              <div className="logo-frame-overlay" />
            </div>

            {/* Partner Details Console (Sticky Side) */}
            <div className="stage-partner-info">
              <div className="partner-meta-top">
                <span className="partner-index-tag">
                  {String(activeIndex + 1).padStart(2, '0')} / {String(partners.length).padStart(2, '0')}
                </span>
                <span className="partner-category-chip" style={{ borderColor: activePartner.accent, color: activePartner.accent }}>
                  {activePartner.category}
                </span>
              </div>

              <h3 className="partner-stage-name">{activePartner.name}</h3>
              <div className="partner-stage-fullname">{activePartner.fullName}</div>
              <p className="partner-stage-desc">{activePartner.desc}</p>

              {/* Navigation Dots and Controls */}
              <div className="stage-nav-controls">
                <div className="nav-dots-wrap" role="tablist" aria-label="Partner Navigation Dots">
                  {partners.map((p, idx) => (
                    <button
                      key={p.id}
                      role="tab"
                      aria-selected={idx === activeIndex}
                      aria-label={`Jump to ${p.name}`}
                      className={`nav-dot-btn ${idx === activeIndex ? 'active' : ''}`}
                      style={{ '--dot-accent': p.accent }}
                      onClick={() => handleSelectPartner(idx, true)}
                    />
                  ))}
                </div>

                <div className="nav-arrow-group">
                  <button
                    type="button"
                    className="stage-arrow-btn"
                    onClick={handlePrev}
                    aria-label="Previous Partner"
                    title="Previous Partner"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    className="stage-arrow-btn"
                    onClick={handleNext}
                    aria-label="Next Partner"
                    title="Next Partner"
                  >
                    ▶
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Triggers Track (Driving the Sticky Viewport on Desktop) */}
        <div className="scroll-triggers-col">
          {partners.map((p, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={p.id}
                ref={(el) => (triggersRef.current[idx] = el)}
                data-index={idx}
                className={`partner-scroll-trigger-card ${isActive ? 'is-active' : ''}`}
                onClick={() => handleSelectPartner(idx, true)}
              >
                <div className="trigger-badge-row">
                  <span className="trigger-num">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="trigger-cat" style={{ color: p.accent }}>{p.category}</span>
                </div>
                <h4 className="trigger-title">{p.name}</h4>
                <p className="trigger-desc">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Layout: Natural Vertical Flow with 1:1 Logos and Zero Sticky Jitter */}
      <div className="mobile-partners-flow">
        {partners.map((p, idx) => (
          <div key={p.id} className="gamified-card mobile-partner-card" style={{ '--partner-accent': p.accent }}>
            <div className="mobile-partner-header">
              <span className="mobile-partner-num">{String(idx + 1).padStart(2, '0')}</span>
              <span className="partner-category-chip" style={{ borderColor: p.accent, color: p.accent }}>
                {p.category}
              </span>
            </div>

            {/* 1:1 Logo without Crop */}
            <div className="mobile-1x1-frame" style={{ backgroundColor: p.bgColor || '#000000' }}>
              <img
                src={p.image1x1 || p.image}
                alt={p.name}
                className="partner-1x1-img"
                loading="lazy"
              />
            </div>

            <div className="mobile-partner-body">
              <h4 className="mobile-partner-name">{p.name}</h4>
              <div className="mobile-partner-fullname">{p.fullName}</div>
              <p className="mobile-partner-desc">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
