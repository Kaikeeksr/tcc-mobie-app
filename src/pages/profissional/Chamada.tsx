import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ClipboardCheck, 
  Calendar as CalendarIcon,
  Check,
  X,
  Save,
  Users,
  PartyPopper
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { turmaService, chamadaService, calendarService } from '@/services/mockService';
import { AttendanceRecord, AttendanceStatus, Turma, Student } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { hapticSelecao, hapticSucesso } from '@/lib/haptics';

const Chamada = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTurmaId = searchParams.get('turma') || '';

  const [turmas] = useState<Turma[]>(turmaService.getAll());
  const [selectedTurmaId, setSelectedTurmaId] = useState(initialTurmaId);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Map<string, AttendanceStatus>>(new Map());
  const [existingChamadaId, setExistingChamadaId] = useState<string | null>(null);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayInfo, setHolidayInfo] = useState<string>('');

  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const holiday = calendarService.getHolidayInfo(dateStr);
    setIsHoliday(!!holiday);
    setHolidayInfo(holiday?.descricao || 'Feriado');
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedTurmaId) {
      setStudents([]);
      setAttendance(new Map());
      setExistingChamadaId(null);
      return;
    }

    const turmaStudents = turmaService.getStudents(selectedTurmaId);
    setStudents(turmaStudents);

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existingChamada = chamadaService.getByTurmaAndDate(selectedTurmaId, dateStr);

    if (existingChamada) {
      setExistingChamadaId(existingChamada.id);
      const attendanceMap = new Map<string, AttendanceStatus>();
      existingChamada.registros.forEach(r => {
        attendanceMap.set(r.alunoId, r.status);
      });
      setAttendance(attendanceMap);
    } else {
      setExistingChamadaId(null);
      const attendanceMap = new Map<string, AttendanceStatus>();
      turmaStudents.forEach(s => {
        attendanceMap.set(s.id, 'FALTA');
      });
      setAttendance(attendanceMap);
    }
  }, [selectedTurmaId, selectedDate]);

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    void hapticSelecao();
    setAttendance(prev => {
      const newMap = new Map(prev);
      newMap.set(studentId, status);
      return newMap;
    });
  };

  const toggleAllPresent = () => {
    const allPresent = students.every(s => attendance.get(s.id) === 'PRESENTE');
    const newStatus: AttendanceStatus = allPresent ? 'FALTA' : 'PRESENTE';
    
    const newMap = new Map<string, AttendanceStatus>();
    students.forEach(s => {
      newMap.set(s.id, newStatus);
    });
    setAttendance(newMap);
  };

  const handleSave = () => {
    if (!selectedTurmaId || !user) return;

    const registros: AttendanceRecord[] = Array.from(attendance.entries()).map(
      ([alunoId, status]) => ({ alunoId, status })
    );

    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    if (existingChamadaId) {
      chamadaService.update(existingChamadaId, registros);
      toast.success('Chamada atualizada com sucesso!');
    } else {
      chamadaService.create(selectedTurmaId, dateStr, registros, user.id);
      toast.success('Chamada salva com sucesso!');
    }
    void hapticSucesso();

    const newChamada = chamadaService.getByTurmaAndDate(selectedTurmaId, dateStr);
    if (newChamada) {
      setExistingChamadaId(newChamada.id);
    }
  };

  const selectedTurma = turmas.find(t => t.id === selectedTurmaId);
  const presentCount = Array.from(attendance.values()).filter(s => s === 'PRESENTE').length;
  const absentCount = Array.from(attendance.values()).filter(s => s === 'FALTA').length;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        {/* No celular o titulo ja vem no cabecalho fixo do Layout. */}
        <h1 className="hidden lg:block text-2xl lg:text-3xl font-bold">Chamada</h1>
        <p className="text-muted-foreground">Registre a presença dos alunos</p>
      </div>

      {/* Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
            <CardTitle className="text-base font-medium">Data</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
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

      {/* Holiday Warning */}
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

      {/* Attendance List */}
      {selectedTurmaId && !isHoliday && (
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  {selectedTurma?.nome}
                </CardTitle>
                <CardDescription className="mt-1">
                  {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  {existingChamadaId && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Editando
                    </Badge>
                  )}
                </CardDescription>
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
            {students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>Nenhum aluno nesta turma</p>
              </div>
            ) : (
              <>
                <div className="flex justify-end mb-3 sm:mb-4">
                  <Button variant="outline" size="sm" onClick={toggleAllPresent} className="text-xs sm:text-sm">
                    {students.every(s => attendance.get(s.id) === 'PRESENTE') 
                      ? 'Todos como falta'
                      : 'Todos como presente'}
                  </Button>
                </div>

                <div className="space-y-2">
                  {students.map((student) => {
                    const status = attendance.get(student.id) || 'FALTA';
                    const isPresent = status === 'PRESENTE';

                    return (
                      <div 
                        key={student.id}
                        className={cn(
                          "flex items-center justify-between p-2 sm:p-3 rounded-lg transition-colors",
                          isPresent ? "bg-success-light" : "bg-danger-light"
                        )}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className={cn(
                            "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0",
                            isPresent ? "bg-success/20" : "bg-danger/20"
                          )}>
                            <span className={cn(
                              "text-sm font-medium",
                              isPresent ? "text-success" : "text-danger"
                            )}>
                              {student.nome.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-sm sm:text-base truncate">{student.nome}</span>
                        </div>
                        {/* 44px e o minimo do iOS HIG. Esta e a interacao central
                            do app: motorista marcando aluno por aluno, uma mao so. */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant={isPresent ? "default" : "outline"}
                            aria-label={`Marcar ${student.nome} como presente`}
                            className={cn(
                              "h-11 w-11 p-0",
                              isPresent && "bg-success hover:bg-success/90"
                            )}
                            onClick={() => handleAttendanceChange(student.id, 'PRESENTE')}
                          >
                            <Check className="w-5 h-5" />
                          </Button>
                          <Button
                            size="sm"
                            variant={!isPresent ? "destructive" : "outline"}
                            aria-label={`Marcar ${student.nome} como falta`}
                            className="h-11 w-11 p-0"
                            onClick={() => handleAttendanceChange(student.id, 'FALTA')}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end mt-4 sm:mt-6">
                  <Button onClick={handleSave} className="gradient-primary w-full sm:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    {existingChamadaId ? 'Atualizar Chamada' : 'Salvar Chamada'}
                  </Button>
                </div>
              </>
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
              Escolha uma turma e uma data para realizar a chamada
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Chamada;
