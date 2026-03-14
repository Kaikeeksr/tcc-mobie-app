// User Types
export type UserType = 'PROFISSIONAL' | 'RESPONSAVEL' | 'ALUNO';

export interface User {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: UserType;
  avatar?: string;
  alunoId?: string; // ID do aluno quando tipoUsuario === 'ALUNO'
}

// Student Types
export interface Student {
  id: string;
  nome: string;
  responsavelId: string;
  responsavelNome: string;
  turmaIds: string[];
}

// Class Types
export interface Turma {
  id: string;
  nome: string;
  descricao: string;
  alunoIds: string[];
  criadoPor: string;
  criadoEm: Date;
}

// Calendar Types
export type DayType = 'LETIVO' | 'FERIADO';

export interface CalendarDay {
  date: string; // YYYY-MM-DD format
  tipo: DayType;
  descricao?: string;
}

// Attendance Types
export type AttendanceStatus = 'PRESENTE' | 'FALTA';

export interface AttendanceRecord {
  alunoId: string;
  status: AttendanceStatus;
}

export interface Chamada {
  id: string;
  turmaId: string;
  data: string; // YYYY-MM-DD format
  registros: AttendanceRecord[];
  criadoPor: string;
  criadoEm: Date;
  atualizadoEm?: Date;
}

// Report Types
export interface StudentAttendanceSummary {
  alunoId: string;
  alunoNome: string;
  totalAulas: number;
  presencas: number;
  faltas: number;
  percentualFrequencia: number;
}

export interface TurmaReport {
  turmaId: string;
  turmaNome: string;
  totalAulas: number;
  alunos: StudentAttendanceSummary[];
  frequenciaMedia: number;
}

export interface GeneralReport {
  turmas: TurmaReport[];
  frequenciaMediaGeral: number;
  totalAulasGeral: number;
}

// Child view for parent
export interface ChildAttendance {
  alunoId: string;
  alunoNome: string;
  turmas: {
    turmaId: string;
    turmaNome: string;
    totalAulas: number;
    presencas: number;
    faltas: number;
    percentualFrequencia: number;
    historico: {
      data: string;
      status: AttendanceStatus;
    }[];
  }[];
}
