import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Icon } from "@/components/Icon";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  if (session) redirect(callbackUrl || "/projetos");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-8)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-md)",
          padding: "var(--space-12) var(--space-8)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-6)",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "var(--accent)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-accent)",
            }}
          >
            <Icon name="sparkle" size={22} color="#fff" filled />
          </span>
          <span
            className="bb-h1"
            style={{ fontSize: 30, fontWeight: 500, color: "var(--text-primary)" }}
          >
            Pauta
          </span>
        </div>

        <p className="bb-body" style={{ margin: 0 }}>
          Entre para planejar e produzir seus vídeos com agentes de IA.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: callbackUrl || "/projetos" });
          }}
          style={{ width: "100%" }}
        >
          <button
            type="submit"
            style={{
              width: "100%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "12px 18px",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: 500,
              color: "#fff",
              background: "var(--accent)",
              border: "1px solid transparent",
              borderRadius: "var(--radius-full)",
              boxShadow: "var(--shadow-accent)",
              cursor: "pointer",
            }}
          >
            <Icon name="user" size={18} color="#fff" />
            Entrar com Google
          </button>
        </form>
      </div>
    </main>
  );
}
