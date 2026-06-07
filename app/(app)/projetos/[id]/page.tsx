import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Topbar } from "@/components/app/Topbar";
import { ModelChip } from "@/components/ui";
import { ProjectInterior } from "@/components/project/ProjectInterior";
import { getProjectById, getProjectArtifacts } from "@/lib/projects";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const [project, artifacts] = await Promise.all([
    getProjectById(session.user.id, id),
    getProjectArtifacts(session.user.id, id),
  ]);
  if (!project) notFound();

  const ch = session.user.channel;
  const channel = ch
    ? { name: ch.name, handle: ch.handle, initial: ch.name.charAt(0).toUpperCase() }
    : null;

  return (
    <>
      <Topbar
        crumbs={[
          { label: "Projetos", href: "/projetos" },
          { label: project.title },
        ]}
        right={<ModelChip model={project.model} size="sm" />}
      />
      <ProjectInterior
        project={{
          id: project.id,
          title: project.title,
          status: project.status,
          model: project.model,
          updated: project.updated,
          done: project.done,
        }}
        artifacts={artifacts}
        channel={channel}
      />
    </>
  );
}
