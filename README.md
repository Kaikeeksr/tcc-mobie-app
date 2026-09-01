# Gestão de Chamadas

Sistema de controle de frequência para transporte escolar. Um mesmo app atende três perfis:

- **Profissional** (motorista) — cria turmas, cadastra alunos, faz a chamada, gerencia o calendário letivo e exporta relatórios em PDF.
- **Responsável** — acompanha a frequência dos filhos, turma a turma.
- **Aluno** — consulta a própria frequência e o histórico de presenças.

Roda como site e como **app Android nativo** — mesmo código, empacotado com Capacitor.

> **Estado atual:** o app consome a API [`tcc-backend`](https://github.com/Kaikeeksr/tcc-backend). Não há dados mockados — `src/data/` está vazio e a antiga camada `mockService` deu lugar a `src/services/api.ts`. Sessão e token ficam gravados no dispositivo via `@capacitor/preferences`, sobrevivendo a recarregar a página e a fechar o app.

## Stack

React 19 · TypeScript 5.9 (`strict`) · Vite 7 · Tailwind CSS 3 · shadcn/ui (Radix) · React Router 7 · Vitest 3 · Capacitor 8 · Bun

## Pré-requisitos

- [Bun](https://bun.sh) — gerenciador de pacotes e runner do projeto
- Node.js `^20.19` ou `>=22.12` (o Vite 7 exige; o Bun não substitui essa dependência)
- A **API rodando** — por padrão em `http://localhost:5218`. Ver [`tcc-backend`](https://github.com/Kaikeeksr/tcc-backend).

## Como rodar

```bash
bun install
bun dev
```

A aplicação sobe em http://localhost:8080.

### Apontar para outra API

A URL base vem de `VITE_API_URL`, com `http://localhost:5218` como padrão. Para outro ambiente, crie um `.env.local` (ignorado pelo git):

```
VITE_API_URL=https://sua-api.exemplo.com
```

### Primeiro acesso

Não há contas de demonstração. O transportador se cadastra pela própria tela de registro (`/registro`), informando nome, e-mail, senha e CPF ou CNPJ — o cadastro já devolve o token autenticado. A partir daí ele cria veículos, escolas, grupos, alunos e responsáveis, e é o cadastro do responsável/aluno que gera o login desses perfis.

## Scripts

| Comando | O que faz |
| ------------------ | -------------------------------------------- |
| `bun dev` | Servidor de desenvolvimento com HMR |
| `bun run build` | Build de produção em `dist/` |
| `bun run preview` | Serve o build de produção localmente |
| `bun run typecheck` | Checagem de tipos (`tsc --noEmit`) |
| `bun run lint` | ESLint |
| `bun run test` | Testes com Vitest |
| `bun run test:watch` | Vitest em modo watch |
| `bun run cap:sync` | Build web + copia para o projeto nativo |
| `bun run android:run` | Build, sync e instala no emulador/aparelho |
| `bun run android:open` | Abre o projeto no Android Studio |

> **Use `bun run` para tudo que não seja `dev`.** `bun build` e `bun test` invocam o bundler e o test runner *embutidos* do Bun, ignorando o Vite e o `vitest.config.ts` — silenciosamente, sem erro nenhum.

## Como o app fala com a API

Toda requisição passa por `src/lib/apiClient.ts`, e só os módulos de `src/services/` o importam. Ele concentra três coisas que, espalhadas pelas telas, viram bug:

- **Token** — anexa `Authorization: Bearer` em toda chamada; o `AuthContext` registra e limpa o token no login e no logout.
- **Erro** — traduz o `ProblemDetails` (RFC 9457) do backend numa `ApiError` tipada, com `status` e `errorCode`, e extrai a primeira mensagem de validação de campo. As telas mostram `error.message`, sem conhecer o protocolo.
- **401** — dispara o handler registrado pelo `AuthContext`, que encerra a sessão local. Token expirado não deixa o app num estado meio-logado.

`src/services/api.ts` é a fronteira de tradução: converte os DTOs do backend (inglês, `snake_case`) para os tipos de domínio do app (português), e vice-versa. Mudança de contrato se resolve nesse arquivo e em nenhum outro.

## App Android

O código é o mesmo do site: o Capacitor serve o `dist/` dentro de um WebView nativo.

**Pré-requisitos:** JDK 17+ (21 recomendado), Android SDK com **API 36** e `ANDROID_HOME` definido. O caminho do SDK fica em `android/local.properties`, fora do git — cada máquina tem o seu.

```bash
bun run android:run     # build + sync + instala
```

Depois de mexer no código web, `bun run cap:sync` copia o novo build para o projeto nativo. Sem isso o app continua com a versão antiga.

O que muda em relação ao site:

- **PDF** — na web baixa pelo navegador; no app o arquivo é gravado e a folha de compartilhamento é aberta. `doc.save()` do jsPDF falha silenciosamente dentro de um WebView, por isso o caminho nativo é separado em `src/utils/pdfExport.ts`.
- **Sessão e dados** — gravados em `@capacitor/preferences`, para sobreviver quando o Android encerra o app em segundo plano.
- **Botão voltar** — fecha o menu lateral antes de navegar (`src/hooks/useBackButton.ts`).

> Ao gerar o APK de distribuição, use uma **keystore de release** — não a chave de debug. Nem o `.jks` nem a senha vão para o repositório.

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
│   ├── ProtectedRoute.tsx  # Guarda de rota por perfil
│   ├── BottomNav.tsx  # Barra de abas do celular (+ folha "Mais")
│   └── AccountSheet.tsx  # Dados da conta e sair
├── contexts/          # AuthContext — sessão, token e handler de 401
├── hooks/             # useBackButton (botão voltar do Android)
├── lib/               # apiClient, cn(), frequência, documento (CPF/CNPJ),
│                      # navegação, storage, haptics, camada nativa
├── pages/             # Telas, agrupadas por perfil
├── services/          # api.ts — os services que as páginas consomem
├── types/             # Tipos de domínio
└── utils/             # Exportação de PDF (jsPDF)
```

O roteamento é aninhado: `ProtectedRoute` valida o perfil e `Layout` desenha a moldura, ambos via `<Outlet/>` — assim as páginas não repetem essa estrutura. As telas de cada perfil são carregadas sob demanda (`lazy`), então um responsável não baixa o bundle do profissional.

**Navegação:** `src/lib/navigation.ts` é a fonte única. No celular vira barra de abas inferior; no desktop, sidebar. Os destinos que não cabem nas abas vão para a folha "Mais", e perfis com um único destino não mostram abas.

Os limiares de frequência (80% adequada, 60% atenção) vivem só em `src/lib/frequency.ts`; dashboards, relatórios e o PDF importam de lá, para não haver duas verdades.

## Telas

| Perfil | Rota | O que faz |
|---|---|---|
| — | `/login`, `/registro` | Entrar; autocadastro do transportador |
| Profissional | `/profissional` | Painel: turmas, alunos, chamadas do dia, frequência média |
| Profissional | `/profissional/turmas`, `/turmas/:id` | Grupos de transporte e seus detalhes |
| Profissional | `/profissional/alunos` | Cadastro de alunos e vínculo com responsáveis |
| Profissional | `/profissional/chamada` | Abre a chamada por grupo, sentido e data; marca exceções e registra retirada |
| Profissional | `/profissional/calendario` | Feriados e recessos; a chamada consulta esse calendário |
| Profissional | `/profissional/relatorios` | Frequência por período e por turma; exportação em PDF |
| Responsável | `/responsavel`, `/filhos`, `/filhos/:id` | Frequência dos filhos e histórico dia a dia |
| Aluno | `/aluno` | Frequência própria e histórico recente |

### A chamada, na prática

Ao abrir a sessão, o backend já materializa uma linha por aluno matriculado **no estado presente**. O condutor só toca em quem faltou, atrasou ou foi retirado — num dia sem ocorrências, a chamada se conclui em duas interações. A premissa é simples: quem está dirigindo uma van não pode gastar trinta toques numa tela. Em data não letiva (fim de semana, feriado cadastrado), a tela não oferece a abertura e informa o motivo.

## O que ainda falta

- Exportação em planilha (XLSX) — hoje só PDF.
- Comunicação em tempo real e notificação ativa ao responsável: é preciso abrir o app para ver o que aconteceu.
- A suíte de testes automatizados ainda não cobre os fluxos das telas.
- Funcionamento offline: em trecho sem cobertura de rede, a chamada não é registrada. É a limitação mais séria, dado o caso de uso.

## Sobre

Frontend do Trabalho de Conclusão de Curso em Engenharia de Software. A API que ele consome está em [`tcc-backend`](https://github.com/Kaikeeksr/tcc-backend).

**Kaike Santos Rocha** — [@Kaikeeksr](https://github.com/Kaikeeksr)
