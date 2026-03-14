import { User, Student, Turma, CalendarDay, Chamada } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'prof-1',
    nome: 'Carlos Silva',
    email: 'carlos@escola.com',
    tipoUsuario: 'PROFISSIONAL',
    avatar: undefined,
  },
  {
    id: 'resp-1',
    nome: 'Maria Santos',
    email: 'maria@email.com',
    tipoUsuario: 'RESPONSAVEL',
    avatar: undefined,
  },
  {
    id: 'resp-2',
    nome: 'João Oliveira',
    email: 'joao@email.com',
    tipoUsuario: 'RESPONSAVEL',
    avatar: undefined,
  },
  {
    id: 'aluno-1',
    nome: 'Pedro Santos',
    email: 'pedro@aluno.com',
    tipoUsuario: 'ALUNO',
    alunoId: 'aluno-1',
    avatar: undefined,
  },
  {
    id: 'aluno-3',
    nome: 'Lucas Oliveira',
    email: 'lucas@aluno.com',
    tipoUsuario: 'ALUNO',
    alunoId: 'aluno-3',
    avatar: undefined,
  },
];

// Mock Students
export const mockStudents: Student[] = [
  {
    id: 'aluno-1',
    nome: 'Pedro Santos',
    responsavelId: 'resp-1',
    responsavelNome: 'Maria Santos',
    turmaIds: ['turma-1', 'turma-2'],
  },
  {
    id: 'aluno-2',
    nome: 'Ana Santos',
    responsavelId: 'resp-1',
    responsavelNome: 'Maria Santos',
    turmaIds: ['turma-1'],
  },
  {
    id: 'aluno-3',
    nome: 'Lucas Oliveira',
    responsavelId: 'resp-2',
    responsavelNome: 'João Oliveira',
    turmaIds: ['turma-1', 'turma-3'],
  },
  {
    id: 'aluno-4',
    nome: 'Julia Ferreira',
    responsavelId: 'resp-3',
    responsavelNome: 'Roberto Ferreira',
    turmaIds: ['turma-2'],
  },
  {
    id: 'aluno-5',
    nome: 'Gabriel Costa',
    responsavelId: 'resp-4',
    responsavelNome: 'Fernanda Costa',
    turmaIds: ['turma-1', 'turma-2', 'turma-3'],
  },
  {
    id: 'aluno-6',
    nome: 'Isabela Lima',
    responsavelId: 'resp-5',
    responsavelNome: 'Patricia Lima',
    turmaIds: ['turma-3'],
  },
  {
    id: 'aluno-7',
    nome: 'Matheus Alves',
    responsavelId: 'resp-6',
    responsavelNome: 'Ricardo Alves',
    turmaIds: ['turma-2', 'turma-3'],
  },
  {
    id: 'aluno-8',
    nome: 'Sophia Rodrigues',
    responsavelId: 'resp-7',
    responsavelNome: 'Amanda Rodrigues',
    turmaIds: ['turma-1'],
  },
];

// Mock Classes (Turmas)
export const mockTurmas: Turma[] = [
  {
    id: 'turma-1',
    nome: 'Futebol Sub-12',
    descricao: 'Categoria sub-12 de futebol masculino e feminino',
    alunoIds: ['aluno-1', 'aluno-2', 'aluno-3', 'aluno-5', 'aluno-8'],
    criadoPor: 'prof-1',
    criadoEm: new Date('2024-01-15'),
  },
  {
    id: 'turma-2',
    nome: 'Natação Iniciante',
    descricao: 'Turma de natação para iniciantes - manhã',
    alunoIds: ['aluno-1', 'aluno-4', 'aluno-5', 'aluno-7'],
    criadoPor: 'prof-1',
    criadoEm: new Date('2024-02-01'),
  },
  {
    id: 'turma-3',
    nome: 'Transporte Escolar - Rota A',
    descricao: 'Rota da manhã - Bairro Centro até Escola Municipal',
    alunoIds: ['aluno-3', 'aluno-5', 'aluno-6', 'aluno-7'],
    criadoPor: 'prof-1',
    criadoEm: new Date('2024-01-10'),
  },
];

