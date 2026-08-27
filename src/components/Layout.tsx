import { Suspense, useCallback, useEffect, useRef, useState, type UIEvent } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Loader2, LogOut, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBackButton } from '@/hooks/useBackButton';
import { BottomNav } from '@/components/BottomNav';
import { AccountSheet } from '@/components/AccountSheet';
import { Button } from '@/components/ui/button';
import { getSectionLabel, isRoleRoot, NAV_BY_ROLE } from '@/lib/navigation';
import { ROLE_HOME } from '@/lib/roles';
import { cn } from '@/lib/utils';

const PERFIL_LABEL = {
  PROFISSIONAL: 'Profissional',
  RESPONSAVEL: 'Responsável',
  ALUNO: 'Aluno',
} as const;

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [contaAberta, setContaAberta] = useState(false);
  const [maisAberto, setMaisAberto] = useState(false);

  // Um unico handler de voltar para toda a moldura: dois listeners disputariam
  // o evento e o segundo navegaria mesmo com uma folha aberta.
  useBackButton(
    useCallback(() => {
      if (contaAberta) {
        setContaAberta(false);
        return true;
      }
      if (maisAberto) {
        setMaisAberto(false);
        return true;
      }
      return false;
    }, [contaAberta, maisAberto])
  );

  const nav = NAV_BY_ROLE[user?.tipoUsuario ?? 'ALUNO'];
  const todosItens = [...nav.primary, ...nav.secondary];
  const titulo = getSectionLabel(nav, location.pathname);

  // Com um unico destino, uma barra de abas seria decorativa.
  const mostrarAbas = nav.primary.length + nav.secondary.length > 1;

  // Titulo grande no topo do conteudo, que rola junto e cede lugar ao titulo
  // compacto do cabecalho — o comportamento de navigation bar do iOS.
  const conteudoRef = useRef<HTMLElement>(null);
  const [rolado, setRolado] = useState(false);

  const aoRolar = (evento: UIEvent<HTMLElement>) => {
    const y = evento.currentTarget.scrollTop;
    // Limiares diferentes para entrar e sair: sem essa histerese o titulo pisca
    // quando o dedo para exatamente em cima do ponto de corte.
    setRolado(atual => (atual ? y > 16 : y > 36));
  };

  // Cada tela comeca do topo, como se fosse uma tela nova empilhada.
  useEffect(() => {
    conteudoRef.current?.scrollTo({ top: 0 });
    setRolado(false);
  }, [location.pathname]);

  const naHome = location.pathname === ROLE_HOME[user?.tipoUsuario ?? 'ALUNO'];
  const primeiroNome = user?.nome.split(' ')[0] ?? '';
  const tituloGrande = naHome ? `Olá, ${primeiroNome}` : titulo;

  // Telas de detalhe (/perfil/secao/:id) ja exibem o nome da entidade com botao
  // de voltar; um titulo grande com o nome da secao acima seria ruido.
  const ehDetalhe = location.pathname.split('/').filter(Boolean).length > 2;

  return (
    // h-dvh + overflow-hidden: so o <main> rola, entao cabecalho e abas ficam
    // fixos como num app nativo, em vez de subirem junto com o conteudo.
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      {/* Sidebar — apenas desktop */}
      <aside className="hidden w-64 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-sidebar-primary">
            <Users className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold">Chamada</h1>
            <p className="text-xs text-sidebar-foreground/70">
              {PERFIL_LABEL[user?.tipoUsuario ?? 'ALUNO']}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {todosItens.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={isRoleRoot(item.to)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sidebar-accent">
              <span className="text-sm font-medium">{user?.nome.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.nome}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra de navegacao do celular. Translucida com blur, como no iOS:
            o conteudo passa por baixo em vez de sumir atras de um bloco opaco. */}
        <header
          className={cn(
            'relative z-20 flex flex-shrink-0 items-center justify-end px-4 pb-2',
            'pt-[calc(0.5rem+env(safe-area-inset-top))] lg:hidden',
            'border-b bg-card/80 backdrop-blur-xl transition-colors duration-200',
            rolado ? 'border-border' : 'border-transparent'
          )}
        >
          {/* Centralizado de forma absoluta para nao depender da largura do
              avatar — o titulo fica no eixo da tela, nao no espaco que sobra. */}
          <h1
            className={cn(
              'pointer-events-none absolute left-1/2 max-w-[60%] -translate-x-1/2 truncate',
              'text-[17px] font-semibold tracking-tight transition-all duration-200 ease-out',
              rolado ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
            )}
          >
            {titulo}
          </h1>

          <button
            type="button"
            onClick={() => setContaAberta(true)}
            aria-label="Abrir conta"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary transition-transform active:scale-95 active:bg-primary/20"
          >
            {user?.nome.charAt(0).toUpperCase()}
          </button>
        </header>

        <main
          ref={conteudoRef}
          onScroll={aoRolar}
          className="flex-1 overflow-y-auto overscroll-contain"
        >
          <div className="mx-auto w-full max-w-7xl px-4 pb-5 pt-2 lg:px-6 lg:py-8">
            {/* Titulo grande: rola junto com o conteudo e da lugar ao compacto. */}
            {!ehDetalhe && (
              <h1 className="mb-4 text-[1.9rem] font-bold leading-tight tracking-tight lg:hidden">
                {tituloGrande}
              </h1>
            )}

            {/* O Suspense fica aqui dentro para que cabecalho e abas nao pisquem
                enquanto o chunk da tela carrega. */}
            <Suspense
              fallback={
                <div className="flex justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>

        {mostrarAbas && (
          <BottomNav
            primary={nav.primary}
            secondary={nav.secondary}
            maisAberto={maisAberto}
            onMaisChange={setMaisAberto}
          />
        )}
      </div>

      <AccountSheet
        user={user}
        perfil={PERFIL_LABEL[user?.tipoUsuario ?? 'ALUNO']}
        open={contaAberta}
        onOpenChange={setContaAberta}
        onLogout={logout}
      />
    </div>
  );
};

export default Layout;
