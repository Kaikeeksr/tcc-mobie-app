import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_HOME } from '@/lib/roles';
import { UserType } from '@/types';

interface ProtectedRouteProps {
  allowedTypes?: UserType[];
}

export const ProtectedRoute = ({ allowedTypes }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Sem esta guarda o app sempre abriria no login: a sessao gravada e lida de
  // forma assincrona e ainda nao chegou no primeiro render.
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedTypes && user && !allowedTypes.includes(user.tipoUsuario)) {
    return <Navigate to={ROLE_HOME[user.tipoUsuario] ?? '/login'} replace />;
  }

  return <Outlet />;
};
