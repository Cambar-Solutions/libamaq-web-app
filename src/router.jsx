import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import BrandPage from './components/brand-page';
import NoContentExample from './pages/NoContentExample';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/marcas/:brandName',
    element: <BrandPage />,
  },
  {
    path: '/no-content-example',
    element: <NoContentExample />,
  },
]);
