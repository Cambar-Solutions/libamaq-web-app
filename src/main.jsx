import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { SidebarProvider } from './providers/sidebar-provider';
import './index.css';
import LoadingScreen from './components/LoadingScreen';
import AuthRoute from './components/AuthRoute';

// Importar todos los componentes usando lazy loading
const App = lazy(() => import('./App.jsx'));

// Importar los demás componentes usando lazy loading
const Dashboard = lazy(() => import('./app/dashboard/page.jsx'));
const Gerente = lazy(() => import('./app/dashboard/Gerente'));
const Login = lazy(() => import('./app/normal/Login'));
const DetalleHerramienta = lazy(() => import('./app/e-commerce/DetalleHerramienta'));
const DetalleProducto = lazy(() => import('./app/e-commerce/DetalleProducto'));
const RentPage = lazy(() => import('./app/e-commerce/RentPage'));
const BrandPage = lazy(() => import('./components/brand-page'));
const ProductList = lazy(() => import('./app/e-commerce/Ecomerce'));
const CategoryPage = lazy(() => import('./app/e-commerce/CategoryPage'));

const Nosotros = lazy(() => import('./Nosotros.jsx'));
const UserHome = lazy(() => import('./app/user/UserHome'));
const Account = lazy(() => import('./app/user/components/pages/Account')); 
const PaymentMethod = lazy(() => import('./app/e-commerce/PaymentMethod'));
const LocationLibamaq = lazy(() => import('./components/LocationLibamaq'));

// Componente de layout que envuelve todas las rutas con Suspense
const AppLayout = ({ children }) => (
  <Suspense fallback={<LoadingScreen />}>
    {children}
  </Suspense>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={
              <AppLayout>
                <App />
              </AppLayout>
            } />
            <Route path="/login" element={
              <AppLayout>
                <AuthRoute isLoginRoute>
                  <Login />
                </AuthRoute>
              </AppLayout>
            } />
            <Route path="/nosotros" element={
              <AppLayout>
                <Nosotros />
              </AppLayout>
            } />
            <Route path="/location" element={
              <AppLayout>
                <LocationLibamaq />
              </AppLayout>
            } />

            {/* Rutas públicas de e-commerce */}
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
            <Route path="/payment-method" element={
              <AppLayout>
                <PaymentMethod />
              </AppLayout>
            } />

            {/* Rutas protegidas para ADMIN, DIRECTOR, PROVIDER y DELIVERY */}
            <Route path="/dashboard" element={
              <AppLayout>
                <AuthRoute allowedRoles={['ADMIN', 'DIRECTOR']}>
                  <Dashboard />
                </AuthRoute>
              </AppLayout>
            } />

            {/* Rutas protegidas para USER y CUSTOMER */}
            <Route path="/user-home" element={
              <AppLayout>
                <AuthRoute allowedRoles={['GENERAL_CUSTOMER', 'FREQUENT_CUSTOMER']}>
                  <UserHome />
                </AuthRoute>
              </AppLayout>
            } />
            <Route path="/user-profile" element={
              <AppLayout>
                <AuthRoute allowedRoles={['GENERAL_CUSTOMER', 'FREQUENT_CUSTOMER']}>
                  <Account />
                </AuthRoute>
              </AppLayout>
            } />
          </Routes>
        </Router>
      </SidebarProvider>
    </QueryClientProvider>
  </StrictMode>
);