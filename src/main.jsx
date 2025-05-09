import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import Dashboard from './app/dashboard/page.jsx'; 
import Login from './app/normal/Login';
import DetalleHerramienta from './app/e-commerce/DetalleHerramienta'; 
import BrandPage from './components/brand-page';
import ProductList from './app/e-commerce/Ecomerce';
import CategoryPage from './app/e-commerce/CategoryPage';
import NuevoProducto from './app/dashboard/NuevoProducto';
import ProductoDetalle from './app/dashboard/ProductoDetalle';
import Nosotros from './Nosotros.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* PRINCIPAL */}
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/nosotros" element={<Nosotros/>} />

        {/* E-COMMERCE */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/detalle/:nombre" element={<DetalleHerramienta />} />
        <Route path="/marcas/:brandName" element={<BrandPage />} />
        <Route path="/tienda" element={<ProductList />} />
        
        <Route path="/productos/:brand/:category" element={<CategoryPage />} />
        <Route path="/nuevo-producto" element={<NuevoProducto />} />
        <Route path="/producto-detalle" element={<ProductoDetalle />} />

      </Routes>
    </Router>
  </StrictMode>
);
