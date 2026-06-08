// lib/ai/schema.ts — Zod schema for structured artifact generation.
// Mirrors the block union in lib/artifact-content.ts so generateObject/streamObject
// constrain the model to emit valid, renderable artifacts (F10 — never raw text).

import { z } from "zod";

const metricsBlock = z.object({
  t: z.literal("metrics"),
  items: z.array(z.object({ value: z.string(), label: z.string() })),
});
const headingBlock = z.object({ t: z.literal("h"), text: z.string() });
const paragraphBlock = z.object({ t: z.literal("p"), text: z.string() });
const leadBlock = z.object({ t: z.literal("lead"), text: z.string() });
const noteBlock = z.object({ t: z.literal("note"), text: z.string() });
const tableBlock = z.object({
  t: z.literal("table"),
  cols: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});
const splitColumn = z.object({ title: z.string(), items: z.array(z.string()) });
const splitBlock = z.object({
  t: z.literal("split"),
  left: splitColumn,
  right: splitColumn,
});
const listBlock = z.object({
  t: z.literal("list"),
  items: z.array(z.object({ title: z.string(), text: z.string() })),
});
const rankedBlock = z.object({
  t: z.literal("ranked"),
  items: z.array(
    z.object({
      rank: z.number(),
      title: z.string(),
      score: z.number(),
      text: z.string(),
    }),
  ),
});
const structureBlock = z.object({
  t: z.literal("blocks"),
  items: z.array(
    z.object({
      tag: z.string(),
      title: z.string(),
      dur: z.string(),
      text: z.string(),
    }),
  ),
});
const scriptBlock = z.object({
  t: z.literal("script"),
  speaker: z.string(),
  text: z.string(),
});
const scoreBlock = z.object({
  t: z.literal("score"),
  value: z.string(),
  label: z.string(),
  sub: z.string(),
});

// NOTE: z.union (→ JSON Schema `anyOf`), not z.discriminatedUnion (→ `oneOf`).
// OpenAI Structured Outputs rejects `oneOf` ("'oneOf' is not permitted"); `anyOf`
// is accepted by all three providers. The literal `t` field still disambiguates.
export const artifactBlockSchema = z.union([
  metricsBlock,
  headingBlock,
  paragraphBlock,
  leadBlock,
  noteBlock,
  tableBlock,
  splitBlock,
  listBlock,
  rankedBlock,
  structureBlock,
  scriptBlock,
  scoreBlock,
]);

export const artifactContentSchema = z.object({
  summary: z.string(),
  blocks: z.array(artifactBlockSchema),
});

export type GeneratedArtifactContent = z.infer<typeof artifactContentSchema>;
