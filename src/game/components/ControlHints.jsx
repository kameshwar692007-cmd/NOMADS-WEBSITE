// Nomad's Province — Control Hints
// Small unobtrusive desktop control guide

export default function ControlHints({ isMobile }) {
  if (isMobile) return null;

  return (
    <div className="control-hints">
      <div className="control-hint-group">
        <span className="hint-keys">
          <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
          <span className="hint-separator">/</span>
          <kbd>&#8593;</kbd><kbd>&#8595;</kbd><kbd>&#8592;</kbd><kbd>&#8594;</kbd>
        </span>
        <span className="hint-label">Move</span>
      </div>
      <div className="control-hint-divider" />
      <div className="control-hint-group">
        <span className="hint-keys"><kbd>E</kbd></span>
        <span className="hint-label">Interact</span>
      </div>
      <div className="control-hint-divider" />
      <div className="control-hint-group">
        <span className="hint-keys">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M1 1h5v5H1zM8 1h5v5H8zM1 8h5v5H1z" opacity="0.3"/>
            <path d="M7 3a4 4 0 100 8 4 4 0 000-8z"/>
          </svg>
        </span>
        <span className="hint-label">Click to Travel</span>
      </div>
    </div>
  );
}
