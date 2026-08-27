import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  GraduationCap,
  UserPlus,
  Star,
  Car,
  KeyRound,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { studentApi, guardianApi, guardianStudentApi } from '@/services/api';
import { Guardian, GuardianStudentLink, RelationshipType, Student } from '@/types';
import { toast } from 'sonner';

const RELATIONSHIP_LABEL: Record<RelationshipType, string> = {
  Father: 'Pai',
  Mother: 'Mãe',
  Grandparent: 'Avô/Avó',
  LegalGuardian: 'Responsável legal',
  Other: 'Outro',
};

const Alunos = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ nome: '', dataNascimento: '', serie: '' });
  const [isSaving, setIsSaving] = useState(false);

  const [guardianDialogStudent, setGuardianDialogStudent] = useState<Student | null>(null);
  const [loginDialogStudent, setLoginDialogStudent] = useState<Student | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      setStudents(await studentApi.list());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar alunos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filteredStudents = students.filter(student =>
    student.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({ nome: student.nome, dataNascimento: student.dataNascimento, serie: student.serie || '' });
    } else {
      setEditingStudent(null);
      setFormData({ nome: '', dataNascimento: '', serie: '' });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStudent(null);
    setFormData({ nome: '', dataNascimento: '', serie: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.dataNascimento) {
      toast.error('Nome e data de nascimento são obrigatórios');
      return;
    }

    setIsSaving(true);
    try {
      if (editingStudent) {
        await studentApi.update(editingStudent.id, formData);
        toast.success('Aluno atualizado com sucesso!');
      } else {
        await studentApi.create(formData);
        toast.success('Aluno criado com sucesso!');
      }
      await load();
      handleCloseDialog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar aluno');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    try {
      await studentApi.delete(deletingStudent.id);
      toast.success('Aluno removido com sucesso!');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao remover aluno');
    } finally {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="hidden lg:block text-2xl lg:text-3xl font-bold">Alunos</h1>
          <p className="text-muted-foreground text-sm">Gerencie todos os alunos cadastrados</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gradient-primary w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Aluno
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar alunos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground py-12">Carregando...</p>
      ) : filteredStudents.length === 0 ? (
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
          {filteredStudents.map((student) => (
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
                    {student.serie && (
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{student.serie}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Responsáveis"
                    onClick={() => setGuardianDialogStudent(student)}
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
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
                      {!student.temLogin && (
                        <DropdownMenuItem onClick={() => setLoginDialogStudent(student)}>
                          <KeyRound className="w-4 h-4 mr-2" />
                          Criar login
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(student)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serie">Série (opcional)</Label>
                <Input
                  id="serie"
                  placeholder="Ex: 3°A"
                  value={formData.serie}
                  onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {editingStudent ? 'Salvar' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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

      {guardianDialogStudent && (
        <GuardianLinksDialog
          student={guardianDialogStudent}
          onClose={() => setGuardianDialogStudent(null)}
        />
      )}

      {loginDialogStudent && (
        <StudentLoginDialog
          student={loginDialogStudent}
          onClose={() => setLoginDialogStudent(null)}
          onCreated={() => {
            setLoginDialogStudent(null);
            void load();
          }}
        />
      )}
    </div>
  );
};

/** Cria o login opcional do aluno, para ele acompanhar a própria frequência no app. */
const StudentLoginDialog = ({
  student,
  onClose,
  onCreated,
}: {
  student: Student;
  onClose: () => void;
  onCreated: () => void;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if (!email.trim() || password.length < 8) {
      toast.error('Informe um e-mail e uma senha com ao menos 8 caracteres');
      return;
    }
    setIsSaving(true);
    try {
      await studentApi.createLogin(student.id, email, password);
      toast.success('Login criado! O aluno já pode entrar no app.');
      onCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar login');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar login de {student.nome}</DialogTitle>
          <DialogDescription>
            O aluno poderá entrar no app para acompanhar a própria frequência.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="student-login-email">E-mail</Label>
            <Input id="student-login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student-login-password">Senha</Label>
            <Input
              id="student-login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={isSaving}>Criar login</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** Gerencia os responsáveis vinculados a um aluno: quem pode retirar, quem é o contato principal. */
const GuardianLinksDialog = ({ student, onClose }: { student: Student; onClose: () => void }) => {
  const [links, setLinks] = useState<GuardianStudentLink[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newGuardian, setNewGuardian] = useState({
    mode: 'existing' as 'existing' | 'new',
    guardianId: '',
    nome: '',
    email: '',
    password: '',
    relationship: 'Mother' as RelationshipType,
    isPrimary: false,
    canPickup: true,
  });

  const load = async () => {
    setIsLoading(true);
    try {
      const [linksData, guardiansData] = await Promise.all([
        guardianStudentApi.listByStudent(student.id),
        guardianApi.list(),
      ]);
      setLinks(linksData);
      setGuardians(guardiansData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar responsáveis');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student.id]);

  const guardianName = (guardianId: string) => guardians.find(g => g.id === guardianId)?.nome ?? guardianId;

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      let guardianId = newGuardian.guardianId;

      if (newGuardian.mode === 'new') {
        if (!newGuardian.nome.trim() || !newGuardian.email.trim() || newGuardian.password.length < 8) {
          toast.error('Preencha nome, e-mail e uma senha com ao menos 8 caracteres');
          setIsAdding(false);
          return;
        }
        const created = await guardianApi.create({
          nome: newGuardian.nome,
          email: newGuardian.email,
          password: newGuardian.password,
        });
        guardianId = created.id;
      }

      if (!guardianId) {
        toast.error('Selecione um responsável');
        setIsAdding(false);
        return;
      }

      await guardianStudentApi.link(student.id, {
        guardianId,
        relationship: newGuardian.relationship,
        isPrimary: newGuardian.isPrimary,
        canPickup: newGuardian.canPickup,
      });

      toast.success('Responsável vinculado com sucesso!');
      setNewGuardian({
        mode: 'existing',
        guardianId: '',
        nome: '',
        email: '',
        password: '',
        relationship: 'Mother',
        isPrimary: false,
        canPickup: true,
      });
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao vincular responsável');
    } finally {
      setIsAdding(false);
    }
  };

  const handleTogglePickup = async (link: GuardianStudentLink) => {
    try {
      await guardianStudentApi.update(link.id, {
        relationship: link.relationship,
        isPrimary: link.isPrimary,
        canPickup: !link.canPickup,
      });
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar vínculo');
    }
  };

  const handleUnlink = async (link: GuardianStudentLink) => {
    try {
      await guardianStudentApi.end(link.id);
      toast.success('Vínculo encerrado');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao encerrar vínculo');
    }
  };

  const availableGuardians = guardians.filter(g => !links.some(l => l.guardianId === g.id && l.active));

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Responsáveis de {student.nome}</DialogTitle>
          <DialogDescription>
            Quem pode retirar o aluno direto na escola precisa estar marcado aqui.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-4">Carregando...</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {links.filter(l => l.active).length === 0 && (
              <p className="text-sm text-muted-foreground py-2">Nenhum responsável vinculado ainda.</p>
            )}
            {links.filter(l => l.active).map(link => (
              <div key={link.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate flex items-center gap-1">
                    {guardianName(link.guardianId)}
                    {link.isPrimary && <Star className="w-3 h-3 text-warning fill-warning" />}
                  </p>
                  <p className="text-xs text-muted-foreground">{RELATIONSHIP_LABEL[link.relationship]}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    type="button"
                    variant={link.canPickup ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 gap-1 text-xs px-2"
                    onClick={() => handleTogglePickup(link)}
                    title="Pode retirar o aluno na escola"
                  >
                    <Car className="w-3.5 h-3.5" />
                    {link.canPickup ? 'Pode retirar' : 'Não retira'}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleUnlink(link)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-4 space-y-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={newGuardian.mode === 'existing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNewGuardian({ ...newGuardian, mode: 'existing' })}
            >
              Vincular existente
            </Button>
            <Button
              type="button"
              variant={newGuardian.mode === 'new' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNewGuardian({ ...newGuardian, mode: 'new' })}
            >
              Cadastrar novo
            </Button>
          </div>

          {newGuardian.mode === 'existing' ? (
            <Select value={newGuardian.guardianId} onValueChange={(v) => setNewGuardian({ ...newGuardian, guardianId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                {availableGuardians.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">Nenhum responsável disponível</div>
                ) : (
                  availableGuardians.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.nome} ({g.email})</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Nome"
                value={newGuardian.nome}
                onChange={(e) => setNewGuardian({ ...newGuardian, nome: e.target.value })}
                className="col-span-2"
              />
              <Input
                placeholder="E-mail"
                type="email"
                value={newGuardian.email}
                onChange={(e) => setNewGuardian({ ...newGuardian, email: e.target.value })}
                className="col-span-2"
              />
              <Input
                placeholder="Senha (mín. 8 caracteres)"
                type="password"
                value={newGuardian.password}
                onChange={(e) => setNewGuardian({ ...newGuardian, password: e.target.value })}
                className="col-span-2"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Select
              value={newGuardian.relationship}
              onValueChange={(v: RelationshipType) => setNewGuardian({ ...newGuardian, relationship: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(RELATIONSHIP_LABEL) as RelationshipType[]).map(rel => (
                  <SelectItem key={rel} value={rel}>{RELATIONSHIP_LABEL[rel]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant={newGuardian.canPickup ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNewGuardian({ ...newGuardian, canPickup: !newGuardian.canPickup })}
            >
              <Car className="w-3.5 h-3.5 mr-1.5" />
              {newGuardian.canPickup ? 'Pode retirar' : 'Não retira'}
            </Button>
          </div>
          <Button
            type="button"
            variant={newGuardian.isPrimary ? 'default' : 'outline'}
            size="sm"
            className="w-full"
            onClick={() => setNewGuardian({ ...newGuardian, isPrimary: !newGuardian.isPrimary })}
          >
            <Star className="w-3.5 h-3.5 mr-1.5" />
            {newGuardian.isPrimary ? 'Contato principal' : 'Marcar como contato principal'}
          </Button>

          <Button onClick={handleAdd} disabled={isAdding} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Vincular responsável
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Alunos;
