import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Users,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { turmaService } from '@/services/mockService';
import { Turma } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const Turmas = () => {
  const { user } = useAuth();
  const [turmas, setTurmas] = useState<Turma[]>(turmaService.getAll());
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [deletingTurma, setDeletingTurma] = useState<Turma | null>(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '' });

  const filteredTurmas = turmas.filter(turma =>
    turma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (turma?: Turma) => {
    if (turma) {
      setEditingTurma(turma);
      setFormData({ nome: turma.nome, descricao: turma.descricao });
    } else {
      setEditingTurma(null);
      setFormData({ nome: '', descricao: '' });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTurma(null);
    setFormData({ nome: '', descricao: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error('Nome da turma é obrigatório');
      return;
    }

    if (editingTurma) {
      turmaService.update(editingTurma.id, formData);
      toast.success('Turma atualizada com sucesso!');
    } else {
      turmaService.create({
        ...formData,
        criadoPor: user?.id || '',
      });
      toast.success('Turma criada com sucesso!');
    }

    setTurmas(turmaService.getAll());
    handleCloseDialog();
  };

  const handleDelete = () => {
    if (deletingTurma) {
      turmaService.delete(deletingTurma.id);
      setTurmas(turmaService.getAll());
      toast.success('Turma removida com sucesso!');
      setIsDeleteDialogOpen(false);
      setDeletingTurma(null);
    }
  };

  const openDeleteDialog = (turma: Turma) => {
    setDeletingTurma(turma);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* No celular o titulo ja vem no cabecalho fixo do Layout. */}
          <h1 className="hidden lg:block text-2xl lg:text-3xl font-bold">Turmas</h1>
          <p className="text-muted-foreground">Gerencie suas turmas e alunos</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Nova Turma
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar turmas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Turmas Grid */}
      {filteredTurmas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma turma encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm 
                ? 'Tente buscar por outro termo' 
                : 'Crie sua primeira turma para começar'}
            </p>
            {!searchTerm && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Turma
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTurmas.map((turma) => (
            <Card key={turma.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{turma.nome}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {turma.descricao}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(turma)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(turma)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{turma.alunoIds.length} alunos</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/profissional/turmas/${turma.id}`}>
                      Ver detalhes
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTurma ? 'Editar Turma' : 'Nova Turma'}
            </DialogTitle>
            <DialogDescription>
              {editingTurma 
                ? 'Atualize as informações da turma' 
                : 'Preencha os dados para criar uma nova turma'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Turma</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Futebol Sub-12"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva a turma..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingTurma ? 'Salvar' : 'Criar'}
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
              Tem certeza que deseja remover a turma "{deletingTurma?.nome}"? 
              Esta ação não pode ser desfeita e todos os dados associados serão perdidos.
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

export default Turmas;
