import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Topbar } from "@/components/app/Topbar";
import { getProjectById } from "@/lib/projects";

// Placeholder artifact view — the structured block renderer, version switcher
// and actions (copiar / usar como input / regenerar / renomear) land in Phase 7.
export default async function ArtifactPage({
  params,
}: {
  params: Promise<{ id: string; artifactId: string }>;
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
          { label: project.title, href: `/projetos/${project.id}` },
          { label: "Artefato" },
        ]}
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
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 30,
            fontWeight: 400,
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          Artefato
        </h1>
        <p className="bb-body" style={{ margin: 0 }}>
          A visualização estruturada do artefato, o seletor de versão e as ações
          (copiar, usar como input, regenerar, renomear) chegam na Fase 7.
        </p>
      </div>
    </>
  );
}
