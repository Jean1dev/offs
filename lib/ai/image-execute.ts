// lib/ai/image-execute.ts — image-generation execution (spec offs-geracao-imagem §5).
// The single contract the rest of the pipeline talks to. It hides which provider
// generated the image and how multi-output is achieved:
//   - "imageModel"  (gpt-image): generateImage with n → one call, n images.
//   - "llmImageOut" (Nano Banana): generateText × n in parallel, reading result.files.
// Returns the variations as data URLs (base64) + the real USD cost for UsageRecord.

import { generateImage, generateText } from "ai";
import { getImageModelEntry } from "@/lib/ai/image-models";
import { imageRealCostUsd } from "@/lib/credits";
import type { AIImageModelId } from "@/lib/types";

export interface RunImageInput {
  /** Logical image model id, already resolved via resolveImageModel (RN-IMG01). */
  imageModel: AIImageModelId;
  /** Assembled prompt: briefing visual + narrative context (roteiro/introdução). */
  prompt: string;
  /** Reference images (data URLs) — channel/competitor thumbnails (§3.3). Optional. */
  refs?: string[];
  /** Number of variations to generate (2–3). */
  n: number;
  /** Pixel size, e.g. "1536x1024" (16:9-ish thumbnail). Provider-dependent. */
  size?: `${number}x${number}`;
}

export interface RunImageResult {
  /** Generated variations as data URLs (base64), length up to `n`. */
  images: string[];
  /** Real cost in USD of this execution (spec §7) — feeds UsageRecord. */
  costUsd: number;
}

const DEFAULT_SIZE = "1536x1024" as const; // ~16:9 thumbnail

function fileToDataUrl(file: {
  base64: string;
  mediaType?: string;
}): string {
  const mime = file.mediaType ?? "image/png";
  return `data:${mime};base64,${file.base64}`;
}

/** Generates `n` thumbnail variations. Throws on provider failure (caller releases credits). */
export async function runImageAgent(
  input: RunImageInput,
): Promise<RunImageResult> {
  const entry = getImageModelEntry(input.imageModel);
  const n = Math.max(1, input.n);

  let images: string[];

  if (entry.kind === "imageModel") {
    // gpt-image: native text-to-image, n images in a single call. The standard
    // generateImage interface is text-only, so reference images are not consumed
    // here (documented trade-off — Nano Banana is the path for ref-driven runs).
    const { images: generated } = await generateImage({
      model: entry.model(),
      prompt: input.prompt,
      n,
      size: input.size ?? DEFAULT_SIZE,
    });
    images = generated.map((f) => fileToDataUrl(f));
  } else {
    // Nano Banana: LLM with image output. No `n` param → fan out n parallel calls.
    // Reference images go in as multimodal parts so the model can preserve the
    // channel's visual identity (§3.3).
    const userContent: Array<
      { type: "text"; text: string } | { type: "image"; image: string }
    > = [{ type: "text", text: input.prompt }];
    for (const ref of input.refs ?? []) {
      userContent.push({ type: "image", image: ref });
    }
    const results = await Promise.all(
      Array.from({ length: n }, () =>
        generateText({
          model: entry.model(),
          messages: [{ role: "user", content: userContent }],
        }),
      ),
    );
    images = results
      .map((r) => r.files.find((f) => f.mediaType?.startsWith("image/")))
      .filter((f): f is NonNullable<typeof f> => Boolean(f))
      .map((f) => fileToDataUrl(f));
  }

  // No partial execution (RN-C02): if the provider delivered fewer variations than
  // requested (e.g. Nano Banana fan-out where some calls returned only text), fail the
  // whole run so the reserve is released (RN-C03) instead of charging for a degraded result.
  if (images.length < n) {
    throw new Error(
      `O provedor de imagem retornou ${images.length} de ${n} variações solicitadas.`,
    );
  }

  return {
    images,
    costUsd: imageRealCostUsd(input.imageModel, images.length),
  };
}
