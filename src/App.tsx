import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

// Pages
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

// Profissional Pages
import ProfessionalDashboard from "@/pages/profissional/Dashboard";
import Turmas from "@/pages/profissional/Turmas";
import TurmaDetails from "@/pages/profissional/TurmaDetails";
import Alunos from "@/pages/profissional/Alunos";
import Calendario from "@/pages/profissional/Calendario";
import Chamada from "@/pages/profissional/Chamada";
import Relatorios from "@/pages/profissional/Relatorios";

// Responsavel Pages
import ResponsavelDashboard from "@/pages/responsavel/Dashboard";
import Filhos from "@/pages/responsavel/Filhos";
import FilhoDetails from "@/pages/responsavel/FilhoDetails";

// Aluno Pages
import AlunoDashboard from "@/pages/aluno/Dashboard";

const queryClient = new QueryClient();

const HomeRedirect = () => {
  const { isAuthenticated, isProfissional, isResponsavel, isAluno } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (isProfissional) {
    return <Navigate to="/profissional" replace />;
  }
  
  if (isResponsavel) {
    return <Navigate to="/responsavel" replace />;
  }
  
  if (isAluno) {
    return <Navigate to="/aluno" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Home Redirect */}
            <Route path="/" element={<HomeRedirect />} />
            
            {/* Profissional Routes */}
            <Route path="/profissional" element={
              <ProtectedRoute allowedTypes={['PROFISSIONAL']}>
                <Layout><ProfessionalDashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profissional/turmas" element={
              <ProtectedRoute allowedTypes={['PROFISSIONAL']}>
                <Layout><Turmas /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profissional/turmas/:id" element={
              <ProtectedRoute allowedTypes={['PROFISSIONAL']}>
                <Layout><TurmaDetails /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profissional/alunos" element={
              <ProtectedRoute allowedTypes={['PROFISSIONAL']}>
                <Layout><Alunos /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profissional/calendario" element={
              <ProtectedRoute allowedTypes={['PROFISSIONAL']}>
                <Layout><Calendario /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profissional/chamada" element={
              <ProtectedRoute allowedTypes={['PROFISSIONAL']}>
                <Layout><Chamada /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/profissional/relatorios" element={
              <ProtectedRoute allowedTypes={['PROFISSIONAL']}>
                <Layout><Relatorios /></Layout>
              </ProtectedRoute>
            } />
            
            {/* Responsavel Routes */}
            <Route path="/responsavel" element={
              <ProtectedRoute allowedTypes={['RESPONSAVEL']}>
                <Layout><ResponsavelDashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/responsavel/filhos" element={
              <ProtectedRoute allowedTypes={['RESPONSAVEL']}>
                <Layout><Filhos /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/responsavel/filhos/:id" element={
              <ProtectedRoute allowedTypes={['RESPONSAVEL']}>
                <Layout><FilhoDetails /></Layout>
              </ProtectedRoute>
            } />
            
            {/* Aluno Routes */}
            <Route path="/aluno" element={
              <ProtectedRoute allowedTypes={['ALUNO']}>
                <Layout><AlunoDashboard /></Layout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
