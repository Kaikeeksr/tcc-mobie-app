import { useState } from 'react';
import { NavLink as RouterNavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  ClipboardCheck, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Home,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const professionalLinks = [
  { to: '/profissional', icon: Home, label: 'Dashboard' },
  { to: '/profissional/turmas', icon: BookOpen, label: 'Turmas' },
  { to: '/profissional/alunos', icon: GraduationCap, label: 'Alunos' },
  { to: '/profissional/calendario', icon: Calendar, label: 'Calendário' },
  { to: '/profissional/chamada', icon: ClipboardCheck, label: 'Chamada' },
  { to: '/profissional/relatorios', icon: BarChart3, label: 'Relatórios' },
];

const parentLinks = [
  { to: '/responsavel', icon: Home, label: 'Dashboard' },
  { to: '/responsavel/filhos', icon: Users, label: 'Meus Filhos' },
];

const studentLinks = [
  { to: '/aluno', icon: Home, label: 'Minha Frequência' },
];

const Layout = () => {
  const { user, logout, isProfissional, isAluno } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = isProfissional ? professionalLinks : isAluno ? studentLinks : parentLinks;
  
  const getUserTypeLabel = () => {
    if (isProfissional) return 'Profissional';
    if (isAluno) return 'Aluno';
    return 'Responsável';
  };

  const isActive = (path: string) => {
    if (path === '/profissional' || path === '/responsavel' || path === '/aluno') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:transform-none",
          "flex flex-col bg-sidebar text-sidebar-foreground",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sidebar-primary flex-shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-sidebar-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base sm:text-lg">Chamada</h1>
            <p className="text-xs text-sidebar-foreground/70">
              {getUserTypeLabel()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 sm:px-3 py-3 sm:py-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <RouterNavLink
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-colors",
                isActive(link.to)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              <span>{link.label}</span>
            </RouterNavLink>
          ))}
        </nav>

        {/* User info and logout */}
        <div className="p-3 sm:p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 sm:gap-3 px-2 mb-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
              <span className="text-xs sm:text-sm font-medium">
                {user?.nome.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.nome}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={logout}
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-4 px-3 sm:px-4 py-2.5 sm:py-3 border-b bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-sm sm:text-base">Chamada</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
