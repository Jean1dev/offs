# Offs / "Pauta" — Plano Técnico

> Documento de planejamento do desenvolvimento, derivado de
> [`offs-especificacoes-negocio.md`](./offs-especificacoes-negocio.md) e do handoff de
> design em [`/design`](../design). Organizado em **fases de alto nível**; cada fase é um
> entregável incremental.

---

## 1. Contexto

**Offs** (marca do protótipo: **"Pauta"**) é um assistente de projetos para criadores de
YouTube. Cada projeto representa um vídeo em produção; dentro dele, agentes de IA
especializados analisam canais, identificam temas e escrevem roteiros (modo guiado ou
livre). Tudo que um agente produz vira um **artefato versionado** dentro do projeto.

Há um **handoff de design** completo em [`/design`](../design) (Claude Design / "Pauta"):
protótipo React das **5 telas** sobre o design system **BeautyBook**
(`design/project/assets/colors_and_type.css`). A diretriz do handoff é recriar as telas
com fidelidade visual na stack alvo (Next.js), portando tokens e componentes — ler o
source, não renderizar/screenshot. O transcript em `design/chats/chat1.md` registra
decisões de arquitetura que **resolvem itens em aberto da spec** (ver §5).

---

## 2. Decisões de arquitetura

| Dimensão | Decisão |
|---|---|
| Stack | **Next.js 16** full-stack (App Router, Server Actions/Route Handlers, TypeScript) |
| Banco | **MongoDB** via **Mongoose** (schemas tipados + hooks de versionamento) |
| Auth | **NextAuth (Auth.js)** + **Google OAuth2** + adapter MongoDB |
| Camada de IA | **Vercel AI SDK** com `customProvider()` (registry de modelos lógicos) |
| Providers de IA | **Multi-provider real**: Claude (Anthropic), GPT-4o (OpenAI), Gemini 2.5 Pro (Google) |
| Hierarquia de modelo | global (usuário) → projeto → execução, resolvida em runtime |

### 2.1 Estilização / UI

O protótipo usa **React + estilos inline referenciando CSS variables** definidas em
`colors_and_type.css` (não usa Tailwind/shadcn). Abordagem adotada:

- `colors_and_type.css` vira a **camada de tokens** global: paleta rosa/gold/neutros, tipo
  (Cormorant Garamond display + DM Sans body), radii, sombras, spacing e **dark mode** via
  `[data-theme="dark"]`.
- **Portar os componentes do protótipo** para client components `.tsx` tipados,
  preservando o estilo via CSS vars. Tailwind opcional para utilitários; **shadcn não é
  necessário** — usar apenas se um primitivo específico (ex: dialog) compensar.
- Fontes via Google Fonts ou `next/font`.

### 2.2 Camada de IA (referência: projeto `front-politicai`)

- Registry de modelos em `lib/ai/models.ts` via `customProvider({ languageModels })`.
- Seleção de modelo em runtime + resolução da hierarquia.
- Execução **streaming** (`streamText`/`streamObject` + `createDataStreamResponse`) → F08.
- **Saída estruturada** (`streamObject` + schema Zod) → artefato estruturado, não texto
  bruto → F10.
- Prompts versionados em `lib/ai/prompts.ts` (prompt base por agente, editável → F12).

---

## 3. Mapeamento design → produto

| Arquivo do bundle (`design/project/`) | Vira | Tela spec |
|---|---|---|
| `assets/colors_and_type.css` | Camada de tokens global | — |
| `app/data.jsx` | **Seed** do catálogo de agentes + taxonomias + seed Mongoose | — |
| `app/icons.jsx`, `app/ui.jsx` | Componentes base (Icon, Button, chips…) | — |
| `app/app.jsx` | Shell: sidebar, topbar/breadcrumb, router, tweaks, dark mode | — |
| `app/screen_projects.jsx` | Lista de projetos | T01 |
| `app/screen_project.jsx` | Interior do projeto (guiado/livre/biblioteca/vazio) | T02 / T02b |
| `app/screen_agent.jsx` | Execução do agente (compositor adaptativo) | T03 |
| `app/screen_artifact.jsx` + `app/artifact_content.jsx` | Visualização + render por tipo | T04 |
| `app/screen_customize.jsx` | Customização do agente | T05 |

