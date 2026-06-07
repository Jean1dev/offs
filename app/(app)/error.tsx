"use client";

import { useEffect } from "react";
import { Icon } from "@/components/Icon";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-4)",
        padding: "var(--space-12)",
        textAlign: "center",
      }}
    >
      <span
        style={{
          width: 56,
          height: 56,
          borderRadius: 999,
          background: "var(--accent-light)",
          color: "var(--accent)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="alert" size={26} />
      </span>
      <h1 className="bb-h2" style={{ margin: 0, color: "var(--text-primary)" }}>
        Algo deu errado
      </h1>
      <p className="bb-body" style={{ margin: 0, maxWidth: 420 }}>
        Não foi possível carregar esta tela. Tente novamente — se persistir, recarregue
        a página.
      </p>
      <button
        onClick={reset}
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
          border: "1px solid transparent",
          borderRadius: "var(--radius-full)",
          boxShadow: "var(--shadow-accent)",
          cursor: "pointer",
        }}
      >
        <Icon name="refresh" size={16} color="#fff" />
        Tentar novamente
      </button>
    </div>
  );
}
