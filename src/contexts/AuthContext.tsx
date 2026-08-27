import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '@/types';
import { authApi } from '@/services/api';
import { setAuthToken, setUnauthorizedHandler } from '@/lib/apiClient';
import { storage } from '@/lib/storage';

const SESSION_KEY = 'sessao.usuario';

interface StoredSession {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  /** Verdadeiro ate a sessao gravada terminar de ser lida no boot. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => void;
  isProfissional: boolean;
  isResponsavel: boolean;
  isAluno: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setAuthToken(null);
    void storage.remove(SESSION_KEY);
  }, []);

  // O Android encerra apps em segundo plano com frequencia. Sem isto, voltar ao
  // app cairia no login como se fosse um crash.
  useEffect(() => {
    setUnauthorizedHandler(logout);

    storage
      .get<StoredSession>(SESSION_KEY)
      .then(session => {
        if (session) {
          setAuthToken(session.token);
          setUser(session.user);
        }
      })
      .finally(() => setIsLoading(false));

    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(
    async (email: string, password: string): Promise<{ ok: true } | { ok: false; message: string }> => {
      try {
        const { token, user: loggedUser } = await authApi.login(email, password);
        setAuthToken(token);
        setUser(loggedUser);
        await storage.set(SESSION_KEY, { token, user: loggedUser } satisfies StoredSession);
        return { ok: true };
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : 'Email ou senha inválidos' };
      }
    },
    []
  );

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
