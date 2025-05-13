import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import Dashboard from './app/dashboard/page.jsx'; 
import Login from './app/normal/Login';
import DetalleHerramienta from './app/e-commerce/DetalleHerramienta'; 
import DetalleProducto from './app/e-commerce/DetalleProducto';
import RentPage from './app/e-commerce/RentPage';
import BrandPage from './components/brand-page';
import ProductList from './app/e-commerce/Ecomerce';
import CategoryPage from './app/e-commerce/CategoryPage';
import NuevoProducto from './app/dashboard/NuevoProducto';
import ProductoDetalle from './app/dashboard/ProductoDetalle';
import Nosotros from './Nosotros.jsx';
import UserHome from './app/user/UserHome';

// Importar todos los componentes usando lazy loading
const App = lazy(() => import('./App.jsx'));

// Importar los demás componentes usando lazy loading
const Dashboard = lazy(() => import('./app/dashboard/page.jsx'));
const Login = lazy(() => import('./app/normal/Login'));
const DetalleHerramienta = lazy(() => import('./app/e-commerce/DetalleHerramienta'));
const DetalleProducto = lazy(() => import('./app/e-commerce/DetalleProducto'));
const RentPage = lazy(() => import('./app/e-commerce/RentPage'));
const BrandPage = lazy(() => import('./components/brand-page'));
const ProductList = lazy(() => import('./app/e-commerce/Ecomerce'));
const CategoryPage = lazy(() => import('./app/e-commerce/CategoryPage'));
const NuevoProducto = lazy(() => import('./app/dashboard/NuevoProducto'));
const ProductoDetalle = lazy(() => import('./app/dashboard/ProductoDetalle'));
const Nosotros = lazy(() => import('./Nosotros.jsx'));


// Componente de layout que envuelve todas las rutas con Suspense
const AppLayout = ({ children }) => (
  <Suspense fallback={<LoadingScreen />}>
    {children}
  </Suspense>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* PRINCIPAL */}
        <Route path="/" element={
          <AppLayout>
            <App />
          </AppLayout>
        } />
        <Route path="/login" element={
          <AppLayout>
            <Login />
          </AppLayout>
        } />
        <Route path="/nosotros" element={
          <AppLayout>
            <Nosotros />
          </AppLayout>
        } />

        {/* E-COMMERCE */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/detalle/:nombre" element={<DetalleHerramienta />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
        <Route path="/e-commerce/rentar/:id" element={<RentPage />} />
        <Route path="/marcas/:brandName" element={<BrandPage />} />
        <Route path="/tienda" element={<ProductList />} />
        
        <Route path="/productos/:brand/:category" element={<CategoryPage />} />
        <Route path="/nuevo-producto" element={<NuevoProducto />} />
        <Route path="/producto-detalle" element={<ProductoDetalle />} />

        <Route path='/user-home' element={<UserHome/>}/>
      </Routes>
    </Router>
  </StrictMode>
);
