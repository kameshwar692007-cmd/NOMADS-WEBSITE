// Nomad's Province — Placeholder Page
// Temporary route placeholder for section pages

import { useNavigate, useLocation } from 'react-router-dom';

const PAGE_INFO = {
  '/about': {
    title: 'Main Headquarters',
    subtitle: 'About Nomad\'s Province',
    description: 'Our story, vision, mission, achievements and team.',
    color: '#e84537'
  },
  '/esports': {
    title: 'Esports Arena',
    subtitle: 'Tournaments & Gaming Events',
    description: 'Competitive tournaments, gaming events and the Nomad\'s Province esports ecosystem.',
    color: '#ff4444'
  },
  '/studio': {
    title: 'Game Dev Studio',
    subtitle: 'Games & Projects',
    description: 'Games, projects and interactive experiences built by our studio.',
    color: '#38bdf8'
  },
  '/events': {
    title: 'Event Grounds',
    subtitle: 'Upcoming & Past Events',
    description: 'Upcoming events, past events, results and highlights.',
    color: '#fdbe53'
  },
  '/community': {
    title: 'Community Hub',
    subtitle: 'Network & Collaborations',
    description: 'Partnerships, collaborations and community initiatives.',
    color: '#84c669'
  },
  '/contact': {
    title: 'Contact Centre',
    subtitle: 'Partnerships & Contact',
    description: 'Connect with us for partnerships, sponsorships, internships and enquiries.',
    color: '#c0cbdc'
  }
};

export default function PlaceholderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const info = PAGE_INFO[location.pathname] || {
    title: 'Page',
    subtitle: 'Coming Soon',
    description: 'This page is under construction.',
    color: '#e84537'
  };

  return (
    <div className="placeholder-page">
      <div className="placeholder-accent" style={{ backgroundColor: info.color }} />
      <div className="placeholder-content">
        <button className="placeholder-back" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Return to Campus
        </button>
        <h1 className="placeholder-title">{info.title}</h1>
        <p className="placeholder-subtitle">{info.subtitle}</p>
        <p className="placeholder-desc">{info.description}</p>
        <div className="placeholder-badge">
          <span>COMING SOON</span>
          <p>This section is being developed. Return to the campus to explore other areas.</p>
        </div>
      </div>
    </div>
  );
}
