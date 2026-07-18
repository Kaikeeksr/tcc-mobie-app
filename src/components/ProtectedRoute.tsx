import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_HOME } from '@/lib/roles';
import { UserType } from '@/types';

interface ProtectedRouteProps {
  allowedTypes?: UserType[];
}

export const ProtectedRoute = ({ allowedTypes }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedTypes && user && !allowedTypes.includes(user.tipoUsuario)) {
    return <Navigate to={ROLE_HOME[user.tipoUsuario] ?? '/login'} replace />;
  }

  return <Outlet />;
};
