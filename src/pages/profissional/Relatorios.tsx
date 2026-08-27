import { useEffect, useMemo, useState } from 'react';
import { format, startOfMonth } from 'date-fns';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { turmaApi, attendanceApi } from '@/services/api';
import { Turma, TurmaReport } from '@/types';
import { cn } from '@/lib/utils';
import { getFrequencyColor, getFrequencyBadgeClass } from '@/lib/frequency';
import { exportTurmaPDF } from '@/utils/pdfExport';
import { toast } from 'sonner';

const Relatorios = () => {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('all');
  const [from, setFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reports, setReports] = useState<TurmaReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTurmas, setExpandedTurmas] = useState<Set<string>>(new Set());

  useEffect(() => {
    turmaApi.list().then(setTurmas).catch(() => toast.error('Erro ao carregar turmas'));
  }, []);

  useEffect(() => {
    if (turmas.length === 0) {
      setReports([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    Promise.all(turmas.map(t => attendanceApi.groupReport(t.id, from, to)))
      .then(setReports)
      .catch(() => toast.error('Erro ao carregar relatórios'))
      .finally(() => setIsLoading(false));
  }, [turmas, from, to]);

  const toggleTurmaExpanded = (turmaId: string) => {
    setExpandedTurmas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(turmaId)) newSet.delete(turmaId);
      else newSet.add(turmaId);
      return newSet;
    });
  };

  const handleExportPDF = async (report: TurmaReport) => {
    try {
      await exportTurmaPDF(report);
      toast.success('PDF exportado com sucesso!');
    } catch (erro) {
      console.error('Falha ao exportar PDF', erro);
      toast.error('Erro ao exportar PDF');
    }
  };

  const generalStats = useMemo(() => {
    const totalAulas = reports.reduce((sum, r) => sum + r.totalAulas, 0);
    const totalAlunos = reports.reduce((sum, r) => sum + r.alunos.length, 0);
    const frequenciaMediaGeral = reports.length > 0
      ? Math.round(reports.reduce((sum, r) => sum + r.frequenciaMedia, 0) / reports.length)
      : 0;
    return { totalAulas, totalAlunos, frequenciaMediaGeral };
  }, [reports]);

  const turmaReport = selectedTurmaId !== 'all' ? reports.find(r => r.turmaId === selectedTurmaId) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="hidden lg:block text-2xl lg:text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análise de frequência e presença</p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-stretch sm:items-end gap-2">
          <div className="space-y-1">
            <Label className="text-xs">De</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Até</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9" />
          </div>
          <div className="col-span-2 sm:col-span-1 space-y-1">
            <Label className="text-xs">Turma</Label>
            <Select value={selectedTurmaId} onValueChange={setSelectedTurmaId}>
              <SelectTrigger className="w-full sm:w-[200px] h-9">
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
          </div>
          {selectedTurmaId !== 'all' && turmaReport && (
            <Button onClick={() => handleExportPDF(turmaReport)} className="col-span-2 sm:col-span-1 sm:w-auto self-end h-9">
              <FileDown className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-12">Carregando...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl sm:text-2xl font-bold">
                      {selectedTurmaId === 'all' ? reports.length : 1}
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
                      {selectedTurmaId === 'all' ? generalStats.totalAulas : turmaReport?.totalAulas || 0}
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
                      getFrequencyColor(selectedTurmaId === 'all' ? generalStats.frequenciaMediaGeral : turmaReport?.frequenciaMedia || 0)
                    )}>
                      {selectedTurmaId === 'all' ? generalStats.frequenciaMediaGeral : turmaReport?.frequenciaMedia || 0}%
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
                      {selectedTurmaId === 'all' ? generalStats.totalAlunos : turmaReport?.alunos.length || 0}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Alunos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {selectedTurmaId === 'all' ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Visão Geral por Turma</CardTitle>
                <CardDescription>Comparativo de frequência entre turmas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reports.map((turma) => (
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
                            <Badge variant="outline" className={cn("text-xs hidden sm:inline-flex", getFrequencyBadgeClass(turma.frequenciaMedia))}>
                              {turma.frequenciaMedia}%
                            </Badge>
                            <span className={cn("text-sm font-bold sm:hidden", getFrequencyColor(turma.frequenciaMedia))}>
                              {turma.frequenciaMedia}%
                            </span>
                            {expandedTurmas.has(turma.turmaId)
                              ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                              : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />}
                          </div>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-t p-3 space-y-2">
                          {turma.alunos.map((aluno) => (
                            <div key={aluno.alunoId} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm truncate">{aluno.alunoNome}</p>
                                <p className="text-xs text-muted-foreground">
                                  {aluno.presencas}P / {aluno.faltas}F / {aluno.atrasos}A / {aluno.retiradas}R
                                </p>
                              </div>
                              <span className={cn("text-sm font-bold", getFrequencyColor(aluno.percentualFrequencia))}>
                                {aluno.percentualFrequencia}%
                              </span>
                            </div>
                          ))}
                          <div className="flex justify-end pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleExportPDF(turma);
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

                {reports.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma chamada registrada neste período</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            turmaReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">{turmaReport.turmaNome}</CardTitle>
                  <CardDescription>Relatório detalhado de frequência da turma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {turmaReport.alunos.map((aluno) => (
                      <div key={aluno.alunoId} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-primary">{aluno.alunoNome.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{aluno.alunoNome}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-success">{aluno.presencas}P</span>
                            <span className="text-xs text-danger">{aluno.faltas}F</span>
                            <span className="text-xs text-warning">{aluno.atrasos}A</span>
                            <span className="text-xs text-info">{aluno.retiradas}R</span>
                            <span className="text-xs text-muted-foreground">/ {aluno.totalAulas} chamadas</span>
                          </div>
                          <Progress value={aluno.percentualFrequencia} className="h-1.5 mt-2" />
                        </div>
                        <span className={cn("text-sm font-bold flex-shrink-0", getFrequencyColor(aluno.percentualFrequencia))}>
                          {aluno.percentualFrequencia}%
                        </span>
                      </div>
                    ))}
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
        </>
      )}
    </div>
  );
};

export default Relatorios;
