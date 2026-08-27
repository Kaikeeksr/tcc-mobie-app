import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const moduloVazio = path.resolve(__dirname, "./src/lib/modulo-vazio.ts");

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Dependencias opcionais do jsPDF, usadas so por doc.html() — que este
      // app nao chama. Ver src/lib/modulo-vazio.ts.
      canvg: moduloVazio,
      dompurify: moduloVazio,
      html2canvas: moduloVazio,
    },
  },
});
