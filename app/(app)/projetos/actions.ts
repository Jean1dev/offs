"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  createProject,
  renameProject,
  archiveProject,
  duplicateProject,
  setProjectStatus,
} from "@/lib/projects";
import { STATUS, type ProjectStatus } from "@/lib/catalog";

export async function createProjectAction() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const id = await createProject(session.user.id, session.user.defaultModel);
  redirect(`/projetos/${id}`);
}

export async function renameProjectAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "");
  if (projectId) await renameProject(session.user.id, projectId, title);
  revalidatePath("/projetos");
}

export async function archiveProjectAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const projectId = String(formData.get("projectId") ?? "");
  if (projectId) await archiveProject(session.user.id, projectId);
  revalidatePath("/projetos");
}

export async function setProjectStatusAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const projectId = String(formData.get("projectId") ?? "");
  const status = String(formData.get("status") ?? "") as ProjectStatus;
  if (projectId && status in STATUS) {
    await setProjectStatus(session.user.id, projectId, status);
    revalidatePath(`/projetos/${projectId}`);
    revalidatePath("/projetos");
  }
}

export async function duplicateProjectAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const projectId = String(formData.get("projectId") ?? "");
  if (projectId) await duplicateProject(session.user.id, projectId);
  revalidatePath("/projetos");
}
