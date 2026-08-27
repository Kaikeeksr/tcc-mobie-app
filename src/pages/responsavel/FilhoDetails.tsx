import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, startOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  Check,
  X,
  Clock,
  Car,
  FileText,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { meApi } from '@/services/api';
import { AttendanceStatus, StudentAttendanceHistory } from '@/types';
import { cn } from '@/lib/utils';
import { getFrequencyColor } from '@/lib/frequency';

const STATUS_META: Record<AttendanceStatus, { label: string; className: string; icon: typeof Check }> = {
  Present: { label: 'Presente', className: 'bg-success-light text-success', icon: Check },
  Absent: { label: 'Falta', className: 'bg-danger-light text-danger', icon: X },
  Late: { label: 'Atrasado', className: 'bg-warning-light text-warning', icon: Clock },
  PickedUpByGuardian: { label: 'Retirado', className: 'bg-info-light text-info', icon: Car },
  Justified: { label: 'Justificado', className: 'bg-muted text-muted-foreground', icon: FileText },
};

const FilhoDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [history, setHistory] = useState<StudentAttendanceHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    const from = format(startOfYear(new Date()), 'yyyy-MM-dd');
    const to = format(new Date(), 'yyyy-MM-dd');
    meApi
      .childAttendance(id, from, to)
      .then(setHistory)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-12">Carregando...</p>;
  }

  if (error || !history) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold mb-2">Filho não encontrado</h2>
        <Button asChild>
          <Link to="/responsavel/filhos">Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="flex-shrink-0 mt-0.5">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{history.alunoNome}</h1>
          <p className="text-muted-foreground text-sm">Detalhes de frequência</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-5">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-success">{history.presencas}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Presenças</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-danger/10 flex items-center justify-center flex-shrink-0">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-danger" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-danger">{history.faltas}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Faltas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                <Car className="w-4 h-4 sm:w-5 sm:h-5 text-info" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-info">{history.retiradas}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Retiradas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-warning">{history.atrasos}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Atrasos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <p className={cn("text-xl sm:text-2xl font-bold", getFrequencyColor(history.percentualFrequencia))}>
                  {history.percentualFrequencia}%
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Freq.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Histórico de Presença</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Chamadas registradas neste ano</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          {history.historico.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhum registro de presença</p>
          ) : (
            <div className="space-y-1.5 sm:space-y-2">
              {history.historico.map((registro) => {
                const meta = STATUS_META[registro.status];
                const Icon = meta.icon;
                return (
                  <div
                    key={registro.sessionId}
                    className={cn('flex items-center justify-between p-2 sm:p-3 rounded-lg', meta.className)}
                  >
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-medium truncate block">
                        {format(new Date(registro.data + 'T12:00:00'), "dd/MM - EEEE", { locale: ptBR })}
                      </span>
                      <span className="text-xs opacity-80">
                        {registro.sentido === 'ToSchool' ? 'Ida' : 'Volta'}
                        {registro.justificativa ? ` • ${registro.justificativa}` : ''}
                      </span>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0 text-xs bg-transparent">
                      <Icon className="w-3 h-3 mr-1" />
                      {meta.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FilhoDetails;
