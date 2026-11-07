import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CAMPUS_NPCS } from '../game/data/npcDialogues.js';
import { NpcPortrait } from '../game/components/NpcDialogue.jsx';
import { sound } from '../game/systems/soundFx.js';

const SLIDE_INTERVAL_MS = 5500;

export default function ProvinceSlider({ destinations }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media) return;
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  const count = destinations.length;

  // Always scrolls automatically across destinations
  useEffect(() => {
    if (!pageVisible || count < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex(index => (index + 1) % count);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [pageVisible, count]);

  if (!count) return null;

  const destination = destinations[activeIndex % count];
  const npc = CAMPUS_NPCS.find(item => item.route === destination.route);
  const goTo = index => {
    sound.playSelect();
    setActiveIndex((index + count) % count);
  };

  return (
    <div className="province-slider" aria-roledescription="carousel"
      aria-label="Explore the Province destinations"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}>
      <div className="province-slider-viewport" aria-live="off">
        <article key={destination.id} className="province-slider-card gamified-card"
          aria-roledescription="slide"
          aria-label={`${activeIndex + 1} of ${count}: ${destination.displayName}`}
          style={{ '--province-accent': destination.accentColor }}>
          <div className="province-slider-portrait">
            {npc ? (
              <NpcPortrait portraitIndex={npc.portraitIndex} name={npc.name} />
            ) : (
              <img src={destination.badgeAsset} alt="" width="160" height="160" />
            )}
            <span>{npc ? npc.name : destination.shortName}</span>
          </div>
          <div className="province-slider-content">
            <span className="province-slider-kicker">DESTINATION {String(activeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
            <span className="province-slider-tagline">{destination.tagline}</span>
            <h3>{destination.displayName}</h3>
            <p>{destination.description}</p>
            {npc && <p className="province-slider-npc-line">Meet {npc.name}, {npc.title.toLowerCase()}, and discover this part of the Province.</p>}
            <Link to={destination.route} className="province-explore-more"
              onMouseEnter={() => sound.playBlip()}
              aria-label={'View more about ' + destination.displayName}>
              Explore {destination.shortName} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
      </div>
      <div className="province-slider-controls" aria-label="Destination slider controls">
        <button type="button" className="province-slider-arrow"
          onClick={() => goTo(activeIndex - 1)}
          aria-label="Previous destination">←</button>
        <div className="province-slider-dots" role="group" aria-label="Choose a destination">
          {destinations.map((item, index) => (
            <button key={item.id} type="button"
              className={index === activeIndex ? 'province-slider-dot is-active' : 'province-slider-dot'}
              onClick={() => goTo(index)}
              aria-label={`Show ${item.displayName}`}
              aria-current={index === activeIndex ? 'true' : undefined} />
          ))}
        </div>
        <button type="button" className="province-slider-arrow"
          onClick={() => goTo(activeIndex + 1)}
          aria-label="Next destination">→</button>
      </div>
    </div>
  );
}
