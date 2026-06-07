// lib/types.ts — shared domain types used across the app.
// The full agent catalog and taxonomies land in Phase 2; these are the
// cross-cutting bits needed already by auth/account in Phase 1.

/** AI model ids (match the design's MODELS keys; registry comes in Phase 3). */
export type AIModelId = "claude" | "gpt" | "gemini";

export const AI_MODELS: Record<AIModelId, { name: string; short: string }> = {
  claude: { name: "Claude", short: "Claude" },
  gpt: { name: "GPT-4o", short: "GPT-4o" },
  gemini: { name: "Gemini 2.5 Pro", short: "Gemini" },
};

export const DEFAULT_AI_MODEL: AIModelId = "claude";

/** Optional YouTube channel connection (RN01 — never required). */
export interface Channel {
  name: string;
  handle: string;
  url: string;
}
