// Fixed website chrome; independent of the game's scrolling camera.
import { useState, useEffect } from 'react';
import { sound } from '../systems/soundFx.js';

export default function Header({ onDirectoryOpen, onMapOpen, onMenuOpen, onHelpOpen, onLogoReplay }) {
  const [muted, setMuted] = useState(() => sound.isMuted());

  useEffect(() => {
    setMuted(sound.isMuted());
  }, []);

  const toggleSound = () => {
    const next = sound.toggleMute();
    setMuted(next);
  };

  return (
    <header className="campus-fixed-header" aria-label="Nomad's Province navigation">
      <button type="button" className="campus-fixed-brand" onClick={onLogoReplay}
        aria-label="Replay Nomad's Province opening logo animation"
        title="Replay opening animation">
        <img src="/assets/game/headquarters-banner-client.png"
          alt="Nomad's Province Headquarters" width="600" height="212" draggable="false"
          onError={(event) => {
            const image = event.currentTarget;
            if (!image.src.endsWith('/assets/game/headquarters-banner.webp')) {
              image.src = '/assets/game/headquarters-banner.webp';
            }
          }} />
      </button>
      <nav className="campus-fixed-nav" aria-label="Campus controls">
        <button
          type="button"
          className="campus-fixed-button campus-contact-button"
          onClick={onDirectoryOpen}
          onMouseEnter={() => sound.playBlip()}
          aria-label="Contact Us"
        >
          <span aria-hidden="true">✉</span> <span>Contact Us</span>
        </button>
        <button
          type="button"
          className="campus-fixed-button campus-map-button"
          onClick={onMapOpen}
          onMouseEnter={() => sound.playBlip()}
          aria-label="Open campus map"
        >
          <span aria-hidden="true">⌖</span> <span>Map</span>
        </button>
        <button type="button" className="campus-fixed-button campus-help-button"
          onClick={onHelpOpen} onMouseEnter={() => sound.playBlip()}
          aria-label="How to play" title="How to play">
          <span aria-hidden="true">?</span> <span>Help</span>
        </button>
        <button
          type="button"
          className="campus-fixed-button campus-menu-button"
          onClick={onMenuOpen}
          onMouseEnter={() => sound.playBlip()}
          aria-label="Open website menu"
        >
          <span aria-hidden="true">☰</span> <span>Menu</span>
        </button>
        <button
          type="button"
          className={`campus-fixed-button campus-sound-button ${muted ? 'is-muted' : ''}`}
          onClick={toggleSound}
          onMouseEnter={() => sound.playBlip()}
          title={muted ? 'Unmute sound effects' : 'Mute sound effects'}
          aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
        >
          <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
          <span>{muted ? 'Muted' : 'SFX'}</span>
        </button>
      </nav>
    </header>
  );
}
