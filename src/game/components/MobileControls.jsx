// Nomad's Province — Mobile Controls
// Virtual joystick + interact button for touch devices

import { useState, useRef, useCallback, useEffect } from 'react';

export default function MobileControls({ onJoystickChange, onInteract }) {
  const [joystickActive, setJoystickActive] = useState(false);
  const [thumbOffset, setThumbOffset] = useState({ x: 0, y: 0 });
  const joystickRef = useRef(null);
  const joystickCenterRef = useRef({ x: 0, y: 0 });

  const handleJoystickStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = joystickRef.current.getBoundingClientRect();
    joystickCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    setJoystickActive(true);
    updateJoystick(touch.clientX, touch.clientY);
  }, []);

  const updateJoystick = useCallback((clientX, clientY) => {
    const center = joystickCenterRef.current;
    let dx = clientX - center.x;
    let dy = clientY - center.y;
    const maxDist = 35;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }

    setThumbOffset({ x: dx, y: dy });

    // Normalize to -1..1
    const normDx = dx / maxDist;
    const normDy = dy / maxDist;
    
    // Apply deadzone
    const deadzone = 0.15;
    const ndx = Math.abs(normDx) < deadzone ? 0 : normDx;
    const ndy = Math.abs(normDy) < deadzone ? 0 : normDy;
    
    onJoystickChange({ dx: ndx, dy: ndy });
  }, [onJoystickChange]);

  const handleJoystickMove = useCallback((e) => {
    e.preventDefault();
    if (!joystickActive) return;
    const touch = e.touches[0];
    updateJoystick(touch.clientX, touch.clientY);
  }, [joystickActive, updateJoystick]);

  const handleJoystickEnd = useCallback((e) => {
    e.preventDefault();
    setJoystickActive(false);
    setThumbOffset({ x: 0, y: 0 });
    onJoystickChange({ dx: 0, dy: 0 });
  }, [onJoystickChange]);

  // Prevent page scroll when touching game area
  useEffect(() => {
    const prevent = (e) => {
      if (e.target.closest('.mobile-controls')) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', prevent, { passive: false });
    return () => document.removeEventListener('touchmove', prevent);
  }, []);

  return (
    <div className="mobile-controls">
      {/* Joystick — bottom left */}
      <div 
        ref={joystickRef}
        className={`joystick-base ${joystickActive ? 'active' : ''}`}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
      >
        <div 
          className="joystick-thumb"
          style={{ 
            transform: `translate(${thumbOffset.x}px, ${thumbOffset.y}px)` 
          }}
        />
      </div>

      {/* Interact button — bottom right */}
      <button 
        className="interact-button"
        onTouchStart={(e) => {
          e.preventDefault();
          onInteract();
        }}
      >
        <span className="interact-key">E</span>
        <span className="interact-label">INTERACT</span>
      </button>
    </div>
  );
}
