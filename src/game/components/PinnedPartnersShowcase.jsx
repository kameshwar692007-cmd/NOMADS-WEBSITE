// Nomad's Province — Pinned Partners & Sponsors Split-Screen Showcase
// Based on Pinned Split-Screen Aperture Mask Reveal Architecture
// Verified 1:1 square assets, fluid CSS mask reveals, responsive & accessible

import { useState, useEffect, useRef, useCallback } from 'react';
import { PARTNERS } from '../data/campusContent.js';
import { sound } from '../systems/soundFx.js';

export default function PinnedPartnersShowcase({ partners = PARTNERS, operations = [] }) {
  const ALLY_HOLD_MS = 3500;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [filter, setFilter] = useState('all');
  const filters = [
    {id:'all',label:'All Allies',test:() => true},
    {id:'academic',label:'Colleges',test:p => /academic|collegiate|event/i.test(p.category)},
    {id:'sports',label:'Sports & Esports',test:p => /sports|esports/i.test(p.category)},
    {id:'studio',label:'Studio & Startups',test:p => /game dev|animation|summit|startup|incubation/i.test(p.category)},
    {id:'community',label:'Communities',test:p => /community|culture/i.test(p.category)}
  ];
  const filteredPartners = partners.filter(filters.find(f => f.id === filter)?.test || filters[0].test);
  const safeIndex = Math.min(activeIndex, Math.max(0,filteredPartners.length - 1));
  const trackRef = useRef(null);
  const touchX = useRef(null);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mediaQuery) return;
    const handler = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener?.('change', handler);
    return () => mediaQuery.removeEventListener?.('change', handler);
  }, []);

  const selectPartner = useCallback((index, playSfx = false) => {
    if (playSfx) {
      sound.playSelect();
    }
    setActiveIndex(index);
  }, []);

  const handlePrev = useCallback(() => {
    if (!filteredPartners.length) return;
    const nextIdx = (safeIndex - 1 + filteredPartners.length) % filteredPartners.length;
    selectPartner(nextIdx, true);
  }, [safeIndex, filteredPartners.length, selectPartner]);

  const handleNext = useCallback(() => {
    if (!filteredPartners.length) return;
    const nextIdx = (safeIndex + 1) % filteredPartners.length;
    selectPartner(nextIdx, true);
  }, [safeIndex, filteredPartners.length, selectPartner]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  }, [handleNext, handlePrev]);

  // Same original split-card presentation, with timed partner progression
  // instead of the very long scroll-pinned track.
  useEffect(() => {
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);
  useEffect(() => {
    if (hovered || focused || isReducedMotion || !pageVisible || filteredPartners.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex(i => (i + 1) % filteredPartners.length), ALLY_HOLD_MS);
    return () => window.clearInterval(timer);
  }, [hovered, focused, isReducedMotion, pageVisible, filteredPartners.length]);

  const activePartner = filteredPartners[safeIndex] || filteredPartners[0] || partners[0];
  const showcasePartner = partnerIndex => {
    sound.playSelect();
    setFilter('all');
    setActiveIndex(partnerIndex);
    window.scrollTo({ top: Math.max(0, document.querySelector('.showcase-pinned-track')?.getBoundingClientRect().top + window.scrollY - 120), behavior: 'smooth' });
  };
  const changeFilter = id => {
    sound.playBlip();
    setFilter(id);
    setActiveIndex(0);
  };

  return (
    <section
      className="pinned-partners-showcase-section"
      aria-label="Strategic Partners & Sponsors Showcase"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}
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

      {/* Preserve the condensed operational network alongside the restored allies design. */}
      {operations.length > 0 && (
        <div className="hq-operations-compact" aria-label="Operations and community network">
          {operations.map(group => (
            <details key={group.roleCategory} className="hq-operations-detail">
              <summary><span>{group.roleCategory}</span><strong>{group.title}</strong>
                <span className="hq-operations-expand" aria-hidden="true">+</span>
              </summary>
              <div className="hq-operations-detail-body">
                <p>{group.desc}</p>
                <ul>{group.members.map(member => <li key={member.role}><strong>{member.role}</strong> — {member.area}</li>)}</ul>
              </div>
            </details>
          ))}
        </div>
      )}
      {/* Exact original video-style split-screen card and dot navigation. */}
      <div className="showcase-pinned-track" ref={trackRef}
        onTouchStart={e => { touchX.current = e.touches[0]?.clientX ?? null; }}
        onTouchEnd={e => {
          if (touchX.current === null) return;
          const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 50) (dx < 0 ? handleNext : handlePrev)();
        }}>
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
                {String(safeIndex + 1).padStart(2, '0')} / {String(filteredPartners.length).padStart(2, '0')}
              </span>
            </div>

            <h3 className="partner-title">{activePartner.name}</h3>
            <div className="partner-fullname">{activePartner.fullName}</div>
            <div className="accent-bar" />

            <p className="partner-desc">{activePartner.desc}</p>

            {/* Navigation Bar with 14 Interactive Dots and Arrow Buttons */}
            <div className="nav-bar">
              <div className="dots-group" role="tablist" aria-label="Partner Selection Dots" onKeyDown={handleKeyDown}>
                {filteredPartners.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === safeIndex}
                    aria-label={`Select ${p.name}`}
                    title={p.name}
                    className={`dot ${idx === safeIndex ? 'active' : ''}`}
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
      <div className="showcase-original-filter-row" role="group" aria-label="Filter partner categories">
        {filters.map(item => <button type="button" key={item.id} className={filter === item.id ? 'hq-filter active' : 'hq-filter'}
          aria-pressed={filter === item.id} onClick={() => changeFilter(item.id)}>{item.label}</button>)}
      </div>
      {/* Partner overview uses the same restrained card language as the split-screen above. */}
      <div className="showcase-allies-overview" aria-labelledby="showcase-allies-overview-title">
        <div className="showcase-header">
          <span className="badge-pill">OFFICIAL ALLIANCE NETWORK • {partners.length} ALLIES</span>
          <h3 className="showcase-title" id="showcase-allies-overview-title">Allies Showcase</h3>
          <p className="showcase-desc">Select an ally to view their profile above.</p>
        </div>
        <div className="showcase-allies-grid">
          {partners.map((partner, partnerIndex) => (
            <button type="button" key={partner.id}
              className={filter === 'all' && safeIndex === partnerIndex ? 'showcase-ally-tile is-selected' : 'showcase-ally-tile'}
              onClick={() => showcasePartner(partnerIndex)}
              style={{ '--accent-color': partner.accent, '--bg-color': partner.bgColor || '#000000' }}
              aria-label={`View ${partner.name} in the Allies carousel`}
              aria-pressed={filter === 'all' && safeIndex === partnerIndex}>
              <span className="showcase-ally-frame">
                <span className="stage-corner tl" aria-hidden="true"/>
                <span className="stage-corner tr" aria-hidden="true"/>
                <span className="stage-corner bl" aria-hidden="true"/>
                <span className="stage-corner br" aria-hidden="true"/>
                <img src={partner.image1x1 || partner.image} alt="" loading="lazy" decoding="async"/>
              </span>
              <span className="showcase-ally-name">{partner.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
