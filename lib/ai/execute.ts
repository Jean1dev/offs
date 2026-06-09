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
  /** Image inputs (data URLs) — prints for channel agents (RN04). */
  images?: string[];
}

/** Tokens consumidos na execução — alimentam o registro de consumo (créditos §7). */
export interface RunUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface RunAgentResult {
  content: ArtifactContent;
  usage: RunUsage;
}

function systemFor(input: RunAgentInput): string {
  const override = input.systemPromptOverride?.trim();
  if (override) return override;
  return buildSystemPrompt(input.agent, { narrative: input.narrative });
}

/** Builds the user turn: plain prompt, or multimodal message when images exist. */
function callArgs(input: RunAgentInput) {
  const system = systemFor(input);
  if (input.images && input.images.length > 0) {
    return {
      system,
      messages: [
        {
          role: "user" as const,
          content: [
            { type: "text" as const, text: input.context },
            ...input.images.map((img) => ({
              type: "image" as const,
              image: img,
            })),
          ],
        },
      ],
    };
  }
  return { system, prompt: input.context };
}

/** One-shot structured generation. Returns the artifact content + token usage. */
export async function runAgent(input: RunAgentInput): Promise<RunAgentResult> {
  const { object, usage } = await generateObject({
    model: getLanguageModel(input.model),
    schema: artifactContentSchema,
    ...callArgs(input),
  });
  return {
    content: object as ArtifactContent,
    usage: {
      inputTokens: usage?.inputTokens ?? 0,
      outputTokens: usage?.outputTokens ?? 0,
    },
  };
}

/** Streaming structured generation — for live "generating…" UI. */
export function streamAgent(input: RunAgentInput) {
  return streamObject({
    model: getLanguageModel(input.model),
    schema: artifactContentSchema,
    ...callArgs(input),
  });
}
