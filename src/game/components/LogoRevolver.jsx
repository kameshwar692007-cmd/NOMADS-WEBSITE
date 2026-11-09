// Brand intro using the user's supplied Nomad's Province logo, not a generated remake.
import { useEffect } from 'react';
import './LogoRevolver.css';

export const LOGO_REVOLVE_MS = 2400;

export default function LogoRevolver({ onComplete }) {
  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
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
      <div className="np-revolver-logo">
        <img src="/assets/branding/nomads-client-logo.svg" alt="Nomad's Province"
          width="514" height="410" fetchPriority="high" />
      </div>
      <div className="np-revolver-caption" aria-label="Enter the Province">
        {'ENTER THE PROVINCE'.split('').map((letter, index) => (
          <span key={index} className="np-revolver-letter"
            style={{ '--letter-index': index }} aria-hidden="true">
            {letter === ' ' ? '\u00a0' : letter}
          </span>
        ))}
      </div>
      <button type="button" className="np-revolver-skip" onClick={onComplete}
        aria-label="Skip logo animation and enter campus map">
        Skip intro <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
