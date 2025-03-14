import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import Dashboard from './app/dashboard/page.jsx'; 
import Login from './app/normal/Login';
import DetalleHerramienta from './app/e-commerce/DetalleHerramienta'; 
import BrandPage from './components/brand-page';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/detalle/:nombre" element={<DetalleHerramienta />} />
        <Route path="/marcas/:brandName" element={<BrandPage />} />
      </Routes>
    </Router>
  </StrictMode>
);
