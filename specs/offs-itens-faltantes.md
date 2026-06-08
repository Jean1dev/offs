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
- [x] ~~**Cookie de sessão em produção (segurança)**~~ — **feito**: em produção o cookie
      vira `__Secure-offs.session-token` com `secure: true` (`auth.ts`); o `proxy.ts` aceita
      ambos os nomes.

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
- [x] ~~**Hierarquia do modelo de customização (RN06).**~~ **Resolvido** (opção b): o seletor
      da T03 agora inicia com o modelo da customização quando existe (`initialModel` no
      `AgentRunner`), e o nível `global` do usuário passou a ser respeitado em `resolveModel`.
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

> **Quota / rate limiting** — **implementado (free tier)**: o sistema de créditos
> (`specs/offs-creditos.md`) limita execuções por saldo diário rolling, reserva créditos
> antes da LLM e os devolve em falha técnica, e registra consumo por execução
> (`UsageRecord`) como base do billing futuro. A migração para planos pagos (D02) só
> precisa ajustar `creditos_diarios`/pesos — a arquitetura já comporta.

---

## 4. Qualidade e hardening (P2)

- [~] **Testes automatizados** — **parcial**: Vitest configurado + testes unitários das
      funções puras (hierarquia de modelo, prompts/RN07, schema de conteúdo) em `tests/`
      (`npm run test`). **Falta** integração com DB (versionamento de `Artifact`, montagem
      de contexto end-to-end) via `mongodb-memory-server` e e2e.
- [x] ~~**CI**~~ **feito**: GitHub Actions (`.github/workflows/ci.yml`) roda
      `tsc`/`lint`/`test`/`build` em push/PR.
- [x] ~~**Tratamento de erro de IA mais rico**~~ **feito (básico)**: `runAgentAction` mapeia
      401/403 (chave/sem acesso) e 429 (rate limit) para mensagens acionáveis. Refusal/timeout
      ainda caem no genérico.
- [~] **Acessibilidade** — **parcial**: `aria-label` nos botões só-ícone (`IconBtn`) e no
      toggle de tema. **Falta** auditoria completa (foco, contraste, navegação por teclado).
- [ ] **Security review** — fluxo de auth, server actions (ownership já checado),
      `bodySizeLimit` de 12 MB, ausência de rate limit. Rodar `/security-review`.
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

## Resumo de prioridade (o que ainda falta)

| Prioridade | Foco restante |
|---|---|
| **P0** | **Smoke test e2e com credenciais reais** · índices Mongo sob concorrência *(ambos precisam de infra sua)* |
| **P1** | **Streaming na UI** *(deferido — overlay já cobre F08)* · decisões **D02–D05** *(suas)* · opcionais: regeneração com contexto, toasts, loading states |
| **P2** | Testes de integração-DB/e2e · security review · a11y completa · observabilidade |
| **P3** | YouTube API, colaboração, export, mobile, novos agentes |

> **Concluído nesta rodada:** cookie seguro em produção · CI (Actions) · testes unitários
> (Vitest) · mapeamento básico de erros de IA · modelo da customização no compositor ·
> aria-labels. **Bloqueado por infra/decisão sua:** smoke test, índices sob carga, D02–D05.
> **Deferido com justificativa:** streaming na UI (o overlay de progresso já atende F08;
> token-streaming do objeto estruturado é complexo e arriscaria o fluxo que já funciona).
