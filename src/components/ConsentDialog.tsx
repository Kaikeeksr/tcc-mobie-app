import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/** Versão do termo de consentimento vigente (LGPD, art. 14, §1º). Toda concessão grava essa versão. */
export const TERMS_VERSION = '1.0';

interface ConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alunoNome: string;
  onConfirm: () => Promise<void>;
}

/** Tela do termo exibida ao responsável antes de conceder o consentimento de um filho. */
export const ConsentDialog = ({ open, onOpenChange, alunoNome, onConfirm }: ConsentDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Consentimento para tratamento de dados</DialogTitle>
          <DialogDescription>{alunoNome}</DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            Para acompanhar a frequência de <strong>{alunoNome}</strong>, precisamos do seu consentimento para
            tratar os dados de presença, falta, atraso e retirada dele(a), conforme a Lei Geral de Proteção de
            Dados (Lei nº 13.709/2018, art. 14, §1º).
          </p>
          <p>Esses dados são usados apenas para a chamada do transporte e os relatórios de frequência.</p>
          <p>Você pode revogar este consentimento quando quiser, na tela do seu filho.</p>
        </div>
        <DialogFooter>
          <Button onClick={handleConfirm} disabled={isSubmitting} className="w-full sm:w-auto">
            Concordo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
