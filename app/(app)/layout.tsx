import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/app/Sidebar";
import { getRecentProjects, getProjectsForUser } from "@/lib/projects";
import { getBalanceView } from "@/lib/credit-balance";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [recents, all, credits] = await Promise.all([
    getRecentProjects(session.user.id),
    getProjectsForUser(session.user.id),
    getBalanceView(session.user.id),
  ]);

  const name = session.user.name ?? "Você";

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      <Sidebar
        recents={recents}
        projectCount={all.length}
        user={{
          name,
          plan: "Plano Criador",
          initial: name.charAt(0).toUpperCase(),
        }}
        credits={credits}
      />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {children}
      </main>
    </div>
  );
}
