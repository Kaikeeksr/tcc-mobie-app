# Gestão de Chamadas

Frontend do TCC — sistema de controle de frequência para transporte escolar. Um mesmo app atende três perfis:

- **Profissional** (motorista) — cria turmas, cadastra alunos, faz a chamada, gerencia o calendário letivo e exporta relatórios em PDF.
- **Responsável** — acompanha a frequência dos filhos, turma a turma.
- **Aluno** — consulta a própria frequência e o histórico de presenças.

Roda como site e como **app Android nativo** (mesmo código, empacotado com Capacitor).

> Não há backend. Os dados partem de `src/data/mockData.ts` e ficam gravados no dispositivo via `@capacitor/preferences` — sobrevivem a recarregar a página e a fechar o app.

## Stack

React 19 · TypeScript 5.9 (`strict`) · Vite 7 · Tailwind CSS 3 · shadcn/ui (Radix) · React Router 7 · Vitest 3 · Capacitor 8 · Bun

## Pré-requisitos

- [Bun](https://bun.sh) — gerenciador de pacotes e runner do projeto
- Node.js `^20.19` ou `>=22.12` (o Vite 7 exige; o Bun não substitui essa dependência)

## Como rodar

```bash
bun install
bun dev
```

A aplicação sobe em http://localhost:8080.

### Logins de demonstração

A tela de login tem atalhos para os três perfis. A senha é `123456` para todos — o mock aceita qualquer senha, contanto que o e-mail exista.

| Perfil       | E-mail              |
| ------------ | ------------------- |
| Profissional | `carlos@escola.com` |
| Responsável  | `maria@email.com`   |
| Aluno        | `pedro@aluno.com`   |

## Scripts

| Comando            | O que faz                                    |
| ------------------ | -------------------------------------------- |
| `bun dev`          | Servidor de desenvolvimento com HMR          |
| `bun run build`    | Build de produção em `dist/`                 |
| `bun run preview`  | Serve o build de produção localmente         |
| `bun run typecheck`| Checagem de tipos (`tsc --noEmit`)           |
| `bun run lint`     | ESLint                                       |
| `bun run test`     | Testes com Vitest                            |
| `bun run test:watch` | Vitest em modo watch                       |
| `bun run cap:sync` | Build web + copia para o projeto nativo      |
| `bun run android:run` | Build, sync e instala no emulador/aparelho |
| `bun run android:open` | Abre o projeto no Android Studio          |

> **Use `bun run` para tudo que não seja `dev`.** `bun build` e `bun test` invocam o bundler e o test runner *embutidos* do Bun, ignorando o Vite e o `vitest.config.ts` — silenciosamente, sem erro.

## App Android

O código é o mesmo do site: o Capacitor serve o `dist/` dentro de um WebView nativo.

**Pré-requisitos:** JDK 17+ (21 recomendado), Android SDK com **API 36** e `ANDROID_HOME` definido. O caminho do SDK fica em `android/local.properties` (fora do git — cada máquina tem o seu).

```bash
bun run android:run     # build + sync + instala
```

Depois de mexer no código web, `bun run cap:sync` copia o novo build para o projeto nativo. Sem isso o app continua com a versão antiga.

O que muda em relação ao site:

- **PDF** — na web baixa pelo navegador; no app grava o arquivo e abre a folha de compartilhamento. `doc.save()` do jsPDF falha silenciosamente dentro de um WebView, por isso o caminho nativo é separado (`src/utils/pdfExport.ts`).
- **Sessão e dados** — gravados em `@capacitor/preferences`, para sobreviver quando o Android encerra o app em segundo plano.
- **Botão voltar** — fecha o menu lateral antes de navegar (`src/hooks/useBackButton.ts`).

### iOS

O código já está pronto, mas o build **exige macOS com Xcode 26** — não compila no Windows. Num Mac:

```bash
bun add @capacitor/ios && bunx cap add ios && bunx cap open ios
```

## Estrutura

```
src/
├── components/
│   ├── ui/            # shadcn/ui — apenas os 17 componentes em uso
│   ├── Layout.tsx     # Sidebar + área de conteúdo (renderiza <Outlet/>)
│   └── ProtectedRoute.tsx  # Guarda de rota por perfil
│   ├── BottomNav.tsx  # Barra de abas do celular (+ folha "Mais")
│   └── AccountSheet.tsx  # Dados da conta e sair
├── contexts/          # AuthContext
├── data/              # Dados mockados (semente inicial)
├── hooks/             # useBackButton (botão voltar do Android)
├── services/          # mockService — camada que as páginas consomem
├── lib/               # cn(), frequência, navegação, storage, haptics, camada nativa
├── pages/             # Telas, agrupadas por perfil
├── types/             # Tipos de domínio
└── utils/             # Exportação de PDF (jsPDF)
```

O roteamento usa rotas aninhadas: `ProtectedRoute` valida o perfil e `Layout` desenha a moldura, ambos via `<Outlet/>` — as páginas não repetem essa estrutura.

**Navegação** (`src/lib/navigation.ts` é a fonte única): no celular vira barra de abas inferior; no desktop, sidebar. Os destinos que não cabem nas abas vão para a folha "Mais". Perfis com um único destino não mostram abas.

Os limiares de frequência (80% adequada, 60% atenção) vivem só em `src/lib/frequency.ts`; dashboards, relatórios e o PDF importam de lá.

## Limitações conhecidas

- O cadastro de aluno gera um `responsavelId` fictício, então alunos novos não aparecem no painel de nenhum responsável.
- Em `getTurmaReport`, o total de aulas é contado de duas formas diferentes (por aluno e por turma), o que diverge quando um aluno entra na turma depois de chamadas já registradas.
