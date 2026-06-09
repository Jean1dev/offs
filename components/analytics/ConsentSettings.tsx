"use client";

// ConsentSettings.tsx — controle de privacidade na página de conta.
// Deixa o usuário ver o estado atual do consentimento de analytics e mudá-lo a
// qualquer momento (direito de revogação, LGPD art. 8º §5º).

import { useEffect, useState } from "react";
import {
  CONSENT_CHANGE_EVENT,
  isAnalyticsConfigured,
  readConsent,
  trackEvent,
  writeConsent,
  type ConsentState,
} from "@/lib/analytics";
import { SectionLabel } from "@/components/ui";
import { Icon } from "@/components/Icon";

export function ConsentSettings() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // setState síncrono pós-montagem é intencional (storage é client-only).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setConsent(readConsent());
    const onChange = () => setConsent(readConsent());
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  }, []);

  // Sem Firebase configurado não há o que gerenciar.
  if (!mounted || !isAnalyticsConfigured()) return null;

  const granted = consent === "granted";
  const statusLabel =
    consent === "granted"
      ? "Ativado"
      : consent === "denied"
        ? "Desativado"
        : "Sem decisão";

  return (
    <section>
      <SectionLabel style={{ marginBottom: 10 }}>Privacidade</SectionLabel>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
          padding: "14px 16px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
        }}
      >
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-body)",
              fontSize: 13.5,
              fontWeight: 500,
              color: "var(--text-primary)",
            }}
          >
            Analytics de uso —{" "}
            <span style={{ color: "var(--text-secondary)" }}>{statusLabel}</span>
          </p>
          <p
            className="bb-small"
            style={{ margin: "2px 0 0", color: "var(--text-secondary)" }}
          >
            O Firebase Analytics só coleta dados com o seu consentimento.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (granted) {
              writeConsent("denied");
            } else {
              writeConsent("granted");
              void trackEvent("consent_granted", { source: "settings" });
            }
          }}
          style={{
            padding: "8px 16px",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: "nowrap",
            color: granted ? "var(--text-secondary)" : "#fff",
            background: granted ? "transparent" : "var(--accent)",
            border:
              "1px solid " + (granted ? "var(--border)" : "transparent"),
            borderRadius: "var(--radius-full)",
            cursor: "pointer",
          }}
        >
          {granted ? "Revogar" : "Permitir"}
        </button>
      </div>
    </section>
  );
}
