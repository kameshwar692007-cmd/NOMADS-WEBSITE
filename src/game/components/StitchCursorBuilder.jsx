// Nomad's Province — Stitch AI Cursor Page Builder
// Dynamic scroll-triggered AI UI assembly effect with authentic SFX & zero auto-scroll
// Re-creates the Google Stitch experience: sleek laser pointer without text clutter.
// Constructs elements dynamically as the user scrolls through the page.

import { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../systems/soundFx.js';

export default function StitchCursorBuilder({ accentColor = '#38bdf8' }) {
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isClicking, setIsClicking] = useState(false);
  const [activeBox, setActiveBox] = useState(null);

  const builtSetRef = useRef(new Set());
  const queueRef = useRef([]);
  const isProcessingRef = useRef(false);
  const activeElementRef = useRef(null);
  const isDestroyedRef = useRef(false);

  // Sync coordinates dynamically in real time while user is scrolling during assembly
  const syncPositionWithScroll = useCallback(() => {
    if (!activeElementRef.current) return;
    const el = activeElementRef.current;
    const rect = el.getBoundingClientRect();
    const isButton = el.tagName === 'BUTTON' || el.tagName === 'A' || el.classList.contains('gamified-btn') || el.classList.contains('view-details-btn') || el.classList.contains('tab-btn');

    const targetX = rect.left + (isButton ? rect.width / 2 : Math.min(80, rect.width * 0.45));
    const targetY = rect.top + (isButton ? rect.height / 2 : Math.min(45, rect.height * 0.35));

    setCursorPos({ x: targetX, y: targetY });
    setActiveBox({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      isButton
    });
  }, []);

  useEffect(() => {
    // Only trigger on genuine reload or fresh session entry
    const navEntry = window.performance?.getEntriesByType?.('navigation')?.[0];
    const isReload = navEntry?.type === 'reload';
    const reloadToken = (window.performance?.timeOrigin || Date.now()).toString();
    const tokenKey = 'stitch_reload_' + window.location.pathname;
    const previousToken = sessionStorage.getItem(tokenKey);

    if (previousToken === reloadToken && !isReload) {
      document.querySelectorAll('.stitch-target').forEach(el => {
        el.classList.add('stitch-built');
      });
      return;
    }

    sessionStorage.setItem(tokenKey, reloadToken);
    isDestroyedRef.current = false;

    // Gather all tagged targets on the current page
    const allTargets = Array.from(document.querySelectorAll('.stitch-target'));
    if (allTargets.length === 0) return;

    // Initialize unbuilt targets in blueprint wireframe mode
    allTargets.forEach(el => {
      el.classList.add('stitch-pending');
      el.classList.remove('stitch-built');
    });

    // Worker queue processing elements that enter viewport
    async function processQueue() {
      if (isProcessingRef.current || queueRef.current.length === 0 || isDestroyedRef.current) return;
      isProcessingRef.current = true;

      while (queueRef.current.length > 0 && !isDestroyedRef.current) {
        const el = queueRef.current.shift();
        if (!el || builtSetRef.current.has(el)) continue;

        activeElementRef.current = el;
        const isButton = el.tagName === 'BUTTON' || el.tagName === 'A' || el.classList.contains('gamified-btn') || el.classList.contains('view-details-btn') || el.classList.contains('tab-btn');

        // Viewport coordinates without auto-scrolling
        const rect = el.getBoundingClientRect();
        const targetX = rect.left + (isButton ? rect.width / 2 : Math.min(80, rect.width * 0.45));
        const targetY = rect.top + (isButton ? rect.height / 2 : Math.min(45, rect.height * 0.35));

        // 1. Cursor swoops to element with SFX
        setCursorVisible(true);
        setCursorPos({ x: targetX, y: targetY });
        try { sound.playLaserSwoop(); } catch (_) {}

        // Flight transition time
        await new Promise(r => setTimeout(r, 260));
        if (isDestroyedRef.current) break;

        // 2. Laser bounding box locks on with scan SFX
        const currentRect = el.getBoundingClientRect();
        setActiveBox({
          top: currentRect.top,
          left: currentRect.left,
          width: currentRect.width,
          height: currentRect.height,
          isButton
        });
        try { sound.playLaserScan(); } catch (_) {}

        // Transition element into active construction
        el.classList.remove('stitch-pending');
        el.classList.add('stitch-constructing');

        await new Promise(r => setTimeout(r, isButton ? 260 : 320));
        if (isDestroyedRef.current) break;

        // 3. If button, perform physical click with mechanical SFX
        if (isButton) {
          setIsClicking(true);
          try { sound.playHapticClick(); } catch (_) {}
          el.classList.add('stitch-clicked');

          await new Promise(r => setTimeout(r, 180));
          setIsClicking(false);
          try { sound.playSelect(); } catch (_) {}
          el.classList.remove('stitch-clicked');
        }

        // 4. Solidify component
        el.classList.remove('stitch-constructing');
        el.classList.add('stitch-built');
        builtSetRef.current.add(el);
        setActiveBox(null);
        activeElementRef.current = null;

        await new Promise(r => setTimeout(r, 90));
      }

      isProcessingRef.current = false;

      // If no more visible targets in queue, fade cursor cleanly
      if (queueRef.current.length === 0) {
        setTimeout(() => {
          if (!isProcessingRef.current && queueRef.current.length === 0) {
            setCursorVisible(false);
          }
        }, 320);
      }
    }

    // Scroll trigger handler: checks elements entering viewport as user scrolls
    const handleScrollOrResize = () => {
      // Keep active bounding box & cursor synchronized with scroll position in real time
      if (activeElementRef.current) {
        syncPositionWithScroll();
      }

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const targets = document.querySelectorAll('.stitch-target');

      targets.forEach(el => {
        if (builtSetRef.current.has(el) || queueRef.current.includes(el) || activeElementRef.current === el) {
          return;
        }

        const rect = el.getBoundingClientRect();
        // Element is visible in the active viewport
        if (rect.top < viewportHeight * 0.90 && rect.bottom > 40) {
          queueRef.current.push(el);
        }
      });

      if (queueRef.current.length > 0 && !isProcessingRef.current) {
        processQueue();
      }
    };

    // Initial check for elements already visible above the fold on initial load
    const initialTimer = setTimeout(() => {
      handleScrollOrResize();
    }, 120);

    // Dynamic scroll listeners without any forced auto-scroll
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      isDestroyedRef.current = true;
      clearTimeout(initialTimer);
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      document.querySelectorAll('.stitch-target').forEach(el => {
        el.classList.remove('stitch-pending', 'stitch-constructing', 'stitch-clicked');
        el.classList.add('stitch-built');
      });
    };
  }, [syncPositionWithScroll]);

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
        </div>
      )}

      {/* 2. Floating AI Laser Cursor Pointer (Clean laser arrow without text) */}
      <div
        className={`stitch-ai-cursor ${cursorVisible ? 'visible' : 'hidden'}`}
        style={{
          transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)`,
          '--cursor-accent': accentColor
        }}
      >
        <div className={`cursor-body ${isClicking ? 'clicking' : ''}`}>
          {/* Futuristic Laser Arrow Pointer */}
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="cursor-arrow-svg">
            <path
              d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
              fill={accentColor}
              stroke="#090d16"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>

          {/* Pulsing Spark at Cursor Tip */}
          <div className="cursor-spark-ring" />
        </div>
      </div>
    </div>
  );
}
