// Nomad's Province — Location Details Panel
// Shows when player interacts with a building

import { useNavigate } from 'react-router-dom';
import { sound } from '../systems/soundFx.js';

export default function LocationPanel({ location, onClose }) {
  const navigate = useNavigate();

  if (!location) return null;

  const handleEnter = () => {
    sound.playDoorEnter();
    onClose();
    navigate(location.route);
  };

  const handleClose = () => {
    sound.playCancel();
    onClose();
  };

  return (
    <div className="location-panel-backdrop" onClick={handleClose}>
      <div className="location-panel" onClick={e => e.stopPropagation()}>
        <div className="location-panel-accent" style={{ backgroundColor: location.accentColor }} />
        
        <div className="location-panel-header">
          <h2 className="location-panel-title">{location.displayName}</h2>
          <p className="location-panel-desc">{location.description}</p>
          <button className="location-panel-close" onClick={handleClose} onMouseEnter={() => sound.playBlip()}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="location-panel-body">
          <div className="location-panel-stats">
            {location.sectionDetails.quickStats.map((stat, i) => (
              <div key={i} className="location-stat" onMouseEnter={() => sound.playBlip()}>
                <span className="location-stat-label">{stat.label}</span>
                <span className="location-stat-value">{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="location-panel-highlights">
            {location.sectionDetails.highlights.map((item, i) => (
              <div key={i} className="location-highlight">
                <span className="highlight-dot" style={{ backgroundColor: location.accentColor }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="location-panel-actions">
          <button
            className="location-enter-btn"
            onClick={handleEnter}
            onMouseEnter={() => sound.playBlip()}
            style={{ backgroundColor: location.accentColor }}
          >
            {location.enterLabel}
          </button>
          <button
            className="location-secondary-btn"
            onClick={handleEnter}
            onMouseEnter={() => sound.playBlip()}
          >
            {location.secondaryLabel}
          </button>
          <button
            className="location-close-btn"
            onClick={handleClose}
            onMouseEnter={() => sound.playBlip()}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
