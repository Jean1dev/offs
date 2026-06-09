"use client";

// ConsentManager.tsx — orquestra consentimento (LGPD) + Firebase Analytics.
//
// Responsável por: (1) mostrar o banner enquanto não há decisão; (2) carregar o
// Firebase APENAS quando o consentimento é "granted"; (3) registrar page_view a
// cada navegação do App Router. Nada do Firebase é importado/avaliado antes do
// "Aceitar" — o `loadAnalytics()` faz `import()` dinâmico sob demanda.

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_OPEN_EVENT,
  isAnalyticsConfigured,
  loadAnalytics,
  readConsent,
  setCollectionEnabled,
  trackEvent,
  writeConsent,
  type ConsentState,
} from "@/lib/analytics";
import { ConsentBanner } from "./ConsentBanner";

export function ConsentManager() {
  // `null` até montar para não divergir entre SSR e cliente (localStorage só
  // existe no browser). Depois reflete a decisão persistida.
  const [consent, setConsent] = useState<ConsentState>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Hidrata o estado e ouve mudanças vindas de outras telas (ex.: página conta).
  useEffect(() => {
    // Lemos o storage só após montar para não divergir de SSR (anti-FOUC, como
    // no ThemeToggle). Por isso o setState síncrono é intencional aqui.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setConsent(readConsent());

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ConsentState>).detail;
      setConsent(detail ?? readConsent());
    };
    const onReopen = () => setConsent(null);

    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    window.addEventListener(CONSENT_OPEN_EVENT, onReopen);
    return () => {
      window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
      window.removeEventListener(CONSENT_OPEN_EVENT, onReopen);
    };
  }, []);

  // Carrega o Firebase só após o consentimento explícito; ao revogar, desliga
  // a coleta do SDK mesmo que a instância já esteja em memória. Ao reconceder,
  // religa explicitamente — loadAnalytics() reaproveita a instância em cache e
  // não reativaria a coleta sozinho (ficaria desligada o resto da sessão).
  useEffect(() => {
    if (consent === "granted") {
      void (async () => {
        await loadAnalytics();
        await setCollectionEnabled(true);
      })();
    } else if (consent === "denied") {
      void setCollectionEnabled(false);
    }
  }, [consent]);

  // page_view por navegação — só quando consentido e carregado.
  useEffect(() => {
    if (consent !== "granted" || !pathname) return;
    void trackEvent("page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [consent, pathname]);

  // Sem config de Firebase ou antes de montar: não renderiza nada (e não pede
  // consentimento por algo que não existe).
  if (!mounted || !isAnalyticsConfigured()) return null;

  if (consent === null) {
    return (
      <ConsentBanner
        onAccept={() => {
          writeConsent("granted");
          void trackEvent("consent_granted", { source: "banner" });
        }}
        onReject={() => writeConsent("denied")}
      />
    );
  }

  return null;
}
