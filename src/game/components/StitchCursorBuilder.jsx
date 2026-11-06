// Nomad's Province — Stitch AI Cursor Page Builder
// Re-creates the iconic AI prompt-to-UI assembly effect (as seen in Google Stitch & AI UI builders)
// An AI cursor traverses specific divs & buttons, constructing their wireframes into solid UI.
// Triggers ONCE when the user refreshes/reloads the page, then parks cleanly.

import { useState, useEffect, useRef } from 'react';
import { sound } from '../systems/soundFx.js';

export default function StitchCursorBuilder({ accentColor = '#38bdf8' }) {
  const [active, setActive] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorLabel, setCursorLabel] = useState('✨ Stitch AI: Synthesizing Prompt...');
  const [isClicking, setIsClicking] = useState(false);
  const [activeBox, setActiveBox] = useState(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    // Determine if this is a genuine page reload / refresh
    const navEntry = window.performance?.getEntriesByType?.('navigation')?.[0];
    const isReload = navEntry?.type === 'reload';
    const reloadToken = (window.performance?.timeOrigin || Date.now()).toString();
    const tokenKey = 'stitch_reload_' + window.location.pathname;
    const previousToken = sessionStorage.getItem(tokenKey);

    // Trigger only if it's a reload (or fresh initial session load if reload token not stored)
    // and hasn't already executed for this reload instance
    if (previousToken === reloadToken && !isReload) {
      document.querySelectorAll('.stitch-target').forEach(el => {
        el.classList.add('stitch-built');
      });
      return;
    }

    sessionStorage.setItem(tokenKey, reloadToken);

    let startTimer;
    let finishTimer;

    // Small delay to allow DOM nodes and game shell to mount cleanly
    startTimer = setTimeout(() => {
      const targets = Array.from(document.querySelectorAll('.stitch-target'));
      if (targets.length === 0) return;

      // Initially mark targets as pending wireframe
      targets.forEach(el => {
        el.classList.add('stitch-pending');
        el.classList.remove('stitch-built');
      });

      setActive(true);
      cancelledRef.current = false;

      // Start cursor in the top-right quadrant
      const startX = Math.min(window.innerWidth - 120, Math.max(80, window.innerWidth * 0.65));
      const startY = 90;
      setCursorPos({ x: startX, y: startY });
      setCursorLabel('✨ Stitch AI: Synthesizing Layout...');

      async function runSequence() {
        // Pause to let user perceive initial blueprint state
        await new Promise(r => setTimeout(r, 400));
        if (cancelledRef.current) return;

        for (let i = 0; i < targets.length; i++) {
          const el = targets[i];
          if (!el || cancelledRef.current) break;

          const isButton = el.tagName === 'BUTTON' || el.tagName === 'A' || el.classList.contains('gamified-btn') || el.classList.contains('view-details-btn') || el.classList.contains('tab-btn');
          const customLabel = el.getAttribute('data-stitch-label') || (isButton ? '🎯 Compiling Action Button...' : `⚡ Assembling Blueprint Div 0${i + 1}...`);

          // Bring element into view if necessary
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          await new Promise(r => setTimeout(r, 160));
          if (cancelledRef.current) break;

          const rect = el.getBoundingClientRect();
          const targetX = rect.left + Math.min(60, rect.width * 0.5);
          const targetY = rect.top + Math.min(30, rect.height * 0.5);

          // Move cursor to target
          setCursorPos({ x: targetX, y: targetY });
          setCursorLabel(customLabel);
          setActiveBox({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            isButton
          });

          try { sound.playBlip(); } catch (_) {}

          // Trace & construct element
          el.classList.remove('stitch-pending');
          el.classList.add('stitch-constructing');

          // Dwell time on element
          await new Promise(r => setTimeout(r, isButton ? 440 : 360));
          if (cancelledRef.current) break;

          // If button, perform physical click animation with sound
          if (isButton) {
            setIsClicking(true);
            try { sound.playSelect(); } catch (_) {}
            el.classList.add('stitch-clicked');

            await new Promise(r => setTimeout(r, 220));
            setIsClicking(false);
            el.classList.remove('stitch-clicked');
          }

          // Solidify element
          el.classList.remove('stitch-constructing');
          el.classList.add('stitch-built');
          setActiveBox(null);

          await new Promise(r => setTimeout(r, 140));
        }

        // Completion & graceful parking
        if (!cancelledRef.current) {
          setCursorLabel('✓ Stitch AI: Complete');
          setCursorPos(prev => ({ x: prev.x + 60, y: Math.max(30, prev.y - 40) }));

          finishTimer = setTimeout(() => {
            setActive(false);
            targets.forEach(el => el.classList.add('stitch-built'));
          }, 600);
        }
      }

      runSequence();
    }, 120);

    // Instant cancel if user scrolls or types to ensure non-blocking UX
    const handleCancel = () => {
      cancelledRef.current = true;
      setActive(false);
      document.querySelectorAll('.stitch-target').forEach(el => {
        el.classList.remove('stitch-pending', 'stitch-constructing', 'stitch-clicked');
        el.classList.add('stitch-built');
      });
    };

    window.addEventListener('keydown', handleCancel, { once: true });
    window.addEventListener('wheel', handleCancel, { once: true, passive: true });

    return () => {
      cancelledRef.current = true;
      clearTimeout(startTimer);
      clearTimeout(finishTimer);
      window.removeEventListener('keydown', handleCancel);
      window.removeEventListener('wheel', handleCancel);
    };
  }, []);

  if (!active) return null;

  return (
    <div className="stitch-builder-overlay" style={{ pointerEvents: 'none' }}>
      {/* 1. Active Laser Bounding Box surrounding current element */}
      {activeBox && (
        <div
          className={`stitch-laser-box ${activeBox.isButton ? 'button-box' : ''}`}
          style={{
            top: activeBox.top,
            left: activeBox.left,
            width: activeBox.width,
            height: activeBox.height,
            '--laser-accent': accentColor
          }}
        >
          <span className="corner-tag tl" />
          <span className="corner-tag tr" />
          <span className="corner-tag bl" />
          <span className="corner-tag br" />
          <span className="wireframe-status-tag">{cursorLabel}</span>
        </div>
      )}

      {/* 2. Floating AI Cursor Pointer */}
      <div
        className="stitch-ai-cursor"
        style={{
          transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)`,
          '--cursor-accent': accentColor
        }}
      >
        <div className={`cursor-body ${isClicking ? 'clicking' : ''}`}>
          {/* Futuristic Laser Arrow Pointer */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="cursor-arrow-svg">
            <path
              d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
              fill={accentColor}
              stroke="#090d16"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>

          {/* Pulsing Spark at Cursor Tip */}
          <div className="cursor-spark-ring" />

          {/* Floating AI Status Pill */}
          <div className="cursor-pill-badge">
            <span className="badge-radar-dot" />
            <span className="badge-text">{cursorLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
