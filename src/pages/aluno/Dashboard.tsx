import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { reportService } from '@/services/mockService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AlunoDashboard = () => {
  const { user } = useAuth();
  
  const attendance = user?.alunoId 
    ? reportService.getAlunoAttendance(user.alunoId) 
    : null;

  if (!attendance) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Minha Frequência</h1>
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

  const totalPresencas = attendance.turmas.reduce((sum, t) => sum + t.presencas, 0);
  const totalFaltas = attendance.turmas.reduce((sum, t) => sum + t.faltas, 0);
  const totalAulas = totalPresencas + totalFaltas;
  const frequenciaGeral = totalAulas > 0 
    ? Math.round((totalPresencas / totalAulas) * 100) 
    : 0;

  const getFrequencyColor = (freq: number) => {
    if (freq >= 80) return 'text-success';
    if (freq >= 60) return 'text-warning';
    return 'text-danger';
  };

  const getFrequencyBadge = (freq: number) => {
    if (freq >= 80) return 'success';
    if (freq >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Olá, {attendance.alunoNome}!</h1>
        <p className="text-muted-foreground mt-1 text-sm">Acompanhe seu registro de frequência</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Turmas</p>
                <p className="text-xl sm:text-2xl font-bold">{attendance.turmas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Presenças</p>
                <p className="text-xl sm:text-2xl font-bold text-success">{totalPresencas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-danger/10 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-danger" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Faltas</p>
                <p className="text-xl sm:text-2xl font-bold text-danger">{totalFaltas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Freq. Geral</p>
                <p className={`text-xl sm:text-2xl font-bold ${getFrequencyColor(frequenciaGeral)}`}>
                  {frequenciaGeral}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Turmas Details */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">Minhas Turmas</h2>
        
        {attendance.turmas.map((turma) => (
          <Card key={turma.turmaId}>
            <CardHeader className="p-3 sm:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg truncate">{turma.turmaNome}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {turma.totalAulas} aula{turma.totalAulas !== 1 ? 's' : ''} registrada{turma.totalAulas !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <Badge variant={getFrequencyBadge(turma.percentualFrequencia) as "success" | "warning" | "danger"} className="flex-shrink-0 text-xs">
                  {turma.percentualFrequencia}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 pt-0 sm:p-6 sm:pt-0">
              {/* Progress Bar */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Frequência</span>
                  <span className={getFrequencyColor(turma.percentualFrequencia)}>
                    {turma.presencas}/{turma.totalAulas}
                  </span>
                </div>
                <Progress 
                  value={turma.percentualFrequencia} 
                  className="h-2"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-success/10">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Presenças</p>
                    <p className="font-semibold text-sm sm:text-base text-success">{turma.presencas}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-danger/10">
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-danger flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Faltas</p>
                    <p className="font-semibold text-sm sm:text-base text-danger">{turma.faltas}</p>
                  </div>
                </div>
              </div>

              {/* History */}
              {turma.historico.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Histórico Recente
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {turma.historico.slice(0, 10).map((registro, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        >
                          <span className="text-xs sm:text-sm truncate mr-2">
                            {format(parseISO(registro.data), "dd/MM - EEEE", { locale: ptBR })}
                          </span>
                          <Badge 
                            variant={registro.status === 'PRESENTE' ? 'success' : 'danger'}
                            className="text-xs flex-shrink-0"
                          >
                            {registro.status === 'PRESENTE' ? (
                              <><CheckCircle2 className="w-3 h-3 mr-0.5" /> P</>
                            ) : (
                              <><XCircle className="w-3 h-3 mr-0.5" /> F</>
                            )}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AlunoDashboard;
