// Nomad's Province — Dedicated Event Page (/events/:slug)
// Standalone shareable event page with full schedule, poster hero, partners,
// tournament winner podium, and external registration redirect.

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import GameShell from '../game/components/GameShell.jsx';
import { eventService } from '../game/services/eventService.js';
import { sound } from '../game/systems/soundFx.js';
import {
  IconMapPin,
  IconEvents,
  IconTrophy,
  IconRocket,
  IconWhatsApp,
  IconShield,
  IconCheck
} from '../game/components/Icons.jsx';

export default function EventDetailPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      try {
        const data = await eventService.getEventBySlug(slug);
        setEvent(data);
      } catch (err) {
        console.error('Failed to load event details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [slug]);

  const handleRegisterClick = () => {
    sound.playSelect();
    if (event?.id) {
      eventService.trackRegistrationClick(event.id, event.title);
    }
    const targetUrl = event?.registrationUrl || 'https://whatsapp.com/channel/0029VbCLLDiAjPXQTWkJP00f';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <GameShell
        title="EVENT TRANSMISSION"
        subtitle="Accessing Provincial Holo-Archives..."
        accentColor="#fdbe53"
      >
        <div className="events-loading-pane" style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span className="pulse-beacon" />
          <p style={{ marginTop: '16px', letterSpacing: '2px', color: '#38bdf8' }}>DECRYPTING EVENT DATA STREAM...</p>
        </div>
      </GameShell>
    );
  }

  if (!event) {
    return (
      <GameShell
        title="EVENT NOT FOUND"
        subtitle="The requested event broadcast does not exist or has been archived."
        accentColor="#ef4444"
      >
        <div className="gamified-card" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '600px', margin: '40px auto' }}>
          <IconEvents size={48} color="#64748b" />
          <h3 style={{ color: '#f87171', margin: '16px 0 8px 0', fontFamily: 'monospace' }}>SIGNAL LOST: 404 EVENT NOT FOUND</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
            We could not locate an active tournament or festival matching <code>"{slug}"</code>.
          </p>
          <Link to="/events" className="gamified-btn" onClick={() => sound.playSelect()}>
            ← RETURN TO EVENT GROUNDS
          </Link>
        </div>
      </GameShell>
    );
  }

  const isOngoing = event.computedStatus === 'ONGOING';
  const isConcluded = event.computedStatus === 'ENDED';
  const isUpcoming = event.computedStatus === 'UPCOMING';

  return (
    <GameShell
      title={event.title}
      subtitle={`${event.category} • Official Nomad's Province Showcase`}
      accentColor="#fdbe53"
    >
      {/* 1. Breadcrumb Navigation */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontFamily: 'monospace' }}>
        <Link to="/events" style={{ color: '#94a3b8', textDecoration: 'none' }} onClick={() => sound.playSelect()}>
          EVENT GROUNDS
        </Link>
        <span style={{ color: '#475569' }}>/</span>
        <span style={{ color: '#fdbe53' }}>{event.title}</span>
      </div>

      {/* 2. Main Event Detail Grid */}
      <div className="event-detail-page-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 420px) 1fr',
        gap: '28px',
        alignItems: 'start'
      }}>
        {/* Left Column: Poster & Quick Action Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="gamified-card" style={{ padding: '16px' }}>
            <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1e293b' }}>
              <img
                src={event.posterUrl || '/assets/events-and-logos/img_1_2026-11-05_at_10.30.08_AM.jpeg'}
                alt={event.title}
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                padding: '4px 10px',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '11px',
                letterSpacing: '1px',
                background: isOngoing ? '#16a34a' : isUpcoming ? '#0284c7' : '#475569',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
              }}>
                {isOngoing ? '● LIVE NOW' : isUpcoming ? '⚡ UPCOMING' : '✓ CONCLUDED'}
              </div>
            </div>

            {/* External Registration Action */}
            <div style={{ marginTop: '20px' }}>
              {isConcluded ? (
                <div style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '14px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}>
                  REGISTRATIONS CONCLUDED FOR THIS TOURNAMENT
                </div>
              ) : (
                <button
                  className="gamified-btn"
                  onClick={handleRegisterClick}
                  onMouseEnter={() => sound.playBlip()}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: '#ef4444',
                    border: '1px solid #f87171'
                  }}
                >
                  <IconRocket size={18} />
                  <span>REGISTER NOW (EXTERNAL LINK) ↗</span>
                </button>
              )}

              <p style={{
                fontSize: '11px',
                color: '#64748b',
                textAlign: 'center',
                marginTop: '10px',
                lineHeight: '1.4'
              }}>
                Registration redirects to the official organizer form / WhatsApp lobby. No account required on this website.
              </p>
            </div>
          </div>

          {/* Partner & Organizer Recognition */}
          <div className="gamified-card" style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '11px', color: '#64748b', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
              FEATURED PARTNER / HOST
            </h4>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconShield size={16} color="#38bdf8" />
              <span>{event.partner || "Nomad's Province"}</span>
            </div>
          </div>
        </div>

        {/* Right Column: In-depth Specifications & Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Specifications Card */}
          <div className="gamified-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
              <span className={`cat-pill ${event.category.toLowerCase().replace(/\s+/g, '-')}`}>
                {event.category}
              </span>
              <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                SLUG: {event.slug || slug}
              </span>
            </div>

            <h2 style={{ fontSize: '24px', color: '#fff', margin: '0 0 16px 0', fontFamily: 'inherit' }}>
              {event.title}
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              padding: '16px',
              background: '#0d1322',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              marginBottom: '20px'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>START TIME</span>
                <strong style={{ color: '#fdbe53', fontSize: '14px' }}>
                  {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </strong>
                <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>
                  {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>CONCLUDES</span>
                <strong style={{ color: '#fdbe53', fontSize: '14px' }}>
                  {new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </strong>
                <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>
                  {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>VENUE / ARENA</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', marginTop: '2px' }}>
                  <IconMapPin size={14} />
                  <strong style={{ fontSize: '13px' }}>{event.venue}</strong>
                </div>
              </div>
            </div>

            {/* Description */}
            <h4 style={{ fontSize: '13px', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
              ABOUT THIS EVENT
            </h4>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {event.description || 'Join Nomad\'s Province for high-stakes competition, gaming culture showcases, and community activations.'}
            </p>
          </div>

          {/* Tournament Results Podium (if recorded) */}
          {event.results?.champion && (
            <div className="gamified-card" style={{
              padding: '24px',
              border: '1px solid #ffd700',
              background: 'linear-gradient(180deg, #131c2e 0%, #0c1322 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ padding: '6px', borderRadius: '50%', background: 'rgba(255, 215, 0, 0.1)' }}>
                  <IconTrophy size={24} color="#ffd700" />
                </span>
                <div>
                  <h3 style={{ margin: 0, color: '#ffd700', fontSize: '18px' }}>OFFICIAL TOURNAMENT PODIUM</h3>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Certified results recorded by Nomad's Province tournament referees</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '16px' }}>
                <div style={{ background: '#0a0f1d', border: '1px solid #eab308', padding: '14px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#ffd700', fontWeight: 'bold' }}>🥇 CHAMPION / 1ST PLACE</span>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>
                    {event.results.champion}
                  </div>
                </div>

                {event.results.runnerUp && (
                  <div style={{ background: '#0a0f1d', border: '1px solid #94a3b8', padding: '14px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 'bold' }}>🥈 RUNNER-UP / 2ND PLACE</span>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>
                      {event.results.runnerUp}
                    </div>
                  </div>
                )}
              </div>

              {event.results.highlights && (
                <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '6px', borderLeft: '3px solid #38bdf8' }}>
                  <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', textTransform: 'uppercase' }}>MATCH HIGHLIGHTS</span>
                  <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>
                    {event.results.highlights}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* External Action Bottom Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <Link to="/events" className="gamified-btn" style={{ background: '#1e293b' }} onClick={() => sound.playSelect()}>
              ← BACK TO ALL EVENTS
            </Link>

            {!isConcluded && (
              <button className="gamified-btn" onClick={handleRegisterClick} onMouseEnter={() => sound.playBlip()}>
                <IconRocket size={16} />
                <span>OPEN REGISTRATION FORM ↗</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </GameShell>
  );
}
