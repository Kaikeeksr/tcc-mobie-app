import { lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import { ROLE_HOME } from "@/lib/roles";

// Login e NotFound ficam no bundle inicial: sao as duas telas que podem
// aparecer antes de qualquer navegacao.
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";

// As demais viram chunks proprios — cada perfil so baixa e interpreta as telas
// que usa, em vez de um bundle unico com o app inteiro.
const ProfessionalDashboard = lazy(() => import("@/pages/profissional/Dashboard"));
const Turmas = lazy(() => import("@/pages/profissional/Turmas"));
const TurmaDetails = lazy(() => import("@/pages/profissional/TurmaDetails"));
const Alunos = lazy(() => import("@/pages/profissional/Alunos"));
const Calendario = lazy(() => import("@/pages/profissional/Calendario"));
const Chamada = lazy(() => import("@/pages/profissional/Chamada"));
const Relatorios = lazy(() => import("@/pages/profissional/Relatorios"));

const ResponsavelDashboard = lazy(() => import("@/pages/responsavel/Dashboard"));
const Filhos = lazy(() => import("@/pages/responsavel/Filhos"));
const FilhoDetails = lazy(() => import("@/pages/responsavel/FilhoDetails"));

const AlunoDashboard = lazy(() => import("@/pages/aluno/Dashboard"));

const HomeRedirect = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={ROLE_HOME[user.tipoUsuario] ?? "/login"} replace />;
};

const App = () => (
  <AuthProvider>
    {/* O posicionamento vem do CSS (ver index.css): a prop `offset` do sonner
        1.7 concatena "px" no valor e nao aceita calc(). */}
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<ProtectedRoute allowedTypes={["PROFISSIONAL"]} />}>
          <Route path="/profissional" element={<Layout />}>
            <Route index element={<ProfessionalDashboard />} />
            <Route path="turmas" element={<Turmas />} />
            <Route path="turmas/:id" element={<TurmaDetails />} />
            <Route path="alunos" element={<Alunos />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="chamada" element={<Chamada />} />
            <Route path="relatorios" element={<Relatorios />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedTypes={["RESPONSAVEL"]} />}>
          <Route path="/responsavel" element={<Layout />}>
            <Route index element={<ResponsavelDashboard />} />
            <Route path="filhos" element={<Filhos />} />
            <Route path="filhos/:id" element={<FilhoDetails />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedTypes={["ALUNO"]} />}>
          <Route path="/aluno" element={<Layout />}>
            <Route index element={<AlunoDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
