import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import LoadingScreen from './components/LoadingScreen';

// Importar el componente principal de forma normal ya que es el que se carga primero
import App from './App.jsx';

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
        <Route path="/" element={<App />} />
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
        <Route path="/dashboard" element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        } />
        <Route path="/detalle/:nombre" element={
          <AppLayout>
            <DetalleHerramienta />
          </AppLayout>
        } />
        <Route path="/producto/:id" element={
          <AppLayout>
            <DetalleProducto />
          </AppLayout>
        } />
        <Route path="/e-commerce/rentar/:id" element={
          <AppLayout>
            <RentPage />
          </AppLayout>
        } />
        <Route path="/marcas/:brandName" element={
          <AppLayout>
            <BrandPage />
          </AppLayout>
        } />
        <Route path="/tienda" element={
          <AppLayout>
            <ProductList />
          </AppLayout>
        } />
        <Route path="/productos/:brand/:category" element={
          <AppLayout>
            <CategoryPage />
          </AppLayout>
        } />
        <Route path="/nuevo-producto" element={
          <AppLayout>
            <NuevoProducto />
          </AppLayout>
        } />
        <Route path="/producto-detalle" element={
          <AppLayout>
            <ProductoDetalle />
          </AppLayout>
        } />
      </Routes>
    </Router>
  </StrictMode>
);
