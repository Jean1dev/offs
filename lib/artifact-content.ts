// lib/artifact-content.ts — structured artifact content model.
// Artifacts are NOT raw text (F10): each is a `summary` + a list of typed blocks.
// Ported from the design's block taxonomy (design/project/app/artifact_content.jsx).
// The renderer for these blocks lands in Phase 7.

export interface MetricsBlock {
  t: "metrics";
  items: { value: string; label: string }[];
}
export interface HeadingBlock {
  t: "h";
  text: string;
}
export interface ParagraphBlock {
  t: "p";
  text: string;
}
export interface LeadBlock {
  t: "lead";
  text: string;
}
export interface NoteBlock {
  t: "note";
  text: string;
}
export interface TableBlock {
  t: "table";
  cols: string[];
  rows: string[][];
}
export interface SplitColumn {
  title: string;
  items: string[];
}
export interface SplitBlock {
  t: "split";
  left: SplitColumn;
  right: SplitColumn;
}
export interface ListBlock {
  t: "list";
  items: { title: string; text: string }[];
}
export interface RankedBlock {
  t: "ranked";
  items: { rank: number; title: string; score: number; text: string }[];
}
export interface StructureBlock {
  t: "blocks";
  items: { tag: string; title: string; dur: string; text: string }[];
}
export interface ScriptBlock {
  t: "script";
  speaker: string;
  text: string;
}
export interface ScoreBlock {
  t: "score";
  value: string;
  label: string;
  sub: string;
}
/** A generated image (thumbnail). `url` points to durable storage (RN-IMG04 — never base64). */
export interface ImageBlock {
  t: "image";
  url: string;
  alt?: string;
  /** Effective prompt used to generate it — for traceability/regeneration. */
  prompt?: string;
}

export type ArtifactBlock =
  | MetricsBlock
  | HeadingBlock
  | ParagraphBlock
  | LeadBlock
  | NoteBlock
  | TableBlock
  | SplitBlock
  | ListBlock
  | RankedBlock
  | StructureBlock
  | ScriptBlock
  | ScoreBlock
  | ImageBlock;

export interface ArtifactContent {
  summary: string;
  blocks: ArtifactBlock[];
}
