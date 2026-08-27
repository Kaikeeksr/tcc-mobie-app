// User Types
export type UserType = 'PROFISSIONAL' | 'RESPONSAVEL' | 'ALUNO';

/** Papel bruto do backend (inclui Assistant, ainda sem tela própria no app). */
export type BackendRole = 'Transporter' | 'Assistant' | 'Guardian' | 'Student';

export interface User {
  id: string;
  nome: string;
  email: string;
  tipoUsuario: UserType;
  /** Id do perfil (transporter/guardian/student), usado para escopar chamadas "meus dados". */
  perfilId: string;
  transporterId: string;
}

// Transport group ("turma da van")
export interface Turma {
  id: string;
  nome: string;
  turno?: string | null;
  veiculoId?: string | null;
  monitorId?: string | null;
}

// Student
export interface Student {
  id: string;
  nome: string;
  dataNascimento: string; // YYYY-MM-DD
  serie?: string | null;
  escolaId?: string | null;
  temLogin: boolean;
}

export interface Vehicle {
  id: string;
  placa: string;
  modelo?: string | null;
  capacidade?: number | null;
}

export interface School {
  id: string;
  nome: string;
}

export interface Assistant {
  id: string;
  nome: string;
  email: string;
}

// Guardian (responsável)
export interface Guardian {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  celular?: string | null;
}

export type RelationshipType = 'Father' | 'Mother' | 'Grandparent' | 'LegalGuardian' | 'Other';

export interface GuardianStudentLink {
  id: string;
  guardianId: string;
  studentId: string;
  relationship: RelationshipType;
  isPrimary: boolean;
  canPickup: boolean;
  active: boolean;
}

/** Um filho vinculado ao responsável autenticado ("meus filhos"). */
export interface MeuFilho {
  alunoId: string;
  alunoNome: string;
  serie?: string | null;
  relationship: RelationshipType;
  isPrimary: boolean;
  canPickup: boolean;
}

// Calendar Types
export type DayType = 'LETIVO' | 'FERIADO';

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  tipo: DayType;
  descricao?: string | null;
}

// Attendance Types — fiel ao backend (5 status, sentido ida/volta)
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'PickedUpByGuardian' | 'Justified';
export type SessionType = 'ToSchool' | 'FromSchool';
export type SessionStatus = 'Open' | 'Closed' | 'Canceled';

export interface AttendanceRecord {
  id: string;
  alunoId: string;
  alunoNome: string;
  status: AttendanceStatus;
  retiradoPorId?: string | null;
  retiradoPorNome?: string | null;
  justificativa?: string | null;
  justificadoPor?: string | null;
  escolaId?: string | null;
  registradoEm: string;
}

export interface Chamada {
  id: string;
  turmaId: string;
  turmaNome: string;
  sentido: SessionType;
  data: string; // YYYY-MM-DD
  status: SessionStatus;
  veiculoId?: string | null;
  monitorId?: string | null;
  abertaEm?: string | null;
  fechadaEm?: string | null;
  registros: AttendanceRecord[];
}

export interface ChamadaResumo {
  id: string;
  data: string;
  sentido: SessionType;
  status: SessionStatus;
}

// Report Types
export interface StudentAttendanceSummary {
  alunoId: string;
  alunoNome: string;
  totalAulas: number;
  presencas: number;
  faltas: number;
  atrasos: number;
  retiradas: number;
  justificadas: number;
  percentualFrequencia: number;
}

export interface TurmaReport {
  turmaId: string;
  turmaNome: string;
  from: string;
  to: string;
  totalAulas: number;
  alunos: StudentAttendanceSummary[];
  frequenciaMedia: number;
}

export interface HistoricoItem {
  sessionId: string;
  data: string;
  sentido: SessionType;
  status: AttendanceStatus;
  justificativa?: string | null;
}

export interface StudentAttendanceHistory {
  alunoId: string;
  alunoNome: string;
  from: string;
  to: string;
  totalAulas: number;
  presencas: number;
  faltas: number;
  atrasos: number;
  retiradas: number;
  justificadas: number;
  percentualFrequencia: number;
  historico: HistoricoItem[];
}
