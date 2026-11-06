// Nomad's Province — Map Modal
// Displays the campus layout with quick travel points

import { sound } from '../systems/soundFx.js';

export default function MapModal({ isOpen, onClose, onTravel }) {
  if (!isOpen) return null;

  const handleTravel = (id) => {
    sound.playWarp();
    onTravel(id);
    onClose();
  };

  const handleClose = () => {
    sound.playCancel();
    onClose();
  };

  return (
    <div className="map-modal-backdrop" onClick={handleClose}>
      <div className="map-modal-card" onClick={e => e.stopPropagation()}>
        <div className="map-modal-header">
          <div className="map-title-row">
            <span className="map-crest">&#9670;</span>
            <h2 className="map-modal-title">CAMPUS OVERVIEW MAP</h2>
          </div>
          <button className="map-modal-close" onClick={handleClose} onMouseEnter={() => sound.playBlip()}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="map-modal-canvas-frame">
          <div className="map-grid-preview">
            {/* Top row */}
            <button 
              className="map-node node-studio"
              onClick={() => handleTravel('game-dev-studio')}
              onMouseEnter={() => sound.playBlip()}
            >
              <span className="node-badge" style={{ backgroundColor: '#38bdf8' }}>STUDIO</span>
              <span className="node-name">Game Dev Studio</span>
            </button>

            <button 
              className="map-node node-hq"
              onClick={() => handleTravel('main-headquarters')}
              onMouseEnter={() => sound.playBlip()}
            >
              <span className="node-badge" style={{ backgroundColor: '#e84537' }}>HQ</span>
              <span className="node-name">Main Headquarters</span>
            </button>

            <button 
              className="map-node node-arena"
              onClick={() => handleTravel('esports-arena')}
              onMouseEnter={() => sound.playBlip()}
            >
              <span className="node-badge" style={{ backgroundColor: '#ff4444' }}>ARENA</span>
              <span className="node-name">Esports Arena</span>
            </button>

            {/* Center Plaza */}
            <div className="map-node-center">
              <div className="plaza-ring">
                <span className="plaza-icon">&#9670;</span>
                <span className="plaza-name">Central Plaza</span>
              </div>
            </div>

            {/* Bottom row */}
            <button 
              className="map-node node-community"
              onClick={() => handleTravel('community-hub')}
              onMouseEnter={() => sound.playBlip()}
            >
              <span className="node-badge" style={{ backgroundColor: '#84c669' }}>HUB</span>
              <span className="node-name">Community Hub</span>
            </button>

            <button 
              className="map-node node-events"
              onClick={() => handleTravel('event-grounds')}
              onMouseEnter={() => sound.playBlip()}
            >
              <span className="node-badge" style={{ backgroundColor: '#fdbe53' }}>EVENTS</span>
              <span className="node-name">Event Grounds</span>
            </button>

            <button 
              className="map-node node-contact"
              onClick={() => handleTravel('contact-centre')}
              onMouseEnter={() => sound.playBlip()}
            >
              <span className="node-badge" style={{ backgroundColor: '#c0cbdc' }}>CONTACT</span>
              <span className="node-name">Contact Centre</span>
            </button>
          </div>
        </div>

        <div className="map-modal-footer">
          <span className="map-footer-hint">Select any sector to automatically navigate your player.</span>
        </div>
      </div>
    </div>
  );
}
