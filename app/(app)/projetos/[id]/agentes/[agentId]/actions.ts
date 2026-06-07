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
    artifactId = await executeAgentRun(session.user.id, input);
  } catch (e) {
    if (e instanceof AgentRunError) return { error: e.message };
    console.error("runAgentAction failed:", e);
    return { error: "Falha ao executar o agente. Tente novamente." };
  }

  redirect(`/projetos/${input.projectId}/artefatos/${artifactId}`);
}
