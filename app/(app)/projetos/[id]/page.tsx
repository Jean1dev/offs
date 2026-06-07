import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Topbar } from "@/components/app/Topbar";
import { ModelChip, StatusBadge } from "@/components/ui";
import { getProjectById } from "@/lib/projects";

// Placeholder project interior — the guided/free modes, artifact library and
// empty state land in Phase 5. For now this confirms navigation works end-to-end.
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const project = await getProjectById(session.user.id, id);
  if (!project) notFound();

  return (
    <>
      <Topbar
        crumbs={[
          { label: "Projetos", href: "/projetos" },
          { label: project.title },
        ]}
        right={<ModelChip model={project.model} size="sm" />}
      />
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <StatusBadge status={project.status} />
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 34,
            fontWeight: 400,
            color: "var(--text-primary)",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {project.title}
        </h1>
        <p className="bb-body" style={{ margin: 0 }}>
          Interior do projeto em construção — o modo guiado, o modo livre e a
          biblioteca de artefatos chegam na Fase 5.
        </p>
      </div>
    </>
  );
}
