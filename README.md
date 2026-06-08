# Pauta (Offs)

Assistente de projetos para criadores de YouTube. Cada projeto é um vídeo em
produção; dentro dele, agentes de IA especializados analisam canais, identificam
temas e escrevem roteiros — em modo guiado ou livre. Tudo que um agente produz vira
um **artefato versionado**.

- Especificação de negócio: [`specs/offs-especificacoes-negocio.md`](specs/offs-especificacoes-negocio.md)
- Sistema de créditos e limite de uso: [`specs/offs-creditos.md`](specs/offs-creditos.md)
- Plano técnico por fases: [`specs/offs-plano-tecnico.md`](specs/offs-plano-tecnico.md)
- Referência de design (protótipo): [`design/`](design)

## Stack

- **Next.js 16** (App Router, Server Actions, TypeScript)
- **MongoDB** via **Mongoose**
- **Auth.js (NextAuth v5)** com Google OAuth2 (adapter MongoDB)
- **Vercel AI SDK** — registry multi-provider: Claude, GPT-4o, Gemini 2.5 Pro
- Design tokens BeautyBook (CSS variables) + fontes self-hosted (`@fontsource`)

## Pré-requisitos

- Node.js 20+ (testado com 22)
- Uma instância MongoDB (Atlas ou local)
- Credenciais OAuth2 do Google
- Chaves de API dos provedores de IA que for usar

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env.local` e preencha:

   ```
   MONGODB_URI=...
   AUTH_SECRET=...                # openssl rand -base64 32
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ANTHROPIC_API_KEY=...
   OPENAI_API_KEY=...
   GOOGLE_GENERATIVE_AI_API_KEY=...
   ```

   No Google Cloud Console, adicione o redirect URI
   `http://localhost:3000/api/auth/callback/google`.

   Modelos concretos são configuráveis por env (opcional):
   `ANTHROPIC_MODEL` (default `claude-opus-4-8`), `OPENAI_MODEL` (`gpt-4o`),
   `GOOGLE_MODEL` (`gemini-2.5-pro`).

## Rodando

```bash
npm run dev      # desenvolvimento (http://localhost:3000)
npm run build    # build de produção
npm run start    # servir o build
npm run lint     # ESLint
```

Fluxo: `/login` → entrar com Google → `/projetos`.

### Dados de demonstração (dev)

Logado, abra **`/api/dev/seed`** para popular sua conta com projetos e artefatos
de exemplo (inclui histórico de versões). Desabilitado em produção.

## Estrutura

```
app/                     # rotas (App Router)
  (app)/                 # área autenticada: projetos, agentes, artefatos, conta
  api/auth/[...nextauth] # Auth.js
auth.ts                  # config NextAuth (Google + MongoDB adapter)
proxy.ts                 # guard de rotas protegidas (edge)
components/              # UI (Icon, átomos, telas)
lib/
  ai/                    # registry de modelos, prompts, schema, execução
  catalog.ts             # catálogo de agentes + taxonomias
  db/                    # conexões Mongoose + MongoClient
  projects.ts artifacts.ts customization.ts agent-run.ts
models/                  # schemas Mongoose (User, Project, Artifact, AgentCustomization)
design/                  # protótipo de referência (não faz parte do build)
```

## Deploy

Compatível com qualquer host Node que rode `next start` (ex.: Vercel). Defina as
mesmas variáveis de ambiente e o redirect URI de produção do Google
(`https://SEU_DOMINIO/api/auth/callback/google`). Para uploads de prints, os inputs
são enviados inline na execução (sem storage) — o `bodySizeLimit` das Server Actions
está em 12 MB (`next.config.ts`).

## Fora de escopo (v1)

Integração com a API do YouTube, colaboração entre usuários, exportação (PDF/DOCX),
mobile, billing. Ver §10 da spec de negócio.
