import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-4)",
        padding: "var(--space-16)",
        textAlign: "center",
      }}
    >
      <span
        className="bb-display"
        style={{ fontSize: 64, color: "var(--accent)", fontStyle: "italic" }}
      >
        404
      </span>
      <h1 className="bb-h2" style={{ margin: 0, color: "var(--text-primary)" }}>
        Página não encontrada
      </h1>
      <p className="bb-body" style={{ margin: 0, maxWidth: 420 }}>
        Este endereço não existe ou o conteúdo foi movido.
      </p>
      <Link
        href="/projetos"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 20px",
          fontFamily: "var(--font-body)",
          fontSize: 13,
          fontWeight: 500,
          color: "#fff",
          background: "var(--accent)",
          borderRadius: "var(--radius-full)",
          boxShadow: "var(--shadow-accent)",
        }}
      >
        Voltar aos projetos
        <Icon name="arrowR" size={16} color="#fff" />
      </Link>
    </main>
  );
}
