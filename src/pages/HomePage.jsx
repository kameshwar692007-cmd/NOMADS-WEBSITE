// Nomad's Province — Homepage (Interactive Campus)
// Main game viewport with all overlays

import { useState, useCallback, useEffect } from 'react';
import GameCanvas from '../game/components/GameCanvas.jsx';
import Header from '../game/components/Header.jsx';
import LocationPanel from '../game/components/LocationPanel.jsx';
import Directory from '../game/components/Directory.jsx';
import MapModal from '../game/components/MapModal.jsx';
import MenuDrawer from '../game/components/MenuDrawer.jsx';
import ControlHints from '../game/components/ControlHints.jsx';

export default function HomePage() {
  const [activeLocation, setActiveLocation] = useState(null);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [travelTarget, setTravelTarget] = useState(null);

  // Responsive device check
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Prevent background touch scrolling on mobile while controlling the game
  useEffect(() => {
    const prevent = (e) => {
      if (
        !e.target.closest('.directory-panel') && 
        !e.target.closest('.location-panel') &&
        !e.target.closest('.map-modal-card') &&
        !e.target.closest('.menu-drawer') &&
        !e.target.closest('.game-header')
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', prevent, { passive: false });
    return () => document.removeEventListener('touchmove', prevent);
  }, []);

  const handleLocationInteract = useCallback((loc) => {
    setActiveLocation(loc);
  }, []);

  const handleLocationClose = useCallback(() => {
    setActiveLocation(null);
  }, []);

  const handleTravelRequest = useCallback((locationId) => {
    setTravelTarget(locationId);
  }, []);

  const handleTravelConsumed = useCallback(() => {
    setTravelTarget(null);
  }, []);

  return (
    <div className="homepage-frame">
      {/* 1. Minimal Header (Brand on left; DIRECTORY, MAP, MENU on right) */}
      <Header 
        onDirectoryOpen={() => setDirectoryOpen(true)}
        onMapOpen={() => setMapOpen(true)}
        onMenuOpen={() => setMenuOpen(true)}
      />

      {/* 2. Interactive Explorable Canvas World */}
      <main className="game-viewport">
        <GameCanvas 
          onLocationInteract={handleLocationInteract}
          isMobile={isMobile}
          directoryTravelTarget={travelTarget}
          onDirectoryTravelConsumed={handleTravelConsumed}
        />
      </main>

      {/* 3. Location Details Panel Modal (on arrival or manual reach) */}
      <LocationPanel 
        location={activeLocation} 
        onClose={handleLocationClose}
      />

      {/* 4. Directory Overlay (with badge icons and click-to-travel) */}
      <Directory 
        isOpen={directoryOpen}
        onClose={() => setDirectoryOpen(false)}
        onTravel={handleTravelRequest}
      />

      {/* 5. Campus Overview Map Modal */}
      <MapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        onTravel={handleTravelRequest}
      />

      {/* 6. Navigation Menu Drawer */}
      <MenuDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      {/* 7. Desktop Unobtrusive Bottom Control Hints */}
      <ControlHints isMobile={isMobile} />

    </div>
  );
}
