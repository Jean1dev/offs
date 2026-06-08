// lib/types.ts — shared domain types used across the app.
// The full agent catalog and taxonomies land in Phase 2; these are the
// cross-cutting bits needed already by auth/account in Phase 1.

/** AI model ids. Display metadata lives in lib/catalog (MODELS); the runtime
 *  registry that actually calls them lands in Phase 3. */
export type AIModelId = "claude" | "claude-sonnet" | "claude-haiku" | "gpt" | "gpt-mini" | "gemini" | "gemini-flash";

export const DEFAULT_AI_MODEL: AIModelId = "claude";

/** Optional YouTube channel connection (RN01 — never required). */
export interface Channel {
  name: string;
  handle: string;
  url: string;
}
