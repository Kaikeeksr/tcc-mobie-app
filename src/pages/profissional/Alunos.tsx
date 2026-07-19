import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Badge } from '@/components/ui/badge';
import { studentService, turmaService } from '@/services/mockService';
import { Student } from '@/types';
import { toast } from 'sonner';

const Alunos = () => {
  const [students, setStudents] = useState<Student[]>(studentService.getAll());
  const turmas = turmaService.getAll();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ 
    nome: '', 
    responsavelNome: '',
    responsavelId: ''
  });

  const filteredStudents = students.filter(student =>
    student.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.responsavelNome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTurmasForStudent = (student: Student) => {
    return turmas.filter(t => student.turmaIds.includes(t.id));
  };

  const handleOpenDialog = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({ 
        nome: student.nome, 
        responsavelNome: student.responsavelNome,
        responsavelId: student.responsavelId
      });
    } else {
      setEditingStudent(null);
      setFormData({ nome: '', responsavelNome: '', responsavelId: '' });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStudent(null);
    setFormData({ nome: '', responsavelNome: '', responsavelId: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error('Nome do aluno é obrigatório');
      return;
    }

    if (editingStudent) {
      studentService.update(editingStudent.id, {
        nome: formData.nome,
        responsavelNome: formData.responsavelNome,
      });
      toast.success('Aluno atualizado com sucesso!');
    } else {
      studentService.create({
        nome: formData.nome,
        responsavelNome: formData.responsavelNome,
        responsavelId: `resp-${Date.now()}`,
      });
      toast.success('Aluno criado com sucesso!');
    }

    setStudents(studentService.getAll());
    handleCloseDialog();
  };

  const handleDelete = () => {
    if (deletingStudent) {
      studentService.delete(deletingStudent.id);
      setStudents(studentService.getAll());
      toast.success('Aluno removido com sucesso!');
      setIsDeleteDialogOpen(false);
      setDeletingStudent(null);
    }
  };

  const openDeleteDialog = (student: Student) => {
    setDeletingStudent(student);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          {/* No celular o titulo ja vem no cabecalho fixo do Layout. */}
          <h1 className="hidden lg:block text-2xl lg:text-3xl font-bold">Alunos</h1>
          <p className="text-muted-foreground text-sm">Gerencie todos os alunos cadastrados</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gradient-primary w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Aluno
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar alunos ou responsáveis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum aluno encontrado</h3>
            <p className="text-muted-foreground text-center text-sm mb-4">
              {searchTerm 
                ? 'Tente buscar por outro termo' 
                : 'Cadastre seu primeiro aluno para começar'}
            </p>
            {!searchTerm && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Aluno
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2 sm:gap-4">
          {filteredStudents.map((student) => {
            const studentTurmas = getTurmasForStudent(student);
            return (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-3 sm:p-4 gap-2">
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-semibold text-primary text-sm sm:text-lg">
                        {student.nome.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{student.nome}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        Resp: {student.responsavelNome}
                      </p>
                      {studentTurmas.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {studentTurmas.map((turma) => (
                            <Badge key={turma.id} variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0">
                              {turma.nome}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(student)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(student)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? 'Editar Aluno' : 'Novo Aluno'}
            </DialogTitle>
            <DialogDescription>
              {editingStudent 
                ? 'Atualize as informações do aluno' 
                : 'Preencha os dados para cadastrar um novo aluno'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Aluno</Label>
                <Input
                  id="nome"
                  placeholder="Ex: João Silva"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsavel">Nome do Responsável</Label>
                <Input
                  id="responsavel"
                  placeholder="Ex: Maria Silva"
                  value={formData.responsavelNome}
                  onChange={(e) => setFormData({ ...formData, responsavelNome: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingStudent ? 'Salvar' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o aluno "{deletingStudent?.nome}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
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

export default Alunos;
