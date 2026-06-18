# Offs — Especificação: Geração de Imagem (camada de provider)

> Complemento às Especificações de Negócio v1.0 e à spec do Agente Gerador de Thumbnails
> Escopo: a infraestrutura de geração de imagem que sustenta o agente `gerador-thumbnails`
> e qualquer agente visual futuro (título visual, capas)
> Status: implementado — o agente `gerador-thumbnails` e a camada de imagem estão no código

---

## 1. Objetivo

Definir uma camada de geração de imagem **provider-agnóstica** e à prova de futuro, de
forma que trocar ou adicionar um provider (gpt-image, Nano Banana, Imagen, Flux) seja uma
mudança contida na Fase 1, sem tocar execução, storage, versionamento ou UI.

O pipeline atual do produto é **text-only** (`generateObject` → `{summary, blocks}`). Esta
spec adiciona um caminho paralelo de imagem **sem alterar** o caminho de texto existente.

---

## 2. Princípio: 4 contratos estáveis

Toda a feature se apoia em quatro contratos. O provider concreto vive **apenas atrás do
primeiro**; os outros três não sabem qual provider gerou a imagem.

| # | Contrato | Onde vive | Estabilidade |
|---|---|---|---|
| 1 | **Dimensão de modelo** — `AIImageModelId` + `resolveImageModel()` | `lib/ai/image-models.ts` | Trocar provider = 1 entrada no mapa |
| 2 | **Execução** — `runImageAgent({ context, refs, n }) → { images, costUsd, usage }` | `lib/ai/image-execute.ts` | Esconde `generateImage` vs `generateText`+`files` |
| 3 | **Storage** — interface `Storage` já existente (`uploadDataUrl`/`upload`) | `lib/storage/*` | Saída sempre vira URL |
| 4 | **Conteúdo** — bloco `image` no `ArtifactContent` | `lib/artifact-content.ts` | T04 renderiza URL, ignora origem |

---

## 3. Dimensão de modelo de imagem (RN06)

A hierarquia de modelo de imagem espelha a de texto (global → projeto → execução), mas é
**independente**: o usuário escolhe o modelo de imagem separado do modelo de texto.

```ts
// lib/ai/image-models.ts
export type AIImageModelId = "gpt-image" | "nano-banana"; // espaço p/ "imagen" | "flux"

export const DEFAULT_IMAGE_MODEL: AIImageModelId = "gpt-image";

type ImageModelEntry =
  | { kind: "imageModel";  modelId: string; multi: "n" }       // generateImage(n)
  | { kind: "llmImageOut"; modelId: string; multi: "fanout" }; // generateText × N

export const IMAGE_MODELS: Record<AIImageModelId, ImageModelEntry> = {
  "gpt-image":   { kind: "imageModel",  modelId: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",          multi: "n" },
  "nano-banana": { kind: "llmImageOut", modelId: process.env.GOOGLE_IMAGE_MODEL ?? "gemini-2.5-flash-image", multi: "fanout" },
};

export function resolveImageModel(opts: {
  execution?: AIImageModelId | null;
  customization?: AIImageModelId | null;
  project?: AIImageModelId | null;
  global?: AIImageModelId | null;
}): AIImageModelId {
  return opts.execution ?? opts.customization ?? opts.project ?? opts.global ?? DEFAULT_IMAGE_MODEL;
}
```

**Níveis da hierarquia (novos campos):**
- `User.defaultImageModel?` — nível global
- `Project.imageModel?` — nível projeto
- `AgentCustomization.imageModel?` — overlay
- `AgentRunInput.imageModel` — execução (mais específico vence)

Ids concretos são overridable por env (`OPENAI_IMAGE_MODEL`, `GOOGLE_IMAGE_MODEL`),
seguindo o padrão de `lib/ai/models.ts` (`ANTHROPIC_MODEL`, `GOOGLE_MODEL`).

---

## 4. Providers suportados

| Modelo (`AIImageModelId`) | Provider / SDK | Id concreto (verificado) | `kind` | Multi-output 2–3 | Custo/imagem | Forte em |
|---|---|---|---|---|---|---|
| `gpt-image` | OpenAI / `@ai-sdk/openai` | `gpt-image-1` | `imageModel` → `generateImage` | `n` nativo (1 chamada, 1–10) | ~$0.01/0.04/0.17 (low/med/high 1024²) | **Texto** legível na imagem |
| `nano-banana` | Google / `@ai-sdk/google` | `gemini-2.5-flash-image` (GA 02/10/2025) | `llmImageOut` → `generateText`, lê `result.files` | **fan-out** (N chamadas paralelas) | **$0.039** fixo (1290 tok @ $30/1M) | **Identidade visual** a partir de referências |

Ambos usam SDKs **já presentes** no projeto — zero dependência nova. São complementares e
ambos selecionáveis pelo usuário via a hierarquia da seção 3.

