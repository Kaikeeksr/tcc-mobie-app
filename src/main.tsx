import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { setupNativeShell } from "@/lib/native";
// Só o subset latino: o pacote completo traz cirílico, grego e vietnamita,
// que este app em pt-BR nunca renderiza.
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Depois do render: o splash so sai quando ha algo para mostrar.
void setupNativeShell();
