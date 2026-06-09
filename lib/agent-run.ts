// lib/agent-run.ts — server-side agent execution (Phase 6).
// Assembles the run context from the composer inputs, calls the resolved model
// (structured output), persists the artifact and marks the agent as done.

import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Project } from "@/models/Project";
import { Artifact } from "@/models/Artifact";
import { runAgent } from "@/lib/ai/execute";
import { resolveModel } from "@/lib/ai/models";
import { resolveAgentCustomization } from "@/lib/customization";
import { researchTopic } from "@/lib/ai/research";
import { getStorage } from "@/lib/storage";
import {
  reserveCredits,
  releaseCredits,
  recordUsage,
} from "@/lib/credit-balance";
import { agentCost } from "@/lib/credits";
import { agentById, type Agent, type NarrativeModelId } from "@/lib/catalog";
import type { AIModelId } from "@/lib/types";
import type { ArtifactContent } from "@/lib/artifact-content";

export interface AgentRunInput {
  projectId: string;
  agentId: string;
  ctxMode: "referencia" | "rascunho" | null;
  model: AIModelId;
  narrative?: NarrativeModelId;
  text: string;
  sources: string[];
  selectedArtifactIds: string[];
  images: string[];
  /** When set, regenerate this artifact as a new version (RN05) instead of new. */
  regenerateOf?: string;
}

/** Flattens a structured artifact to text so it can feed another agent. */
function artifactToText(name: string, content: ArtifactContent): string {
  const lines: string[] = [content.summary];
  for (const b of content.blocks) {
    switch (b.t) {
      case "h":
        lines.push(`## ${b.text}`);
        break;
      case "p":
      case "lead":
      case "note":
        lines.push(b.text);
        break;
      case "table":
        lines.push(
          [b.cols.join(" | "), ...b.rows.map((r) => r.join(" | "))].join("\n"),
        );
        break;
      case "metrics":
        lines.push(b.items.map((m) => `${m.value} ${m.label}`).join(", "));
        break;
      case "split":
        lines.push(
          `${b.left.title}: ${b.left.items.join("; ")} || ${b.right.title}: ${b.right.items.join("; ")}`,
        );
        break;
      case "list":
        lines.push(b.items.map((i) => `- ${i.title}: ${i.text}`).join("\n"));
        break;
      case "ranked":
        lines.push(
          b.items
            .map((i) => `${i.rank}. ${i.title} (${i.score}): ${i.text}`)
            .join("\n"),
        );
        break;
      case "blocks":
        lines.push(
          b.items
            .map((i) => `[${i.tag}] ${i.title} (${i.dur}): ${i.text}`)
            .join("\n"),
        );
        break;
      case "script":
        lines.push(`${b.speaker}: ${b.text}`);
        break;
      case "score":
        lines.push(`${b.label}: ${b.value} — ${b.sub}`);
        break;
    }
  }
  return `### ${name}\n${lines.join("\n")}`;
}

export class AgentRunError extends Error {}

