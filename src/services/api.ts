import { apiClient, ApiError } from '@/lib/apiClient';
import type {
  AttendanceRecord,
  AttendanceStatus,
  Chamada,
  ChamadaResumo,
  CalendarDay,
  DayType,
  Guardian,
  GuardianStudentLink,
  MeuFilho,
  RelationshipType,
  School,
  SessionType,
  Student,
  StudentAttendanceHistory,
  Turma,
  TurmaReport,
  User,
  Vehicle,
} from '@/types';

interface AuthenticatedUserDto {
  id: string;
  name: string;
  email: string;
  role: 'Transporter' | 'Assistant' | 'Guardian' | 'Student';
  profile_id: string;
  transporter_id: string;
}

interface LoginResponseDto {
  token: string;
  token_type: string;
  expires_at_utc: string;
  user: AuthenticatedUserDto;
}

const ROLE_TO_USER_TYPE: Record<AuthenticatedUserDto['role'], User['tipoUsuario'] | null> = {
  Transporter: 'PROFISSIONAL',
  Guardian: 'RESPONSAVEL',
  Student: 'ALUNO',
  Assistant: null,
};

const toUser = (dto: AuthenticatedUserDto): User | null => {
  const tipoUsuario = ROLE_TO_USER_TYPE[dto.role];
  if (!tipoUsuario) return null;

  return {
    id: dto.id,
    nome: dto.name,
    email: dto.email,
    tipoUsuario,
    perfilId: dto.profile_id,
    transporterId: dto.transporter_id,
  };
};

export interface LoginResult {
  token: string;
  user: User;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResult> {
    const response = await apiClient.post<LoginResponseDto>('/api/auth/login', { email, password });
    const user = toUser(response.user);
    if (!user) {
      throw new Error('Este perfil (monitor) ainda não é suportado neste app.');
    }
    return { token: response.token, user };
  },

  async registerTransporter(input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    documentType: 'Cpf' | 'Cnpj';
    documentNumber: string;
  }): Promise<LoginResult> {
    const response = await apiClient.post<LoginResponseDto>('/api/auth/register', {
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: input.password,
      document_type: input.documentType,
      document_number: input.documentNumber,
    });
    const user = toUser(response.user);
    if (!user) {
      throw new Error('Não foi possível concluir o cadastro.');
    }
    return { token: response.token, user };
  },
};

interface TransportGroupDto {
  id: string;
  name: string;
  shift?: string | null;
  vehicle_id?: string | null;
  assistant_id?: string | null;
}

const toTurma = (dto: TransportGroupDto): Turma => ({
  id: dto.id,
  nome: dto.name,
  turno: dto.shift,
  veiculoId: dto.vehicle_id,
  monitorId: dto.assistant_id,
});

export const turmaApi = {
  list: async (): Promise<Turma[]> => (await apiClient.get<TransportGroupDto[]>('/api/transport-groups')).map(toTurma),

  getById: async (id: string): Promise<Turma> => toTurma(await apiClient.get<TransportGroupDto>(`/api/transport-groups/${id}`)),

  create: async (input: { nome: string; turno?: string }): Promise<Turma> =>
    toTurma(await apiClient.post<TransportGroupDto>('/api/transport-groups', { name: input.nome, shift: input.turno })),

  update: async (id: string, input: { nome: string; turno?: string }): Promise<Turma> =>
    toTurma(await apiClient.put<TransportGroupDto>(`/api/transport-groups/${id}`, { name: input.nome, shift: input.turno })),

  assignCrew: async (id: string, input: { veiculoId?: string | null; monitorId?: string | null }): Promise<Turma> =>
    toTurma(
      await apiClient.put<TransportGroupDto>(`/api/transport-groups/${id}/crew`, {
        vehicle_id: input.veiculoId || null,
        assistant_id: input.monitorId || null,
      })
    ),

  delete: async (id: string): Promise<void> => apiClient.delete(`/api/transport-groups/${id}`),
};

