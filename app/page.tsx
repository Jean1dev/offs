import { Icon } from "@/components/Icon";

export default function Home() {
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
        Fundação do projeto pronta — Next.js 16, design tokens BeautyBook, fontes
        Cormorant Garamond + DM Sans e dark mode. As telas chegam nas próximas fases.
      </p>
    </main>
  );
}
