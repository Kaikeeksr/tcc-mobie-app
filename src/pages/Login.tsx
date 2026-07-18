import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Login realizado com sucesso!');
        // Navigate based on user type - the ProtectedRoute will handle redirection
        navigate('/', { replace: true });
      } else {
        setError('Email ou senha inválidos');
      }
    } catch {
      setError('Erro ao realizar login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginAs = async (userEmail: string) => {
    setEmail(userEmail);
    setPassword('123456');
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(userEmail, '123456');
      if (success) {
        toast.success('Login realizado com sucesso!');
        navigate('/', { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg">
            <Users className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Chamada</h1>
          <p className="text-muted-foreground">Sistema de Gestão de Presença</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-card border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-danger bg-danger-light rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 gradient-primary hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            {/* Quick Login for Demo */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Acesso rápido para demonstração:
              </p>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => loginAs('carlos@escola.com')}
                  disabled={isLoading}
                  className="h-auto py-3 flex flex-col items-center gap-1"
                >
                  <span className="font-medium text-xs">Profissional</span>
                  <span className="text-[10px] text-muted-foreground">carlos@escola.com</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => loginAs('maria@email.com')}
                  disabled={isLoading}
                  className="h-auto py-3 flex flex-col items-center gap-1"
                >
                  <span className="font-medium text-xs">Responsável</span>
                  <span className="text-[10px] text-muted-foreground">maria@email.com</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => loginAs('pedro@aluno.com')}
                  disabled={isLoading}
                  className="h-auto py-3 flex flex-col items-center gap-1"
                >
                  <span className="font-medium text-xs">Aluno</span>
                  <span className="text-[10px] text-muted-foreground">pedro@aluno.com</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Dados mockados para demonstração
        </p>
      </div>
    </div>
  );
};

export default Login;
