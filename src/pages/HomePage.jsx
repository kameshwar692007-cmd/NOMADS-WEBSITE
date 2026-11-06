// Nomad's Province — Homepage (Interactive Campus)
// Main game viewport with all overlays

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameCanvas from '../game/components/GameCanvas.jsx';
import Header from '../game/components/Header.jsx';
import LocationPanel from '../game/components/LocationPanel.jsx';
import Directory from '../game/components/Directory.jsx';
import MapModal from '../game/components/MapModal.jsx';
import MenuDrawer from '../game/components/MenuDrawer.jsx';
import ControlHints from '../game/components/ControlHints.jsx';
import NpcDialogue from '../game/components/NpcDialogue.jsx';
import BookIntro from '../game/components/BookIntro.jsx';
import HelpModal from '../game/components/HelpModal.jsx';
import { HERO_GUIDE } from '../game/data/npcDialogues.js';

export default function HomePage() {
  const navigate = useNavigate();
  const [activeLocation, setActiveLocation] = useState(null);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [travelTarget, setTravelTarget] = useState(null);
  // First visit of this tab only; returning from section pages must not
  // force visitors to replay the book or tutorial.
  const [introOpen, setIntroOpen] = useState(() => {
    try { return sessionStorage.getItem('np-campus-welcomed-v2') !== 'yes'; }
    catch { return true; }
  });
  const [npcDialogue, setNpcDialogue] = useState(null);
  const completeIntro = useCallback(() => {
    try { sessionStorage.setItem('np-campus-welcomed-v2', 'yes'); } catch { /* private mode */ }
    setIntroOpen(false);
    setNpcDialogue(HERO_GUIDE);
  }, []);

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
        !e.target.closest('.campus-fixed-header') &&
        !e.target.closest('.campus-help-overlay')
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', prevent, { passive: false });
    return () => document.removeEventListener('touchmove', prevent);
  }, []);

  const handleLocationInteract = useCallback((loc) => {
    setNpcDialogue(null);
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
      {/* Fixed header: Contact Us navigates directly to /contact */}
      <Header
        onDirectoryOpen={() => navigate('/contact')}
        onMapOpen={() => setMapOpen(true)}
        onMenuOpen={() => setMenuOpen(true)}
        onHelpOpen={() => setHelpOpen(true)}
      />
      {/* 2. Interactive Explorable Canvas World */}
      <main className="game-viewport">
        <GameCanvas 
          onLocationInteract={handleLocationInteract}
          onNpcInteract={setNpcDialogue}
          isMobile={isMobile}
          paused={Boolean(introOpen || npcDialogue || activeLocation || directoryOpen || mapOpen || menuOpen || helpOpen)}
          directoryTravelTarget={travelTarget}
          onDirectoryTravelConsumed={handleTravelConsumed}
        />
      </main>

      {/* 3. Location Details Panel Modal (on arrival or manual reach) */}
      <LocationPanel
        location={activeLocation}
        onClose={handleLocationClose}
      />

      {/* 4. Campus Directory Modal */}
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

      {/* Cinematic onboarding and reusable NPC dialogue only cover the campus. */}
      {introOpen && <BookIntro onComplete={completeIntro} />}
      <NpcDialogue npc={npcDialogue} onClose={() => setNpcDialogue(null)} />
      <HelpModal isOpen={helpOpen} isMobile={isMobile} onClose={() => setHelpOpen(false)} />

      {/* 7. Desktop Unobtrusive Bottom Control Hints */}
      <ControlHints isMobile={isMobile} />
    </div>
  );
}
