import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  BookOpen,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { meApi } from '@/services/api';
import { MeuFilho, StudentAttendanceHistory } from '@/types';
import { cn } from '@/lib/utils';
import { getFrequencyColor, getFrequencyBadgeClass } from '@/lib/frequency';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { format, startOfYear } from 'date-fns';

const ResponsavelDashboard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<MeuFilho[]>([]);
  const [attendanceByChild, setAttendanceByChild] = useState<Record<string, StudentAttendanceHistory>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await meApi.children();
        setChildren(list);

        const from = format(startOfYear(new Date()), 'yyyy-MM-dd');
        const to = format(new Date(), 'yyyy-MM-dd');
        const histories = await Promise.all(list.map(c => meApi.childAttendance(c.alunoId, from, to)));
        setAttendanceByChild(Object.fromEntries(histories.map(h => [h.alunoId, h])));
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const totalChildren = children.length;
  const averageFrequency = totalChildren > 0
    ? Math.round(
        children.reduce((sum, c) => sum + (attendanceByChild[c.alunoId]?.percentualFrequencia ?? 0), 0) / totalChildren
      )
    : 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div>
        <h1 className="hidden lg:block text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
          Olá, {user?.nome.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground lg:mt-1 text-sm sm:text-base">
          Acompanhe a frequência dos seus filhos
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{totalChildren}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Filhos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <div>
                <p className={cn("text-xl sm:text-2xl font-bold", getFrequencyColor(averageFrequency))}>
                  {averageFrequency}%
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Freq. Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
        <div className="space-y-4 sm:space-y-6">
          {children.map((child) => {
            const history = attendanceByChild[child.alunoId];
            return (
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
                        <CardDescription className="text-xs sm:text-sm">{child.serie || 'Sem série informada'}</CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="flex-shrink-0 text-xs sm:text-sm">
                      <Link to={`/responsavel/filhos/${child.alunoId}`}>Detalhes</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                  <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {history?.presencas ?? 0}P • {history?.faltas ?? 0}F • {history?.retiradas ?? 0}R
                      </span>
                    </div>
                    <Badge variant="outline" className={cn("flex-shrink-0 text-xs", getFrequencyBadgeClass(history?.percentualFrequencia ?? 0))}>
                      {history?.percentualFrequencia ?? 0}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResponsavelDashboard;
