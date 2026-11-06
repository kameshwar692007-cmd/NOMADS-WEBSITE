// Nomad's Province — Contact Centre (/contact)
// Multi-category communication console with direct routing and FAQ terminal

import { useState } from 'react';
import GameShell from '../game/components/GameShell.jsx';
import { ORG_INFO } from '../game/data/campusContent.js';
import { sound } from '../game/systems/soundFx.js';

const FAQS = [
  {
    q: "How can I join tournaments organized by Nomad's Province?",
    a: "You can register for any active tournament through our registration links announced on our website, WhatsApp community channel, and official Instagram (@nomadsprovince)."
  },
  {
    q: "What games do you organize tournaments for?",
    a: "We organize competitive tournaments and scrims across Free Fire Max, Call of Duty: Mobile (CODM), Indus Battle Royale, Battlegrounds Mobile India (BGMI), and collegiate PC titles."
  },
  {
    q: "Can colleges or gaming communities collaborate with Nomad's Province?",
    a: "Yes! We actively co-host collegiate gaming festivals, esports tournaments, and 24-hr game jams with educational institutions and partners including SRMIST, Easwari Engineering, VIT-AP, Crescent, Decathlon, Playo, and GDAI."
  },
  {
    q: "Are tournaments streamed live?",
    a: "Yes, featured tournament brackets and grand finals are broadcast live with match casting, spectator views, and highlight coverage."
  },
  {
    q: "How can I apply for the Campus Ambassador Program?",
    a: "College students can apply directly through our Community Hub page or via WhatsApp. Ambassadors receive official certificates, priority tournament slots, and direct internship opportunities."
  }
];

export default function ContactPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Brand Sponsorship',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    sound.playSelect();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', category: 'Brand Sponsorship', message: '' });
  };

  const toggleFaq = (idx) => {
    sound.playSelect();
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <GameShell
      title="CONTACT CENTRE"
      subtitle="Partnerships, Sponsorships, Collegiate Fests & General Inquiries"
      accentColor="#c0cbdc"
    >
      <div className="contact-main-grid">
        {/* Left Column: Interactive Dispatch Terminal */}
        <div className="gamified-card contact-form-card">
          <div className="terminal-header">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">TRANSMISSION TERMINAL // DIRECT DISPATCH</span>
          </div>

          <h3 className="section-title">CONNECT WITH NOMAD'S PROVINCE</h3>
          <p className="contact-intro">
            Connect with our core team for esports tournaments, game development collaborations, collegiate fest partnerships, or brand sponsorships.
          </p>

          {submitted ? (
            <div className="pitch-success-msg" style={{ borderColor: '#38bdf8', color: '#38bdf8' }}>
              <span className="success-icon">✓</span>
              <div>TRANSMISSION DISPATCHED: Our team will respond to your inquiry via email / WhatsApp!</div>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="retro-label">SENDER NAME / CONTACT PERSON</label>
                <input 
                  type="text" 
                  placeholder="Your Full Name" 
                  className="retro-input"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="retro-label">COMMUNICATION FREQUENCY (EMAIL)</label>
                <input 
                  type="email" 
                  placeholder="your.email@example.com" 
                  className="retro-input"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="retro-label">INQUIRY CATEGORY</label>
                <select 
                  className="retro-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Brand Sponsorship">Brand Sponsorship (Decathlon / Playo / Corporate)</option>
                  <option value="College Festival">Collegiate Festival & Event (SRM / VIT-AP / Crescent / University)</option>
                  <option value="Game Dev Studio">Game Dev Partnership (GDAI / Indie Studio / Hackathon)</option>
                  <option value="Community Alliance">Community & Pop-Culture (Anime Club / Otaku Nadu / Free Fire)</option>
                  <option value="Campus Ambassador">Campus Ambassador & Internship Program</option>
                  <option value="General Inquiry">General Inquiries</option>
                </select>
              </div>

              <div className="form-group">
                <label className="retro-label">MESSAGE / PROPOSAL BRIEF</label>
                <textarea 
                  placeholder="Describe your collaboration, event dates, or inquiry..." 
                  className="retro-input textarea"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" className="gamified-btn submit-dispatch-btn" onMouseEnter={() => sound.playBlip()}>
                DISPATCH TRANSMISSION 📡
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Direct Channels & Operational Comms */}
        <div className="contact-sidebar">
          <div className="gamified-card comms-channels-card">
            <h4 className="sidebar-title">VERIFIED DIRECT CHANNELS</h4>

            <div className="comms-channel-item" onMouseEnter={() => sound.playBlip()}>
              <span className="channel-icon">💬</span>
              <div>
                <div className="channel-label">Official WhatsApp Channel</div>
                <a href={ORG_INFO.whatsapp} target="_blank" rel="noreferrer" className="channel-link">
                  Join WhatsApp Channel →
                </a>
              </div>
            </div>

            <div className="comms-channel-item" onMouseEnter={() => sound.playBlip()}>
              <span className="channel-icon">📸</span>
              <div>
                <div className="channel-label">Official Instagram (@nomadsprovince)</div>
                <a href={ORG_INFO.instagram} target="_blank" rel="noreferrer" className="channel-link">
                  Follow on Instagram →
                </a>
              </div>
            </div>

            <div className="comms-channel-item" onMouseEnter={() => sound.playBlip()}>
              <span className="channel-icon">✉️</span>
              <div>
                <div className="channel-label">Official Contact Email</div>
                <a href={`mailto:${ORG_INFO.email}`} className="channel-link">
                  {ORG_INFO.email}
                </a>
              </div>
            </div>

            <div className="comms-channel-item" onMouseEnter={() => sound.playBlip()}>
              <span className="channel-icon">📍</span>
              <div>
                <div className="channel-label">Operational Headquarters</div>
                <div className="channel-val">{ORG_INFO.location}</div>
              </div>
            </div>
          </div>

          {/* Quick FAQ Terminal */}
          <div className="gamified-card faq-card">
            <h4 className="sidebar-title">KNOWLEDGE TERMINAL (FAQ)</h4>
            <div className="faq-list">
              {FAQS.map((faq, idx) => (
                <div key={idx} className={`faq-item ${activeFaq === idx ? 'expanded' : ''}`}>
                  <button className="faq-question-btn" onClick={() => toggleFaq(idx)}>
                    <span>{faq.q}</span>
                    <span className="faq-arrow">{activeFaq === idx ? '▲' : '▼'}</span>
                  </button>
                  {activeFaq === idx && (
                    <div className="faq-answer-pane fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
