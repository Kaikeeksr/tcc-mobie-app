import {
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardCheck,
  GraduationCap,
  Home,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { UserType } from '@/types';

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

interface RoleNav {
  /** Destinos da barra de abas. No maximo 4 — a quinta vaga fica com "Mais". */
  primary: NavItem[];
  /** Vao para a folha "Mais" no celular e para a sidebar no desktop. */
  secondary: NavItem[];
}

/**
 * Fonte unica da navegacao: a sidebar do desktop e a barra de abas do celular
 * leem daqui, entao um destino novo aparece nos dois sem duplicar codigo.
 *
 * Os rotulos sao curtos de proposito — cabem embaixo do icone numa tela de 320px.
 */
export const NAV_BY_ROLE: Record<UserType, RoleNav> = {
  PROFISSIONAL: {
    primary: [
      { to: '/profissional', icon: Home, label: 'Início' },
      { to: '/profissional/chamada', icon: ClipboardCheck, label: 'Chamada' },
      { to: '/profissional/turmas', icon: BookOpen, label: 'Turmas' },
      { to: '/profissional/alunos', icon: GraduationCap, label: 'Alunos' },
    ],
    secondary: [
      { to: '/profissional/calendario', icon: Calendar, label: 'Calendário' },
      { to: '/profissional/relatorios', icon: BarChart3, label: 'Relatórios' },
    ],
  },
  RESPONSAVEL: {
    primary: [
      { to: '/responsavel', icon: Home, label: 'Início' },
      { to: '/responsavel/filhos', icon: Users, label: 'Filhos' },
    ],
    secondary: [],
  },
  ALUNO: {
    primary: [{ to: '/aluno', icon: Home, label: 'Frequência' }],
    secondary: [],
  },
};

/** A rota raiz de cada perfil so fica ativa em match exato, senao acende sempre. */
export const isRoleRoot = (to: string) => !to.includes('/', 1);

/** Titulo mostrado no cabecalho, derivado da rota atual. */
export const getSectionLabel = (nav: RoleNav, pathname: string): string => {
  const items = [...nav.primary, ...nav.secondary];
  const match = items
    .filter(item => (isRoleRoot(item.to) ? pathname === item.to : pathname.startsWith(item.to)))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return match?.label ?? 'Chamada';
};
