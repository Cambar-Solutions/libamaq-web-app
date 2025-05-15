import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import LoadingScreen from './components/LoadingScreen';

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
const UserHome = lazy(() => import('./app/user/UserHome'));
const Account = lazy(() => import('./app/user/Account')); 


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


        {/* Cliente */}
        <Route path="/user-home" element={
          <AppLayout>
            <UserHome/>
          </AppLayout>
        } />

        <Route path="/user-profile" element={
          <AppLayout>
            <Account/>
          </AppLayout>
        } />
      </Routes>
    </Router>
  </StrictMode>
);
