// Nomad's Province — Main App with React Router & Route-level Code Splitting
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import './App.css';
import './GamifiedPages.css';

// Lazy-loaded routes for performance & modular chunking
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const EsportsPage = lazy(() => import('./pages/EsportsPage.jsx'));
const StudioPage = lazy(() => import('./pages/StudioPage.jsx'));
const EventsPage = lazy(() => import('./pages/EventsPage.jsx'));
const CommunityPage = lazy(() => import('./pages/CommunityPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));

function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#090d16',
      color: '#38bdf8',
      fontFamily: 'monospace',
      letterSpacing: '2px',
      fontSize: '14px'
    }}>
      <span>INITIALIZING NOMAD PROVINCE SUB-SYSTEM...</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/esports" element={<EsportsPage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
