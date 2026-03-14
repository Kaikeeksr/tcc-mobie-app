import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Users,
  ClipboardCheck,
  Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { turmaService, studentService } from '@/services/mockService';
import { Student } from '@/types';
import { toast } from 'sonner';

const TurmaDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const turma = turmaService.getById(id || '');
  const [students, setStudents] = useState<Student[]>(
    turma ? turmaService.getStudents(turma.id) : []
  );
  const allStudents = studentService.getAll();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [removingStudent, setRemovingStudent] = useState<Student | null>(null);

  if (!turma) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold mb-2">Turma não encontrada</h2>
        <Button asChild>
          <Link to="/profissional/turmas">Voltar para Turmas</Link>
        </Button>
      </div>
    );
  }

  const filteredStudents = students.filter(student =>
    student.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableStudents = allStudents.filter(
    s => !turma.alunoIds.includes(s.id)
  );

  const handleAddStudent = () => {
    if (!selectedStudentId) {
      toast.error('Selecione um aluno');
      return;
    }

    turmaService.addStudent(turma.id, selectedStudentId);
    setStudents(turmaService.getStudents(turma.id));
    toast.success('Aluno adicionado com sucesso!');
    setIsAddDialogOpen(false);
    setSelectedStudentId('');
  };

  const handleRemoveStudent = () => {
    if (removingStudent) {
      turmaService.removeStudent(turma.id, removingStudent.id);
      setStudents(turmaService.getStudents(turma.id));
      toast.success('Aluno removido da turma!');
      setIsRemoveDialogOpen(false);
      setRemovingStudent(null);
    }
  };

  const openRemoveDialog = (student: Student) => {
    setRemovingStudent(student);
    setIsRemoveDialogOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="flex-shrink-0 mt-0.5">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{turma.nome}</h1>
          <p className="text-muted-foreground text-sm truncate">{turma.descricao}</p>
        </div>
      </div>
      
      <Button asChild className="w-full sm:w-auto">
        <Link to={`/profissional/chamada?turma=${turma.id}`}>
          <ClipboardCheck className="w-4 h-4 mr-2" />
          Fazer Chamada
        </Link>
      </Button>

      {/* Stats */}
      <Card>
        <CardContent className="flex items-center gap-4 p-3 sm:p-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold">{students.length}</p>
            <p className="text-sm text-muted-foreground">Alunos na turma</p>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-6">
          <div>
            <CardTitle className="text-base sm:text-lg">Alunos</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Alunos matriculados nesta turma</CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Aluno
          </Button>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alunos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {searchTerm 
                ? 'Nenhum aluno encontrado com esse termo'
                : 'Nenhum aluno nesta turma. Adicione alunos para começar.'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <div 
                  key={student.id}
                  className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors gap-2"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-medium text-primary text-sm">
                        {student.nome.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{student.nome}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        Resp: {student.responsavelNome}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 h-8 w-8"
                    onClick={() => openRemoveDialog(student)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Aluno</DialogTitle>
            <DialogDescription>
              Selecione um aluno para adicionar à turma
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="student">Aluno</Label>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecione um aluno" />
              </SelectTrigger>
              <SelectContent>
                {availableStudents.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Todos os alunos já estão nesta turma
                  </div>
                ) : (
                  availableStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.nome}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddStudent} disabled={!selectedStudentId}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Student Confirmation */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover aluno da turma</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover "{removingStudent?.nome}" desta turma?
              O aluno não será excluído do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveStudent}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TurmaDetails;
