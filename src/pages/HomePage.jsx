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
import LogoRevolver from '../game/components/LogoRevolver.jsx';
import HelpModal from '../game/components/HelpModal.jsx';

export default function HomePage() {
  const navigate = useNavigate();
  const [activeLocation, setActiveLocation] = useState(null);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [travelTarget, setTravelTarget] = useState(null);
  // Brand reveal once per tab; return visits go directly to the interactive campus map.
  const [introOpen, setIntroOpen] = useState(() => {
    try { return sessionStorage.getItem('np-campus-welcomed-v2') !== 'yes'; }
    catch { return true; }
  });
  const [introReplayKey, setIntroReplayKey] = useState(0);
  const [npcDialogue, setNpcDialogue] = useState(null);
  const completeIntro = useCallback(() => {
    try { sessionStorage.setItem('np-campus-welcomed-v2', 'yes'); } catch { /* private mode */ }
    setIntroOpen(false);
  }, []);

  const replayIntro = useCallback(() => {
    setNpcDialogue(null);
    setIntroReplayKey(current => current + 1);
    setIntroOpen(true);
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

  // Pointer gestures are scoped to the game canvas and joystick in CSS.
  // Do not cancel document-wide touchmove: menus and dialogs must be scrollable.

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
        onLogoReplay={replayIntro}
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
      {introOpen && <LogoRevolver key={introReplayKey} onComplete={completeIntro} />}
      <NpcDialogue npc={npcDialogue} onClose={() => setNpcDialogue(null)} />
      <HelpModal isOpen={helpOpen} isMobile={isMobile} onClose={() => setHelpOpen(false)} />

      {/* 7. Desktop Unobtrusive Bottom Control Hints */}
      <ControlHints isMobile={isMobile} />
    </div>
  );
}