// Mock Calendar (Holidays for current month and surroundings)
const generateCalendarDays = (): CalendarDay[] => {
  const holidays: CalendarDay[] = [
    { date: '2025-01-01', tipo: 'FERIADO', descricao: 'Ano Novo' },
    { date: '2025-01-25', tipo: 'FERIADO', descricao: 'Aniversário da Cidade' },
    { date: '2025-02-03', tipo: 'FERIADO', descricao: 'Carnaval' },
    { date: '2025-02-04', tipo: 'FERIADO', descricao: 'Carnaval' },
    { date: '2025-02-05', tipo: 'FERIADO', descricao: 'Quarta-feira de Cinzas' },
    { date: '2025-03-01', tipo: 'FERIADO', descricao: 'Recesso' },
    { date: '2025-04-18', tipo: 'FERIADO', descricao: 'Sexta-feira Santa' },
    { date: '2025-04-21', tipo: 'FERIADO', descricao: 'Tiradentes' },
    { date: '2025-05-01', tipo: 'FERIADO', descricao: 'Dia do Trabalho' },
  ];
  return holidays;
};

export const mockCalendarDays: CalendarDay[] = generateCalendarDays();

// Mock Attendance Records
export const mockChamadas: Chamada[] = [
  {
    id: 'chamada-1',
    turmaId: 'turma-1',
    data: '2025-01-27',
    registros: [
      { alunoId: 'aluno-1', status: 'PRESENTE' },
      { alunoId: 'aluno-2', status: 'PRESENTE' },
      { alunoId: 'aluno-3', status: 'FALTA' },
      { alunoId: 'aluno-5', status: 'PRESENTE' },
      { alunoId: 'aluno-8', status: 'PRESENTE' },
    ],
    criadoPor: 'prof-1',
    criadoEm: new Date('2025-01-27T08:00:00'),
  },
  {
    id: 'chamada-2',
    turmaId: 'turma-1',
    data: '2025-01-24',
    registros: [
      { alunoId: 'aluno-1', status: 'PRESENTE' },
      { alunoId: 'aluno-2', status: 'FALTA' },
      { alunoId: 'aluno-3', status: 'PRESENTE' },
      { alunoId: 'aluno-5', status: 'PRESENTE' },
      { alunoId: 'aluno-8', status: 'PRESENTE' },
    ],
    criadoPor: 'prof-1',
    criadoEm: new Date('2025-01-24T08:00:00'),
  },
  {
    id: 'chamada-3',
    turmaId: 'turma-1',
    data: '2025-01-22',
    registros: [
      { alunoId: 'aluno-1', status: 'PRESENTE' },
      { alunoId: 'aluno-2', status: 'PRESENTE' },
      { alunoId: 'aluno-3', status: 'PRESENTE' },
      { alunoId: 'aluno-5', status: 'FALTA' },
      { alunoId: 'aluno-8', status: 'PRESENTE' },
    ],
    criadoPor: 'prof-1',
    criadoEm: new Date('2025-01-22T08:00:00'),
  },
  {
    id: 'chamada-4',
    turmaId: 'turma-2',
    data: '2025-01-27',
    registros: [
      { alunoId: 'aluno-1', status: 'PRESENTE' },
      { alunoId: 'aluno-4', status: 'PRESENTE' },
      { alunoId: 'aluno-5', status: 'PRESENTE' },
      { alunoId: 'aluno-7', status: 'FALTA' },
    ],
    criadoPor: 'prof-1',
    criadoEm: new Date('2025-01-27T10:00:00'),
  },
  {
    id: 'chamada-5',
    turmaId: 'turma-2',
    data: '2025-01-24',
    registros: [
      { alunoId: 'aluno-1', status: 'FALTA' },
      { alunoId: 'aluno-4', status: 'PRESENTE' },
      { alunoId: 'aluno-5', status: 'PRESENTE' },
      { alunoId: 'aluno-7', status: 'PRESENTE' },
    ],
    criadoPor: 'prof-1',
    criadoEm: new Date('2025-01-24T10:00:00'),
  },
  {
    id: 'chamada-6',
    turmaId: 'turma-3',
    data: '2025-01-28',
    registros: [
      { alunoId: 'aluno-3', status: 'PRESENTE' },
      { alunoId: 'aluno-5', status: 'PRESENTE' },
      { alunoId: 'aluno-6', status: 'PRESENTE' },
      { alunoId: 'aluno-7', status: 'PRESENTE' },
    ],
    criadoPor: 'prof-1',
    criadoEm: new Date('2025-01-28T07:00:00'),
  },
];
