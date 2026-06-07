import Link from "next/link";
import { auth } from "@/auth";
import { Icon } from "@/components/Icon";

export default async function Home() {
  const session = await auth();
  const loggedIn = !!session?.user;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-6)",
        padding: "var(--space-16)",
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            width: 44,
            height: 44,
            borderRadius: 13,
            background: "var(--accent)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-accent)",
          }}
        >
          <Icon name="sparkle" size={26} color="#fff" filled />
        </span>
        <span
          className="bb-display"
          style={{ fontSize: 44, fontWeight: 500, color: "var(--text-primary)" }}
        >
          Pauta
        </span>
      </div>

      <p className="bb-body" style={{ maxWidth: 460 }}>
        Assistente de projetos para criadores de YouTube. Planeje e produza vídeos
        com agentes de IA — do canal ao roteiro.
      </p>

      <Link
        href={loggedIn ? "/projetos" : "/login"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          padding: "12px 22px",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          fontWeight: 500,
          color: "#fff",
          background: "var(--accent)",
          borderRadius: "var(--radius-full)",
          boxShadow: "var(--shadow-accent)",
        }}
      >
        {loggedIn ? "Meus projetos" : "Entrar"}
        <Icon name="arrowR" size={17} color="#fff" />
      </Link>
    </main>
  );
}
