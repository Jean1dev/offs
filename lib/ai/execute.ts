// lib/ai/execute.ts — agent execution entrypoint.
// Assembles the system prompt + user context and calls the resolved model via the
// Vercel AI SDK, constraining output to the structured artifact schema (F08/F10).
// The input composer (images, artifact refs, sources) and persistence land in Phase 6;
// here `context` is the already-assembled textual context for the run.

import { generateObject, streamObject } from "ai";
import { getLanguageModel } from "@/lib/ai/models";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { artifactContentSchema } from "@/lib/ai/schema";
import type { Agent, NarrativeModelId } from "@/lib/catalog";
import type { AIModelId } from "@/lib/types";
import type { ArtifactContent } from "@/lib/artifact-content";

export interface RunAgentInput {
  agent: Agent;
  /** Logical model id, already resolved via resolveModel (RN06). */
  model: AIModelId;
  /** Assembled user context (free text + artifact summaries + sources). */
  context: string;
  /** Narrative model, for agents with `narrative: true`. */
  narrative?: NarrativeModelId;
  /** Customized base prompt, when the user overrode the agent (Phase 8). */
  systemPromptOverride?: string;
}

function systemFor(input: RunAgentInput): string {
  const override = input.systemPromptOverride?.trim();
  if (override) return override;
  return buildSystemPrompt(input.agent, { narrative: input.narrative });
}

/** One-shot structured generation. Returns the finished artifact content. */
export async function runAgent(input: RunAgentInput): Promise<ArtifactContent> {
  const { object } = await generateObject({
    model: getLanguageModel(input.model),
    schema: artifactContentSchema,
    system: systemFor(input),
    prompt: input.context,
  });
  return object as ArtifactContent;
}

/** Streaming structured generation — for live "generating…" UI in Phase 6. */
export function streamAgent(input: RunAgentInput) {
  return streamObject({
    model: getLanguageModel(input.model),
    schema: artifactContentSchema,
    system: systemFor(input),
    prompt: input.context,
  });
}
