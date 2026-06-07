import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Topbar } from "@/components/app/Topbar";
import { ModelChip } from "@/components/ui";
import { ProjectsBrowser } from "@/components/projects/ProjectsBrowser";
import { getProjectsForUser } from "@/lib/projects";

export default async function ProjetosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await getProjectsForUser(session.user.id);

  return (
    <>
      <Topbar
        crumbs={[{ label: "Projetos" }]}
        right={<ModelChip model={session.user.defaultModel} size="sm" />}
      />
      <ProjectsBrowser projects={projects} />
    </>
  );
}
