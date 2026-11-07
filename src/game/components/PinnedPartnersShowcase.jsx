// Nomad's Province — Strategic Partners & Sponsors Alliance Box
// Reusable PinnedPartnersShowcase component
// High-tech stable split-screen matrix: all 14 partners visible simultaneously
// Verified 1:1 square lossless assets, aperture mask reveals, accessible & responsive

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PARTNERS } from '../data/campusContent.js';
import { sound } from '../systems/soundFx.js';

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Allies', count: 14 },
  { id: 'academic', label: 'Collegiate & Academic' },
  { id: 'sports', label: 'Sports & Esports' },
  { id: 'studio', label: 'Game Dev & Startup' },
  { id: 'community', label: 'Community & Culture' },
];

export default function PinnedPartnersShowcase({ partners = PARTNERS }) {
  const [activeId, setActiveId] = useState(partners[0]?.id || 'gdai');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);

  const containerRef = useRef(null);
  const autoPlayTimerRef = useRef(null);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const handler = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Filter partners based on category tab
  const filteredPartners = useMemo(() => {
    if (selectedCategory === 'all') return partners;
    if (selectedCategory === 'academic') {
      return partners.filter((p) => p.category.toLowerCase().includes('academic') || p.category.toLowerCase().includes('collegiate'));
    }
    if (selectedCategory === 'sports') {
      return partners.filter((p) => p.category.toLowerCase().includes('sports'));
    }
    if (selectedCategory === 'studio') {
      return partners.filter(
        (p) =>
          p.category.toLowerCase().includes('game dev') ||
          p.category.toLowerCase().includes('animation') ||
          p.category.toLowerCase().includes('summit') ||
          p.category.toLowerCase().includes('startup') ||
          p.category.toLowerCase().includes('incubation')
      );
    }
    if (selectedCategory === 'community') {
      return partners.filter((p) => p.category.toLowerCase().includes('community') || p.category.toLowerCase().includes('culture'));
    }
    return partners;
  }, [partners, selectedCategory]);

  // Current active partner object
  const activePartner = useMemo(() => {
    const found = partners.find((p) => p.id === activeId);
    return found || filteredPartners[0] || partners[0];
  }, [partners, activeId, filteredPartners]);

  // Active index within the filtered list
  const activeFilteredIndex = useMemo(() => {
    const idx = filteredPartners.findIndex((p) => p.id === activePartner?.id);
    return idx >= 0 ? idx : 0;
  }, [filteredPartners, activePartner]);

  // Select partner action (plays sound ONLY on user click/interaction)
  const selectPartner = useCallback((partnerId, playSfx = false) => {
    if (playSfx) {
      sound.playSelect();
    }
    setActiveId(partnerId);
  }, []);

  const handlePrev = useCallback(() => {
    if (filteredPartners.length === 0) return;
    const nextIdx = (activeFilteredIndex - 1 + filteredPartners.length) % filteredPartners.length;
    selectPartner(filteredPartners[nextIdx].id, true);
  }, [activeFilteredIndex, filteredPartners, selectPartner]);

  const handleNext = useCallback(() => {
    if (filteredPartners.length === 0) return;
    const nextIdx = (activeFilteredIndex + 1) % filteredPartners.length;
    selectPartner(filteredPartners[nextIdx].id, true);
  }, [activeFilteredIndex, filteredPartners, selectPartner]);

  // Track viewport visibility with IntersectionObserver (zero expensive scroll listeners)
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsInViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Ambient live cycle: smoothly advances when idle and in viewport, strictly silent (no auto sfx)
  useEffect(() => {
    if (isPaused || isReducedMotion || !isInViewport || filteredPartners.length <= 1) {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      setActiveId((currentId) => {
        const curIdx = filteredPartners.findIndex((p) => p.id === currentId);
        const nextIdx = curIdx >= 0 ? (curIdx + 1) % filteredPartners.length : 0;
        return filteredPartners[nextIdx].id;
      });
    }, 4500);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isPaused, isReducedMotion, isInViewport, filteredPartners]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      }
    },
    [handleNext, handlePrev]
  );

  return (
    <section
      ref={containerRef}
      className="pinned-partners-showcase-section"
      aria-label="Strategic Partners & Sponsors Showcase"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      tabIndex={0}
    >
      {/* Section Header with verified badge, title & description */}
      <div className="showcase-header">
        <div className="badge-pill">
          <span className="live-radar-dot" style={{ backgroundColor: '#e84537' }} />
          <span>OFFICIAL ALLIANCE NETWORK</span>
          <span className="badge-sep">•</span>
          <span>{partners.length} VERIFIED PARTNERS AT A GLANCE</span>
        </div>
        <h2 className="showcase-title">Strategic Partners & Guild Allies</h2>
        <p className="showcase-desc">
          Collaborating with industry pioneers, national esports bodies, leading collegiate institutes, and regional gaming communities.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="showcase-filter-bar" role="tablist" aria-label="Partner Categories">
        {CATEGORY_FILTERS.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`filter-pill-btn ${isSelected ? 'active' : ''}`}
              onClick={() => {
                sound.playBlip();
                setSelectedCategory(cat.id);
                // If current partner is not in new category, switch to first of that category
                if (cat.id !== 'all') {
                  const subset = partners.filter((p) => {
                    if (cat.id === 'academic') return p.category.toLowerCase().includes('academic') || p.category.toLowerCase().includes('collegiate');
                    if (cat.id === 'sports') return p.category.toLowerCase().includes('sports');
                    if (cat.id === 'studio') return p.category.toLowerCase().includes('game dev') || p.category.toLowerCase().includes('animation') || p.category.toLowerCase().includes('summit') || p.category.toLowerCase().includes('startup') || p.category.toLowerCase().includes('incubation');
                    if (cat.id === 'community') return p.category.toLowerCase().includes('community') || p.category.toLowerCase().includes('culture');
                    return true;
                  });
                  if (subset.length > 0 && !subset.some((p) => p.id === activeId)) {
                    setActiveId(subset[0].id);
                  }
                }
              }}
            >
              {cat.label}
              {cat.id === 'all' && <span className="pill-count">14</span>}
            </button>
          );
        })}
      </div>

      {/* The Stable Alliance Citadel Box (Split-Screen Master-Detail Console) */}
      <div
        className="partners-citadel-box"
        style={{
          '--accent-color': activePartner?.accent || '#ff4d4d',
          '--bg-color': activePartner?.bgColor || '#000000',
          '--card-glow': `${activePartner?.accent || '#ff4d4d'}33`
        }}
      >
        <div className="citadel-box-interior">
          {/* Left: Active Spotlight Inspector (1:1 Square Aperture Mask Stage + Synchronized Info) */}
          <div className="spotlight-inspector-pane">
            <div className="spotlight-stage-wrapper">
              <div className="stage-box">
                <span className="stage-corner tl" />
                <span className="stage-corner tr" />
                <span className="stage-corner bl" />
                <span className="stage-corner br" />
                <img
                  key={activePartner?.id}
                  src={activePartner?.image1x1 || activePartner?.image}
                  alt={activePartner?.name}
                  className={`stage-img ${isReducedMotion ? 'reduced-motion' : ''}`}
                  loading="eager"
                />
              </div>
            </div>

            <div key={activePartner?.id} className="spotlight-details-box">
              <div className="meta-row">
                <span className="cat-badge">{activePartner?.category}</span>
                <span className="partner-index">
                  {String(activeFilteredIndex + 1).padStart(2, '0')} / {String(filteredPartners.length).padStart(2, '0')}
                </span>
              </div>

              <h3 className="partner-title">{activePartner?.name}</h3>
              <div className="partner-fullname">{activePartner?.fullName}</div>
              <div className="accent-bar" />

              <p className="partner-desc">{activePartner?.desc}</p>

              {/* Prev / Next controls */}
              <div className="spotlight-nav-actions">
                <button
                  type="button"
                  className="showcase-nav-btn"
                  onClick={handlePrev}
                  aria-label="Previous partner"
                >
                  ◀
                </button>
                <div className="spotlight-status-label">
                  <span className="pulse-dot" style={{ backgroundColor: activePartner?.accent }} />
                  <span>INSPECTING ACTIVE ALLY</span>
                </div>
                <button
                  type="button"
                  className="showcase-nav-btn"
                  onClick={handleNext}
                  aria-label="Next partner"
                >
                  ▶
                </button>
              </div>
            </div>
          </div>

          {/* Right: The Complete 14-Partner Stable Grid (Visible Simultaneously at a Glance) */}
          <div className="matrix-overview-pane">
            <div className="matrix-pane-header">
              <div className="matrix-title-group">
                <span className="matrix-code">ALLIANCE ROSTER MATRIX</span>
                <h4 className="matrix-heading">All {filteredPartners.length} Organizations Active</h4>
              </div>
              <span className="matrix-hint">Click or hover any tile to inspect</span>
            </div>

            <div className="partners-grid-matrix" role="tablist" aria-label="Partner Roster Grid">
              {filteredPartners.map((p, idx) => {
                const isActive = p.id === activePartner?.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Inspect ${p.name}`}
                    className={`matrix-tile ${isActive ? 'active' : ''}`}
                    style={{
                      '--tile-accent': p.accent,
                      '--tile-bg': p.bgColor || '#000000'
                    }}
                    onClick={() => selectPartner(p.id, true)}
                    onMouseEnter={() => selectPartner(p.id, false)}
                  >
                    <div className="tile-thumb-frame">
                      <img
                        src={p.image1x1 || p.image}
                        alt=""
                        aria-hidden="true"
                        className="tile-thumb-img"
                        loading="lazy"
                      />
                    </div>
                    <div className="tile-info">
                      <span className="tile-number">{String(idx + 1).padStart(2, '0')}</span>
                      <strong className="tile-name">{p.name}</strong>
                    </div>
                    {isActive && <span className="tile-active-pip" style={{ backgroundColor: p.accent }} />}
                    <span className="tile-bracket tl" />
                    <span className="tile-bracket br" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
