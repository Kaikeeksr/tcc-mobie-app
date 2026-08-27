import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ClipboardCheck,
  Calendar as CalendarIcon,
  Check,
  X,
  Users,
  PartyPopper,
  Car,
  Lock,
  Ban,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { turmaApi, attendanceApi, calendarApi, guardianStudentApi, guardianApi } from '@/services/api';
import { AttendanceStatus, Chamada as ChamadaType, Guardian, SessionType, Turma } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { hapticSelecao, hapticSucesso } from '@/lib/haptics';

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  Present: 'Presente',
  Absent: 'Falta',
  Late: 'Atrasado',
  PickedUpByGuardian: 'Retirado',
  Justified: 'Justificado',
};

const STATUS_BADGE_CLASS: Record<AttendanceStatus, string> = {
  Present: 'bg-success/20 text-success border-success/30',
  Absent: 'bg-danger/20 text-danger border-danger/30',
  Late: 'bg-warning/20 text-warning border-warning/30',
  PickedUpByGuardian: 'bg-info/20 text-info border-info/30',
  Justified: 'bg-muted text-muted-foreground border-muted-foreground/30',
};

const SENTIDO_OPTIONS: { value: SessionType; label: string }[] = [
  { value: 'ToSchool', label: 'Ida (casa → escola)' },
  { value: 'FromSchool', label: 'Volta (escola → casa)' },
];

