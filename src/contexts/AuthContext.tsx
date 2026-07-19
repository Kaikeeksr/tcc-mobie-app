import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '@/types';
import { authService } from '@/services/mockService';
import { storage } from '@/lib/storage';

const SESSION_KEY = 'sessao.usuario';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  /** Verdadeiro ate a sessao gravada terminar de ser lida no boot. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isProfissional: boolean;
  isResponsavel: boolean;
  isAluno: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // O Android encerra apps em segundo plano com frequencia. Sem isto, voltar ao
  // app cairia no login como se fosse um crash.
  useEffect(() => {
    storage
      .get<User>(SESSION_KEY)
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = authService.login(email, password);
    if (foundUser) {
      setUser(foundUser);
      await storage.set(SESSION_KEY, foundUser);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    void storage.remove(SESSION_KEY);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    isProfissional: user?.tipoUsuario === 'PROFISSIONAL',
    isResponsavel: user?.tipoUsuario === 'RESPONSAVEL',
    isAluno: user?.tipoUsuario === 'ALUNO',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