`data.jsx` já define, prontos para virar config tipada e seed: `STATUS`
(ideia→roteiro→produção→publicado), `MODELS`, `INPUT` (image/text/artifact/**sources**),
`AGENTS` (os 9, com flags `startingPoint`/`dualContext`/`narrative`/`requiresSources`/
`inputArtifact`), `CATEGORIES`, `GUIDED_FLOW`, `NARRATIVE_MODELS`, `CHANNEL`.

---

## 4. Fases de desenvolvimento

### Fase 0 — Fundação + design system
- Inicializar Next.js 16 (App Router) + TypeScript + ESLint/Prettier.
- **Portar `colors_and_type.css`** como camada de tokens global; carregar fontes; ligar
  **dark mode** `[data-theme]`.
- Estrutura: `app/`, `lib/` (`lib/db`, `lib/ai`, `lib/auth`), `components/` (atoms portados
  de `ui.jsx`/`icons.jsx`), `models/`.
- Conexão MongoDB via Mongoose (singleton serverless-safe).
- `.env.example`: `MONGODB_URI`, `AUTH_SECRET`, `GOOGLE_CLIENT_ID/SECRET`,
  `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`.
- **Decisão pendente:** storage de imagens (ver §6).

**Entregável:** app roda, conecta no Mongo, tokens/fontes/dark mode aplicados, átomos base.

### Fase 1 — Autenticação e conta (F01)
- NextAuth + Google OAuth2 + adapter MongoDB; sessão e proteção de rotas.
- Modelo `User` com preferências globais: modelo de IA padrão, canal YouTube opcional.
- Área de perfil/preferências. Cobre RN01 (canal opcional).

**Entregável:** login Google funcional, preferências persistidas.

### Fase 2 — Modelo de dados e persistência (Mongoose)
- Schemas: `User`, `Project` (status, modelo, `done[]`, `archived`), `Artifact` (nome
  editável, agentId, model, timestamp, **version/versions**, conteúdo estruturado, status),
  `AgentCustomization` (agentRef, prompt, model, escopo global|projeto).
- **Hooks de versionamento** (RN05: regenerar arquiva e cria nova versão).
- Catálogo de agentes como **config estática tipada** (port de `AGENTS`/`CATEGORIES`/
  `GUIDED_FLOW`/`NARRATIVE_MODELS`/`INPUT`/`STATUS`).
- Seed inicial com dados mock para validar telas.

**Entregável:** schemas + CRUD testados, versionamento garantido no nível de dados.

### Fase 3 — Camada de IA multi-provider
- Registry `lib/ai/models.ts` (`customProvider`) com Claude + GPT-4o + Gemini reais.
- Resolução da hierarquia global→projeto→execução (RN06) + rótulo "só nesta execução".
- Prompts base por agente em `lib/ai/prompts.ts` (RN07: Roteirista proíbe conhecimento
  próprio).
- Modelos narrativos aplicáveis a `estruturador`/`roteirista`.
- Entrypoint de execução streaming + saída estruturada (schema Zod por tipo de artefato).

**Entregável:** agente + contexto + modelo → execução real com conteúdo estruturado em
streaming.

### Fase 4 — Shell + lista de projetos (T01, app shell)
- Portar `app.jsx`: sidebar, topbar com breadcrumb, router (Next App Router), toast, painel
  de Tweaks (opcional), dark mode.
- Portar `screen_projects.jsx` (T01): grid de cards (status, progresso do pipeline, modelo,
  última atividade), filtro por status.
- Criar, renomear, **arquivar** (não deletar), **duplicar** projeto (F02).

**Entregável:** navegação geral + gestão de projetos sobre dados reais.

### Fase 5 — Interior do projeto: guiado, livre, vazio (T02/T02b, F03/F04/F14)
- Portar `screen_project.jsx`: modo guiado (stepper destacando próximo passo + card "ponto
  de partida" do Analista de Canais), modo livre (agentes por categoria), biblioteca lateral
  de artefatos com badge de versão, **estado vazio** (T02b). Fluxo é sugestivo (RN02).

**Entregável:** interior do projeto completo, levando à execução de agentes.

### Fase 6 — Execução do agente / compositor (T03, F05/F06/F07/F08/F13)
- Portar `screen_agent.jsx`: compositor adaptativo por `inputs` — upload de imagens (grid +
  remover), texto livre, seletor de artefato (pré-seleciona recomendado), campo de
  **fontes** tipado (item a item).
- Gate editorial do Roteirista: sem fontes, botão bloqueado + "Aguardando fontes" (RN03).
- Toggle **dualContext** do Analista de Roteiro (referência externa vs meu rascunho).
- Seletor narrativo (`narrative`); seletor de modelo por execução com rótulo "só nesta
  execução" (F13/RN06).
- Disparo da execução (Fase 3) com feedback visual; grava o artefato (Fase 2).

**Entregável:** monta contexto, executa qualquer agente, gera artefato persistido.

### Fase 7 — Artefatos: biblioteca, visualização, versionamento (T04, F09/F10/F11)
- Portar `screen_artifact.jsx` + `artifact_content.jsx`: render estruturado por tipo de
  saída (métricas, tabelas, listas rankeadas, blocos de roteiro, laudo) — não texto bruto.
- Seletor de versão ("v3 de 3"); ações: copiar, **usar como input** (abre seletor de agente
  → volta ao compositor da Fase 6), **regenerar** (nova versão), renomear, restaurar versão.
- Ação direta "Analista de Roteiro" no artefato "Rascunho do roteiro".

**Entregável:** ciclo de vida completo do artefato + encadeamento entre agentes.

### Fase 8 — Customização de agente (T05, F12)
- Portar `screen_customize.jsx`: editor de prompt base, seletor de modelo do agente, escopo
  global|projeto (projeto > global), restaurar padrão (sobreposição, não altera o padrão).
- Aplicar customização na resolução de prompt/modelo na execução (Fases 3/6).

**Entregável:** customização com escopo e reversão.

### Fase 9 — Casos especiais, QA e deploy
- Garantir os dois contextos do Analista de Roteiro end-to-end (RN08) e agentes fora do
  guiado só no modo livre.
- Tratamento de erros de IA, loading/empty states, acessibilidade básica, responsividade
  desktop, dark mode em todas as telas.
- Testes e2e dos fluxos principais; preparar deploy.

**Entregável:** v1 coerente com spec + design, casos especiais cobertos.

---

## 5. Decisões resolvidas pelo design (atualizam a spec)

- **D01 — Analista de Canais:** fica **fora** do `GUIDED_FLOW`, mas vira card destacado
  *"Ponto de partida · opcional"* acima do fluxo guiado e selo no modo livre (`startingPoint`).
- **Analista de Roteiro `dualContext`:** UM agente, dois modos via toggle na tela —
  *"Roteiro de referência (externo)"* (input `text` → *Laudo de referência*) e *"Meu
  rascunho"* (input `artifact` Rascunho → *Laudo estrutural*).
- **`sources` = 4º tipo de input** de primeira classe (obrigatório, bloqueia execução),
  separado de `text`.
- **Versionamento:** regenerar **cria nova versão** (v2, v3…), anterior preservada; seletor
  de versão no artefato.
- **Escopo de modelo:** seletor da T03 traz rótulo *"só nesta execução"* / *"padrão"*.

---

## 6. Decisões técnicas em aberto

- **Storage de imagens** (prints, input `image`): GridFS vs blob externo (Vercel Blob / S3 /
  Cloudinary) → decidir na Fase 0.
- D02–D05 de negócio (billing, limites de plano, criar agentes do zero, export PDF/DOCX) —
  fora do escopo técnico das fases até serem fechadas.

---

## 7. Rastreamento spec → fase

| Item | Fase |
|---|---|
| F01 / RN01 | 1 |
| Entidades §2, RN05 | 2 |
| Camada IA, RN06/RN07, narrativos | 3 |
| F02, T01, shell | 4 |
| F03/F04/F14, T02/T02b, RN02 | 5 |
| F05/F06/F07/F08/F13, T03, RN03/RN08 | 6 |
| F09/F10/F11, T04 | 7 |
| F12, T05 | 8 |
| RN04, fora-de-guiado, QA/deploy | 9 |

---

## 8. Verificação

"Pronto" de cada fase = seu entregável. Validação end-to-end (Fase 9 e incremental):
`npm run dev` → Login Google → criar projeto → estado vazio → Analista de Canais (upload de
print, ponto de partida) → seguir guiado → gerar artefato → usar como input do próximo →
regenerar e conferir versão → Roteirista bloqueado sem fontes / liberado com fontes →
Analista de Roteiro nos dois contextos → customizar agente → alternar dark mode. Comparar
fidelidade visual contra os arquivos em [`/design`](../design) (ler source, não screenshot).
