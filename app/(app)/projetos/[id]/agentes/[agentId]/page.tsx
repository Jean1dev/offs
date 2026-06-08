import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Topbar } from "@/components/app/Topbar";
import { AgentRunner } from "@/components/agent/AgentRunner";
import { getProjectById, getProjectArtifacts } from "@/lib/projects";
import { resolveAgentCustomization } from "@/lib/customization";
import { agentById } from "@/lib/catalog";

export default async function AgentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; agentId: string }>;
  searchParams: Promise<{ fonte?: string; regenerar?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id, agentId } = await params;
  const { fonte, regenerar } = await searchParams;
  const agent = agentById(agentId);
  if (!agent) notFound();

  const [project, artifacts, customization] = await Promise.all([
    getProjectById(session.user.id, id),
    getProjectArtifacts(session.user.id, id),
    resolveAgentCustomization(session.user.id, agentId, id),
  ]);
  if (!project) notFound();

  return (
    <>
      <Topbar
        crumbs={[
          { label: "Projetos", href: "/projetos" },
          { label: project.title, href: `/projetos/${project.id}` },
          { label: agent.name },
        ]}
      />
      <AgentRunner
        project={{ id: project.id, model: project.model }}
        agent={agent}
        artifacts={artifacts}
        preselectArtifactId={fonte}
        regenerateOf={regenerar}
        initialModel={customization.model}
      />
    </>
  );
}
