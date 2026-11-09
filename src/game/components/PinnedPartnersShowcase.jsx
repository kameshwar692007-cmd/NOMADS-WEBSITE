// Compact, accessible partner and operational network carousel.
// Source-of-truth partners and team details remain in campusContent.js.
import { useEffect, useMemo, useRef, useState } from 'react';
import { PARTNERS } from '../data/campusContent.js';
import { sound } from '../systems/soundFx.js';

const FILTERS = [
  { id: 'all', label: 'All Allies', matches: () => true },
  { id: 'academic', label: 'Colleges', matches: p => /academic|collegiate|event/i.test(p.category) },
  { id: 'sports', label: 'Sports & Esports', matches: p => /sports|esports/i.test(p.category) },
  { id: 'studio', label: 'Studio & Startups', matches: p => /game dev|animation|summit|startup|incubation/i.test(p.category) },
  { id: 'community', label: 'Communities', matches: p => /community|culture/i.test(p.category) },
];

export default function PinnedPartnersShowcase({ partners = PARTNERS, operations = [] }) {
  const [category, setCategory] = useState('all');
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  );
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const touchX = useRef(null);
  const filtered = useMemo(() => {
    const matcher = FILTERS.find(filter => filter.id === category)?.matches || FILTERS[0].matches;
    return partners.filter(matcher);
  }, [partners, category]);
  const currentIndex = filtered.length ? Math.min(index, filtered.length - 1) : 0;
  const active = filtered[currentIndex];

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return;
    const update = () => setReducedMotion(query.matches);
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    if (hovered || focused || reducedMotion || !pageVisible || filtered.length < 2) return;
    const timer = window.setInterval(() => setIndex(value => (value + 1) % filtered.length), 5500);
    return () => window.clearInterval(timer);
  }, [hovered, focused, reducedMotion, pageVisible, filtered.length]);

  const move = delta => {
    if (!filtered.length) return;
    sound.playSelect();
    setIndex(value => (value + delta + filtered.length) % filtered.length);
  };
  const changeCategory = id => {
    sound.playBlip();
    setCategory(id);
    setIndex(0);
  };
  const showcasePartner = partnerIndex => {
    sound.playSelect();
    setCategory('all');
    setIndex(partnerIndex);
  };

  return (
    <section className="hq-allies-section about-section-block" aria-labelledby="hq-allies-title">
      <div className="section-narrative-header">
        <span className="narrative-tag">ALLIES & OPERATIONS</span>
        <h2 id="hq-allies-title" className="narrative-title">Our Network</h2>
        <p className="narrative-desc">
          A compact view of the teams behind our events and the organizations featured in our existing partner network.
        </p>
      </div>

      {operations.length > 0 && (
        <div className="hq-operations-compact" aria-label="Operations and community network">
          {operations.map(group => (
            <details key={group.roleCategory} className="hq-operations-detail">
              <summary>
                <span>{group.roleCategory}</span>
                <strong>{group.title}</strong>
                <span className="hq-operations-expand" aria-hidden="true">+</span>
              </summary>
              <div className="hq-operations-detail-body">
                <p>{group.desc}</p>
                <ul>{group.members.map(member =>
                  <li key={member.role}><strong>{member.role}</strong> — {member.area}</li>
                )}</ul>
              </div>
            </details>
          ))}
        </div>
      )}

      <div className="hq-partners-carousel gamified-card" aria-roledescription="carousel"
        aria-label="Partner and allies showcase"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}
        onTouchStart={event => { touchX.current = event.touches[0]?.clientX ?? null; }}
        onTouchEnd={event => {
          if (touchX.current === null) return;
          const dx = (event.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1);
        }}
      >
        <div className="hq-partner-filter-row" role="group" aria-label="Filter partner categories">
          {FILTERS.map(filter => (
            <button key={filter.id} type="button" onClick={() => changeCategory(filter.id)}
              className={category === filter.id ? 'hq-filter active' : 'hq-filter'}
              aria-pressed={category === filter.id}>{filter.label}</button>
          ))}
        </div>

        {active ? (
          <div className="hq-partner-slide" aria-live={focused ? 'polite' : 'off'}>
            <div className="hq-partner-image-wrap hq-partner-cyber-stage"
              style={{ '--ally-accent': active.accent, '--ally-bg': active.bgColor || '#090f1e' }}>
              <span className="hq-stage-corner tl" aria-hidden="true" />
              <span className="hq-stage-corner tr" aria-hidden="true" />
              <span className="hq-stage-corner bl" aria-hidden="true" />
              <span className="hq-stage-corner br" aria-hidden="true" />
              <img key={active.id} src={active.image1x1 || active.image} alt={active.name + ' logo'}
                loading="eager" decoding="async"
                onError={event => {
                  if (active.image && !event.currentTarget.src.endsWith(active.image)) {
                    event.currentTarget.src = active.image;
                  }
                }} />
            </div>
            <div className="hq-partner-details">
              <div className="hq-partner-meta-row">
                <span className="hq-partner-kicker">{active.category}</span>
                <span className="hq-partner-counter">{String(currentIndex + 1).padStart(2, '0')} / {String(filtered.length).padStart(2, '0')}</span>
              </div>
              <h3>{active.name}</h3>
              <span className="hq-partner-full-name">{active.fullName}</span>
              <span className="hq-partner-cyber-rule" style={{ '--ally-accent': active.accent }} aria-hidden="true" />
              <p>{active.desc}</p>
              <span className="hq-partner-count">OFFICIAL ALLIES NETWORK</span>
            </div>
          </div>
        ) : <p className="hq-partner-empty">No partner entries in this category.</p>}

        <div className="hq-partner-controls" role="group" aria-label="Partner carousel controls">
          <button type="button" className="hq-cyber-arrow" onClick={() => move(-1)} disabled={filtered.length < 2}
            aria-label="Previous partner">← PREV</button>
          <div className="hq-partner-dots" role="group" aria-label="Choose featured ally">
            {filtered.map((partner, i) => (
              <button key={partner.id} type="button"
                aria-label={`Show ${partner.name}`}
                aria-pressed={i === currentIndex}
                className={i === currentIndex ? 'hq-partner-dot is-active' : 'hq-partner-dot'}
                onClick={() => { sound.playSelect(); setIndex(i); }} />
            ))}
          </div>
          <button type="button" className="hq-cyber-arrow" onClick={() => move(1)} disabled={filtered.length < 2}
            aria-label="Next partner">NEXT →</button>
        </div>
      </div>

      {/* The complete partners showcase belongs below the featured slider.
          Each logo selects the corresponding existing partner without duplicating copy. */}
      <div className="hq-allies-logo-showcase" aria-labelledby="hq-allies-showcase-title">
        <div className="hq-allies-showcase-heading">
          <div className="hq-showcase-heading-top"><span className="hq-showcase-status-dot" aria-hidden="true" /> OFFICIAL ALLIANCE NETWORK <span className="hq-showcase-separator">•</span> {partners.length} ALLIES</div>
          <h3 id="hq-allies-showcase-title">Strategic Partners &amp; Guild Allies</h3>
          <p>Explore the organizations in our network.</p>
        </div>
        <div className="hq-allies-logo-grid">
          {partners.map((partner, partnerIndex) => (
            <button
              key={partner.id}
              type="button"
              className={category === 'all' && currentIndex === partnerIndex
                ? 'hq-allies-logo-tile is-selected' : 'hq-allies-logo-tile'}
              style={{ '--tile-accent': partner.accent || '#e84537' }}
              onClick={() => showcasePartner(partnerIndex)}
              aria-label={`View ${partner.name} in the Allies carousel`}
              aria-pressed={category === 'all' && currentIndex === partnerIndex}
            >
              <span className="hq-allies-tile-number">ALLY {String(partnerIndex + 1).padStart(2, '0')}</span>
              <img src={partner.image1x1 || partner.image} alt=""
                loading="lazy" decoding="async"
                onError={event => {
                  if (partner.image && !event.currentTarget.src.endsWith(partner.image)) {
                    event.currentTarget.src = partner.image;
                  }
                }} />
              <span>{partner.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
