// Nomad's Province — Directory Overlay
// Lists all campus locations with click-to-travel

import { LOCATIONS } from '../data/locationData.js';
import { sound } from '../systems/soundFx.js';

export default function Directory({ isOpen, onClose, onTravel }) {
  if (!isOpen) return null;

  const handleTravelClick = (id) => {
    sound.playWarp();
    onTravel(id);
    onClose();
  };

  const handleClose = () => {
    sound.playCancel();
    onClose();
  };

  return (
    <div className="directory-backdrop" onClick={handleClose}>
      <div className="directory-panel" onClick={e => e.stopPropagation()}>
        <div className="directory-header">
          <h2 className="directory-title">CAMPUS DIRECTORY</h2>
          <button className="directory-close" onClick={handleClose} onMouseEnter={() => sound.playBlip()}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="directory-list">
          {LOCATIONS.map(loc => (
            <button
              key={loc.id}
              className="directory-item"
              onClick={() => handleTravelClick(loc.id)}
              onMouseEnter={() => sound.playBlip()}
            >
              <div className="directory-item-badge" style={{ backgroundColor: loc.accentColor }}>
                <img 
                  src={loc.badgeAsset} 
                  alt="" 
                  className="directory-badge-img"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="directory-item-info">
                <span className="directory-item-name">{loc.displayName}</span>
                <span className="directory-item-tagline">{loc.tagline}</span>
              </div>
              <div className="directory-item-arrow">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