/** Runs an agent and returns the created artifact id. */
export async function executeAgentRun(
  userId: string,
  input: AgentRunInput,
  /** User's global default model — the lowest level of the hierarchy (RN06). */
  globalModel?: AIModelId,
): Promise<string> {
  await connectToDatabase();
  const uid = new Types.ObjectId(userId);

  const project = await Project.findOne({ _id: input.projectId, userId: uid });
  if (!project) throw new AgentRunError("Projeto não encontrado.");

  const agent = agentById(input.agentId);
  if (!agent) throw new AgentRunError("Agente não encontrado.");

  // Dual-context (RN08): inputs/produces/desc swap by the selected moment.
  const ctx =
    agent.dualContext && input.ctxMode
      ? agent.contexts?.[input.ctxMode]
      : undefined;
  const effInputs = ctx ? ctx.inputs : agent.inputs;
  const produces = ctx ? ctx.produces : agent.produces;

  // Editorial gates (referencia mode only).
  if (
    agent.dualContext &&
    input.ctxMode === "referencia" &&
    input.text.trim().length === 0
  ) {
    throw new AgentRunError("Cole o roteiro de referência para analisar.");
  }

  // Assemble context.
  const parts: string[] = [];
  if (agent.dualContext && input.ctxMode === "referencia" && input.text.trim()) {
    parts.push(`Roteiro de referência para análise:\n${input.text.trim()}`);
  }
  if (input.selectedArtifactIds.length) {
    const arts = await Artifact.find({
      _id: { $in: input.selectedArtifactIds },
      projectId: project._id,
    }).lean();
    for (const a of arts) {
      parts.push(`Artefato de entrada — ${artifactToText(a.name, a.content)}`);
    }
  }
  if (input.text.trim() && !(agent.dualContext && input.ctxMode === "referencia")) {
    parts.push(
      `${agent.requiresSources ? "Direcionamentos extras" : "Contexto do usuário"}:\n${input.text.trim()}`,
    );
  }
  if (input.sources.length) {
    parts.push(
      "Fontes fornecidas (use SOMENTE estas):\n" +
        input.sources.map((s, i) => `[${i + 1}] ${s}`).join("\n"),
    );
  }
  const context =
    parts.join("\n\n") || "Gere o artefato com base no papel do agente.";

  // Effective agent so the prompt reflects the dual-context produces/desc.
  const effectiveAgent: Agent = ctx
    ? { ...agent, produces, inputs: effInputs, desc: ctx.desc }
    : agent;

  // Customization overlay (F12): project-scoped overrides global; affects the
  // base prompt and adds a level to the model hierarchy (RN06).
  const overlay = await resolveAgentCustomization(userId, agent.id, project._id);

  const model = resolveModel({
    execution: input.model,
    customization: overlay.model,
    project: project.model as AIModelId,
    global: globalModel,
  });

  // Reserva antecipada de créditos (spec §4): debita ANTES da LLM e só confirma
  // no sucesso. Saldo insuficiente lança InsufficientCreditsError (registrada
  // como `bloqueado_credito`). O registro de consumo é best-effort: nunca pode
  // mascarar o erro original (ex.: trocar InsufficientCreditsError por um erro
  // de escrita do Mongo faria a UI mostrar a mensagem técnica genérica).
  const cost = agentCost(agent.id);
  const safeRecord = async (
    status: "sucesso" | "erro_llm" | "bloqueado_credito",
    tokensInput: number,
    tokensOutput: number,
    creditosDebitados: number,
  ) => {
    try {
      await recordUsage({
        userId,
        agenteId: agent.id,
        projetoId: project._id,
        modeloIa: model,
        tokensInput,
        tokensOutput,
        creditosDebitados,
        status,
      });
    } catch (e) {
      console.error("Falha ao registrar consumo de créditos:", e);
    }
  };

  try {
    await reserveCredits(userId, cost);
  } catch (e) {
    await safeRecord("bloqueado_credito", 0, 0, 0);
    throw e;
  }

  // A partir daqui os créditos estão reservados. Pesquisa, geração E persistência
  // ficam sob o mesmo guarda: qualquer falha técnica (LLM, storage, gravação do
  // artefato) devolve a reserva (RN-C03) para o usuário não perder créditos por
  // uma execução que não entregou artefato.
  let artifact;
  let usage: { inputTokens: number; outputTokens: number };
  try {
    // Web-search research step (pesquisa real) for agents that need it, prepended
    // to the context as factual base. Best effort: failure degrades gracefully.
    let finalContext = context;
    if (agent.webSearch) {
      const research = await researchTopic(model, context);
      if (research) {
        finalContext = `Pesquisa na web (base factual — cite as fontes encontradas com as URLs):\n${research}\n\n${context}`;
      }
    }

    const result = await runAgent({
      agent: effectiveAgent,
      model,
      context: finalContext,
      narrative: agent.narrative ? input.narrative : undefined,
      images: effInputs.includes("image") ? input.images : undefined,
      systemPromptOverride: overlay.prompt,
    });
    const content = result.content;
    usage = result.usage;

    // Persist the source prints to storage (RN04) so they survive the run. The model
    // already received them inline as base64; here we keep durable references. Best
    // effort: a storage failure must not fail an already-generated artifact.
    let inputImages: string[] = [];
    if (effInputs.includes("image") && input.images.length) {
      const storage = getStorage();
      if (storage) {
        try {
          inputImages = await Promise.all(
            input.images.map((dataUrl, i) =>
              storage.uploadDataUrl(dataUrl, {
                bucket: "offs-prints",
                filename: `print-${i + 1}.png`,
              }),
            ),
          );
        } catch (e) {
          console.error("Falha ao persistir prints no storage:", e);
        }
      }
    }

    // Regenerate (RN05): archive the current active version and add the next one,
    // preserving the lineage and the artifact's name. Otherwise create a fresh one.
    artifact = null;
    if (input.regenerateOf && Types.ObjectId.isValid(input.regenerateOf)) {
      const orig = await Artifact.findOne({
        _id: input.regenerateOf,
        projectId: project._id,
      });
      if (orig) {
        artifact = await Artifact.regenerate(orig.lineageId, {
          name: orig.name,
          agentId: agent.id,
          model,
          content,
          inputImages,
        });
      }
    }
    if (!artifact) {
      artifact = await Artifact.createInitial({
        projectId: project._id,
        name: produces,
        agentId: agent.id,
        model,
        content,
        inputImages,
      });
    }

    await Project.updateOne(
      { _id: project._id, userId: uid },
      { $addToSet: { done: agent.id } },
    );
  } catch (e) {
    await releaseCredits(userId, cost);
    await safeRecord("erro_llm", 0, 0, 0);
    throw e;
  }

  // Sucesso: os créditos já foram debitados na reserva. Registra o consumo com
  // os tokens reais para informar o billing futuro (spec §7/§8).
  await safeRecord("sucesso", usage.inputTokens, usage.outputTokens, cost);

  return String(artifact._id);
}
