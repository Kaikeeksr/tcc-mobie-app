import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  TrendingUp,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { turmaService, chamadaService, reportService } from '@/services/mockService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ProfessionalDashboard = () => {
  const { user } = useAuth();
  const turmas = turmaService.getAll();
  const chamadas = chamadaService.getAll();
  const generalReport = reportService.getGeneralReport();

  const today = format(new Date(), 'yyyy-MM-dd');
  const chamadasHoje = chamadas.filter(c => c.data === today);
  const pendentesHoje = turmas.length - chamadasHoje.length;

  const stats = [
    {
      title: 'Turmas',
      value: turmas.length,
      icon: BookOpen,
      color: 'bg-primary/10 text-primary',
      link: '/profissional/turmas',
    },
    {
      title: 'Alunos',
      value: new Set(turmas.flatMap(t => t.alunoIds)).size,
      icon: Users,
      color: 'bg-info/10 text-info',
      link: '/profissional/alunos',
    },
    {
      title: 'Chamadas Hoje',
      value: `${chamadasHoje.length}/${turmas.length}`,
      icon: ClipboardCheck,
      color: pendentesHoje > 0 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success',
      link: '/profissional/chamada',
    },
    {
      title: 'Freq. Média',
      value: `${generalReport.frequenciaMediaGeral}%`,
      icon: TrendingUp,
      color: 'bg-success/10 text-success',
      link: '/profissional/relatorios',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        {/* No celular a saudacao ja e o titulo grande do Layout. */}
        <h1 className="hidden lg:block text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
          Olá, {user?.nome.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground lg:mt-1 text-sm sm:text-base">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((stat) => (
          <Link key={stat.title} to={stat.link}>
            {/* Icone ao lado do numero, e nao acima: corta quase metade da altura
                do bloco de indicadores, que no celular competia com o conteudo. */}
            <Card className="h-full transition-transform active:scale-[0.98] lg:transition-shadow lg:hover:shadow-md">
              <CardContent className="flex items-center gap-3 p-3 sm:p-4 lg:flex-col lg:items-start lg:gap-0 lg:p-6">
                <div
                  className={`w-10 h-10 rounded-lg ${stat.color} flex flex-shrink-0 items-center justify-center lg:mb-3`}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">{stat.value}</p>
                  {/* Quebra em duas linhas em vez de truncar: "Chamadas Hoje" nao
                      cabe em uma linha ao lado do icone numa tela de 320px. */}
                  <p className="text-xs sm:text-sm text-muted-foreground leading-tight">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Recent Classes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6">
            <div>
              <CardTitle className="text-base sm:text-lg">Turmas Recentes</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Suas turmas ativas</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm">
              <Link to="/profissional/turmas">
                Ver todas <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 p-3 pt-0 sm:p-6 sm:pt-0">
            {turmas.slice(0, 3).map((turma) => (
              <div 
                key={turma.id} 
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors gap-2"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate">{turma.nome}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {turma.alunoIds.length} alunos
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild className="flex-shrink-0 text-xs sm:text-sm h-8 sm:h-9">
                  <Link to={`/profissional/chamada?turma=${turma.id}`}>
                    <ClipboardCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden xs:inline">Chamada</span>
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Ações Rápidas</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Acesso rápido às funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 sm:gap-3 p-3 pt-0 sm:p-6 sm:pt-0">
            <Button variant="outline" className="h-auto py-3 sm:py-4 flex-col gap-1.5 sm:gap-2" asChild>
              <Link to="/profissional/chamada">
                <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span className="text-xs sm:text-sm">Nova Chamada</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-3 sm:py-4 flex-col gap-1.5 sm:gap-2" asChild>
              <Link to="/profissional/turmas">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span className="text-xs sm:text-sm">Nova Turma</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-3 sm:py-4 flex-col gap-1.5 sm:gap-2" asChild>
              <Link to="/profissional/calendario">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span className="text-xs sm:text-sm">Calendário</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-3 sm:py-4 flex-col gap-1.5 sm:gap-2" asChild>
              <Link to="/profissional/relatorios">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span className="text-xs sm:text-sm">Relatórios</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pending Attendance Alert */}
      {pendentesHoje > 0 && (
        <Card className="border-warning bg-warning-light">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
                <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base text-foreground">
                  {pendentesHoje} {pendentesHoje === 1 ? 'chamada pendente' : 'chamadas pendentes'} hoje
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Clique para realizar as chamadas
                </p>
              </div>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/profissional/chamada">
                Realizar Chamada
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfessionalDashboard;
