// Nomad's Province — Contact Centre (/contact)
// Multi-category communication console with direct routing and FAQ terminal
// Delivers enquiries to official WhatsApp / Email at ₹0 cost without exposed keys

import { useState } from 'react';
import GameShell from '../game/components/GameShell.jsx';
import { ORG_INFO } from '../game/data/campusContent.js';
import { sound } from '../game/systems/soundFx.js';
import { IconWhatsApp, IconInstagram, IconMail, IconMapPin, IconRocket, IconCheck } from '../game/components/Icons.jsx';

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
  const [dispatchMethod, setDispatchMethod] = useState('whatsapp'); // 'whatsapp' | 'email'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Brand Sponsorship',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    sound.playSelect();

    if (dispatchMethod === 'whatsapp') {
      const text = `*New Nomad's Province Enquiry*%0A%0A*Sender:* ${encodeURIComponent(formData.name)}%0A*Email:* ${encodeURIComponent(formData.email)}%0A*Category:* ${encodeURIComponent(formData.category)}%0A%0A*Message:*%0A${encodeURIComponent(formData.message)}`;
      const waUrl = `https://api.whatsapp.com/send?text=${text}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } else {
      const subject = `[${formData.category}] Enquiry from ${formData.name}`;
      const body = `Sender: ${formData.name}\nEmail: ${formData.email}\nCategory: ${formData.category}\n\nMessage:\n${formData.message}`;
      const mailtoUrl = `mailto:${ORG_INFO.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    }

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
        <div className="gamified-card contact-form-card stitch-target" data-stitch-label="Constructing Inquiry Terminal...">
          <div className="terminal-header">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">DIRECT INQUIRY DISPATCH</span>
          </div>

          <h3 className="section-title">CONNECT WITH NOMAD'S PROVINCE</h3>
          <p className="contact-intro">
            Connect with our core team for esports tournaments, game development collaborations, collegiate fest partnerships, or brand sponsorships.
          </p>

          {submitted ? (
            <div className="pitch-success-msg" style={{ borderColor: '#38bdf8', color: '#38bdf8' }}>
              <span className="success-icon"><IconCheck size={18} /></span>
              <div>INQUIRY TRANSMITTED: Opening your message channel to connect with Nomad's Province leadership!</div>
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
                <label className="retro-label">EMAIL ADDRESS</label>
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

              {/* Delivery Channel Selector */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="retro-label">DISPATCH CHANNEL</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className={`filter-btn ${dispatchMethod === 'whatsapp' ? 'active' : ''}`}
                    onClick={() => { sound.playSelect(); setDispatchMethod('whatsapp'); }}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
                  >
                    <span>💬 WHATSAPP DIRECT</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${dispatchMethod === 'email' ? 'active' : ''}`}
                    onClick={() => { sound.playSelect(); setDispatchMethod('email'); }}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
                  >
                    <span>✉️ EMAIL (MAILTO)</span>
                  </button>
                </div>
              </div>

              <button type="submit" className="gamified-btn submit-dispatch-btn stitch-target" data-stitch-label="Compiling Dispatch Button..." onMouseEnter={() => sound.playBlip()}>
                <IconRocket size={16} />
                <span>{dispatchMethod === 'whatsapp' ? 'TRANSMIT VIA WHATSAPP →' : 'TRANSMIT VIA EMAIL →'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Direct Channels & Operational Comms */}
        <div className="contact-sidebar">
          <div className="gamified-card comms-channels-card">
            <h4 className="sidebar-title">VERIFIED DIRECT CHANNELS</h4>

            <div className="comms-channel-item" onMouseEnter={() => sound.playBlip()}>
              <span className="channel-icon-frame">
                <IconWhatsApp size={20} color="#22c55e" />
              </span>
              <div>
                <div className="channel-label">Official WhatsApp Channel</div>
                <a href={ORG_INFO.whatsapp} target="_blank" rel="noreferrer" className="channel-link">
                  Join WhatsApp Channel →
                </a>
              </div>
            </div>

            <div className="comms-channel-item" onMouseEnter={() => sound.playBlip()}>
              <span className="channel-icon-frame">
                <IconInstagram size={20} color="#ec4899" />
              </span>
              <div>
                <div className="channel-label">Official Instagram (@nomadsprovince)</div>
                <a href={ORG_INFO.instagram} target="_blank" rel="noreferrer" className="channel-link">
                  Follow on Instagram →
                </a>
              </div>
            </div>

            <div className="comms-channel-item" onMouseEnter={() => sound.playBlip()}>
              <span className="channel-icon-frame">
                <IconMail size={20} color="#38bdf8" />
              </span>
              <div>
                <div className="channel-label">Official Contact Email</div>
                <a href={`mailto:${ORG_INFO.email}`} className="channel-link">
                  {ORG_INFO.email}
                </a>
              </div>
            </div>

            <div className="comms-channel-item" onMouseEnter={() => sound.playBlip()}>
              <span className="channel-icon-frame">
                <IconMapPin size={20} color="#f59e0b" />
              </span>
              <div>
                <div className="channel-label">Operational Headquarters</div>
                <div className="channel-val">{ORG_INFO.location}</div>
              </div>
            </div>
          </div>

          {/* Quick FAQ Terminal */}
          <div className="gamified-card faq-card">
            <h4 className="sidebar-title">FREQUENTLY ASKED QUESTIONS</h4>
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