interface EnrollmentDto {
  id: string;
  student_id: string;
  transport_group_id: string;
  group_name: string;
  active: boolean;
  started_at_utc: string;
  ended_at_utc?: string | null;
}

export const enrollmentApi = {
  listByStudent: (studentId: string) => apiClient.get<EnrollmentDto[]>(`/api/students/${studentId}/enrollments`),

  enroll: (studentId: string, transportGroupId: string) =>
    apiClient.post<EnrollmentDto>(`/api/students/${studentId}/enrollments`, { transport_group_id: transportGroupId }),

  end: (enrollmentId: string) => apiClient.delete(`/api/enrollments/${enrollmentId}`),
};

export interface ActiveEnrollment {
  studentId: string;
  transportGroupId: string;
}

/**
 * Matrículas ativas de um conjunto de alunos, numa única leva. Não existe
 * endpoint que já cruze aluno×turma, então cada chamador busca uma vez e
 * deriva turma-a-turma localmente (em vez de refazer a busca por turma).
 */
export const fetchActiveEnrollments = async (students: Student[]): Promise<ActiveEnrollment[]> => {
  const perStudent = await Promise.all(students.map(s => enrollmentApi.listByStudent(s.id)));
  return perStudent.flatMap((enrollments, i) =>
    enrollments.filter(e => e.active).map(e => ({ studentId: students[i].id, transportGroupId: e.transport_group_id }))
  );
};

export const studentsInGroup = (
  groupId: string,
  allStudents: Student[],
  activeEnrollments: ActiveEnrollment[]
): Student[] => {
  const ids = new Set(activeEnrollments.filter(e => e.transportGroupId === groupId).map(e => e.studentId));
  return allStudents.filter(s => ids.has(s.id));
};

interface StudentDto {
  id: string;
  name: string;
  birth_date: string;
  grade?: string | null;
  school_id?: string | null;
  has_login: boolean;
}

const toStudent = (dto: StudentDto): Student => ({
  id: dto.id,
  nome: dto.name,
  dataNascimento: dto.birth_date,
  serie: dto.grade,
  escolaId: dto.school_id,
  temLogin: dto.has_login,
});

export const studentApi = {
  list: async (): Promise<Student[]> => (await apiClient.get<StudentDto[]>('/api/students')).map(toStudent),

  getById: async (id: string): Promise<Student> => toStudent(await apiClient.get<StudentDto>(`/api/students/${id}`)),

  create: async (input: { nome: string; dataNascimento: string; serie?: string; escolaId?: string }): Promise<Student> =>
    toStudent(
      await apiClient.post<StudentDto>('/api/students', {
        name: input.nome,
        birth_date: input.dataNascimento,
        grade: input.serie || null,
        school_id: input.escolaId || null,
      })
    ),

  update: async (id: string, input: { nome: string; dataNascimento: string; serie?: string; escolaId?: string }): Promise<Student> =>
    toStudent(
      await apiClient.put<StudentDto>(`/api/students/${id}`, {
        name: input.nome,
        birth_date: input.dataNascimento,
        grade: input.serie || null,
        school_id: input.escolaId || null,
      })
    ),

  delete: async (id: string): Promise<void> => apiClient.delete(`/api/students/${id}`),

  createLogin: async (id: string, email: string, password: string): Promise<Student> =>
    toStudent(await apiClient.post<StudentDto>(`/api/students/${id}/login`, { email, password })),
};

interface GuardianDto {
  id: string;
  name: string;
  email: string;
  user_account_id: string;
  contact: { phone?: string | null; mobile?: string | null; whatsapp?: string | null; contact_email?: string | null };
  address: Record<string, unknown>;
}

const toGuardian = (dto: GuardianDto): Guardian => ({
  id: dto.id,
  nome: dto.name,
  email: dto.email,
  telefone: dto.contact?.phone,
  celular: dto.contact?.mobile,
});

