import { useEffect, useState } from 'react';
import {
  Users,
  ChevronRight,
  GraduationCap,
  ShieldAlert
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { meApi, consentApi } from '@/services/api';
import { GuardianConsentStatus, MeuFilho, StudentAttendanceHistory } from '@/types';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getFrequencyBadgeClass } from '@/lib/frequency';
import { format, startOfYear } from 'date-fns';
import { ConsentDialog, TERMS_VERSION } from '@/components/ConsentDialog';
import { toast } from 'sonner';

const Filhos = () => {
  const [children, setChildren] = useState<MeuFilho[]>([]);
  const [attendanceByChild, setAttendanceByChild] = useState<Record<string, StudentAttendanceHistory>>({});
  const [consents, setConsents] = useState<GuardianConsentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [consentTarget, setConsentTarget] = useState<GuardianConsentStatus | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await meApi.children();
        setChildren(list);
        const from = format(startOfYear(new Date()), 'yyyy-MM-dd');
        const to = format(new Date(), 'yyyy-MM-dd');
        const [histories, consentStatus] = await Promise.all([
          Promise.all(list.map(c => meApi.childAttendance(c.alunoId, from, to))),
          consentApi.list(),
        ]);
        setAttendanceByChild(Object.fromEntries(histories.map(h => [h.alunoId, h])));
        setConsents(consentStatus);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const pendingConsents = consents.filter((c) => !c.ativo);

  const handleGrantConsent = async () => {
    if (!consentTarget) return;
    try {
      const updated = await consentApi.grant(consentTarget.alunoId, TERMS_VERSION);
      setConsents((prev) => prev.map((c) => (c.alunoId === updated.alunoId ? updated : c)));
      toast.success('Consentimento concedido!');
    } catch {
      toast.error('Erro ao conceder consentimento');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="hidden lg:block text-2xl lg:text-3xl font-bold">Meus Filhos</h1>
        <p className="text-muted-foreground text-sm">Acompanhe a frequência e histórico</p>
      </div>

      {!isLoading && pendingConsents.length > 0 && (
        <div className="space-y-2">
          {pendingConsents.map((pending) => (
            <Card key={pending.alunoId} className="border-warning/40 bg-warning-light">
              <CardContent className="flex items-center justify-between gap-3 p-3 sm:p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <ShieldAlert className="w-5 h-5 text-warning flex-shrink-0" />
                  <p className="text-sm min-w-0">
                    Consentimento pendente para <strong>{pending.alunoNome}</strong>.
                  </p>
                </div>
                <Button size="sm" onClick={() => setConsentTarget(pending)} className="flex-shrink-0">
                  Ver termo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-muted-foreground py-12">Carregando...</p>
      ) : children.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum filho vinculado</h3>
            <p className="text-muted-foreground text-center text-sm">
              Você ainda não possui filhos vinculados ao seu cadastro
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {children.map((child) => {
            const freq = attendanceByChild[child.alunoId]?.percentualFrequencia ?? 0;
            return (
              <Link key={child.alunoId} to={`/responsavel/filhos/${child.alunoId}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center justify-between p-3 sm:p-6 gap-3">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold truncate">{child.alunoNome}</h3>
                        <div className="flex items-center gap-2 mt-0.5 sm:mt-1 flex-wrap">
                          <span className="text-xs sm:text-sm text-muted-foreground">{child.serie || 'Sem série'}</span>
                          <Badge variant="outline" className={cn("text-xs", getFrequencyBadgeClass(freq))}>
                            {freq}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {consentTarget && (
        <ConsentDialog
          open={!!consentTarget}
          onOpenChange={(open) => !open && setConsentTarget(null)}
          alunoNome={consentTarget.alunoNome}
          onConfirm={handleGrantConsent}
        />
      )}
    </div>
  );
};

export default Filhos;