> Recomendação de produto: default `gpt-image`. Quando o usuário anexa referências do
> próprio canal (§3.3 da spec de thumbnails), a UI **pode sugerir** `nano-banana` pela
> consistência de identidade. Sugestão é gancho futuro, não bloqueio.

---

## 5. Contrato de execução — `runImageAgent`

```ts
// lib/ai/image-execute.ts
export interface RunImageInput {
  imageModel: AIImageModelId;     // já resolvido via resolveImageModel (RN06)
  prompt: string;                 // briefing visual + contexto do roteiro/introdução
  refs?: string[];                // data URLs das referências (§3.3) — opcional
  n: number;                      // nº de variações (2–3)
  size?: string;                  // ex. "1536x1024" (thumbnail 16:9)
}

export interface RunImageResult {
  images: string[];               // data URLs (base64) — N imagens
  costUsd: number;                // custo real desta execução (alimenta UsageRecord)
  usage?: { imageCount: number; tokens?: number };
}

export async function runImageAgent(input: RunImageInput): Promise<RunImageResult>;
```

**Despacho interno por `kind`:**
- `imageModel` (gpt-image) → `generateImage({ model: openai.image(id), prompt, n, size })`,
  mapeia `result.images` → data URLs.
- `llmImageOut` (nano-banana) → `Promise.all` de N × `generateText({ model: google(id),
  prompt, /* refs como partes de imagem do user turn */ })`, extraindo de cada
  `result.files` a primeira parte `image/*` → data URL.

O resto do pipeline nunca vê essa diferença. Trocar a estratégia de multi-output (ex.: se
gpt-image perder o `n`) é interno ao `runImageAgent`.

---

## 6. Storage — semântica de erro (a diferença que importa)

A imagem gerada **deve** ser persistida. Diferente dos prints de entrada (best-effort, RN04),
o output é o próprio produto: base64 no Mongo incha o documento (3 imagens ~1–2MB cada,
limite de 16MB) e perde durabilidade.

| | Print de entrada (existente) | Thumbnail gerado (novo) |
|---|---|---|
| Persistência | best-effort — falha é engolida | **obrigatória** |
| Falha de storage | run continua | run **falha e libera a reserva** (RN-C03) |
| O que fica no Mongo | URL em `Artifact.inputImages[]` | **URL** no bloco `image` (sem base64) |
| Bucket | `offs-prints` | `offs-thumbnails` |

Se `getStorage()` retornar `null` (sem `STORAGE_API_URL`), o agente de imagem **bloqueia na
entrada** com mensagem clara — não gera e perde a imagem. O caminho de texto continua
degradando normalmente.

---

## 7. Conteúdo do artefato — bloco `image`

Reusa o modelo de artefato existente (`content.blocks` já é `Mixed`), sem migração:

```ts
// lib/artifact-content.ts — nova entrada na união ArtifactBlock
export interface ImageBlock {
  t: "image";
  url: string;       // URL persistida no storage
  alt?: string;
  prompt?: string;   // prompt efetivo usado (rastreabilidade / regeneração)
}
```

Artefato de thumbnail = `{ summary, blocks: [{ t: "image", url, prompt }] }`, uma imagem por
versão.

`artifactToText` (lib/agent-run.ts) ganha um caso `image` seguro (retorna o `alt`/`prompt`),
mas na prática artefato de imagem **não vira input de outro agente** (§5.2 da spec de
thumbnails: ação "usar como input" oculta).

---

## 8. Multi-output → versões (sem novo modelo de dados)

Uma execução gera 2–3 imagens. Cada variação vira uma **versão** da mesma lineage do
artefato "Thumbnail", reusando F11/RN05:

- Variação 1 → `Artifact.createInitial` (v1, **ativa**).
- Variações 2..N → mesma lineage, arquivadas (`status: "arquivado"`).
- Usuário vê as variações lado a lado (histórico de versões) e **promove** uma — mecanismo
  de promoção existente, sem código novo de promoção.

> Decisão de implementação: introduzir um helper `Artifact.createVariations(input, urls[])`
> que insere as N versões de uma vez (v1 ativa + demais arquivadas), em vez de encadear
> `createInitial` + `regenerate`. Mantém a invariante "uma ativa por lineage" e é mais
> limpo que o encadeamento. (Detalhe a confirmar na implementação.)

---

## 9. Créditos

- Peso do `gerador-thumbnails`: **6 créditos** (`AGENT_COSTS`), provider-agnóstico.
- Fluxo de reserva/débito/liberação reusa RN-C01…RN-C07 **sem alteração**: reserva 6 antes
  de gerar qualquer imagem (bloqueio total, RN-C02); falha técnica (geração ou storage)
  libera a reserva (RN-C03); regenerar é nova execução de 6 (RN-C04).
