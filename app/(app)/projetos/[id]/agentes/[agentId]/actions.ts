"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  executeAgentRun,
  AgentRunError,
  type AgentRunInput,
} from "@/lib/agent-run";

export interface RunResult {
  error?: string;
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
    if (e instanceof AgentRunError) return { error: e.message };
    // Map common AI provider failures to actionable messages.
    const status = (e as { statusCode?: number })?.statusCode;
    if (status === 401 || status === 403) {
      return { error: "Chave de API inválida ou sem acesso ao modelo selecionado." };
    }
    if (status === 429) {
      return { error: "Limite do provedor de IA atingido. Tente novamente em instantes." };
    }
    console.error("runAgentAction failed:", e);
    return { error: "Falha ao executar o agente. Tente de novo ou troque o modelo." };
  }

  redirect(`/projetos/${input.projectId}/artefatos/${artifactId}?novo=1`);
}
