import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/services/api';
import { setAuthToken } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Truck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { storage } from '@/lib/storage';
import { DOCUMENT_DIGIT_LENGTH, formatDocumentNumber, onlyDigits } from '@/lib/document';

const SESSION_KEY = 'sessao.usuario';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    documentType: 'Cpf' as 'Cpf' | 'Cnpj',
    documentNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('A senha precisa ter ao menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const { token, user } = await authApi.registerTransporter(form);
      setAuthToken(token);
      await storage.set(SESSION_KEY, { token, user });
      toast.success('Conta criada com sucesso!');
      // Recarrega para o AuthProvider reler a sessão gravada e popular o estado.
      window.location.assign('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir o cadastro');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg">
            <Truck className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Cadastro do transportador</h1>
          <p className="text-muted-foreground text-sm">
            Crie a conta que vai gerenciar suas turmas, alunos e chamadas
          </p>
        </div>

        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-xl text-center">Criar conta</CardTitle>
            <CardDescription className="text-center">Leva menos de um minuto</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Documento</Label>
                  <Select
                    value={form.documentType}
                    onValueChange={(v: 'Cpf' | 'Cnpj') =>
                      setForm({
                        ...form,
                        documentType: v,
                        documentNumber: form.documentNumber.slice(0, DOCUMENT_DIGIT_LENGTH[v]),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cpf">CPF</SelectItem>
                      <SelectItem value="Cnpj">CNPJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Número</Label>
                  <Input
                    id="documentNumber"
                    inputMode="numeric"
                    placeholder={form.documentType === 'Cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                    value={formatDocumentNumber(form.documentNumber, form.documentType)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        documentNumber: onlyDigits(e.target.value).slice(0, DOCUMENT_DIGIT_LENGTH[form.documentType]),
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-danger bg-danger-light rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full h-11 gradient-primary" disabled={isLoading}>
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Já tem conta?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Entrar
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
