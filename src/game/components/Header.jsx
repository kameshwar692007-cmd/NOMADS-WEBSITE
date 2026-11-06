// Fixed website chrome; independent of the game's scrolling camera.
export default function Header({ onDirectoryOpen, onMapOpen, onMenuOpen }) {
  return (
    <header className="campus-fixed-header" aria-label="Nomad's Province navigation">
      <a className="campus-fixed-brand" href="/" aria-label="Nomad's Province — Home">
        <img
          src="/assets/game/headquarters-banner.webp"
          alt="Nomad's Province Headquarters"
          draggable="false"
        />
      </a>
      <nav className="campus-fixed-nav" aria-label="Campus controls">
        <button type="button" className="campus-fixed-button campus-contact-button" onClick={onDirectoryOpen} aria-label="Contact Us">
          <span aria-hidden="true">✉</span> <span>Contact Us</span>
        </button>
        <button type="button" className="campus-fixed-button" onClick={onMapOpen} aria-label="Open campus map">
          <span aria-hidden="true">⌖</span> <span>Map</span>
        </button>
        <button type="button" className="campus-fixed-button" onClick={onMenuOpen} aria-label="Open website menu">
          <span aria-hidden="true">☰</span> <span>Menu</span>
        </button>
      </nav>
    </header>
  );
}
