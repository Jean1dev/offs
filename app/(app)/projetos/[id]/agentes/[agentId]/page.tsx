import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Topbar } from "@/components/app/Topbar";
import { AgentGlyph } from "@/components/ui";
import { getProjectById } from "@/lib/projects";
import { agentById } from "@/lib/catalog";

// Placeholder agent execution screen — the input composer, policy gates,
// narrative/model selectors and streaming run land in Phase 6.
export default async function AgentPage({
  params,
}: {
  params: Promise<{ id: string; agentId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id, agentId } = await params;
  const project = await getProjectById(session.user.id, id);
  const agent = agentById(agentId);
  if (!project || !agent) notFound();

  return (
    <>
      <Topbar
        crumbs={[
          { label: "Projetos", href: "/projetos" },
          { label: project.title, href: `/projetos/${project.id}` },
          { label: agent.name },
        ]}
      />
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <AgentGlyph agent={agent} size={52} />
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 30,
            fontWeight: 400,
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          {agent.name}
        </h1>
        <p className="bb-body" style={{ margin: 0 }}>
          {agent.desc}
        </p>
        <p className="bb-small" style={{ margin: 0 }}>
          A execução do agente (compositor de input, política editorial, modelo
          narrativo e geração) chega na Fase 6.
        </p>
      </div>
    </>
  );
}
