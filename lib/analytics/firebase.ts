// firebase.ts — configuração e carregamento sob demanda do Firebase Analytics.
//
// Os scripts do Firebase NÃO são importados estaticamente: o `import()` dinâmico
// em `loadAnalytics()` só é resolvido quando há consentimento (ver consent.ts e
// components/analytics/ConsentManager.tsx). Isso garante que nenhum código de
// telemetria seja avaliado antes do "aceito" do usuário (requisito LGPD).

import type { Analytics } from "firebase/analytics";

// Config pública do Firebase (chaves `NEXT_PUBLIC_*` são expostas ao browser por
// design — não são segredos; o controle de acesso é feito pelas regras do
// projeto Firebase, não por sigilo destas chaves).
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} as const;

/** True quando há config suficiente para inicializar o Analytics. */
export function isAnalyticsConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.appId);
}

let analyticsPromise: Promise<Analytics | null> | null = null;

/**
 * Carrega e inicializa o Firebase Analytics sob demanda. Idempotente: chamadas
 * repetidas reaproveitam a mesma instância. Retorna `null` quando não há config,
 * o ambiente não suporta Analytics, ou estamos no servidor.
 */
export function loadAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined" || !isAnalyticsConfigured()) {
    return Promise.resolve(null);
  }
  if (!analyticsPromise) {
    analyticsPromise = (async () => {
      // Imports dinâmicos: o chunk do Firebase só baixa aqui, após o consentimento.
      const { initializeApp, getApps, getApp } = await import("firebase/app");
      const { getAnalytics, isSupported } = await import("firebase/analytics");

      if (!(await isSupported())) return null;

      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      return getAnalytics(app);
    })().catch(() => {
      // Falha no carregamento não deve quebrar a app; permite nova tentativa.
      analyticsPromise = null;
      return null;
    });
  }
  return analyticsPromise;
}

/** Registra um evento, mas só se o Analytics já estiver carregado/consentido. */
export async function trackEvent(
  name: string,
  params?: Record<string, unknown>,
): Promise<void> {
  const analytics = await loadAnalytics();
  if (!analytics) return;
  const { logEvent } = await import("firebase/analytics");
  logEvent(analytics, name, params);
}
