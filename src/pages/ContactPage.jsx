// Nomad's Province — Contact Centre (/contact)
// Three focused sections: 1. Contact Form, 2. Direct Channels, 3. FAQ
// Client requirement: Strict 3-section order, no Quest Board, no promotional buttons

import { useState } from 'react';
import './ContactJourney.css';
import GameShell from '../game/components/GameShell.jsx';
import { ORG_INFO } from '../game/data/campusContent.js';
import { sound } from '../game/systems/soundFx.js';
import { IconWhatsApp, IconInstagram, IconMail, IconMapPin, IconRocket } from '../game/components/Icons.jsx';

const FAQS = [
  {
    q: "How can I join tournaments organized by Nomad's Province?",
    a: "You can register for any active tournament through our registration links announced on our website, official WhatsApp, and official Instagram (@nomadsprovince)."
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
    a: "Some featured brackets and finals may have live streams, commentary, or highlight coverage. Check the current event listing and official channels for confirmed broadcasts."
  },
  {
    q: "How can I apply for the Campus Ambassador Program?",
    a: "College students can prepare an application email through the Community Hub. The organizers can confirm eligibility, selection, and any available ambassador benefits."
  }
];

export default function ContactPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [draftReady, setDraftReady] = useState(false);
  const [dispatchMethod, setDispatchMethod] = useState('whatsapp'); // 'whatsapp' | 'email'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Brand Sponsorship',
    message: ''
  });

  const messageSubject = `[${formData.category}] Enquiry from ${formData.name.trim()}`;
  const messageBody = [
    "Nomad's Province enquiry",
    '',
    'Sender: ' + formData.name.trim(),
    'Email: ' + formData.email.trim(),
    'Category: ' + formData.category,
    '',
    'Message:',
    formData.message.trim()
  ].join('\n');

  const emailUrl = `mailto:${ORG_INFO.email}?subject=${encodeURIComponent(messageSubject)}&body=${encodeURIComponent(messageBody)}`;
  // WhatsApp share URL: user chooses the recipient
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageBody)}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    sound.playSelect();
    setDraftReady(true);
  };

  const toggleFaq = (idx) => {
    sound.playSelect();
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <GameShell
      title="CONTACT CENTRE"
      subtitle="Direct Communications, Verified Inquiries & Official Channels"
      accentColor="#60a5fa"
    >
      <div className="contact-page-container">
        {/* ========================================================
            SECTION 1: CONTACT FORM
            ======================================================== */}
        <section className="gamified-card contact-section-card" aria-labelledby="contact-form-heading">
          <div className="contact-section-header">
            <span className="contact-section-badge">SECTION 01</span>
            <h2 id="contact-form-heading" className="contact-section-title">Send an Inquiry</h2>
            <p className="contact-section-desc">
              Connect with our core team for tournament operations, collegiate fest partnerships, game development collaborations, or brand sponsorships.
            </p>
          </div>

          {draftReady ? (
            <div className="contact-draft-card" role="status">
              <h4>Your message draft is ready</h4>
              <p>
                It has <strong>not been sent</strong>. Review your details and open your chosen app to send the message yourself.
              </p>
              <div className="contact-draft-details">
                <div><span>Contact</span><strong>{formData.name} · {formData.email}</strong></div>
                <div><span>Category</span><strong>{formData.category}</strong></div>
                <div><span>Message</span><p>{formData.message}</p></div>
              </div>
              <div className="contact-draft-actions">
                {dispatchMethod === 'email' ? (
                  <a
                    href={emailUrl}
                    className="contact-draft-send"
                    onClick={() => sound.playSelect()}
                  >
                    Open email draft <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-draft-send"
                    onClick={() => sound.playSelect()}
                  >
                    Share using WhatsApp <span aria-hidden="true">↗</span>
                  </a>
                )}
                <button
                  type="button"
                  className="contact-draft-edit-btn"
                  onClick={() => { sound.playSelect(); setDraftReady(false); }}
                >
                  Edit message
                </button>
              </div>
              {dispatchMethod === 'whatsapp' && (
                <p className="contact-draft-note">
                  WhatsApp opens a share composer. Choose the recipient yourself; this does not send
                  a direct message to Nomad's Province. For a direct enquiry, use email instead.
                </p>
              )}
              <p className="contact-draft-note">
                Official direct email: <a href={`mailto:${ORG_INFO.email}`}>{ORG_INFO.email}</a>
              </p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="retro-label" htmlFor="contact-name">SENDER NAME / CONTACT PERSON</label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Your Full Name"
                  className="retro-input"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="retro-label" htmlFor="contact-email">EMAIL ADDRESS</label>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="your.email@example.com"
                  className="retro-input"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="retro-label" htmlFor="contact-category">INQUIRY CATEGORY</label>
                <select
                  id="contact-category"
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
                <label className="retro-label" htmlFor="contact-message">MESSAGE / PROPOSAL BRIEF</label>
                <textarea
                  id="contact-message"
                  placeholder="Describe your collaboration, event dates, or inquiry..."
                  className="retro-input textarea"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              {/* Delivery Channel Selector */}
              <div className="form-group">
                <label className="retro-label">DISPATCH CHANNEL</label>
                <div className="contact-channel-selector" role="group" aria-label="Choose message channel">
                  <button
                    type="button"
                    className={`filter-btn ${dispatchMethod === 'whatsapp' ? 'active' : ''}`}
                    aria-pressed={dispatchMethod === 'whatsapp'}
                    onClick={() => { sound.playSelect(); setDispatchMethod('whatsapp'); }}
                  >
                    <span>💬 WHATSAPP DIRECT</span>
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${dispatchMethod === 'email' ? 'active' : ''}`}
                    aria-pressed={dispatchMethod === 'email'}
                    onClick={() => { sound.playSelect(); setDispatchMethod('email'); }}
                  >
                    <span>✉️ EMAIL (MAILTO)</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="gamified-btn submit-dispatch-btn"
                onMouseEnter={() => sound.playBlip()}
              >
                <IconRocket size={16} />
                <span>{dispatchMethod === 'whatsapp' ? 'PREPARE WHATSAPP SHARE →' : 'PREPARE EMAIL DRAFT →'}</span>
              </button>
              <p className="contact-form-disclosure">
                This website prepares a message; it does not automatically send or store your enquiry.
                Email can be addressed directly to the team. WhatsApp sharing requires you to choose a recipient.
              </p>
            </form>
          )}
        </section>

        {/* ========================================================
            SECTION 2: DIRECT CHANNELS
            ======================================================== */}
        <section className="gamified-card contact-section-card" aria-labelledby="contact-channels-heading">
          <div className="contact-section-header">
            <span className="contact-section-badge">SECTION 02</span>
            <h2 id="contact-channels-heading" className="contact-section-title">Verified Direct Channels</h2>
            <p className="contact-section-desc">
              Direct official communication channels for tournament inquiries, collegiate operations, and partnerships.
            </p>
          </div>

          <div className="comms-channels-grid">
            {/* WhatsApp */}
            <div className="comms-channel-item" onMouseEnter={() => sound.playBlip()}>
              <span className="channel-icon-frame whatsapp-frame">
                <IconWhatsApp size={22} color="#22c55e" />
              </span>
              <div className="channel-content">
                <div className="channel-label">Official WhatsApp</div>
                <a
                  href={ORG_INFO.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="channel-link"
                >
                  Chat on WhatsApp ({ORG_INFO.whatsappNumber || '+91 97897 20897'}) →
                </a>
              </div>
            </div>

            {/* Instagram */}
            <div className="comms-channel-item" onMouseEnter={() => sound.playBlip()}>
              <span className="channel-icon-frame insta-frame">
                <IconInstagram size={22} color="#ec4899" />
              </span>
              <div className="channel-content">
                <div className="channel-label">Official Instagram (@nomadsprovince)</div>
                <a
                  href={ORG_INFO.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="channel-link"
                >
                  Follow on Instagram →
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="comms-channel-item" onMouseEnter={() => sound.playBlip()}>
              <span className="channel-icon-frame mail-frame">
                <IconMail size={22} color="#38bdf8" />
              </span>
              <div className="channel-content">
                <div className="channel-label">Official Contact Email</div>
                <a
                  href={`mailto:${ORG_INFO.email}`}
                  className="channel-link"
                >
                  {ORG_INFO.email} →
                </a>
              </div>
            </div>

            {/* Operational Location */}
            <div className="comms-channel-item" onMouseEnter={() => sound.playBlip()}>
              <span className="channel-icon-frame location-frame">
                <IconMapPin size={22} color="#f59e0b" />
              </span>
              <div className="channel-content">
                <div className="channel-label">Operational Headquarters</div>
                <div className="channel-val">{ORG_INFO.location}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 3: FREQUENTLY ASKED QUESTIONS
            ======================================================== */}
        <section className="gamified-card contact-section-card" aria-labelledby="contact-faq-heading">
          <div className="contact-section-header">
            <span className="contact-section-badge">SECTION 03</span>
            <h2 id="contact-faq-heading" className="contact-section-title">Frequently Asked Questions</h2>
            <p className="contact-section-desc">
              Common questions about tournament participation, college collaborations, and ecosystem partnerships.
            </p>
          </div>

          <div className="faq-list">
            {FAQS.map((faq, idx) => (
              <div key={idx} className={`faq-item ${activeFaq === idx ? 'expanded' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={activeFaq === idx}
                  aria-controls={`contact-faq-answer-${idx}`}
                >
                  <span className="faq-question-text">{faq.q}</span>
                  <span className="faq-arrow">{activeFaq === idx ? '▲' : '▼'}</span>
                </button>
                {activeFaq === idx && (
                  <div
                    id={`contact-faq-answer-${idx}`}
                    className="faq-answer-pane fade-in"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </GameShell>
  );
}
