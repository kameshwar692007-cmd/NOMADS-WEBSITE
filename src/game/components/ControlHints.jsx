// Click/tap navigation guidance. No keyboard or joystick instructions.
export default function ControlHints({isMobile}){
 return (
  <div className={'control-hints click-only-hints'+(isMobile?' touch-hints':'')} aria-label="Navigation instructions">
    {isMobile
      ? <><span className="hint-label">Tap anywhere on a path to walk</span><span className="hint-separator">•</span><span className="hint-label">Tap a building to explore</span><span className="hint-separator">•</span><span className="hint-label">Use Directory for quick travel</span></>
      : <><span className="hint-label">Click a path to walk</span><span className="hint-separator">•</span><span className="hint-label">Click a building to explore</span><span className="hint-separator">•</span><span className="hint-label">Directory for quick travel</span></>}
  </div>
 );
}
