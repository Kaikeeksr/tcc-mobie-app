import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import { ROLE_HOME } from "@/lib/roles";

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

const HomeRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={ROLE_HOME[user.tipoUsuario] ?? "/login"} replace />;
};

const App = () => (
  <AuthProvider>
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
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
