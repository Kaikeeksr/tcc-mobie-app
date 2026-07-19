/**
 * Stub para as dependencias opcionais do jsPDF (canvg, dompurify, html2canvas).
 *
 * O jsPDF as carrega por `import()` dentro de `doc.html()`, metodo que este app
 * nunca chama — geramos o PDF com texto e autotable. Sem este stub o bundler
 * inclui as tres mesmo assim: ~380 KB que nao executam nenhuma linha.
 *
 * Se algum dia o app passar a usar `doc.html()`, remova os alias do vite.config.
 */
export default {};
