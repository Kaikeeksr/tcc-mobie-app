import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  BookOpen,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { reportService } from '@/services/mockService';
import { cn } from '@/lib/utils';
import { getFrequencyColor, getFrequencyBadgeClass } from '@/lib/frequency';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ResponsavelDashboard = () => {
  const { user } = useAuth();
  const childrenAttendance = reportService.getChildAttendance(user?.id || '');

  const totalChildren = childrenAttendance.length;
  const totalTurmas = childrenAttendance.reduce((sum, child) => sum + child.turmas.length, 0);
  const averageFrequency = totalChildren > 0
    ? Math.round(
        childrenAttendance.reduce((sum, child) => {
          const childAvg = child.turmas.length > 0
            ? child.turmas.reduce((s, t) => s + t.percentualFrequencia, 0) / child.turmas.length
            : 0;
          return sum + childAvg;
        }, 0) / totalChildren
      )
    : 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
          Olá, {user?.nome.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Acompanhe a frequência dos seus filhos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold">{totalChildren}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Filhos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-info" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold">{totalTurmas}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Turmas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <div className="text-center sm:text-left">
                <p className={cn("text-xl sm:text-2xl font-bold", getFrequencyColor(averageFrequency))}>
                  {averageFrequency}%
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Freq.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children Overview */}
      {childrenAttendance.length === 0 ? (
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
        <div className="space-y-4 sm:space-y-6">
          {childrenAttendance.map((child) => (
            <Card key={child.alunoId}>
              <CardHeader className="p-3 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-base sm:text-lg font-semibold text-primary">
                        {child.alunoNome.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base sm:text-lg truncate">{child.alunoNome}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {child.turmas.length} {child.turmas.length === 1 ? 'turma' : 'turmas'}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="flex-shrink-0 text-xs sm:text-sm">
                    <Link to={`/responsavel/filhos/${child.alunoId}`}>
                      Detalhes
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                {child.turmas.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4 text-sm">
                    Nenhuma turma vinculada
                  </p>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {child.turmas.map((turma) => (
                      <div 
                        key={turma.turmaId}
                        className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50 gap-2"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{turma.turmaNome}</p>
                            <p className="text-xs text-muted-foreground">
                              {turma.presencas}P • {turma.faltas}F
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline"
                          className={cn("flex-shrink-0 text-xs", getFrequencyBadgeClass(turma.percentualFrequencia))}
                        >
                          {turma.percentualFrequencia}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResponsavelDashboard;