export const guardianApi = {
  list: async (): Promise<Guardian[]> => (await apiClient.get<GuardianDto[]>('/api/guardians')).map(toGuardian),

  create: async (input: { nome: string; email: string; password: string; celular?: string }): Promise<Guardian> =>
    toGuardian(
      await apiClient.post<GuardianDto>('/api/guardians', {
        name: input.nome,
        email: input.email,
        password: input.password,
        contact: { mobile: input.celular || null },
      })
    ),
};

interface GuardianStudentDto {
  id: string;
  guardian_id: string;
  student_id: string;
  relationship: RelationshipType;
  is_primary: boolean;
  can_pickup: boolean;
  active: boolean;
}

const toLink = (dto: GuardianStudentDto): GuardianStudentLink => ({
  id: dto.id,
  guardianId: dto.guardian_id,
  studentId: dto.student_id,
  relationship: dto.relationship,
  isPrimary: dto.is_primary,
  canPickup: dto.can_pickup,
  active: dto.active,
});

export const guardianStudentApi = {
  listByStudent: async (studentId: string): Promise<GuardianStudentLink[]> =>
    (await apiClient.get<GuardianStudentDto[]>(`/api/students/${studentId}/guardians`)).map(toLink),

  link: async (
    studentId: string,
    input: { guardianId: string; relationship: RelationshipType; isPrimary: boolean; canPickup: boolean }
  ): Promise<GuardianStudentLink> =>
    toLink(
      await apiClient.post<GuardianStudentDto>(`/api/students/${studentId}/guardians`, {
        guardian_id: input.guardianId,
        relationship: input.relationship,
        is_primary: input.isPrimary,
        can_pickup: input.canPickup,
      })
    ),

  update: async (
    id: string,
    input: { relationship: RelationshipType; isPrimary: boolean; canPickup: boolean }
  ): Promise<GuardianStudentLink> =>
    toLink(
      await apiClient.put<GuardianStudentDto>(`/api/guardian-students/${id}`, {
        relationship: input.relationship,
        is_primary: input.isPrimary,
        can_pickup: input.canPickup,
      })
    ),

  end: async (id: string): Promise<void> => apiClient.delete(`/api/guardian-students/${id}`),
};

interface VehicleDto {
  id: string;
  plate: string;
  model?: string | null;
  capacity?: number | null;
}

export const vehicleApi = {
  list: async (): Promise<Vehicle[]> =>
    (await apiClient.get<VehicleDto[]>('/api/vehicles')).map(v => ({
      id: v.id,
      placa: v.plate,
      modelo: v.model,
      capacidade: v.capacity,
    })),
};

interface SchoolDto {
  id: string;
  name: string;
}

export const schoolApi = {
  list: async (): Promise<School[]> => (await apiClient.get<SchoolDto[]>('/api/schools')).map(s => ({ id: s.id, nome: s.name })),
};

interface AttendanceRecordDto {
  id: string;
  student_id: string;
  student_name: string;
  status: AttendanceStatus;
  picked_up_by_guardian_id?: string | null;
  picked_up_by_guardian_name?: string | null;
  justification?: string | null;
  justified_by?: string | null;
  school_id?: string | null;
  recorded_at_utc: string;
}

interface AttendanceSessionDto {
  id: string;
  transport_group_id: string;
  transport_group_name: string;
  session_type: SessionType;
  session_date: string;
  status: 'Open' | 'Closed' | 'Canceled';
  vehicle_id?: string | null;
  assistant_id?: string | null;
  opened_at_utc?: string | null;
  closed_at_utc?: string | null;
  records: AttendanceRecordDto[];
}

const toRecord = (dto: AttendanceRecordDto): AttendanceRecord => ({
  id: dto.id,
  alunoId: dto.student_id,
  alunoNome: dto.student_name,
  status: dto.status,
  retiradoPorId: dto.picked_up_by_guardian_id,
  retiradoPorNome: dto.picked_up_by_guardian_name,
  justificativa: dto.justification,
  justificadoPor: dto.justified_by,
  escolaId: dto.school_id,
  registradoEm: dto.recorded_at_utc,
});

