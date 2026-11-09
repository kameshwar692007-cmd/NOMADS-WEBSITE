// Nomad's Province — Esports Arena (/esports)
// Professional, minimal competitive tournament dashboard with responsive horizontal carousel

import { useState, useRef, useEffect, useCallback } from 'react';
import './EsportsArenaGuide.css';
import GameShell from '../game/components/GameShell.jsx';
import { TOURNAMENTS, ORG_INFO } from '../game/data/campusContent.js';
import { sound } from '../game/systems/soundFx.js';
import { IconCrosshair, IconWhatsApp, IconInstagram } from '../game/components/Icons.jsx';

export default function EsportsPage() {
  const [selectedTournament, setSelectedTournament] = useState(TOURNAMENTS[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeGame, setActiveGame] = useState('all');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const carouselRef = useRef(null);
  const touchStartX = useRef(0);

  const visibleTournaments = activeGame === 'all'
    ? TOURNAMENTS
    : TOURNAMENTS.filter(tourney => tourney.id === activeGame);

  const scrollToIndex = useCallback((index) => {
    const el = carouselRef.current;
    if (!el) return;
    const cards = el.querySelectorAll('.esports-carousel-card');
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      setActiveSlideIndex(index);
    }
  }, []);

  const handlePrev = () => {
    sound.playSelect();
    const nextIdx = Math.max(0, activeSlideIndex - 1);
    scrollToIndex(nextIdx);
  };

  const handleNext = () => {
    sound.playSelect();
    const nextIdx = Math.min(visibleTournaments.length - 1, activeSlideIndex + 1);
    scrollToIndex(nextIdx);
  };

  const handleFilterChange = (gameId) => {
    sound.playSelect();
    setActiveGame(gameId);
    setActiveSlideIndex(0);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const handleRegisterClick = (tourney) => {
    sound.playSelect();
    setSelectedTournament(tourney);
    setModalOpen(true);
  };

  // Keep active index in sync during native scroll / touch swipe
  const handleScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const cards = el.querySelectorAll('.esports-carousel-card');
    if (!cards.length) return;
    const scrollLeft = el.scrollLeft;
    let closestIndex = 0;
    let minDiff = Infinity;
    cards.forEach((card, idx) => {
      const diff = Math.abs(card.offsetLeft - el.offsetLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });
    if (closestIndex !== activeSlideIndex) {
      setActiveSlideIndex(closestIndex);
    }
  };

  // Keyboard navigation within the carousel
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  // Touch swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // ESC key closes modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && modalOpen) {
        sound.playCancel();
        setModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [modalOpen]);

  return (
    <GameShell
      title="ESPORTS ARENA"
      subtitle="Tournament Operations, Collegiate Circuits & Competitive Showdowns"
      accentColor="#ff4444"
    >
      {/* 1. Concise Professional Headline Banner */}
      <section className="gamified-card esports-hero-card">
        <div className="esports-header-meta">
          <span className="esports-status-pill">
            <span className="esports-live-dot" />
            COMPETITIVE CIRCUITS ACTIVE
          </span>
          <span className="esports-badge-kicker">NOMAD'S PROVINCE ESPORTS</span>
        </div>
        <h2 className="esports-hero-title">Structured Esports & Collegiate Tournaments</h2>
        <p className="esports-hero-desc">
          Nomad's Province organizes structured tournaments, private collegiate scrims, and community showdowns 
          across India's top competitive mobile and PC titles. Browse active circuits below to view match formats and register.
        </p>
      </section>

      {/* 2. Interactive Game Filters & Circuit Carousel */}
      <section className="esports-circuits-section" aria-labelledby="esports-circuits-heading">
        <div className="section-title-wrap">
          <h3 id="esports-circuits-heading" className="section-title">FEATURED TOURNAMENT CIRCUITS</h3>
          <span className="section-badge">VERIFIED CIRCUITS</span>
        </div>

        {/* Game Filters */}
        <div className="arena-game-filters" role="group" aria-label="Filter tournaments by game">
          <button
            type="button"
            className={`arena-game-filter ${activeGame === 'all' ? 'active' : ''}`}
            aria-pressed={activeGame === 'all'}
            onClick={() => handleFilterChange('all')}
          >
            All Games
          </button>
          {TOURNAMENTS.map(tourney => (
            <button
              type="button"
              key={tourney.id}
              className={`arena-game-filter ${activeGame === tourney.id ? 'active' : ''}`}
              aria-pressed={activeGame === tourney.id}
              onClick={() => handleFilterChange(tourney.id)}
            >
              {tourney.game}
            </button>
          ))}
        </div>

        <div className="esports-filter-status-row">
          <p className="arena-filter-count" aria-live="polite">
            Showing {visibleTournaments.length} of {TOURNAMENTS.length} tournament circuits
          </p>

          {/* Carousel Controls */}
          {visibleTournaments.length > 1 && (
            <div className="esports-carousel-nav" aria-label="Carousel pagination">
              <button
                type="button"
                className="carousel-nav-btn prev-btn"
                aria-label="Previous tournament"
                disabled={activeSlideIndex === 0}
                onClick={handlePrev}
              >
                ‹
              </button>
              <span className="carousel-nav-counter">
                {activeSlideIndex + 1} / {visibleTournaments.length}
              </span>
              <button
                type="button"
                className="carousel-nav-btn next-btn"
                aria-label="Next tournament"
                disabled={activeSlideIndex >= visibleTournaments.length - 1}
                onClick={handleNext}
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* Horizontal Responsive Carousel */}
        <div
          className="esports-carousel-wrapper"
          tabIndex={0}
          role="region"
          aria-label="Featured tournaments carousel"
          onKeyDown={handleKeyDown}
        >
          <div
            ref={carouselRef}
            className="esports-carousel-track"
            onScroll={handleScroll}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {visibleTournaments.map((t, idx) => (
              <article
                key={t.id}
                className={`gamified-card esports-carousel-card ${activeSlideIndex === idx ? 'is-active-slide' : ''}`}
                style={{ '--tourney-accent': t.accent }}
                onMouseEnter={() => sound.playBlip()}
                aria-label={`Tournament ${idx + 1} of ${visibleTournaments.length}: ${t.title}`}
              >
                <div className="tourney-header-chip-wrap">
                  <span className="tourney-status-chip" style={{ backgroundColor: t.accent }}>
                    {t.status}
                  </span>
                  <span className="tourney-game-badge">{t.game}</span>
                </div>

                <div className="tourney-body">
                  <div className="tourney-badge-sub" style={{ color: t.accent }}>
                    {t.badge}
                  </div>
                  <h4 className="tourney-title">{t.title}</h4>
                  <p className="tourney-desc">{t.desc}</p>

                  <div className="tourney-partner-tag">
                    <span className="partner-bullet">●</span> {t.partnerInfo}
                  </div>

                  <div className="tourney-specs-grid">
                    <div className="spec-box">
                      <span className="spec-label">AWARDS & RECOGNITION</span>
                      <span className="spec-val" style={{ color: t.accent }}>{t.prizePool}</span>
                    </div>
                    <div className="spec-box">
                      <span className="spec-label">MATCH FORMAT</span>
                      <span className="spec-val">{t.format}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="gamified-btn tourney-btn"
                    style={{ backgroundColor: t.accent }}
                    onClick={() => handleRegisterClick(t)}
                    onMouseEnter={() => sound.playBlip()}
                  >
                    <IconCrosshair size={16} />
                    <span>REGISTER FOR TOURNAMENT</span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Carousel Dot Indicators */}
          {visibleTournaments.length > 1 && (
            <div className="esports-dots-indicator" role="tablist" aria-label="Tournament slides">
              {visibleTournaments.map((t, idx) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  className={`esports-dot ${activeSlideIndex === idx ? 'active' : ''}`}
                  aria-selected={activeSlideIndex === idx}
                  aria-label={`Go to slide ${idx + 1}: ${t.title}`}
                  onClick={() => scrollToIndex(idx)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Tournament Details & Registration Modal */}
      {modalOpen && (
        <div
          className="retro-modal-backdrop"
          onClick={() => { sound.playCancel(); setModalOpen(false); }}
        >
          <div
            className="retro-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ borderColor: selectedTournament?.accent }}>
              <h3 id="modal-title">ENTER {selectedTournament?.title}</h3>
              <button
                type="button"
                className="modal-close-btn"
                aria-label="Close registration dialog"
                onClick={() => { sound.playCancel(); setModalOpen(false); }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-specs-summary">
                <p><strong>Game:</strong> {selectedTournament?.game}</p>
                <p><strong>Format:</strong> {selectedTournament?.format}</p>
                <p><strong>Awards:</strong> {selectedTournament?.prizePool}</p>
                <p><strong>Partner:</strong> {selectedTournament?.partnerInfo}</p>
              </div>
              <p className="modal-instruction">
                Squad check-ins and external registration forms are coordinated via our official channels:
              </p>
              <div className="modal-links">
                <a
                  href={ORG_INFO.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="modal-action-btn whatsapp-btn"
                  onClick={() => sound.playSelect()}
                >
                  <IconWhatsApp size={18} />
                  <span>Register via Official WhatsApp</span>
                </a>
                <a
                  href={ORG_INFO.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="modal-action-btn insta-btn"
                  onClick={() => sound.playSelect()}
                >
                  <IconInstagram size={18} />
                  <span>View Updates on Instagram (@nomadsprovince)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </GameShell>
  );
}
