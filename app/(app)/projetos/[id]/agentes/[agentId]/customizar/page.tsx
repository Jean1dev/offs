import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Topbar } from "@/components/app/Topbar";
import { AgentCustomizer } from "@/components/agent/AgentCustomizer";
import { getProjectById } from "@/lib/projects";
import {
  buildEditablePrompt,
  getCustomizationForEdit,
} from "@/lib/customization";
import { agentById } from "@/lib/catalog";

export default async function CustomizePage({
  params,
}: {
  params: Promise<{ id: string; agentId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id, agentId } = await params;
  const agent = agentById(agentId);
  if (!agent) notFound();

  const [project, initial] = await Promise.all([
    getProjectById(session.user.id, id),
    getCustomizationForEdit(session.user.id, agentId, id),
  ]);
  if (!project) notFound();

  return (
    <>
      <Topbar
        crumbs={[
          { label: "Projetos", href: "/projetos" },
          { label: project.title, href: `/projetos/${project.id}` },
          { label: agent.name, href: `/projetos/${project.id}/agentes/${agent.id}` },
          { label: "Customizar" },
        ]}
      />
      <AgentCustomizer
        project={{ id: project.id, title: project.title, model: project.model }}
        agent={agent}
        basePrompt={buildEditablePrompt(agentId)}
        initial={initial}
      />
    </>
  );
}
