import { 
  User, 
  Student, 
  Turma, 
  CalendarDay, 
  Chamada, 
  TurmaReport, 
  GeneralReport,
  ChildAttendance,
  AttendanceRecord,
  DayType
} from '@/types';
import { 
  mockUsers, 
  mockStudents, 
  mockTurmas, 
  mockCalendarDays, 
  mockChamadas 
} from '@/data/mockData';

// In-memory state for mutations
let students = [...mockStudents];
let turmas = [...mockTurmas];
const calendarDays = [...mockCalendarDays];
const chamadas = [...mockChamadas];

// Auth Service
export const authService = {
  login: (email: string, _password: string): User | null => {
    const user = mockUsers.find(u => u.email === email);
    return user || null;
  },
};

// Turma Service
export const turmaService = {
  getAll: (): Turma[] => turmas,
  
  getById: (id: string): Turma | undefined => turmas.find(t => t.id === id),
  
  create: (data: Omit<Turma, 'id' | 'criadoEm' | 'alunoIds'>): Turma => {
    const newTurma: Turma = {
      ...data,
      id: `turma-${Date.now()}`,
      alunoIds: [],
      criadoEm: new Date(),
    };
    turmas.push(newTurma);
    return newTurma;
  },
  
  update: (id: string, data: Partial<Turma>): Turma | undefined => {
    const index = turmas.findIndex(t => t.id === id);
    if (index !== -1) {
      turmas[index] = { ...turmas[index], ...data };
      return turmas[index];
    }
    return undefined;
  },
  
  delete: (id: string): boolean => {
    const index = turmas.findIndex(t => t.id === id);
    if (index !== -1) {
      turmas.splice(index, 1);
      // Remove turma from students
      students = students.map(s => ({
        ...s,
        turmaIds: s.turmaIds.filter(tid => tid !== id)
      }));
      return true;
    }
    return false;
  },
  
  addStudent: (turmaId: string, studentId: string): boolean => {
    const turma = turmas.find(t => t.id === turmaId);
    const student = students.find(s => s.id === studentId);
    if (turma && student) {
      if (!turma.alunoIds.includes(studentId)) {
        turma.alunoIds.push(studentId);
      }
      if (!student.turmaIds.includes(turmaId)) {
        student.turmaIds.push(turmaId);
      }
      return true;
    }
    return false;
  },
  
  removeStudent: (turmaId: string, studentId: string): boolean => {
    const turma = turmas.find(t => t.id === turmaId);
    const student = students.find(s => s.id === studentId);
    if (turma && student) {
      turma.alunoIds = turma.alunoIds.filter(id => id !== studentId);
      student.turmaIds = student.turmaIds.filter(id => id !== turmaId);
      return true;
    }
    return false;
  },
  
  getStudents: (turmaId: string): Student[] => {
    const turma = turmas.find(t => t.id === turmaId);
    if (!turma) return [];
    return students.filter(s => turma.alunoIds.includes(s.id));
  },
};

// Student Service
export const studentService = {
  getAll: (): Student[] => students,
  
  getById: (id: string): Student | undefined => students.find(s => s.id === id),
  
  create: (data: Omit<Student, 'id' | 'turmaIds'>): Student => {
    const newStudent: Student = {
      ...data,
      id: `aluno-${Date.now()}`,
      turmaIds: [],
    };
    students.push(newStudent);
    return newStudent;
  },
  
  update: (id: string, data: Partial<Student>): Student | undefined => {
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students[index] = { ...students[index], ...data };
      return students[index];
    }
    return undefined;
  },
  
  delete: (id: string): boolean => {
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      // Remove student from all turmas
      turmas = turmas.map(t => ({
        ...t,
        alunoIds: t.alunoIds.filter(aid => aid !== id)
      }));
      students.splice(index, 1);
      return true;
    }
    return false;
  },
  
  getByResponsavel: (responsavelId: string): Student[] => {
    return students.filter(s => s.responsavelId === responsavelId);
  },
};

// Calendar Service
export const calendarService = {
  getAll: (): CalendarDay[] => calendarDays,
  
  getByDate: (date: string): CalendarDay | undefined => {
    return calendarDays.find(d => d.date === date);
  },
  
  isHoliday: (date: string): boolean => {
    const day = calendarDays.find(d => d.date === date);
    return day?.tipo === 'FERIADO';
  },
  
  getHolidayInfo: (date: string): CalendarDay | undefined => {
    return calendarDays.find(d => d.date === date && d.tipo === 'FERIADO');
  },
  
  setDayType: (date: string, tipo: DayType, descricao?: string): CalendarDay => {
    const existingIndex = calendarDays.findIndex(d => d.date === date);
    const newDay: CalendarDay = { date, tipo, descricao };
    
    if (existingIndex !== -1) {
      if (tipo === 'LETIVO') {
        // Remove from holidays
        calendarDays.splice(existingIndex, 1);
      } else {
        calendarDays[existingIndex] = newDay;
      }
    } else if (tipo === 'FERIADO') {
      calendarDays.push(newDay);
    }
    
    return newDay;
  },
  
  removeHoliday: (date: string): boolean => {
    const index = calendarDays.findIndex(d => d.date === date);
    if (index !== -1) {
      calendarDays.splice(index, 1);
      return true;
    }
    return false;
  },
};

