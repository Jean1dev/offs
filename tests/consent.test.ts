import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// O módulo de consentimento é SSR-safe e fala com `window`/`localStorage`. O
// ambiente de teste é "node" (sem DOM), então montamos um `window` mínimo —
// localStorage em memória + dispatch/CustomEvent — para exercitar a lógica.

type Listener = (e: { detail: unknown }) => void;

function installFakeWindow() {
  const memory = new Map<string, string>();
  const listeners: Record<string, Listener[]> = {};
  const fake = {
    localStorage: {
      getItem: (k: string) => (memory.has(k) ? memory.get(k)! : null),
      setItem: (k: string, v: string) => void memory.set(k, v),
      removeItem: (k: string) => void memory.delete(k),
    },
    addEventListener: (type: string, cb: Listener) => {
      (listeners[type] ??= []).push(cb);
    },
    removeEventListener: (type: string, cb: Listener) => {
      listeners[type] = (listeners[type] ?? []).filter((l) => l !== cb);
    },
    dispatchEvent: (e: { type: string; detail: unknown }) => {
      (listeners[e.type] ?? []).forEach((l) => l(e));
      return true;
    },
  };
  vi.stubGlobal("window", fake);
  // CustomEvent não existe em node: shim simples carregando type + detail.
  vi.stubGlobal(
    "CustomEvent",
    class {
      type: string;
      detail: unknown;
      constructor(type: string, init?: { detail?: unknown }) {
        this.type = type;
        this.detail = init?.detail ?? null;
      }
    },
  );
  return { memory, listeners };
}

describe("consent storage", () => {
  beforeEach(() => installFakeWindow());
  afterEach(() => vi.unstubAllGlobals());

  it("começa sem decisão (opt-in: nada de tracking por padrão)", async () => {
    const { readConsent } = await import("@/lib/analytics/consent");
    expect(readConsent()).toBeNull();
  });

  it("persiste e lê o consentimento concedido", async () => {
    const { readConsent, writeConsent } = await import(
      "@/lib/analytics/consent"
    );
    writeConsent("granted");
    expect(readConsent()).toBe("granted");
    writeConsent("denied");
    expect(readConsent()).toBe("denied");
  });

  it("trata valores inválidos no storage como sem decisão", async () => {
    const { readConsent } = await import("@/lib/analytics/consent");
    window.localStorage.setItem("pauta-analytics-consent", "talvez");
    expect(readConsent()).toBeNull();
  });

  it("dispara evento de mudança ao escrever", async () => {
    const { writeConsent, CONSENT_CHANGE_EVENT } = await import(
      "@/lib/analytics/consent"
    );
    const seen: unknown[] = [];
    window.addEventListener(CONSENT_CHANGE_EVENT, (e) =>
      seen.push((e as CustomEvent).detail),
    );
    writeConsent("granted");
    expect(seen).toEqual(["granted"]);
  });

  it("clearConsent remove a decisão e pede reabertura do banner", async () => {
    const { writeConsent, clearConsent, readConsent, CONSENT_OPEN_EVENT } =
      await import("@/lib/analytics/consent");
    writeConsent("granted");
    let reopened = false;
    window.addEventListener(CONSENT_OPEN_EVENT, () => (reopened = true));
    clearConsent();
    expect(readConsent()).toBeNull();
    expect(reopened).toBe(true);
  });
});
