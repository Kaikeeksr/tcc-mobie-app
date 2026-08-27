import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { meApi } from '@/services/api';
import { AttendanceStatus, StudentAttendanceHistory } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  GraduationCap,
  Check,
  X,
  Clock,
  Car,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { format, startOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getFrequencyColor, getFrequencyVariant } from '@/lib/frequency';
import { cn } from '@/lib/utils';

const STATUS_META: Record<AttendanceStatus, { label: string; icon: typeof Check }> = {
  Present: { label: 'Presente', icon: Check },
  Absent: { label: 'Falta', icon: X },
  Late: { label: 'Atrasado', icon: Clock },
  PickedUpByGuardian: { label: 'Retirado', icon: Car },
  Justified: { label: 'Justificado', icon: FileText },
};

const AlunoDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<StudentAttendanceHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const from = format(startOfYear(new Date()), 'yyyy-MM-dd');
    const to = format(new Date(), 'yyyy-MM-dd');
    meApi
      .myAttendance(from, to)
      .then(setHistory)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-12">Carregando...</p>;
  }

  if (!history) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="hidden lg:block text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Minha Frequência</h1>
          <p className="text-muted-foreground mt-1 text-sm">Visualize seu registro de presença</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum registro encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="hidden lg:block text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Olá, {user?.nome}!</h1>
        <p className="text-muted-foreground lg:mt-1 text-sm">Acompanhe seu registro de frequência</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5 lg:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Presenças</p>
                <p className="text-xl sm:text-2xl font-bold text-success">{history.presencas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-danger/10 flex items-center justify-center flex-shrink-0">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-danger" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Faltas</p>
                <p className="text-xl sm:text-2xl font-bold text-danger">{history.faltas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-info/10 flex items-center justify-center flex-shrink-0">
                <Car className="w-4 h-4 sm:w-5 sm:h-5 text-info" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Retiradas</p>
                <p className="text-xl sm:text-2xl font-bold text-info">{history.retiradas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Atrasos</p>
                <p className="text-xl sm:text-2xl font-bold text-warning">{history.atrasos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Freq. Geral</p>
                <p className={`text-xl sm:text-2xl font-bold ${getFrequencyColor(history.percentualFrequencia)}`}>
                  {history.percentualFrequencia}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Progresso do ano</CardTitle>
          <CardDescription>{history.totalAulas} chamada{history.totalAulas !== 1 ? 's' : ''} registrada{history.totalAulas !== 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={history.percentualFrequencia} className="h-2" />
        </CardContent>
      </Card>

      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">Histórico Recente</h2>
        <div className="space-y-1.5 max-h-96 overflow-y-auto">
          {history.historico.slice(0, 30).map((registro) => {
            const meta = STATUS_META[registro.status];
            const Icon = meta.icon;
            return (
              <div key={registro.sessionId} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-xs sm:text-sm truncate mr-2">
                  {format(new Date(registro.data + 'T12:00:00'), "dd/MM - EEEE", { locale: ptBR })} • {registro.sentido === 'ToSchool' ? 'Ida' : 'Volta'}
                </span>
                <Badge variant={getFrequencyVariant(registro.status === 'Absent' ? 0 : 100)} className="text-xs flex-shrink-0">
                  <Icon className="w-3 h-3 mr-0.5" />
                  {meta.label}
                </Badge>
              </div>
            );
          })}
          {history.historico.length === 0 && (
            <p className={cn('text-sm text-muted-foreground text-center py-8')}>Nenhum registro ainda</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlunoDashboard;
