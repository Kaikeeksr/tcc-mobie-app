import { LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

interface AccountSheetProps {
  user: User | null;
  perfil: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout: () => void;
}

/**
 * Dados da conta e saida. Com a barra de abas ocupando os destinos principais,
 * este e o lugar natural para o que nao e navegacao.
 */
export const AccountSheet = ({
  user,
  perfil,
  open,
  onOpenChange,
  onLogout,
}: AccountSheetProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent
      side="bottom"
      className="rounded-t-2xl pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
    >
      <SheetHeader className="text-left">
        <SheetTitle>Conta</SheetTitle>
      </SheetHeader>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
          {user?.nome.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium">{user?.nome}</p>
          <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-muted-foreground">{perfil}</p>
        </div>
      </div>

      <Button
        variant="outline"
        className="mt-6 h-12 w-full justify-center gap-2 text-destructive"
        onClick={onLogout}
      >
        <LogOut className="h-5 w-5" />
        Sair
      </Button>
    </SheetContent>
  </Sheet>
);
