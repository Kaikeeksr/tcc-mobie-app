import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { hydrateStore } from "@/services/mockService";
import { setupNativeShell } from "@/lib/native";
// Só o subset latino: o pacote completo traz cirílico, grego e vietnamita,
// que este app em pt-BR nunca renderiza.
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "./index.css";

// IIFE em vez de top-level await: este roda em WebView do sistema, cuja versao
// varia por aparelho, e top-level await exige um motor relativamente recente.
const boot = async () => {
  // Os services sao sincronos, entao os dados gravados precisam estar em memoria
  // antes do primeiro render — senao a tela monta com o mock original.
  await hydrateStore();

  createRoot(document.getElementById("root")!).render(<App />);

  // Depois do render: o splash so sai quando ha algo para mostrar.
  void setupNativeShell();
};

void boot();
