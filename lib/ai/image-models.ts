// lib/ai/image-models.ts — image-model registry + hierarchy (server-only).
// Mirrors lib/ai/models.ts for the image dimension (spec offs-geracao-imagem §3).
// The rest of the app references image models by logical id (AIImageModelId) and
// never touches a provider directly. Two providers are wired today and they are
// called by DIFFERENT SDK paths — the `kind` field captures that so runImageAgent
// (lib/ai/image-execute.ts) can dispatch without the pipeline knowing:
//   - "imageModel"  → ai.generateImage (openai.image), supports n in one call
//   - "llmImageOut" → ai.generateText reading result.files (Nano Banana fan-out)

import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { DEFAULT_IMAGE_MODEL, type AIImageModelId } from "@/lib/types";

// Concrete provider model ids — overridable via env without touching code.
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";
const GOOGLE_IMAGE_MODEL =
  process.env.GOOGLE_IMAGE_MODEL ?? "gemini-2.5-flash-image";

// Provider model types are inferred from the factories so we don't depend on
// which type names the `ai` package re-exports across versions.
export type ImageModelEntry =
  | {
      /** Native image model: text-to-image via generateImage, n images per call. */
      kind: "imageModel";
      multi: "n";
      model: () => ReturnType<typeof openai.image>;
    }
  | {
      /** LLM with image output (Nano Banana): generateText → result.files, fan-out. */
      kind: "llmImageOut";
      multi: "fanout";
      model: () => ReturnType<typeof google>;
    };

/** Logical image model id → provider entry. Adding Imagen/Flux = one entry here. */
export const IMAGE_MODELS: Record<AIImageModelId, ImageModelEntry> = {
  "gpt-image": {
    kind: "imageModel",
    multi: "n",
    model: () => openai.image(OPENAI_IMAGE_MODEL),
  },
  "nano-banana": {
    kind: "llmImageOut",
    multi: "fanout",
    model: () => google(GOOGLE_IMAGE_MODEL),
  },
};

export function getImageModelEntry(id: AIImageModelId): ImageModelEntry {
  return IMAGE_MODELS[id] ?? IMAGE_MODELS[DEFAULT_IMAGE_MODEL];
}

/**
 * Image-model hierarchy (RN-IMG01, mirrors RN06): execution override → agent
 * customization → project default → user global default → hard default. The most
 * explicit choice that exists wins. Independent of the text-model hierarchy.
 */
export function resolveImageModel(opts: {
  execution?: AIImageModelId | null;
  customization?: AIImageModelId | null;
  project?: AIImageModelId | null;
  global?: AIImageModelId | null;
}): AIImageModelId {
  return (
    opts.execution ??
    opts.customization ??
    opts.project ??
    opts.global ??
    DEFAULT_IMAGE_MODEL
  );
}