const toChamada = (dto: AttendanceSessionDto): Chamada => ({
  id: dto.id,
  turmaId: dto.transport_group_id,
  turmaNome: dto.transport_group_name,
  sentido: dto.session_type,
  data: dto.session_date,
  status: dto.status,
  veiculoId: dto.vehicle_id,
  monitorId: dto.assistant_id,
  abertaEm: dto.opened_at_utc,
  fechadaEm: dto.closed_at_utc,
  registros: dto.records.map(toRecord),
});

interface AttendanceSessionSummaryDto {
  id: string;
  session_date: string;
  session_type: SessionType;
  status: 'Open' | 'Closed' | 'Canceled';
}

interface StudentAttendanceStatDto {
  student_id: string;
  student_name: string;
  total_sessions: number;
  present: number;
  absent: number;
  late: number;
  picked_up_by_guardian: number;
  justified: number;
  attendance_rate: number;
}

interface TransportGroupAttendanceReportDto {
  transport_group_id: string;
  transport_group_name: string;
  from: string;
  to: string;
  total_sessions: number;
  students: StudentAttendanceStatDto[];
  average_attendance_rate: number;
}

interface StudentAttendanceHistoryItemDto {
  session_id: string;
  session_date: string;
  session_type: SessionType;
  status: AttendanceStatus;
  justification?: string | null;
}

interface StudentAttendanceHistoryDto {
  student_id: string;
  student_name: string;
  from: string;
  to: string;
  total_sessions: number;
  present: number;
  absent: number;
  late: number;
  picked_up_by_guardian: number;
  justified: number;
  attendance_rate: number;
  history: StudentAttendanceHistoryItemDto[];
}

const toHistory = (dto: StudentAttendanceHistoryDto): StudentAttendanceHistory => ({
  alunoId: dto.student_id,
  alunoNome: dto.student_name,
  from: dto.from,
  to: dto.to,
  totalAulas: dto.total_sessions,
  presencas: dto.present,
  faltas: dto.absent,
  atrasos: dto.late,
  retiradas: dto.picked_up_by_guardian,
  justificadas: dto.justified,
  percentualFrequencia: dto.attendance_rate,
  historico: dto.history.map(h => ({
    sessionId: h.session_id,
    data: h.session_date,
    sentido: h.session_type,
    status: h.status,
    justificativa: h.justification,
  })),
});

