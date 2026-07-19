import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { isRoleRoot, type NavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  primary: NavItem[];
  secondary: NavItem[];
  /** Estado controlado pelo Layout, que centraliza o botao voltar do Android. */
  maisAberto: boolean;
  onMaisChange: (aberto: boolean) => void;
}

const tabClass = (active: boolean) =>
  cn(
    'flex flex-1 flex-col items-center justify-center gap-1 py-2 min-h-[3.25rem]',
    'text-[0.6875rem] font-medium leading-none transition-colors',
    'active:bg-muted/60',
    active ? 'text-primary' : 'text-muted-foreground'
  );

/**
 * Barra de abas do celular. Substitui o menu lateral: destino principal a um
 * toque, sem gaveta escondida — o padrao esperado em Android e iOS.
 */
export const BottomNav = ({ primary, secondary, maisAberto, onMaisChange }: BottomNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const maisAtivo = secondary.some(item => location.pathname.startsWith(item.to));

  const abrirSecundario = (to: string) => {
    onMaisChange(false);
    navigate(to);
  };

  return (
    <>
      <nav
        className={cn(
          'lg:hidden flex items-stretch border-t bg-card/95 backdrop-blur',
          'pb-safe-bottom'
        )}
      >
        {primary.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={isRoleRoot(item.to)}
            className={({ isActive }) => tabClass(isActive)}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('w-6 h-6', isActive && 'fill-primary/15')} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {secondary.length > 0 && (
          <button
            type="button"
            onClick={() => onMaisChange(true)}
            className={tabClass(maisAtivo)}
            aria-label="Mais opções"
          >
            <MoreHorizontal className="w-6 h-6" />
            <span>Mais</span>
          </button>
        )}
      </nav>

      <Sheet open={maisAberto} onOpenChange={onMaisChange}>
        {/* calc preserva o padding do sheet e soma a area segura por cima. */}
        <SheetContent
          side="bottom"
          className="rounded-t-2xl pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="text-left">
            <SheetTitle>Mais</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex flex-col">
            {secondary.map(item => (
              <button
                key={item.to}
                type="button"
                onClick={() => abrirSecundario(item.to)}
                className={cn(
                  'flex items-center gap-4 rounded-xl px-3 py-4 text-left',
                  'text-base font-medium active:bg-muted'
                )}
              >
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
