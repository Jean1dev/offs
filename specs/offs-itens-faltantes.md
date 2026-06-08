# Pauta (Offs) — Itens faltantes

> Estado em relação ao [plano técnico](./offs-plano-tecnico.md). As Fases 0–9 foram
> implementadas (5 telas, auth, dados, IA multi-provider, execução, versionamento,
> customização). Este documento lista o que **ainda falta** construir, validar ou decidir.
> Prioridades: **P0** bloqueia uso/produção · **P1** importante para v1 sólida ·
> **P2** melhoria/hardening · **P3** roadmap pós-v1.

---

## 1. Validação antes de produção (P0)

O código compila, builda e linta, mas **não foi exercido contra serviços reais**.

- [ ] **Smoke test end-to-end** com `.env.local` real (Mongo + Google OAuth + chaves de IA):
      login → criar projeto → estado vazio → rodar um agente de canal (com prints) →
      gerar artefato → usar como input do próximo → regenerar (conferir versão) →
      Roteirista bloqueado sem fontes / liberado com fontes → Analista de Roteiro nos
      dois contextos → customizar agente → dark mode.
- [x] ~~**Formato multimodal de imagem por provider**~~ — **confirmado**: o AI SDK aceita
      data URL/base64 e os 3 providers (Anthropic/OpenAI/Google) suportam base64; URL direta
      tem nuances por provider, então mantemos **data URL (base64)** no `lib/ai/execute.ts`.
- [ ] **Índices do MongoDB** — validar criação dos índices (`Artifact` único de versão
      ativa por lineage, índices de `userId`/`projectId`) e comportamento sob concorrência
      de regeneração.
- [ ] **Cookie de sessão em produção (segurança)** — hoje o nome é fixo `offs.session-token`
      sem prefixo `__Secure-`/`secure` em https. Aplicar quando `NODE_ENV==='production'`
      (o `proxy.ts` já aceita ambos os nomes). Ver `auth.ts`.

---

## 2. Lacunas dentro do escopo v1 (P1)

Itens do plano que foram simplificados ou ficaram parciais.

- [ ] **Streaming real na execução do agente (F08).** Hoje a execução usa `generateObject`
      (one-shot) com overlay de progresso animado. Já existe `streamAgent` (`streamObject`)
      em `lib/ai/execute.ts`, mas **não está ligado à UI**. Para “gerando ao vivo”, criar
      um route handler de streaming e consumir o `partialObjectStream` no `AgentRunner`.
- [x] ~~**Persistência opcional de prints.**~~ **Implementado**: abstração de storage
      (`lib/storage`) com backend na API interna `POST /v1/s3`; `executeAgentRun` sobe os
      prints e guarda as URLs em `Artifact.inputImages` (exibidas no artefato). Configurar
      `STORAGE_API_URL` no env; se ausente, degrada para inline (sem persistir).
- [ ] **Hierarquia do modelo de customização (RN06).** O modelo salvo na customização
      (`AgentCustomization.model`) quase nunca prevalece porque o seletor “por execução”
      (T03) sempre envia um modelo, e execução > customização. Decidir: (a) deixar como
      está; (b) inicializar o seletor da T03 com o modelo da customização; (c) permitir
      “usar o modelo da customização” explicitamente.
- [ ] **Reabrir contexto de regeneração.** Ao “Regenerar”, a tela do agente abre limpa
      (o usuário remonta o contexto). Opcional: pré-carregar inputs da geração anterior.
- [ ] **Toasts/feedback.** Ações como copiar/renomear usam estados inline; o protótipo
      previa toasts globais. Avaliar um sistema de toast consistente.
- [ ] **Estados de carregamento.** Não há `loading.tsx` (skeletons) nas rotas; as
      navegações dependem do Server Component resolver. Opcional para UX.

---

## 3. Decisões de produto em aberto (P1 — precisam de você)

Da spec de negócio (§11). Bloqueiam funcionalidades correlatas.

- [ ] **D02 — Modelo de billing** (por execução / por projeto / assinatura). Define se há
      cobrança e arquitetura de pagamento.
- [ ] **D03 — Limite de projetos por plano.** Define checagens de quota.
- [ ] **D04 — Usuário cria agentes do zero?** Hoje só dá para **customizar** os 9 do
      catálogo. Criar agentes próprios é roadmap.
- [ ] **D05 — Exportação de artefatos (PDF/DOCX) na v1?** O botão “Exportar” foi omitido
      por estar fora de escopo; reavaliar.

> **Quota / rate limiting** (cobrar execuções, limitar uso) depende de D02/D03 e **não está
> implementado** — o projeto de referência tinha `user-request-limit`; aqui não há.

---

## 4. Qualidade e hardening (P2)

- [ ] **Testes automatizados** — não há nenhum (unit/integração/e2e). Mínimo sugerido:
      testes da lógica de versionamento (`models/Artifact`), montagem de contexto
      (`lib/agent-run`) e resolução de modelo/customização.
- [ ] **Security review** — fluxo de auth, server actions (ownership já checado),
      `bodySizeLimit` de 12 MB, ausência de rate limit. Rodar `/security-review`.
- [ ] **Acessibilidade** — passe de `aria-label`/foco/contraste (há `chrome-devtools-mcp:a11y`).
      Vários botões-ícone têm `title`, mas falta auditoria.
- [ ] **CI** — sem pipeline. Adicionar GitHub Actions rodando `tsc`/`build`/`lint` no PR.
- [ ] **Tratamento de erro de IA mais rico** — hoje retorna mensagem genérica; mapear
      erros por tipo (rate limit, refusal, chave inválida) para mensagens acionáveis.
- [ ] **Observabilidade** — sem logging estruturado/telemetria de execuções de agente.

---

## 5. Fora de escopo v1 / Roadmap (P3)

Explicitamente fora da v1 (spec §10), listados para registro:

- [ ] Integração com a **API do YouTube** (métricas em tempo real, conectar canal de verdade
      — hoje o canal é só dados manuais).
- [ ] **Colaboração** entre usuários no mesmo projeto.
- [ ] **Exportação** para Google Docs / Notion.
- [ ] **Mobile** (foco atual é desktop; não há layout responsivo dedicado).
- [ ] **Histórico de execuções com diff visual** entre versões de artefato.
- [ ] Agentes de **thumbnail, título ou descrição**.
- [ ] **Publicação direta** no YouTube.
- [ ] Criação de **agentes próprios** pelo usuário (ligado a D04).

---

## Resumo de prioridade

| Prioridade | Foco |
|---|---|
| **P0** | Smoke test real, imagem multimodal por provider, índices Mongo, cookie seguro em prod |
| **P1** | Streaming na UI, decisões D02–D05, hierarquia de modelo da customização |
| **P2** | Testes, security review, a11y, CI, erros de IA |
| **P3** | YouTube API, colaboração, export, mobile, novos agentes |
