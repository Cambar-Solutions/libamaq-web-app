import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import BrandPage from './components/brand-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/marcas/:brandName',
    element: <BrandPage />,
  },
]);