- **Calibragem (D08) é por modelo de imagem:** `custo_real_usd` diverge entre `gpt-image`
  (~$0.01–0.17/img × n) e `nano-banana` ($0.039/img × n). `UsageRecord.modeloIa` deve
  registrar o **id do modelo de imagem** efetivo para permitir a calibragem separada.

---

## 10. Regras de negócio

**RN-IMG01 — Hierarquia independente de modelo de imagem**
O modelo de imagem resolve por global → projeto → customização → execução, separado do
modelo de texto.

**RN-IMG02 — Contrato único de execução**
Todo provider é consumido via `runImageAgent`; o pipeline não conhece a forma de chamada
(`generateImage` vs `generateText`+`files`) nem a estratégia de multi-output.

**RN-IMG03 — Persistência de output obrigatória**
Imagem gerada só vira artefato após upload bem-sucedido ao storage. Falha de upload é falha
técnica: libera a reserva (RN-C03) e não cobra crédito. Sem storage configurado, o agente
bloqueia na entrada.

**RN-IMG04 — Sem base64 no banco**
O documento do artefato guarda apenas a URL. Base64 nunca é persistido em Mongo.

**RN-IMG05 — Variações como versões**
As N imagens de uma execução são N versões de uma lineage; exatamente uma fica ativa; a
troca usa o mecanismo de promoção existente.

**RN-IMG06 — Registro por modelo de imagem**
`UsageRecord` grava o id do modelo de imagem e o `custo_real_usd` real para calibrar D08
por provider.

---

## 11. Pontos verificados (fontes)

- AI SDK 6: `experimental_generateImage` foi promovida e renomeada para `generateImage`
  (estável). `n` suportado (1–10) para `gpt-image-1`; retorna `images[]` de `GeneratedFile`.
- Nano Banana = `gemini-2.5-flash-image`, **GA desde 02/10/2025**; no AI SDK gera via
  `generateText` lendo `result.files`. Custo $0.039/imagem (1290 tok @ $30/1M output).
- Projeto: `ai@^6.0.197`, `@ai-sdk/openai@^3`, `@ai-sdk/google@^3` (ambos já instalados).

Fontes:
- https://vercel.com/blog/ai-sdk-6
- https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-image
- https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-image
- https://developers.googleblog.com/en/gemini-2-5-flash-image-now-ready-for-production-with-new-aspect-ratios/
- https://vercel.com/ai-gateway/models/gemini-2.5-flash-image

---

## 12. Implementação (arquivos)

| Camada | Arquivo | Mudança |
|---|---|---|
| Dimensão de modelo (contrato 1) | `lib/ai/image-models.ts` | **novo** — `AIImageModelId`, `IMAGE_MODELS`, `resolveImageModel` |
| Execução (contrato 2) | `lib/ai/image-execute.ts` | **novo** — `runImageAgent` com despacho por `kind` |
| Conteúdo (contrato 4) | `lib/artifact-content.ts` | + `ImageBlock` na união |
| Storage (contrato 3) | `lib/storage/*` | reuso; bucket `offs-thumbnails` |
| Versões | `models/Artifact.ts` | + `createVariations`; enum `model` aceita id de imagem |
| Orquestração | `lib/agent-run.ts` | bifurca p/ caminho de imagem (reserva 6 → runImageAgent → upload → createVariations) |
| Catálogo | `lib/catalog.ts` | categoria `visual`, agente `gerador-thumbnails`, flags `multiOutput`/`imageOutput`, GUIDED_FLOW |
| Créditos | `lib/credits.ts` | `AGENT_COSTS["gerador-thumbnails"] = 6` |
| Hierarquia (modelos) | `models/User.ts`, `models/Project.ts`, `models/AgentCustomization.ts` | + campo de modelo de imagem |
| UI runner (T03) | `components/agent/AgentRunner.tsx` | reuso de `ImageInput`; seletor de modelo de imagem; custo 6 |
| UI viewer (T04) | `components/artifact/ArtifactBlock.tsx`, `ArtifactView.tsx` | renderer de imagem; galeria de variações; Copiar→Download; "usar como input" oculto |
| Testes | `tests/` | custo do agente, `resolveImageModel`, `createVariations` |

---

## 13. Decisões em aberto remanescentes

| # | Questão | Estado |
|---|---|---|
| D06 | Categoria | **Resolvido** — nova categoria "Produção visual" (`cat: "visual"`) |
| D07 | Provider | **Resolvido** — `gpt-image` default + `nano-banana` selecionável, atrás da dimensão plugável |
| D08 | Peso 6 créditos | Provisório — calibrar com `custo_real_usd` **por modelo de imagem** |
| D09 (novo) | Tamanho/aspect ratio padrão da thumbnail | **Resolvido** — default `1536×1024` (~16:9) em `image-execute.ts`; configurável via `RunImageInput.size` |
| D10 (novo) | Verificar acesso a `gpt-image-1` na chave OpenAI do ambiente (requer verificação de org na OpenAI) | Em aberto — validar no smoke test e2e |
