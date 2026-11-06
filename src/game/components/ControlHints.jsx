export default function ControlHints({isMobile}){
 return (
  <div className={'control-hints'+(isMobile?' touch-hints':'')} aria-label="Navigation instructions">
    {isMobile
      ? <><span className="hint-label">Hold arrows to walk</span><span className="hint-separator">•</span><span className="hint-label">Tap a building for travel</span><span className="hint-separator">•</span><span className="hint-label">Explore on arrival</span></>
      : <><span className="hint-label">WASD / Arrow keys to move</span><span className="hint-separator">•</span><span className="hint-label">Click a building to travel</span><span className="hint-separator">•</span><span className="hint-label">Explore on arrival</span></>}
  </div>
 );
}
