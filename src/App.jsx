// Nomad's Province — Main App with React Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import EsportsPage from './pages/EsportsPage.jsx';
import StudioPage from './pages/StudioPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import './App.css';
import './GamifiedPages.css';

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
