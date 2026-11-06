// Nomad's Province — Community Hub (/community)
// Guild hall, Campus Ambassador recruitment, and pop-culture partnerships

import { useState } from 'react';
import GameShell from '../game/components/GameShell.jsx';
import { AMBASSADOR_PERKS, ORG_INFO } from '../game/data/campusContent.js';
import { sound } from '../game/systems/soundFx.js';
import { ThemedIcon, IconWhatsApp, IconInstagram, IconCheck } from '../game/components/Icons.jsx';

export default function CommunityPage() {
  const [applied, setApplied] = useState(false);
  const [formData, setFormData] = useState({ name: '', college: '', email: '', phone: '', reason: '' });

  const handleAmbassadorSubmit = (e) => {
    e.preventDefault();
    sound.playSelect();
    setApplied(true);
    setTimeout(() => setApplied(false), 5000);
    setFormData({ name: '', college: '', email: '', phone: '', reason: '' });
  };

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
            <span>JOIN WHATSAPP CHANNEL</span>
          </a>
          <a href={ORG_INFO.instagram} target="_blank" rel="noreferrer" className="gamified-btn comm-btn insta-comm" onMouseEnter={() => sound.playBlip()}>
            <IconInstagram size={16} />
            <span>FOLLOW ON INSTAGRAM (@nomadsprovince)</span>
          </a>
        </div>
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
      <section className="gamified-card ambassador-apply-card">
        <h3 className="section-title">ENLIST AS A CAMPUS AMBASSADOR</h3>
        <p className="apply-intro">
          Any college student passionate about esports, gaming community organization, or game development can apply. 
          No prior esports experience is required!
        </p>

        {applied ? (
          <div className="pitch-success-msg" style={{ borderColor: '#84c669', color: '#84c669' }}>
            <span className="success-icon"><IconCheck size={18} /></span>
            <div>APPLICATION SUBMITTED: Our campus coordinators will reach out via WhatsApp / Email!</div>
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
              <span>SUBMIT AMBASSADOR APPLICATION</span>
            </button>
          </form>
        )}
      </section>

      {/* 4. Pop-Culture Guild Alliances */}
      <section className="gamified-card culture-card">
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
