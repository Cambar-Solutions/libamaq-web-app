import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '@/utils/storage';

const AuthRoute = ({ 
  children, 
  isLoginRoute = false, 
  allowedRoles = [],
  redirectTo = null 
}) => {
  const location = useLocation();
  const isAuth = isAuthenticated();
  const userRole = getUserRole();

  // Si no está autenticado y no es ruta de login, redirigir al login
  if (!isAuth && !isLoginRoute) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado y es ruta de login, redirigir según el rol
  if (isLoginRoute && isAuth) {
    if (userRole === 'ADMIN' || userRole === 'DIRECTOR') {
      return <Navigate to="/dashboard" replace />;
    } else if (userRole === 'USER' || userRole === 'CUSTOMER') {
      return <Navigate to="/user-home" replace />;
    } else if (userRole === 'PROVIDER' || userRole === 'DELIVERY') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Si hay roles permitidos y el usuario no tiene el rol correcto
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Si se especificó una redirección personalizada, usarla
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    switch (userRole) {
      case 'ADMIN':
        return <Navigate to="/dashboard" replace />;
      case 'DIRECTOR':
        return <Navigate to="/dashboard" replace />;
      case 'USER':
      case 'CUSTOMER':
        return <Navigate to="/user-home" replace />;
      case 'PROVIDER':
      case 'DELIVERY':
        return <Navigate to="/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default AuthRoute; 