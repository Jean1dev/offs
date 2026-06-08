import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Topbar } from "@/components/app/Topbar";
import { ProjectsBrowser } from "@/components/projects/ProjectsBrowser";
import { getProjectsForUser } from "@/lib/projects";

export default async function ProjetosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await getProjectsForUser(session.user.id);

  return (
    <>
      <Topbar crumbs={[{ label: "Projetos" }]} />
      <ProjectsBrowser projects={projects} />
    </>
  );
}
