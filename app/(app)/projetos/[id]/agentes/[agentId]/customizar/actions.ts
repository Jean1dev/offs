"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  saveCustomization,
  deleteCustomization,
  type CustomizationScope,
} from "@/lib/customization";
import { MODELS } from "@/lib/catalog";
import type { AIModelId } from "@/lib/types";

export async function saveCustomizationAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projectId = String(formData.get("projectId") ?? "");
  const agentId = String(formData.get("agentId") ?? "");
  const prompt = String(formData.get("prompt") ?? "");
  const rawModel = String(formData.get("model") ?? "");
  const scope = (String(formData.get("scope") ?? "projeto") === "global"
    ? "global"
    : "projeto") as CustomizationScope;
  const model: AIModelId | null = rawModel in MODELS ? (rawModel as AIModelId) : null;

  if (projectId && agentId) {
    await saveCustomization(session.user.id, agentId, projectId, {
      prompt,
      model,
      scope,
    });
  }
  redirect(`/projetos/${projectId}/agentes/${agentId}`);
}

export async function restoreCustomizationAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projectId = String(formData.get("projectId") ?? "");
  const agentId = String(formData.get("agentId") ?? "");
  // The saved overlay's scope (not the editor's current selection).
  const scope = (String(formData.get("restoreScope") ?? "projeto") === "global"
    ? "global"
    : "projeto") as CustomizationScope;

  if (projectId && agentId) {
    await deleteCustomization(session.user.id, agentId, projectId, scope);
    revalidatePath(`/projetos/${projectId}/agentes/${agentId}/customizar`);
  }
  redirect(`/projetos/${projectId}/agentes/${agentId}`);
}
