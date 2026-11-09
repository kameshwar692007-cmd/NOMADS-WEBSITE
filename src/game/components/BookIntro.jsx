// Minimal client-approved logo reveal: automatically transition into the campus.
import { useEffect } from 'react';
import { sound } from '../systems/soundFx.js';
import './BookIntro.css';

const INTRO_DURATION_MS = 2000;

export default function BookIntro({ onComplete }) {
  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // No delayed animation for visitors who request reduced motion.
    const timeout = window.setTimeout(onComplete, reducedMotion ? 0 : INTRO_DURATION_MS);
    const onKeyDown = event => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.clearTimeout(timeout);
        onComplete();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onComplete]);

  const skip = () => {
    sound.playSelect();
    onComplete();
  };

  return (
    <div className="np-logo-intro" role="dialog" aria-modal="true"
      aria-label="Nomad's Province opening logo">
      <div className="np-logo-intro-aura" aria-hidden="true" />
      <div className="np-logo-intro-mark">
        <img
          src="/assets/game/headquarters-banner-client.png"
          alt="Nomad's Province Headquarters"
          width="600"
          height="212"
          fetchPriority="high"
          onError={event => {
            const image = event.currentTarget;
            if (!image.src.endsWith('/assets/game/headquarters-banner.webp')) {
              image.src = '/assets/game/headquarters-banner.webp';
            }
          }}
        />
      </div>
      <button type="button" className="np-logo-intro-skip"
        onClick={skip} aria-label="Skip intro and enter campus map">
        Skip <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
