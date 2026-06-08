// lib/credits.ts — sistema de créditos: configuração de produto e funções puras.
// Espelha a spec "Sistema de Créditos e Limite de Uso". Aqui ficam apenas dados
// estáticos (pesos por agente, plano, preço por modelo) e helpers sem I/O — a
// lógica de saldo/reserva/débito vive no model CreditBalance e em lib/credit-balance.ts.
// Mantendo isto puro, as regras de custo ficam testáveis sem banco (ver tests/).

import type { AIModelId } from "@/lib/types";

// ── Planos ──
export type Plano = "free";

/** Créditos diários por plano (spec §2). Free tier = 10/dia. */
export const PLAN_DAILY_CREDITS: Record<Plano, number> = {
  free: 10,
};

export const DEFAULT_PLANO: Plano = "free";

/** Janela do ciclo rolling (RN-C05): 24h a partir do primeiro uso do dia. */
export const CYCLE_MS = 24 * 60 * 60 * 1000;

// ── Custo por agente (spec §3) ──
// Pesos fixos por agente. Agentes ausentes caem em DEFAULT_AGENT_COST.
export const AGENT_COSTS: Record<string, number> = {
  "analista-canais": 2, // input pesado — múltiplas imagens
  "analista-conteudo": 2, // input pesado — múltiplas imagens
  "analista-oportunidade": 1, // input leve — apenas artefato
  "analista-temas": 1, // input leve — artefato + texto
  "analista-roteiro": 1, // output estruturado médio
  "resumidor-temas": 1, // agente mais leve do produto
  estruturador: 1, // output médio
  roteirista: 3, // agente mais pesado — maior contexto e output
  "roteirizador-intro": 1, // output pequeno e focado
};

export const DEFAULT_AGENT_COST = 1;

/** Custo em créditos de uma execução do agente (spec §3, RN-C04). */
export function agentCost(agentId: string): number {
  return AGENT_COSTS[agentId] ?? DEFAULT_AGENT_COST;
}

// ── Preço real por modelo (spec §7/§8) ──
// USD por 1M de tokens (input/output). Base para registrar custo_real_usd e,
// no futuro, calibrar o preço por crédito. Ajustável sem mudar a arquitetura.
export const MODEL_PRICING: Record<
  AIModelId,
  { input: number; output: number }
> = {
  claude: { input: 5, output: 25 }, // Claude Opus 4.8
  "claude-sonnet": { input: 3, output: 15 }, // Claude Sonnet 4.6
  "claude-haiku": { input: 1, output: 5 }, // Claude Haiku 4.5
  gpt: { input: 2.5, output: 10 }, // GPT-4o
  "gpt-mini": { input: 0.15, output: 0.6 }, // GPT-4o mini
  gemini: { input: 1.25, output: 10 }, // Gemini 2.5 Pro
  "gemini-flash": { input: 0.3, output: 2.5 }, // Gemini 2.5 Flash
};

/** Custo real em USD a partir dos tokens consumidos (spec §7). 6 casas (microdólar). */
export function realCostUsd(
  model: AIModelId,
  tokensInput: number,
  tokensOutput: number,
): number {
  const p = MODEL_PRICING[model] ?? { input: 0, output: 0 };
  const usd = (tokensInput / 1e6) * p.input + (tokensOutput / 1e6) * p.output;
  return Math.round(usd * 1e6) / 1e6;
}

/** Saldo exposto à UI — o frontend reflete este estado, nunca o calcula (spec §6). */
export interface BalanceView {
  plano: Plano;
  creditosRestantes: number;
  creditosDiarios: number;
  /** Epoch ms do próximo reset, ou null quando o ciclo ainda não começou. */
  proximoReset: number | null;
}

/** Rótulo "6h 30min" / "45min" para o próximo reset (spec §6.1). Puro e testável. */
export function formatResetCountdown(
  proximoResetMs: number,
  nowMs: number = Date.now(),
): string {
  const diff = Math.max(0, proximoResetMs - nowMs);
  const totalMin = Math.ceil(diff / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}min`;
  return `${h}h ${m}min`;
}
