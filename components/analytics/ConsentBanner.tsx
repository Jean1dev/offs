"use client";

// ConsentBanner.tsx — banner de consentimento LGPD para analytics.
// Apresentacional: recebe os handlers do ConsentManager. Aparece fixo no rodapé
// enquanto o usuário não decidiu (ou ao reabrir as preferências de privacidade).

import { Button } from "@/components/ui";
import { Icon } from "@/components/Icon";

export function ConsentBanner({
  onAccept,
  onReject,
}: {
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="Consentimento de cookies e analytics"
      aria-live="polite"
      style={{
        position: "fixed",
        zIndex: 60,
        left: "50%",
        transform: "translateX(-50%)",
        bottom: "var(--space-4, 16px)",
        width: "min(560px, calc(100vw - 32px))",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        padding: "var(--space-5, 20px)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--accent-light)",
            color: "var(--accent)",
          }}
        >
          <Icon name="lock" size={17} />
        </span>
        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontFamily: "var(--font-body)",
              fontSize: 14.5,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Sua privacidade
          </h2>
          <p
            style={{
              margin: "6px 0 0",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              lineHeight: 1.55,
              color: "var(--text-secondary)",
            }}
          >
            Usamos o Firebase Analytics para entender como você usa o Pauta e
            melhorar o produto. Em conformidade com a LGPD, esses scripts só são
            carregados com o seu consentimento. Você pode mudar essa escolha a
            qualquer momento na sua conta.
          </p>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <Button variant="ghost" size="sm" onClick={onReject}>
          Recusar
        </Button>
        <Button variant="primary" size="sm" onClick={onAccept}>
          Aceitar
        </Button>
      </div>
    </div>
  );
}
