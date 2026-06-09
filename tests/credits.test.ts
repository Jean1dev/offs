import { describe, it, expect } from "vitest";
import {
  agentCost,
  realCostUsd,
  formatResetCountdown,
  AGENT_COSTS,
  PLAN_DAILY_CREDITS,
} from "@/lib/credits";

// Pesos por agente (spec §3).
describe("agentCost", () => {
  it("usa o peso do catálogo de custos", () => {
    expect(agentCost("roteirista")).toBe(3);
    expect(agentCost("analista-canais")).toBe(2);
    expect(agentCost("resumidor-temas")).toBe(1);
  });

  it("cai no custo padrão para agente desconhecido", () => {
    expect(agentCost("agente-inexistente")).toBe(1);
  });

  it("pipeline completo custa 13 e excede o free tier (10)", () => {
    const total = Object.values(AGENT_COSTS).reduce((a, b) => a + b, 0);
    expect(total).toBe(13);
    expect(total).toBeGreaterThan(PLAN_DAILY_CREDITS.free);
  });
});

// Custo real em USD a partir de tokens (spec §7).
describe("realCostUsd", () => {
  it("calcula input + output pelo preço do modelo (Opus 4.8)", () => {
    // 1M input ($5) + 1M output ($25) = $30
    expect(realCostUsd("claude", 1_000_000, 1_000_000)).toBe(30);
  });

  it("escala proporcionalmente aos tokens", () => {
    // 200k input * $1/M + 100k output * $5/M (Haiku) = 0.2 + 0.5 = 0.7
    expect(realCostUsd("claude-haiku", 200_000, 100_000)).toBeCloseTo(0.7, 6);
  });

  it("é zero sem tokens", () => {
    expect(realCostUsd("gpt", 0, 0)).toBe(0);
  });
});

// Rótulo do próximo reset (spec §6.1).
describe("formatResetCountdown", () => {
  const now = 1_000_000_000_000;

  it("formata horas e minutos", () => {
    expect(formatResetCountdown(now + (6 * 60 + 30) * 60_000, now)).toBe("6h 30min");
  });

  it("mostra só minutos quando falta menos de uma hora", () => {
    expect(formatResetCountdown(now + 45 * 60_000, now)).toBe("45min");
  });

  it("nunca fica negativo", () => {
    expect(formatResetCountdown(now - 10_000, now)).toBe("0min");
  });
});
