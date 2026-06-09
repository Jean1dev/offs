// consent.ts — LGPD consent state for analytics.
//
// LGPD (Lei 13.709/2018) exige consentimento livre, informado e inequívoco
// ANTES de qualquer coleta de dados comportamentais. Por isso o padrão aqui é
// "sem decisão" → nenhum script do Firebase é carregado. Só após o usuário
// escolher "granted" explicitamente é que a telemetria começa.

export type ConsentValue = "granted" | "denied";

/** Estado do consentimento: `null` = usuário ainda não decidiu. */
export type ConsentState = ConsentValue | null;

const STORAGE_KEY = "pauta-analytics-consent";

/** Evento disparado em `window` sempre que o consentimento muda. */
export const CONSENT_CHANGE_EVENT = "pauta-consent-change";
/** Evento que pede para reabrir o banner (ex.: a partir da página de conta). */
export const CONSENT_OPEN_EVENT = "pauta-consent-open";

/** Lê o consentimento persistido. SSR-safe: retorna `null` no servidor. */
export function readConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    // localStorage indisponível (modo privado, storage bloqueado): trate como
    // "sem decisão" — nunca assuma consentimento.
    return null;
  }
}

/** Persiste a escolha e notifica os listeners (Analytics, banner). */
export function writeConsent(value: ConsentValue): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* storage indisponível — segue só com o evento em memória */
  }
  window.dispatchEvent(
    new CustomEvent<ConsentValue>(CONSENT_CHANGE_EVENT, { detail: value }),
  );
}

/** Limpa a decisão (volta ao estado "sem decisão" → banner reaparece). */
export function clearConsent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}