export const attendanceApi = {
  open: async (
    groupId: string,
    input: { sentido: SessionType; data: string; veiculoId?: string; monitorId?: string }
  ): Promise<Chamada> =>
    toChamada(
      await apiClient.post<AttendanceSessionDto>(`/api/transport-groups/${groupId}/attendance-sessions`, {
        session_type: input.sentido,
        session_date: input.data,
        vehicle_id: input.veiculoId || null,
        assistant_id: input.monitorId || null,
      })
    ),

  getByDate: async (groupId: string, data: string, sentido: SessionType): Promise<Chamada | null> => {
    try {
      return toChamada(
        await apiClient.get<AttendanceSessionDto>(`/api/transport-groups/${groupId}/attendance-sessions/by-date`, {
          date: data,
          type: sentido,
        })
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getById: async (id: string): Promise<Chamada> => toChamada(await apiClient.get<AttendanceSessionDto>(`/api/attendance-sessions/${id}`)),

  listByGroup: async (groupId: string, from: string, to: string): Promise<ChamadaResumo[]> =>
    (
      await apiClient.get<AttendanceSessionSummaryDto[]>(`/api/transport-groups/${groupId}/attendance-sessions`, { from, to })
    ).map(s => ({ id: s.id, data: s.session_date, sentido: s.session_type, status: s.status })),

  markRecords: async (sessionId: string, records: { alunoId: string; status: AttendanceStatus }[]): Promise<void> =>
    apiClient.put(`/api/attendance-sessions/${sessionId}/records`, {
      records: records.map(r => ({ student_id: r.alunoId, status: r.status })),
    }),

  pickup: async (sessionId: string, studentId: string, guardianId: string, justificativa?: string): Promise<void> =>
    apiClient.post(`/api/attendance-sessions/${sessionId}/records/${studentId}/pickup`, {
      guardian_id: guardianId,
      justification: justificativa || null,
    }),

  justify: async (sessionId: string, studentId: string, justificativa: string): Promise<void> =>
    apiClient.put(`/api/attendance-sessions/${sessionId}/records/${studentId}/justify`, {
      justification: justificativa,
      justified_by: null,
    }),

  close: async (sessionId: string): Promise<void> => apiClient.post(`/api/attendance-sessions/${sessionId}/close`),

  cancel: async (sessionId: string): Promise<void> => apiClient.post(`/api/attendance-sessions/${sessionId}/cancel`),

  groupReport: async (groupId: string, from: string, to: string): Promise<TurmaReport> => {
    const dto = await apiClient.get<TransportGroupAttendanceReportDto>(`/api/transport-groups/${groupId}/attendance-report`, {
      from,
      to,
    });
    return {
      turmaId: dto.transport_group_id,
      turmaNome: dto.transport_group_name,
      from: dto.from,
      to: dto.to,
      totalAulas: dto.total_sessions,
      alunos: dto.students.map(s => ({
        alunoId: s.student_id,
        alunoNome: s.student_name,
        totalAulas: s.total_sessions,
        presencas: s.present,
        faltas: s.absent,
        atrasos: s.late,
        retiradas: s.picked_up_by_guardian,
        justificadas: s.justified,
        percentualFrequencia: s.attendance_rate,
      })),
      frequenciaMedia: dto.average_attendance_rate,
    };
  },

  studentHistory: async (studentId: string, from: string, to: string): Promise<StudentAttendanceHistory> =>
    toHistory(await apiClient.get<StudentAttendanceHistoryDto>(`/api/students/${studentId}/attendance-history`, { from, to })),
};

interface CalendarDayDto {
  date: string;
  type: 'SchoolDay' | 'Holiday';
  description?: string | null;
}

const toCalendarDay = (dto: CalendarDayDto): CalendarDay => ({
  date: dto.date,
  tipo: dto.type === 'Holiday' ? 'FERIADO' : 'LETIVO',
  descricao: dto.description,
});

export const calendarApi = {
  list: async (from: string, to: string): Promise<CalendarDay[]> =>
    (await apiClient.get<CalendarDayDto[]>('/api/calendar-days', { from, to })).map(toCalendarDay),

  set: async (date: string, tipo: DayType, descricao?: string): Promise<CalendarDay> =>
    toCalendarDay(
      await apiClient.put<CalendarDayDto>('/api/calendar-days', {
        date,
        type: tipo === 'FERIADO' ? 'Holiday' : 'SchoolDay',
        description: descricao || null,
      })
    ),

  remove: async (date: string): Promise<void> => apiClient.delete(`/api/calendar-days/${date}`),
};

interface MyChildDto {
  student_id: string;
  student_name: string;
  grade?: string | null;
  relationship: RelationshipType;
  is_primary: boolean;
  can_pickup: boolean;
}

export const meApi = {
  children: async (): Promise<MeuFilho[]> =>
    (await apiClient.get<MyChildDto[]>('/api/me/children')).map(c => ({
      alunoId: c.student_id,
      alunoNome: c.student_name,
      serie: c.grade,
      relationship: c.relationship,
      isPrimary: c.is_primary,
      canPickup: c.can_pickup,
    })),

  childAttendance: async (studentId: string, from: string, to: string): Promise<StudentAttendanceHistory> =>
    toHistory(await apiClient.get<StudentAttendanceHistoryDto>(`/api/me/children/${studentId}/attendance`, { from, to })),

  myAttendance: async (from: string, to: string): Promise<StudentAttendanceHistory> =>
    toHistory(await apiClient.get<StudentAttendanceHistoryDto>('/api/me/attendance', { from, to })),
};