// Chamada (Attendance) Service
export const chamadaService = {
  getAll: (): Chamada[] => chamadas,
  
  getByTurma: (turmaId: string): Chamada[] => {
    return chamadas.filter(c => c.turmaId === turmaId);
  },
  
  getByTurmaAndDate: (turmaId: string, data: string): Chamada | undefined => {
    return chamadas.find(c => c.turmaId === turmaId && c.data === data);
  },
  
  create: (turmaId: string, data: string, registros: AttendanceRecord[], criadoPor: string): Chamada => {
    const newChamada: Chamada = {
      id: `chamada-${Date.now()}`,
      turmaId,
      data,
      registros,
      criadoPor,
      criadoEm: new Date(),
    };
    chamadas.push(newChamada);
    return newChamada;
  },
  
  update: (id: string, registros: AttendanceRecord[]): Chamada | undefined => {
    const index = chamadas.findIndex(c => c.id === id);
    if (index !== -1) {
      chamadas[index] = { 
        ...chamadas[index], 
        registros, 
        atualizadoEm: new Date() 
      };
      return chamadas[index];
    }
    return undefined;
  },
};

// Report Service
export const reportService = {
  getTurmaReport: (turmaId: string): TurmaReport | null => {
    const turma = turmaService.getById(turmaId);
    if (!turma) return null;
    
    const turmaChamadas = chamadaService.getByTurma(turmaId);
    const turmaStudents = turmaService.getStudents(turmaId);
    
    const alunos = turmaStudents.map(student => {
      let presencas = 0;
      let faltas = 0;
      
      turmaChamadas.forEach(chamada => {
        const registro = chamada.registros.find(r => r.alunoId === student.id);
        if (registro) {
          if (registro.status === 'PRESENTE') presencas++;
          else faltas++;
        }
      });
      
      const totalAulas = presencas + faltas;
      const percentualFrequencia = totalAulas > 0 
        ? Math.round((presencas / totalAulas) * 100) 
        : 0;
      
      return {
        alunoId: student.id,
        alunoNome: student.nome,
        totalAulas,
        presencas,
        faltas,
        percentualFrequencia,
      };
    });
    
    const totalAulas = turmaChamadas.length;
    const frequenciaMedia = alunos.length > 0
      ? Math.round(alunos.reduce((sum, a) => sum + a.percentualFrequencia, 0) / alunos.length)
      : 0;
    
    return {
      turmaId,
      turmaNome: turma.nome,
      totalAulas,
      alunos,
      frequenciaMedia,
    };
  },
  
  getGeneralReport: (): GeneralReport => {
    const turmaReports = turmas
      .map(t => reportService.getTurmaReport(t.id))
      .filter((r): r is TurmaReport => r !== null);
    
    const frequenciaMediaGeral = turmaReports.length > 0
      ? Math.round(turmaReports.reduce((sum, t) => sum + t.frequenciaMedia, 0) / turmaReports.length)
      : 0;
    
    const totalAulasGeral = turmaReports.reduce((sum, t) => sum + t.totalAulas, 0);
    
    return {
      turmas: turmaReports,
      frequenciaMediaGeral,
      totalAulasGeral,
    };
  },
  
  getChildAttendance: (responsavelId: string): ChildAttendance[] => {
    const children = studentService.getByResponsavel(responsavelId);
    
    return children.map(child => {
      return reportService.getStudentAttendance(child);
    });
  },
  
  getStudentAttendance: (student: Student): ChildAttendance => {
    const turmasData = student.turmaIds.map(turmaId => {
      const turma = turmaService.getById(turmaId);
      const turmaChamadas = chamadaService.getByTurma(turmaId);
      
      let presencas = 0;
      let faltas = 0;
      const historico: { data: string; status: 'PRESENTE' | 'FALTA' }[] = [];
      
      turmaChamadas.forEach(chamada => {
        const registro = chamada.registros.find(r => r.alunoId === student.id);
        if (registro) {
          if (registro.status === 'PRESENTE') presencas++;
          else faltas++;
          historico.push({ data: chamada.data, status: registro.status });
        }
      });
      
      const totalAulas = presencas + faltas;
      const percentualFrequencia = totalAulas > 0
        ? Math.round((presencas / totalAulas) * 100)
        : 0;
      
      return {
        turmaId,
        turmaNome: turma?.nome || 'Turma não encontrada',
        totalAulas,
        presencas,
        faltas,
        percentualFrequencia,
        historico: historico.sort((a, b) => b.data.localeCompare(a.data)),
      };
    });
    
    return {
      alunoId: student.id,
      alunoNome: student.nome,
      turmas: turmasData,
    };
  },
  
  getAlunoAttendance: (alunoId: string): ChildAttendance | null => {
    const student = studentService.getById(alunoId);
    if (!student) return null;
    return reportService.getStudentAttendance(student);
  },
};
