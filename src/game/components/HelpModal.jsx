import { useEffect, useRef } from 'react';
import { sound } from '../systems/soundFx.js';
import './HelpModal.css';

export default function HelpModal({ isOpen, isMobile, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen, onClose]);
  if (!isOpen) return null;

  const close = () => { sound.playCancel(); onClose(); };
  return (
    <div className="campus-help-overlay" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
      <section className="campus-help-panel" role="dialog" aria-modal="true" aria-labelledby="campus-help-title" aria-describedby="campus-help-description">
        <header className="campus-help-heading">
          <div>
            <span className="campus-help-eyebrow">EXPLORER'S FIELD GUIDE</span>
            <h2 id="campus-help-title">How to explore Nomad's Province</h2>
          </div>
          <button ref={closeRef} type="button" className="campus-help-close" onClick={close} aria-label="Close help">×</button>
        </header>
        <p id="campus-help-description">Walk around headquarters, meet the team, and enter each destination to learn more.</p>
        <div className="campus-help-steps">
          <div className="campus-help-step"><span className="campus-help-step-icon" aria-hidden="true">⌨</span><div><strong>Move your character</strong><p>{isMobile ? 'Hold the on-screen directional arrows to walk.' : 'Use W A S D or the arrow keys to walk.'}</p></div></div>
          <div className="campus-help-step"><span className="campus-help-step-icon" aria-hidden="true">⌖</span><div><strong>Travel across the map</strong><p>Click or tap a building or open path to walk there. Use Map in the top bar to discover destinations.</p></div></div>
          <div className="campus-help-step"><span className="campus-help-step-icon" aria-hidden="true">✦</span><div><strong>Talk to characters</strong><p>Click or tap an NPC to open their dialogue. {isMobile ? 'Tap a character when you get close.' : 'You can also press E when standing near a character.'}</p></div></div>
          <div className="campus-help-step"><span className="campus-help-step-icon" aria-hidden="true">↗</span><div><strong>Explore destinations</strong><p>Choose the dialogue action to visit its section, or close it to keep exploring.</p></div></div>
        </div>
        <div className="campus-help-footnote">Tip: Open Help anytime to see these instructions again. Press Esc to close dialogs on desktop.</div>
        <button type="button" className="campus-help-done" onClick={close}>Got it — let's explore</button>
      </section>
    </div>
  );
}
