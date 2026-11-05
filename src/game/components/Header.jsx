// Nomad's Province — Header Bar
// Minimal header: brand left, navigation right

export default function Header({ onDirectoryOpen, onMapOpen, onMenuOpen }) {
  return (
    <header className="game-header">
      <div className="header-brand">
        <span className="header-crest">&#9670;</span>
        <div className="header-brand-text">
          <span className="header-brand-name">NOMAD'S PROVINCE</span>
          <span className="header-brand-sub">HEADQUARTERS</span>
        </div>
      </div>

      <nav className="header-nav">
        <button className="header-nav-btn" onClick={onDirectoryOpen}>
          DIRECTORY
        </button>
        <button className="header-nav-btn" onClick={onMapOpen}>
          MAP
        </button>
        <button className="header-nav-btn" onClick={onMenuOpen}>
          MENU
        </button>
      </nav>
    </header>
  );
}
