"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { renameArtifact, promoteArtifactVersion } from "@/lib/artifacts";

export async function renameArtifactAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const projectId = String(formData.get("projectId") ?? "");
  const artifactId = String(formData.get("artifactId") ?? "");
  const name = String(formData.get("name") ?? "");
  if (projectId && artifactId) {
    await renameArtifact(session.user.id, projectId, artifactId, name);
    revalidatePath(`/projetos/${projectId}/artefatos/${artifactId}`);
    revalidatePath(`/projetos/${projectId}`);
  }
}

export async function promoteArtifactAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const projectId = String(formData.get("projectId") ?? "");
  const artifactId = String(formData.get("artifactId") ?? "");
  if (projectId && artifactId) {
    await promoteArtifactVersion(session.user.id, projectId, artifactId);
    revalidatePath(`/projetos/${projectId}/artefatos/${artifactId}`);
    revalidatePath(`/projetos/${projectId}`);
  }
}
