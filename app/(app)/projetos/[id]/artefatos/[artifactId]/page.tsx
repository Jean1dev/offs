import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Topbar } from "@/components/app/Topbar";
import { ArtifactView } from "@/components/artifact/ArtifactView";
import { getProjectById } from "@/lib/projects";
import { getArtifactDetail } from "@/lib/artifacts";

export default async function ArtifactPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; artifactId: string }>;
  searchParams: Promise<{ novo?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id, artifactId } = await params;
  const { novo } = await searchParams;

  const [project, artifact] = await Promise.all([
    getProjectById(session.user.id, id),
    getArtifactDetail(session.user.id, id, artifactId),
  ]);
  if (!project || !artifact) notFound();

  return (
    <>
      <Topbar
        crumbs={[
          { label: "Projetos", href: "/projetos" },
          { label: project.title, href: `/projetos/${project.id}` },
          { label: artifact.name },
        ]}
      />
      <ArtifactView
        projectId={project.id}
        artifact={artifact}
        justNew={novo === "1"}
      />
    </>
  );
}
