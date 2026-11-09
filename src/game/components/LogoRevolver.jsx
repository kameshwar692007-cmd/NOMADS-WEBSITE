// Lightweight rotating brand reveal. The campus map mounts behind this overlay.
import { useEffect } from 'react';
import './LogoRevolver.css';

export const LOGO_REVOLVE_MS = 1800;

export default function LogoRevolver({ onComplete }) {
  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    // Skip all motion for accessibility. Otherwise enter the map automatically.
    const timer = window.setTimeout(onComplete, reducedMotion ? 0 : LOGO_REVOLVE_MS);
    const onEscape = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        window.clearTimeout(timer);
        onComplete();
      }
    };
    window.addEventListener('keydown', onEscape);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onEscape);
    };
  }, [onComplete]);

  return (
    <div className="np-revolver" role="dialog" aria-modal="true"
      aria-label="Nomad's Province logo intro">
      <div className="np-revolver-orbit" aria-hidden="true" />
      <div className="np-revolver-logo">
        <img
          src="/assets/game/headquarters-banner-client.png"
          alt="Nomad's Province"
          width="600" height="212"
          fetchPriority="high"
          onError={event => {
            const img = event.currentTarget;
            if (!img.src.endsWith('/assets/game/headquarters-banner.webp')) {
              img.src = '/assets/game/headquarters-banner.webp';
            }
          }}
        />
      </div>
      <button type="button" className="np-revolver-skip" onClick={onComplete}
        aria-label="Skip logo animation and enter campus map">
        Skip intro <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
