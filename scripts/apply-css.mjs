import fs from 'fs';
import path from 'path';

const cssPath = 'c:/Users/asus/Desktop/nomads-province/src/GamifiedPages.css';
let content = fs.readFileSync(cssPath, 'utf8');

const splitMarker = '/* Pinned Partners Showcase Container */';
const idx = content.indexOf(splitMarker);
if (idx === -1) {
  console.error('Marker not found!');
  process.exit(1);
}

const before = content.substring(0, idx);

const newShowcaseCSS = `/* Pinned Partners Showcase Container */
.pinned-partners-showcase-section {
  margin-top: 64px;
  margin-bottom: 64px;
  position: relative;
  outline: none;
}

.showcase-header {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 40px auto;
  padding: 0 16px;
}

.badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(232, 69, 55, 0.12);
  border: 1px solid rgba(232, 69, 55, 0.35);
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  color: #e84537;
  letter-spacing: 1.2px;
  margin-bottom: 16px;
}

.badge-sep {
  color: rgba(232, 69, 55, 0.45);
}

.showcase-title {
  font-size: 32px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
  line-height: 1.25;
}

.showcase-desc {
  font-size: 15px;
  color: #94a3b8;
  max-width: 640px;
  margin: 0 auto;
  line-height: 1.65;
}

/* Pinned Showcase Track */
.showcase-pinned-track {
  position: relative;
  min-height: 280vh;
}

/* Pinned Split-Screen Card */
.split-card {
  position: sticky;
  top: 100px;
  background: #0a1120;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 36px 40px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.75), 0 0 35px var(--card-glow, rgba(56, 189, 248, 0.12));
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 48px;
  align-items: center;
  min-height: 480px;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
  box-sizing: border-box;
}

/* Left: 1:1 Logo Stage with Aperture Mask Reveal */
.stage-wrapper {
  position: relative;
  width: 100%;
  max-width: 360px;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
}

.stage-box {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid var(--accent-color, #ff4d4d);
  background: var(--bg-color, #080808);
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px var(--card-glow, rgba(255, 77, 77, 0.25));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  transition: border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
}

.stage-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6));
  animation: maskReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.stage-img.reduced-motion {
  animation: none !important;
  opacity: 1 !important;
  transform: none !important;
  clip-path: none !important;
}

@keyframes maskReveal {
  0% {
    clip-path: inset(40% 40% 40% 40% round 8px);
    opacity: 0;
    transform: scale(0.92);
  }
  100% {
    clip-path: inset(0% 0% 0% 0% round 0px);
    opacity: 1;
    transform: scale(1);
  }
}

.stage-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: var(--accent-color, #ff4d4d);
  border-style: solid;
  pointer-events: none;
  transition: border-color 0.3s ease;
}

.stage-corner.tl { top: 8px; left: 8px; border-width: 2px 0 0 2px; }
.stage-corner.tr { top: 8px; right: 8px; border-width: 2px 2px 0 0; }
.stage-corner.bl { bottom: 8px; left: 8px; border-width: 0 0 2px 2px; }
.stage-corner.br { bottom: 8px; right: 8px; border-width: 0 2px 2px 0; }

/* Right: Synchronized Details Side */
.details-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 8px;
  animation: detailSlideIn 0.35s ease forwards;
}

@keyframes detailSlideIn {
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.cat-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  color: var(--accent-color, #ff4d4d);
  border: 1px solid var(--accent-color, #ff4d4d);
  background: rgba(255, 255, 255, 0.04);
  padding: 4px 12px;
  border-radius: 4px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  transition: color 0.3s ease, border-color 0.3s ease;
}

.partner-index {
  font-family: monospace;
  font-size: 13px;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 1px;
}

.partner-title {
  font-size: 32px;
  font-weight: 900;
  color: #ffffff;
  line-height: 1.2;
  margin: 0 0 6px 0;
  letter-spacing: 0.5px;
}

.partner-fullname {
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 16px;
  line-height: 1.4;
}

.accent-bar {
  width: 60px;
  height: 3px;
  background: var(--accent-color, #ff4d4d);
  border-radius: 2px;
  margin-bottom: 18px;
  transition: background-color 0.3s ease;
}

.partner-desc {
  font-size: 15px;
  line-height: 1.7;
  color: #cbd5e1;
  margin-bottom: 28px;
  max-width: 580px;
}

/* Navigation Bar */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.dots-group {
  display: flex;
  gap: 7px;
  align-items: center;
  flex-wrap: wrap;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  outline: none;
}

.dot:hover {
  background: rgba(255, 255, 255, 0.4);
  border-color: #fff;
}

.dot.active {
  background: var(--accent-color, #ff4d4d);
  border-color: var(--accent-color, #ff4d4d);
  transform: scale(1.3);
  box-shadow: 0 0 10px var(--accent-color, #ff4d4d);
}

.arrows-group {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.arrow-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #f1f5f9;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.arrow-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--accent-color, #ff4d4d);
  color: #ffffff;
}

/* Responsive Design */
@media (max-width: 860px) {
  .showcase-pinned-track {
    min-height: auto;
  }

  .split-card {
    position: relative;
    top: 0;
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 24px 20px;
  }

  .stage-wrapper {
    max-width: 260px;
  }

  .stage-box {
    padding: 18px;
  }

  .details-box {
    padding-left: 0;
  }

  .partner-title {
    font-size: 24px;
  }

  .partner-fullname {
    font-size: 13px;
    margin-bottom: 12px;
  }

  .partner-desc {
    font-size: 14px;
    margin-bottom: 20px;
  }

  .nav-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .dots-group {
    justify-content: center;
  }

  .arrows-group {
    justify-content: space-between;
    width: 100%;
  }

  .arrow-btn {
    flex: 1;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .showcase-title {
    font-size: 24px;
  }

  .showcase-desc {
    font-size: 13px;
  }

  .split-card {
    padding: 18px 14px;
  }

  .stage-wrapper {
    max-width: 220px;
  }
}
`;

fs.writeFileSync(cssPath, before + newShowcaseCSS, 'utf8');
console.log('CSS applied successfully!');
