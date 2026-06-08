// lib/customization.ts — agent customization overlays (F12, spec §2.5).
// An overlay is project-scoped or global; project takes priority. Restoring the
// default deletes the overlay (the catalog agent itself is never mutated).

import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Project } from "@/models/Project";
import { AgentCustomization } from "@/models/AgentCustomization";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { agentById } from "@/lib/catalog";
import type { AIModelId } from "@/lib/types";

export type CustomizationScope = "global" | "projeto";

/** The default editable base prompt shown in the customize editor. */
export function buildEditablePrompt(agentId: string): string {
  const agent = agentById(agentId);
  return agent ? buildSystemPrompt(agent) : "";
}

export interface EditOverlay {
  prompt: string;
  model: AIModelId | null;
  scope: CustomizationScope;
}

/** Existing overlay to prefill the editor (project preferred, then global). */
export async function getCustomizationForEdit(
  userId: string,
  agentId: string,
  projectId: string,
): Promise<EditOverlay | null> {
  await connectToDatabase();
  const uid = new Types.ObjectId(userId);
  const proj = Types.ObjectId.isValid(projectId)
    ? await AgentCustomization.findOne({
        userId: uid,
        agentId,
        scope: "projeto",
        projectId: new Types.ObjectId(projectId),
      }).lean()
    : null;
  const overlay =
    proj ??
    (await AgentCustomization.findOne({
      userId: uid,
      agentId,
      scope: "global",
      projectId: null,
    }).lean());
  if (!overlay) return null;
  return {
    prompt: overlay.prompt ?? "",
    model: (overlay.model as AIModelId | null) ?? null,
    scope: overlay.scope as CustomizationScope,
  };
}

/** Resolved overlay for an execution: project overrides global (used at run time). */
export async function resolveAgentCustomization(
  userId: string,
  agentId: string,
  projectId: Types.ObjectId | string,
): Promise<{ prompt?: string; model?: AIModelId }> {
  await connectToDatabase();
  const uid = new Types.ObjectId(userId);
  const proj = Types.ObjectId.isValid(projectId)
    ? await AgentCustomization.findOne({
        userId: uid,
        agentId,
        scope: "projeto",
        projectId: new Types.ObjectId(projectId),
      }).lean()
    : null;
  const overlay =
    proj ??
    (await AgentCustomization.findOne({
      userId: uid,
      agentId,
      scope: "global",
      projectId: null,
    }).lean());
  if (!overlay) return {};
  return {
    prompt: overlay.prompt?.trim() || undefined,
    model: (overlay.model as AIModelId | null) ?? undefined,
  };
}

export async function saveCustomization(
  userId: string,
  agentId: string,
  projectId: string,
  data: { prompt: string; model: AIModelId | null; scope: CustomizationScope },
): Promise<void> {
  await connectToDatabase();
  const uid = new Types.ObjectId(userId);
  if (data.scope === "projeto") {
    const owns = await Project.exists({ _id: projectId, userId: uid });
    if (!owns) return;
  }
  const pid = data.scope === "projeto" ? new Types.ObjectId(projectId) : null;
  await AgentCustomization.findOneAndUpdate(
    { userId: uid, agentId, scope: data.scope, projectId: pid },
    { prompt: data.prompt, model: data.model },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

/** Restores the original default by deleting the overlay for that scope. */
export async function deleteCustomization(
  userId: string,
  agentId: string,
  projectId: string,
  scope: CustomizationScope,
): Promise<void> {
  await connectToDatabase();
  const uid = new Types.ObjectId(userId);
  const pid = scope === "projeto" ? new Types.ObjectId(projectId) : null;
  await AgentCustomization.deleteOne({ userId: uid, agentId, scope, projectId: pid });
}
