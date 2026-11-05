// Nomad's Province — Main App with React Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<PlaceholderPage />} />
        <Route path="/esports" element={<PlaceholderPage />} />
        <Route path="/studio" element={<PlaceholderPage />} />
        <Route path="/events" element={<PlaceholderPage />} />
        <Route path="/community" element={<PlaceholderPage />} />
        <Route path="/contact" element={<PlaceholderPage />} />
      </Routes>
    </BrowserRouter>
  );
}