const Chamada = () => {
  const [searchParams] = useSearchParams();
  const initialTurmaId = searchParams.get('turma') || '';

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState(initialTurmaId);
  const [sentido, setSentido] = useState<SessionType>('ToSchool');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [chamada, setChamada] = useState<ChamadaType | null>(null);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayInfo, setHolidayInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [pickupStudent, setPickupStudent] = useState<{ id: string; nome: string } | null>(null);

  useEffect(() => {
    turmaApi.list().then(setTurmas).catch(() => toast.error('Erro ao carregar turmas'));
  }, []);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  useEffect(() => {
    // Fim de semana é não letivo por padrão, mesmo sem um registro no calendário.
    const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;

    calendarApi
      .list(dateStr, dateStr)
      .then(days => {
        const override = days.find(d => d.date === dateStr);
        const effectiveTipo = override?.tipo ?? (isWeekend ? 'FERIADO' : 'LETIVO');
        setIsHoliday(effectiveTipo === 'FERIADO');
        setHolidayInfo(override?.descricao || (isWeekend ? 'Fim de semana' : 'Feriado'));
      })
      .catch(() => {
        setIsHoliday(isWeekend);
        setHolidayInfo('Fim de semana');
      });
  }, [dateStr, selectedDate]);

  const loadChamada = useCallback(async () => {
    if (!selectedTurmaId) {
      setChamada(null);
      return;
    }
    setIsLoading(true);
    try {
      const existing = await attendanceApi.getByDate(selectedTurmaId, dateStr, sentido);
      setChamada(existing);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar chamada');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTurmaId, dateStr, sentido]);

  useEffect(() => {
    void loadChamada();
  }, [loadChamada]);

  const handleOpen = async () => {
    if (!selectedTurmaId) return;
    setIsOpening(true);
    try {
      const opened = await attendanceApi.open(selectedTurmaId, { sentido, data: dateStr });
      setChamada(opened);
      toast.success('Chamada aberta! Todos começam como presentes — ajuste quem faltou.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao abrir chamada');
    } finally {
      setIsOpening(false);
    }
  };

  const handleStatusChange = async (studentId: string, status: AttendanceStatus) => {
    if (!chamada) return;
    void hapticSelecao();

    // Otimista: atualiza a tela antes da resposta do servidor.
    setChamada({
      ...chamada,
      registros: chamada.registros.map(r => (r.alunoId === studentId ? { ...r, status } : r)),
    });

    try {
      await attendanceApi.markRecords(chamada.id, [{ alunoId: studentId, status }]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao marcar presença');
      await loadChamada();
    }
  };

  const handleClose = async () => {
    if (!chamada) return;
    try {
      await attendanceApi.close(chamada.id);
      toast.success('Chamada fechada!');
      void hapticSucesso();
      await loadChamada();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao fechar chamada');
    }
  };

  const handleCancel = async () => {
    if (!chamada) return;
    try {
      await attendanceApi.cancel(chamada.id);
      toast.success('Chamada cancelada');
      await loadChamada();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao cancelar chamada');
    }
  };

  const selectedTurma = turmas.find(t => t.id === selectedTurmaId);
  const presentCount = chamada?.registros.filter(r => r.status === 'Present').length ?? 0;
  const absentCount = chamada?.registros.filter(r => r.status === 'Absent').length ?? 0;
  const isOpen = chamada?.status === 'Open';

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="hidden lg:block text-2xl lg:text-3xl font-bold">Chamada</h1>
        <p className="text-muted-foreground">Registre a presença dos alunos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-3 p-3 sm:p-6 sm:pb-3">
            <CardTitle className="text-base font-medium">Turma</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <Select value={selectedTurmaId} onValueChange={setSelectedTurmaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma turma" />
              </SelectTrigger>
              <SelectContent>
                {turmas.map((turma) => (
                  <SelectItem key={turma.id} value={turma.id}>
                    {turma.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 p-3 sm:p-6 sm:pb-3">
            <CardTitle className="text-base font-medium">Sentido</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <Select value={sentido} onValueChange={(v: SessionType) => setSentido(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SENTIDO_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 p-3 sm:p-6 sm:pb-3">
            <CardTitle className="text-base font-medium">Data</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  autoFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      </div>

      {isHoliday && selectedTurmaId && (
        <Card className="border-holiday bg-holiday-light">
          <CardContent className="flex items-center gap-3 p-3 sm:p-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-holiday/20 flex items-center justify-center flex-shrink-0">
              <PartyPopper className="w-5 h-5 sm:w-6 sm:h-6 text-holiday" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm sm:text-base text-foreground">
                Chamada indisponível — {holidayInfo}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Este dia está marcado como feriado
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTurmaId && !isHoliday && isLoading && (
        <p className="text-center text-muted-foreground py-8">Carregando...</p>
      )}

      {selectedTurmaId && !isHoliday && !isLoading && !chamada && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <ClipboardCheck className="w-12 h-12 text-muted-foreground" />
            <p className="text-muted-foreground text-center text-sm">
              Nenhuma chamada aberta para {selectedTurma?.nome} nesta data/sentido
            </p>
            <Button onClick={handleOpen} disabled={isOpening} className="gradient-primary">
              {isOpening ? 'Abrindo...' : 'Abrir Chamada'}
            </Button>
          </CardContent>
        </Card>
      )}

      {selectedTurmaId && !isHoliday && !isLoading && chamada && (
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  {chamada.turmaNome}
                </CardTitle>
                <div className="mt-1 flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                  {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  <Badge variant="outline" className="text-xs">
                    {chamada.status === 'Open' ? 'Aberta' : chamada.status === 'Closed' ? 'Fechada' : 'Cancelada'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-success hover:bg-success">
                  <Check className="w-3 h-3 mr-1" />
                  {presentCount}
                </Badge>
                <Badge variant="destructive">
                  <X className="w-3 h-3 mr-1" />
                  {absentCount}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            {chamada.registros.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>Nenhum aluno matriculado nesta turma</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chamada.registros.map((registro) => (
                  <div
                    key={registro.alunoId}
                    className={cn(
                      'flex items-center justify-between p-2 sm:p-3 rounded-lg gap-2 border',
                      STATUS_BADGE_CLASS[registro.status]
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-sm sm:text-base truncate block">{registro.alunoNome}</span>
                      {registro.status === 'PickedUpByGuardian' && registro.retiradoPorNome && (
                        <span className="text-xs text-muted-foreground">
                          Retirado por {registro.retiradoPorNome}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Select
                        value={registro.status}
                        disabled={!isOpen}
                        onValueChange={(v: AttendanceStatus) => {
                          if (v !== 'PickedUpByGuardian') void handleStatusChange(registro.alunoId, v);
                        }}
                      >
                        <SelectTrigger className="h-9 w-[130px] text-xs sm:text-sm">
                          <SelectValue>{STATUS_LABEL[registro.status]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Present">Presente</SelectItem>
                          <SelectItem value="Absent">Falta</SelectItem>
                          <SelectItem value="Late">Atrasado</SelectItem>
                          <SelectItem value="Justified">Justificado</SelectItem>
                          {registro.status === 'PickedUpByGuardian' && (
                            <SelectItem value="PickedUpByGuardian">Retirado</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {isOpen && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9"
                          title="Retirado pelo responsável"
                          onClick={() => setPickupStudent({ id: registro.alunoId, nome: registro.alunoNome })}
                        >
                          <Car className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isOpen && chamada.registros.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 sm:mt-6">
                <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                  <Ban className="w-4 h-4 mr-2" />
                  Cancelar Chamada
                </Button>
                <Button onClick={handleClose} className="gradient-primary w-full sm:w-auto">
                  <Lock className="w-4 h-4 mr-2" />
                  Fechar Chamada
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedTurmaId && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Selecione uma turma</h3>
            <p className="text-muted-foreground text-center text-sm">
              Escolha uma turma, sentido e data para realizar a chamada
            </p>
          </CardContent>
        </Card>
      )}

      {pickupStudent && chamada && (
        <PickupDialog
          sessionId={chamada.id}
          student={pickupStudent}
          onClose={() => setPickupStudent(null)}
          onDone={() => {
            setPickupStudent(null);
            void loadChamada();
          }}
        />
      )}
    </div>
  );
};

/** Escolhe qual responsável (entre os que podem retirar) buscou o aluno na escola. */
const PickupDialog = ({
  sessionId,
  student,
  onClose,
  onDone,
}: {
  sessionId: string;
  student: { id: string; nome: string };
  onClose: () => void;
  onDone: () => void;
}) => {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [selectedGuardianId, setSelectedGuardianId] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [links, allGuardians] = await Promise.all([
          guardianStudentApi.listByStudent(student.id),
          guardianApi.list(),
        ]);
        const allowedIds = new Set(links.filter(l => l.active && l.canPickup).map(l => l.guardianId));
        setGuardians(allGuardians.filter(g => allowedIds.has(g.id)));
      } catch {
        toast.error('Erro ao carregar responsáveis');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [student.id]);

  const handleConfirm = async () => {
    if (!selectedGuardianId) {
      toast.error('Selecione o responsável que retirou o aluno');
      return;
    }
    setIsSaving(true);
    try {
      await attendanceApi.pickup(sessionId, student.id, selectedGuardianId, justificativa);
      toast.success('Retirada registrada — não conta como falta.');
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao registrar retirada');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Retirado pelo responsável</DialogTitle>
          <DialogDescription>
            {student.nome} foi buscado na escola antes da van chegar. Isso não conta como falta.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando responsáveis...</p>
          ) : guardians.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum responsável deste aluno está autorizado a retirá-lo. Ajuste a permissão em Alunos.
            </p>
          ) : (
            <Select value={selectedGuardianId} onValueChange={setSelectedGuardianId}>
              <SelectTrigger>
                <SelectValue placeholder="Quem retirou?" />
              </SelectTrigger>
              <SelectContent>
                {guardians.map(g => (
                  <SelectItem key={g.id} value={g.id}>{g.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Textarea
            placeholder="Observação (opcional)"
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            rows={2}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={isSaving || guardians.length === 0}>
            Confirmar retirada
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Chamada;
