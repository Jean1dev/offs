"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  executeAgentRun,
  AgentRunError,
  type AgentRunInput,
} from "@/lib/agent-run";
import { InsufficientCreditsError } from "@/lib/credit-balance";

export interface RunResult {
  error?: string;
}

/** Maps a thrown error to an actionable message (and surfaces detail in dev). */
function describeRunError(e: unknown): string {
  const err = e as {
    name?: string;
    message?: string;
    statusCode?: number;
  };
  const status = err?.statusCode;
  const name = err?.name ?? "";
  const msg = err?.message ?? "";

  if (status === 401 || status === 403 || name === "LoadAPIKeyError" || /api[\s-]?key/i.test(msg)) {
    return "Chave de API do provedor ausente ou inválida — confira o .env.local.";
  }
  if (status === 429) {
    return "Limite do provedor de IA atingido. Tente novamente em instantes.";
  }
  if (name === "NoObjectGeneratedError") {
    return "O modelo não retornou o artefato no formato esperado. Tente outro modelo.";
  }
  if (process.env.NODE_ENV !== "production" && msg) {
    return `Falha ao executar: ${msg}`;
  }
  return "Falha ao executar o agente. Tente de novo ou troque o modelo.";
}

export async function runAgentAction(input: AgentRunInput): Promise<RunResult> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let artifactId: string;
  try {
    artifactId = await executeAgentRun(
      session.user.id,
      input,
      session.user.defaultModel,
    );
  } catch (e) {
    // Saldo insuficiente (spec §6.2): mensagem acionável, sem detalhe técnico.
    if (e instanceof InsufficientCreditsError) return { error: e.message };
    if (e instanceof AgentRunError) return { error: e.message };
    console.error("runAgentAction failed:", e);
    return { error: describeRunError(e) };
  }

  redirect(`/projetos/${input.projectId}/artefatos/${artifactId}?novo=1`);
}
