import { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  BookOpen,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  FileDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { turmaService, reportService } from '@/services/mockService';
import { TurmaReport } from '@/types';
import { cn } from '@/lib/utils';
import { getFrequencyColor, getFrequencyBadgeClass } from '@/lib/frequency';
import { exportTurmaPDF } from '@/utils/pdfExport';
import { toast } from 'sonner';

const Relatorios = () => {
  const turmas = turmaService.getAll();
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('all');
  const [expandedTurmas, setExpandedTurmas] = useState<Set<string>>(new Set());

  const generalReport = reportService.getGeneralReport();
  const turmaReport = selectedTurmaId !== 'all' 
    ? reportService.getTurmaReport(selectedTurmaId) 
    : null;

  const toggleTurmaExpanded = (turmaId: string) => {
    setExpandedTurmas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(turmaId)) {
        newSet.delete(turmaId);
      } else {
        newSet.add(turmaId);
      }
      return newSet;
    });
  };

  const handleExportPDF = (report: TurmaReport) => {
    try {
      exportTurmaPDF(report);
      toast.success('PDF exportado com sucesso!');
    } catch {
      toast.error('Erro ao exportar PDF');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análise de frequência e presença</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Select value={selectedTurmaId} onValueChange={setSelectedTurmaId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Selecione uma turma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as turmas</SelectItem>
              {turmas.map((turma) => (
                <SelectItem key={turma.id} value={turma.id}>
                  {turma.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTurmaId !== 'all' && turmaReport && (
            <Button onClick={() => handleExportPDF(turmaReport)} className="w-full sm:w-auto">
              <FileDown className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          )}
        </div>
      </div>

      {/* General Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold">
                  {selectedTurmaId === 'all' 
                    ? generalReport.turmas.length 
                    : 1}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Turmas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 text-info" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold">
                  {selectedTurmaId === 'all' 
                    ? generalReport.totalAulasGeral 
                    : turmaReport?.totalAulas || 0}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Chamadas</p>
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
              <div className="min-w-0">
                <p className={cn(
                  "text-xl sm:text-2xl font-bold",
                  getFrequencyColor(
                    selectedTurmaId === 'all' 
                      ? generalReport.frequenciaMediaGeral 
                      : turmaReport?.frequenciaMedia || 0
                  )
                )}>
                  {selectedTurmaId === 'all' 
                    ? generalReport.frequenciaMediaGeral 
                    : turmaReport?.frequenciaMedia || 0}%
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Freq. Média</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold">
                  {selectedTurmaId === 'all' 
                    ? generalReport.turmas.reduce((sum, t) => sum + t.alunos.length, 0)
                    : turmaReport?.alunos.length || 0}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Alunos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      {selectedTurmaId === 'all' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Visão Geral por Turma</CardTitle>
            <CardDescription>Comparativo de frequência entre turmas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generalReport.turmas.map((turma) => (
              <Collapsible
                key={turma.turmaId}
                open={expandedTurmas.has(turma.turmaId)}
                onOpenChange={() => toggleTurmaExpanded(turma.turmaId)}
              >
                <div className="border rounded-lg overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-muted/50 transition-colors gap-2">
                      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{turma.turmaNome}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {turma.alunos.length} alunos • {turma.totalAulas} chamadas
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs hidden sm:inline-flex", getFrequencyBadgeClass(turma.frequenciaMedia))}
                        >
                          {turma.frequenciaMedia}%
                        </Badge>
                        <span className={cn("text-sm font-bold sm:hidden", getFrequencyColor(turma.frequenciaMedia))}>
                          {turma.frequenciaMedia}%
                        </span>
                        {expandedTurmas.has(turma.turmaId) 
                          ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                          : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        }
                      </div>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t">
                      {/* Mobile card list */}
                      <div className="sm:hidden p-3 space-y-2">
                        {turma.alunos.map((aluno) => (
                          <div key={aluno.alunoId} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{aluno.alunoNome}</p>
                              <p className="text-xs text-muted-foreground">
                                {aluno.presencas}P / {aluno.faltas}F
                              </p>
                            </div>
                            <span className={cn("text-sm font-bold", getFrequencyColor(aluno.percentualFrequencia))}>
                              {aluno.percentualFrequencia}%
                            </span>
                          </div>
                        ))}
                      </div>
                      {/* Desktop table */}
                      <div className="hidden sm:block overflow-x-auto px-4 py-3">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left text-sm font-medium text-muted-foreground py-2">Aluno</th>
                              <th className="text-center text-sm font-medium text-muted-foreground py-2">Presenças</th>
                              <th className="text-center text-sm font-medium text-muted-foreground py-2">Faltas</th>
                              <th className="text-right text-sm font-medium text-muted-foreground py-2">Frequência</th>
                            </tr>
                          </thead>
                          <tbody>
                            {turma.alunos.map((aluno) => (
                              <tr key={aluno.alunoId} className="border-b last:border-0">
                                <td className="py-2 font-medium text-sm">{aluno.alunoNome}</td>
                                <td className="py-2 text-center">
                                  <Badge className="bg-success/20 text-success hover:bg-success/30">
                                    {aluno.presencas}
                                  </Badge>
                                </td>
                                <td className="py-2 text-center">
                                  <Badge variant="outline" className="text-danger border-danger/30">
                                    {aluno.faltas}
                                  </Badge>
                                </td>
                                <td className="py-2 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Progress value={aluno.percentualFrequencia} className="w-20 h-2" />
                                    <span className={cn("font-medium min-w-[3rem] text-right", getFrequencyColor(aluno.percentualFrequencia))}>
                                      {aluno.percentualFrequencia}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex justify-end px-3 sm:px-4 pb-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportPDF(turma);
                          }}
                        >
                          <FileDown className="w-4 h-4 mr-2" />
                          Exportar PDF
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}

            {generalReport.turmas.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>Nenhuma chamada registrada ainda</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        turmaReport && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">{turmaReport.turmaNome}</CardTitle>
              <CardDescription>
                Relatório detalhado de frequência da turma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mobile card list */}
              <div className="sm:hidden space-y-2">
                {turmaReport.alunos.map((aluno) => (
                  <div key={aluno.alunoId} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {aluno.alunoNome.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{aluno.alunoNome}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-success">{aluno.presencas}P</span>
                        <span className="text-xs text-danger">{aluno.faltas}F</span>
                        <span className="text-xs text-muted-foreground">/ {aluno.totalAulas} aulas</span>
                      </div>
                    </div>
                    <span className={cn("text-sm font-bold flex-shrink-0", getFrequencyColor(aluno.percentualFrequencia))}>
                      {aluno.percentualFrequencia}%
                    </span>
                  </div>
                ))}
              </div>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left text-sm font-medium text-muted-foreground py-2">Aluno</th>
                      <th className="text-center text-sm font-medium text-muted-foreground py-2">Total Aulas</th>
                      <th className="text-center text-sm font-medium text-muted-foreground py-2">Presenças</th>
                      <th className="text-center text-sm font-medium text-muted-foreground py-2">Faltas</th>
                      <th className="text-right text-sm font-medium text-muted-foreground py-2">Frequência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turmaReport.alunos.map((aluno) => (
                      <tr key={aluno.alunoId} className="border-b last:border-0">
                        <td className="py-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {aluno.alunoNome.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium">{aluno.alunoNome}</span>
                          </div>
                        </td>
                        <td className="py-2 text-center">{aluno.totalAulas}</td>
                        <td className="py-2 text-center">
                          <Badge className="bg-success/20 text-success hover:bg-success/30">
                            {aluno.presencas}
                          </Badge>
                        </td>
                        <td className="py-2 text-center">
                          <Badge variant="outline" className="text-danger border-danger/30">
                            {aluno.faltas}
                          </Badge>
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Progress value={aluno.percentualFrequencia} className="w-24 h-2" />
                            <span className={cn("font-bold min-w-[3.5rem] text-right", getFrequencyColor(aluno.percentualFrequencia))}>
                              {aluno.percentualFrequencia}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {turmaReport.alunos.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>Nenhum dado de frequência disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
};

export default Relatorios;
