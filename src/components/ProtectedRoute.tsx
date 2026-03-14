import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserType } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedTypes?: UserType[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedTypes 
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedTypes && user && !allowedTypes.includes(user.tipoUsuario)) {
    // Redirect to appropriate dashboard based on user type
    let redirectPath = '/login';
    if (user.tipoUsuario === 'PROFISSIONAL') redirectPath = '/profissional';
    else if (user.tipoUsuario === 'RESPONSAVEL') redirectPath = '/responsavel';
    else if (user.tipoUsuario === 'ALUNO') redirectPath = '/aluno';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
