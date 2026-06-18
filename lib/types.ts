// lib/types.ts — shared domain types used across the app.
// The full agent catalog and taxonomies land in Phase 2; these are the
// cross-cutting bits needed already by auth/account in Phase 1.

/** AI model ids. Display metadata lives in lib/catalog (MODELS); the runtime
 *  registry that actually calls them lands in Phase 3. */
export type AIModelId = "claude" | "claude-sonnet" | "claude-haiku" | "gpt" | "gpt-mini" | "gemini" | "gemini-flash";

export const DEFAULT_AI_MODEL: AIModelId = "claude";

/** Image-generation model ids. Independent dimension from the text models above
 *  (spec offs-geracao-imagem §3). The provider mapping + per-provider call shape
 *  live in lib/ai/image-models.ts; display metadata in lib/catalog (IMAGE_MODELS_META). */
export type AIImageModelId = "gpt-image" | "nano-banana";

export const DEFAULT_IMAGE_MODEL: AIImageModelId = "gpt-image";

/** What an artifact's `model` field can hold: a text model or an image model. */
export type ArtifactModelId = AIModelId | AIImageModelId;

/** Optional YouTube channel connection (RN01 — never required). */
export interface Channel {
  name: string;
  handle: string;
  url: string;
}
