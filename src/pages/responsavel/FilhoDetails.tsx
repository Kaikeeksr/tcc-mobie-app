import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ArrowLeft,
  BookOpen, 
  Check,
  X,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { reportService } from '@/services/mockService';
import { cn } from '@/lib/utils';

const FilhoDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const childrenAttendance = reportService.getChildAttendance(user?.id || '');
  const child = childrenAttendance.find(c => c.alunoId === id);

  const getFrequencyColor = (percentage: number) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-danger';
  };

  const getFrequencyBadge = (percentage: number) => {
    if (percentage >= 80) return 'bg-success-light text-success border-success/30';
    if (percentage >= 60) return 'bg-warning-light text-warning border-warning/30';
    return 'bg-danger-light text-danger border-danger/30';
  };

  if (!child) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold mb-2">Filho não encontrado</h2>
        <Button asChild>
          <Link to="/responsavel/filhos">Voltar</Link>
        </Button>
      </div>
    );
  }

  const averageFrequency = child.turmas.length > 0
    ? Math.round(
        child.turmas.reduce((sum, t) => sum + t.percentualFrequencia, 0) / child.turmas.length
      )
    : 0;

  const totalPresencas = child.turmas.reduce((sum, t) => sum + t.presencas, 0);
  const totalFaltas = child.turmas.reduce((sum, t) => sum + t.faltas, 0);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="flex-shrink-0 mt-0.5">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{child.alunoNome}</h1>
          <p className="text-muted-foreground text-sm">Detalhes de frequência</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{child.turmas.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Turmas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-success">{totalPresencas}</p>
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
                <p className="text-xl sm:text-2xl font-bold text-danger">{totalFaltas}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Faltas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-info" />
              </div>
              <div>
                <p className={cn("text-xl sm:text-2xl font-bold", getFrequencyColor(averageFrequency))}>
                  {averageFrequency}%
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Freq.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Turmas with History */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Turmas e Histórico</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Toque em uma turma para ver o histórico</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          {child.turmas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>Nenhuma turma vinculada</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {child.turmas.map((turma) => (
                <AccordionItem key={turma.turmaId} value={turma.turmaId}>
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center justify-between w-full pr-2 gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{turma.turmaNome}</p>
                          <p className="text-xs text-muted-foreground">
                            {turma.presencas}P • {turma.faltas}F
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={cn("flex-shrink-0 text-xs", getFrequencyBadge(turma.percentualFrequencia))}
                      >
                        {turma.percentualFrequencia}%
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-2 sm:pt-4 pl-2 sm:pl-4 border-l-2 border-muted ml-4 sm:ml-5">
                      <h4 className="font-medium mb-3 flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        Histórico de Presença
                      </h4>
                      {turma.historico.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          Nenhum registro de presença
                        </p>
                      ) : (
                        <div className="space-y-1.5 sm:space-y-2">
                          {turma.historico.map((registro, index) => (
                            <div 
                              key={`${registro.data}-${index}`}
                              className={cn(
                                "flex items-center justify-between p-2 sm:p-3 rounded-lg",
                                registro.status === 'PRESENTE' 
                                  ? "bg-success-light" 
                                  : "bg-danger-light"
                              )}
                            >
                              <span className="text-xs sm:text-sm font-medium truncate mr-2">
                                {format(new Date(registro.data + 'T12:00:00'), "dd/MM - EEEE", { locale: ptBR })}
                              </span>
                              <Badge 
                                variant="outline"
                                className={cn(
                                  "flex-shrink-0 text-xs",
                                  registro.status === 'PRESENTE'
                                    ? "bg-success/20 text-success border-success/30"
                                    : "bg-danger/20 text-danger border-danger/30"
                                )}
                              >
                                {registro.status === 'PRESENTE' ? (
                                  <><Check className="w-3 h-3 mr-0.5" />P</>
                                ) : (
                                  <><X className="w-3 h-3 mr-0.5" />F</>
                                )}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FilhoDetails;
