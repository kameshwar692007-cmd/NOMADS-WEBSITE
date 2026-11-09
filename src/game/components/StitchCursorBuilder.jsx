// Nomad's Province — Stitch AI Cursor Page Builder
// Dynamic scroll-triggered AI UI assembly effect with authentic SFX & zero auto-scroll
// Re-creates the iconic Google Stitch prompt-to-UI assembly experience.
// Never locks page scrolling: user can browse while the cursor animation runs.

import { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../systems/soundFx.js';

export default function StitchCursorBuilder({ accentColor = '#38bdf8' }) {
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isClicking, setIsClicking] = useState(false);
  const [activeBox, setActiveBox] = useState(null);

  const queueRef = useRef([]);
  const isProcessingRef = useRef(false);
  const activeElementRef = useRef(null);
  const isDestroyedRef = useRef(false);
  const builtElementsRef = useRef(new WeakSet());

  // Real-time synchronization: keeps cursor & laser bounding box magnetically attached while user is actively scrolling
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
    isDestroyedRef.current = false;

    // Real-time tracking during user scroll or window resize
    const handleScrollOrResize = () => {
      if (activeElementRef.current) {
        syncPositionWithScroll();
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    // Worker queue processing targets as they scroll into view
    async function processQueue() {
      if (isProcessingRef.current || queueRef.current.length === 0 || isDestroyedRef.current) return;
      isProcessingRef.current = true;

      while (queueRef.current.length > 0 && !isDestroyedRef.current) {
        const el = queueRef.current.shift();
        if (!el || builtElementsRef.current.has(el)) continue;

        activeElementRef.current = el;
        const isButton = el.tagName === 'BUTTON' || el.tagName === 'A' || el.classList.contains('gamified-btn') || el.classList.contains('view-details-btn') || el.classList.contains('tab-btn');

        // Target coordinates in the active viewport
        const rect = el.getBoundingClientRect();
        const targetX = rect.left + (isButton ? rect.width / 2 : Math.min(80, rect.width * 0.45));
        const targetY = rect.top + (isButton ? rect.height / 2 : Math.min(45, rect.height * 0.35));

        // 1. AI Cursor wakes up and swoops to element with SFX
        setCursorVisible(true);
        setCursorPos({ x: targetX, y: targetY });
        try { sound.playLaserSwoop(); } catch (_) {}

        // Flight transition time
        await new Promise(r => setTimeout(r, 260));
        if (isDestroyedRef.current) break;

        // 2. Laser bounding box frames the element with scan SFX
        const currentRect = el.getBoundingClientRect();
        setActiveBox({
          top: currentRect.top,
          left: currentRect.left,
          width: currentRect.width,
          height: currentRect.height,
          isButton
        });
        try { sound.playLaserScan(); } catch (_) {}

        // Transition element into active synthesis
        el.classList.remove('stitch-pending');
        el.classList.add('stitch-constructing');

        await new Promise(r => setTimeout(r, isButton ? 280 : 340));
        if (isDestroyedRef.current) break;

        // 3. If button, perform physical click animation with mechanical SFX
        if (isButton) {
          setIsClicking(true);
          try { sound.playHapticClick(); } catch (_) {}
          el.classList.add('stitch-clicked');

          await new Promise(r => setTimeout(r, 190));
          setIsClicking(false);
          try { sound.playSelect(); } catch (_) {}
          el.classList.remove('stitch-clicked');
        }

        // 4. Solidify component into place
        el.classList.remove('stitch-constructing');
        el.classList.add('stitch-built');
        builtElementsRef.current.add(el);
        setActiveBox(null);
        activeElementRef.current = null;

        await new Promise(r => setTimeout(r, 100));
      }

      isProcessingRef.current = false;

      // When queue is empty, cleanly fade cursor out until next element scrolls into view
      if (queueRef.current.length === 0) {
        setTimeout(() => {
          if (!isProcessingRef.current && queueRef.current.length === 0) {
            setCursorVisible(false);
          }
        }, 320);
      }
    }

    // Set up targets and IntersectionObserver
    let observer;
    const initTimer = setTimeout(() => {
      const targets = document.querySelectorAll('.stitch-target');
      if (targets.length === 0) return;

      // Initialize all unbuilt targets in blueprint wireframe mode
      targets.forEach(el => {
        if (!builtElementsRef.current.has(el)) {
          el.classList.add('stitch-pending');
          el.classList.remove('stitch-built');
        }
      });

      // Observer automatically triggers when an element enters the viewport upon scroll or initial load
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !builtElementsRef.current.has(entry.target)) {
            // Unobserve so each element is constructed only once
            observer.unobserve(entry.target);
            if (!queueRef.current.includes(entry.target)) {
              queueRef.current.push(entry.target);
            }
          }
        });

        if (queueRef.current.length > 0 && !isProcessingRef.current) {
          processQueue();
        }
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -30px 0px'
      });

      targets.forEach(el => {
        if (!builtElementsRef.current.has(el)) {
          observer.observe(el);
        }
      });
    }, 80);

    return () => {
      isDestroyedRef.current = true;
      clearTimeout(initTimer);
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      if (observer) observer.disconnect();
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

      {/* 2. Floating AI Laser Cursor Pointer (Clean laser arrow without text clutter) */}
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
