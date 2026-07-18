import type { UserType } from '@/types';

/** Rota inicial de cada perfil, usada no redirect pós-login e no ProtectedRoute. */
export const ROLE_HOME: Record<UserType, string> = {
  PROFISSIONAL: '/profissional',
  RESPONSAVEL: '/responsavel',
  ALUNO: '/aluno',
};
