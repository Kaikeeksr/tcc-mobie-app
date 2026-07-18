# Gestão de Chamadas

Frontend do TCC — sistema de controle de frequência para transporte escolar. Um mesmo app atende três perfis:

- **Profissional** (motorista) — cria turmas, cadastra alunos, faz a chamada, gerencia o calendário letivo e exporta relatórios em PDF.
- **Responsável** — acompanha a frequência dos filhos, turma a turma.
- **Aluno** — consulta a própria frequência e o histórico de presenças.

> Os dados são mockados em memória (`src/data/mockData.ts`). Não há backend: as alterações persistem enquanto a aba estiver aberta e se perdem ao recarregar.

## Stack

React 19 · TypeScript 5.9 (`strict`) · Vite 7 · Tailwind CSS 3 · shadcn/ui (Radix) · React Router 7 · Vitest 3 · Bun

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

> **Use `bun run` para tudo que não seja `dev`.** `bun build` e `bun test` invocam o bundler e o test runner *embutidos* do Bun, ignorando o Vite e o `vitest.config.ts` — silenciosamente, sem erro.

## Estrutura

```
src/
├── components/
│   ├── ui/            # shadcn/ui — apenas os 17 componentes em uso
│   ├── Layout.tsx     # Sidebar + área de conteúdo (renderiza <Outlet/>)
│   └── ProtectedRoute.tsx  # Guarda de rota por perfil
├── contexts/          # AuthContext
├── data/              # Dados mockados
├── services/          # mockService — camada que as páginas consomem
├── lib/               # cn(), limiares de frequência, mapa perfil→rota
├── pages/             # Telas, agrupadas por perfil
├── types/             # Tipos de domínio
└── utils/             # Exportação de PDF (jsPDF)
```

O roteamento usa rotas aninhadas: `ProtectedRoute` valida o perfil e `Layout` desenha a moldura, ambos via `<Outlet/>` — as páginas não repetem essa estrutura.

Os limiares de frequência (80% adequada, 60% atenção) vivem só em `src/lib/frequency.ts`; dashboards, relatórios e o PDF importam de lá.

## Limitações conhecidas

- **A sessão não persiste.** O `AuthContext` guarda o usuário só em memória, então recarregar a página (F5) desloga e links diretos para rotas internas caem no login.
- O cadastro de aluno gera um `responsavelId` fictício, então alunos novos não aparecem no painel de nenhum responsável.
- Em `getTurmaReport`, o total de aulas é contado de duas formas diferentes (por aluno e por turma), o que diverge quando um aluno entra na turma depois de chamadas já registradas.
