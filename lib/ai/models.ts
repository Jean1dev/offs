// lib/ai/models.ts — multi-provider model registry (Vercel AI SDK).
// Mirrors the front-politicai architecture: a customProvider maps logical model
// ids ("claude" | "gpt" | "gemini") to concrete provider models, so the rest of
// the app references models by logical id and never touches a provider directly.

import { customProvider } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { DEFAULT_AI_MODEL, type AIModelId } from "@/lib/types";

// Concrete provider model ids — overridable via env without touching code.
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";
const GOOGLE_MODEL = process.env.GOOGLE_MODEL ?? "gemini-2.5-pro";

export const registry = customProvider({
  languageModels: {
    claude: anthropic(ANTHROPIC_MODEL),
    gpt: openai(OPENAI_MODEL),
    gemini: google(GOOGLE_MODEL),
  },
});

/** Resolves a logical model id to the concrete AI SDK LanguageModel. */
export function getLanguageModel(id: AIModelId) {
  return registry.languageModel(id);
}

/**
 * Model hierarchy (RN06): execution override → agent customization → project
 * default → user global default → hard default. Each level overrides the
 * previous; the most explicit choice that exists wins.
 */
export function resolveModel(opts: {
  execution?: AIModelId | null;
  customization?: AIModelId | null;
  project?: AIModelId | null;
  global?: AIModelId | null;
}): AIModelId {
  return (
    opts.execution ??
    opts.customization ??
    opts.project ??
    opts.global ??
    DEFAULT_AI_MODEL
  );
}
