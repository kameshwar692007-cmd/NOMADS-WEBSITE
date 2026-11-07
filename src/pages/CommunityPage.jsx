// Nomad's Province — Community Hub (/community)
// Guild hall, Campus Ambassador recruitment, and pop-culture partnerships

import { useState } from 'react';
import { Link } from 'react-router-dom';
import './CommunityJourney.css';
import GameShell from '../game/components/GameShell.jsx';
import { AMBASSADOR_PERKS, ORG_INFO } from '../game/data/campusContent.js';
import { sound } from '../game/systems/soundFx.js';
import { ThemedIcon, IconWhatsApp, IconInstagram, IconCheck } from '../game/components/Icons.jsx';

export default function CommunityPage() {
  const [applicationReady, setApplicationReady] = useState(false);
  const [formData, setFormData] = useState({ name: '', college: '', email: '', phone: '', reason: '' });

  const handleAmbassadorSubmit = (e) => {
    e.preventDefault();
    sound.playSelect();
    // A mail draft is not a submitted application. The visitor must send it in their email app.
    setApplicationReady(true);
  };

  const applicationBody = [
    'Campus Ambassador Application — Nomad\'s Province',
    '',
    'Name: ' + formData.name.trim(),
    'College: ' + formData.college.trim(),
    'Email: ' + formData.email.trim(),
    'WhatsApp: ' + formData.phone.trim(),
    '',
    'Why I want to join:',
    formData.reason.trim(),
  ].join('\n');
  const applicationMailto = `mailto:${ORG_INFO.email}?subject=${encodeURIComponent('Campus Ambassador Application — ' + formData.name.trim())}&body=${encodeURIComponent(applicationBody)}`;

  return (
    <GameShell
      title="COMMUNITY HUB"
      subtitle="Our Guild of Gamers, Collegiate Chapters & Pop-Culture Allies"
      accentColor="#84c669"
    >
      {/* 1. Guild Welcome Hero */}
      <section className="gamified-card community-hero-card stitch-target" data-stitch-label="Constructing Community Guild Hub...">
        <div className="guild-beacon">
          <span>CHENNAI ANIME CLUB • OTAKU NADU • FREE FIRE COMMUNITY • DRUSHYA (DAG)</span>
        </div>
        <h2 className="community-headline">Connecting Gamers, Creators & Collegiate Leaders</h2>
        <p className="community-desc">
          Nomad's Province is built on a strong grassroots ecosystem connecting passionate esports competitors, 
          indie game developers, anime & pop-culture fans, and student leaders across educational institutions.
        </p>

        <div className="community-links-row">
          <a href={ORG_INFO.whatsapp} target="_blank" rel="noreferrer" className="gamified-btn comm-btn whatsapp-comm stitch-target" data-stitch-label="Compiling WhatsApp Community CTA..." onMouseEnter={() => sound.playBlip()}>
            <IconWhatsApp size={16} />
            <span>CONNECT ON WHATSAPP</span>
          </a>
          <a href={ORG_INFO.instagram} target="_blank" rel="noreferrer" className="gamified-btn comm-btn insta-comm" onMouseEnter={() => sound.playBlip()}>
            <IconInstagram size={16} />
            <span>FOLLOW ON INSTAGRAM (@nomadsprovince)</span>
          </a>
        </div>
      </section>

      <section className="community-journey gamified-card" aria-labelledby="community-journey-title">
        <span className="community-journey-eyebrow">COMMUNITY FIELD GUIDE / FIND YOUR GUILD</span>
        <h2 id="community-journey-title">There's a place for every kind of player and creator.</h2>
        <p>Find your path through the Province. Compete with others, build interactive worlds, or join the activities bringing local communities together.</p>
        <div className="community-journey-grid">
          {[
            { number: '01', title: 'Compete', desc: 'Explore collegiate tournaments and community scrims.', to: '/esports', action: 'Explore Esports' },
            { number: '02', title: 'Create', desc: 'Discover games, prototypes, and opportunities to collaborate.', to: '/studio', action: 'Visit the Studio' },
            { number: '03', title: 'Connect', desc: 'Find upcoming events and ways to meet the wider community.', to: '/events', action: 'Browse Events' },
          ].map(path => (
            <article className="community-journey-option" key={path.to}>
              <span className="community-journey-index">{path.number}</span>
              <h3>{path.title}</h3>
              <p>{path.desc}</p>
              <Link to={path.to} onMouseEnter={() => sound.playBlip()}>{path.action} <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
        <a className="community-journey-ambassador" href="#community-apply"
          onMouseEnter={() => sound.playBlip()}>Interested in representing your campus? Explore the ambassador program <span aria-hidden="true">↓</span></a>
      </section>

      {/* 2. Official Campus Ambassador Program */}
      <div className="section-title-wrap">
        <h3 className="section-title">CAMPUS AMBASSADOR PROGRAM</h3>
        <span className="section-badge" style={{ borderColor: '#84c669', color: '#84c669' }}>CAMPUS NETWORK</span>
      </div>

      <div className="ambassador-perks-grid">
        {AMBASSADOR_PERKS.map((p, idx) => (
          <div key={idx} className="gamified-card perk-card" onMouseEnter={() => sound.playBlip()}>
            <div className="perk-icon-frame">
              <ThemedIcon name={p.iconType} size={22} color="#84c669" />
            </div>
            <h4 className="perk-title">{p.title}</h4>
            <p className="perk-desc">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* 3. Ambassador Application Form */}
      <section id="community-apply" className="gamified-card ambassador-apply-card community-apply-anchor">
        <h3 className="section-title">ENLIST AS A CAMPUS AMBASSADOR</h3>
        <p className="apply-intro">
          Any college student passionate about esports, gaming community organization, or game development can apply. 
          No prior esports experience is required!
        </p>

        {applicationReady ? (
          <div className="community-draft-ready" role="status">
            <h4>Your application email is ready</h4>
            <p>No application has been sent yet. Open your email app, review the prefilled details,
              then press Send there to contact Nomad's Province.</p>
            <div className="community-draft-actions">
              <a href={applicationMailto} className="community-draft-send"
                onClick={() => sound.playSelect()}>
                Open application email <span aria-hidden="true">↗</span>
              </a>
              <button type="button" onClick={() => { sound.playSelect(); setApplicationReady(false); }}>
                Edit application
              </button>
            </div>
            <p className="community-draft-note">If your device has no configured email app, contact
              <a href={`mailto:${ORG_INFO.email}`}>{ORG_INFO.email}</a> directly.</p>
          </div>
        ) : (
          <form className="ambassador-form" onSubmit={handleAmbassadorSubmit}>
            <div className="form-grid-2">
              <input 
                type="text" 
                placeholder="Full Name" 
                className="retro-input"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input 
                type="text" 
                placeholder="College / Institution Name" 
                className="retro-input"
                required
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                className="retro-input"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input 
                type="tel" 
                placeholder="WhatsApp Number" 
                className="retro-input"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <textarea 
              placeholder="Why do you want to represent Nomad's Province at your college?" 
              className="retro-input textarea"
              required
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
            <button type="submit" className="gamified-btn apply-submit-btn" style={{ backgroundColor: '#84c669' }} onMouseEnter={() => sound.playBlip()}>
              <IconCheck size={16} />
              <span>PREPARE APPLICATION EMAIL</span>
            </button>
          </form>
        )}
      </section>

      <section className="community-ambassador-steps gamified-card" aria-labelledby="community-ambassador-steps-title">
        <span className="community-journey-eyebrow">YOUR AMBASSADOR JOURNEY</span>
        <h3 id="community-ambassador-steps-title">From student to campus connector</h3>
        <ol>
          <li><span>01</span><strong>Share your interest</strong><p>Tell the team about your college and what you would like to contribute.</p></li>
          <li><span>02</span><strong>Connect with the team</strong><p>Use the official contact channels to discuss expectations and possible activities.</p></li>
          <li><span>03</span><strong>Bring people together</strong><p>Help your campus discover competitive gaming, creative events, and community experiences.</p></li>
        </ol>
        <p>Joining and any ambassador benefits depend on confirmation from the organizers.</p>
      </section>

      {/* 4. Pop-Culture Guild Alliances */}
      <section id="community-allies" className="gamified-card culture-card">
        <h3 className="section-title">COMMUNITY & POP-CULTURE ALLIANCES</h3>
        <p className="culture-desc">
          We collaborate closely with regional cultural groups like <strong>Chennai Anime Club</strong> and <strong>Otaku Nadu</strong> to merge anime conventions, cosplay showcases, and gaming into unified youth celebrations.
        </p>
        <div className="culture-badges-row">
          <div className="culture-badge-box">◆ OTAKU NADU ALLIANCE</div>
          <div className="culture-badge-box">✦ CHENNAI ANIME CLUB</div>
          <div className="culture-badge-box">▲ FREE FIRE COMMUNITY</div>
          <div className="culture-badge-box">● GAME COM</div>
        </div>
      </section>
    </GameShell>
  );
}
