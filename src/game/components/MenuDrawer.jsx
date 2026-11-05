// Nomad's Province — Menu Drawer
// Navigation menu with direct route links and brand info

import { useNavigate } from 'react-router-dom';
import { LOCATIONS } from '../data/locationData.js';

export default function MenuDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="menu-drawer-backdrop" onClick={onClose}>
      <aside className="menu-drawer" onClick={e => e.stopPropagation()}>
        <div className="menu-drawer-header">
          <div className="menu-brand">
            <span className="menu-crest">&#9670;</span>
            <div className="menu-brand-text">
              <span className="menu-title">NOMAD'S PROVINCE</span>
              <span className="menu-subtitle">OFFICIAL DIRECTORY &amp; NAVIGATION</span>
            </div>
          </div>
          <button className="menu-close-btn" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="menu-drawer-body">
          <div className="menu-section-label">CAMPUS SECTIONS</div>
          <div className="menu-links-list">
            {LOCATIONS.map(loc => (
              <button
                key={loc.id}
                className="menu-link-item"
                onClick={() => {
                  onClose();
                  navigate(loc.route);
                }}
              >
                <span className="menu-link-dot" style={{ backgroundColor: loc.accentColor }} />
                <div className="menu-link-text">
                  <span className="menu-link-name">{loc.displayName}</span>
                  <span className="menu-link-route">{loc.route}</span>
                </div>
                <span className="menu-link-arrow">&rarr;</span>
              </button>
            ))}
          </div>

          <div className="menu-section-label" style={{ marginTop: '24px' }}>ABOUT CAMPUS</div>
          <div className="menu-info-card">
            <p className="menu-info-text">
              Nomad's Province interactive headquarters is an explorable retro pixel-art campus connecting our studio, esports ecosystem, community, and events in one connected world.
            </p>
          </div>
        </div>

        <div className="menu-drawer-footer">
          <button className="menu-return-btn" onClick={onClose}>
            &larr; Resume Campus Exploration
          </button>
        </div>
      </aside>
    </div>
  );
}
