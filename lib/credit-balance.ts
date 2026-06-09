// lib/credit-balance.ts — plano de dados do saldo de créditos (server-only).
// Envolve o model CreditBalance/UsageRecord com a configuração de plano e expõe
// as operações que o fluxo de execução (lib/agent-run.ts) e a UI consomem.
// O frontend nunca decide o limite — só reflete o BalanceView retornado daqui.

import { cache } from "react";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CreditBalance } from "@/models/CreditBalance";
import { UsageRecord, type UsageStatus } from "@/models/UsageRecord";
import {
  DEFAULT_PLANO,
  PLAN_DAILY_CREDITS,
  realCostUsd,
  formatResetCountdown,
  type BalanceView,
} from "@/lib/credits";
import type { AIModelId } from "@/lib/types";

const dailyCredits = () => PLAN_DAILY_CREDITS[DEFAULT_PLANO];

/** Erro de saldo insuficiente — mapeado para bloqueio na UI (analogia ao 402). */
export class InsufficientCreditsError extends Error {
  constructor(
    message: string,
    readonly cost: number,
    readonly remaining: number,
    readonly proximoReset: number | null,
  ) {
    super(message);
    this.name = "InsufficientCreditsError";
  }
}

/**
 * Saldo efetivo para exibição (spec §6.1). Leitura pura: se o ciclo expirou,
 * mostra o saldo cheio sem gravar — o reset real acontece na próxima reserva.
 * Memoizado por requisição (React `cache`) para o layout e a página do agente
 * compartilharem uma única leitura por render.
 */
export const getBalanceView = cache(
  async (userId: string): Promise<BalanceView> => {
    await connectToDatabase();
    const daily = dailyCredits();
    const bal = await CreditBalance.findOne({
      userId: new Types.ObjectId(userId),
    }).lean();

    if (!bal) {
      return {
        plano: DEFAULT_PLANO,
        creditosRestantes: daily,
        creditosDiarios: daily,
        proximoReset: null,
      };
    }

    const now = Date.now();
    const expired = bal.proximoReset.getTime() <= now;
    // No ciclo expirado, mostra o total novo (daily); senão, o que está gravado.
    return {
      plano: bal.plano,
      creditosRestantes: expired ? daily : bal.creditosRestantes,
      creditosDiarios: expired ? daily : bal.creditosDiarios,
      proximoReset: expired ? null : bal.proximoReset.getTime(),
    };
  },
);

/**
 * Reserva créditos antes da chamada à LLM (spec §4). Aplica o reset rolling e
 * debita de forma atômica. Lança InsufficientCreditsError quando o saldo não
 * cobre o custo (RN-C02) — o caller registra o consumo como `bloqueado_credito`.
 */
export async function reserveCredits(
  userId: string,
  cost: number,
): Promise<void> {
  await connectToDatabase();
  const uid = new Types.ObjectId(userId);
  await CreditBalance.ensureCycle(uid, DEFAULT_PLANO, dailyCredits());

  const remaining = await CreditBalance.reserve(uid, cost);
  if (remaining === null) {
    const view = await getBalanceView(userId);
    const resetMsg =
      view.proximoReset != null
        ? ` Renova em ${formatResetCountdown(view.proximoReset)}.`
        : "";
    throw new InsufficientCreditsError(
      `Créditos insuficientes: este agente custa ${cost} ${
        cost === 1 ? "crédito" : "créditos"
      } e você tem ${view.creditosRestantes}.${resetMsg}`,
      cost,
      view.creditosRestantes,
      view.proximoReset,
    );
  }
}

/** Devolve a reserva quando a LLM falha (RN-C03). */
export async function releaseCredits(
  userId: string,
  cost: number,
): Promise<void> {
  await connectToDatabase();
  await CreditBalance.release(new Types.ObjectId(userId), cost);
}

/** Registra o consumo de uma execução (spec §7) — base do billing futuro. */
export async function recordUsage(input: {
  userId: string;
  agenteId: string;
  projetoId: Types.ObjectId | string;
  modeloIa: AIModelId;
  tokensInput: number;
  tokensOutput: number;
  creditosDebitados: number;
  status: UsageStatus;
}): Promise<void> {
  await connectToDatabase();
  await UsageRecord.create({
    userId: new Types.ObjectId(input.userId),
    agenteId: input.agenteId,
    projetoId: input.projetoId,
    modeloIa: input.modeloIa,
    tokensInput: input.tokensInput,
    tokensOutput: input.tokensOutput,
    creditosDebitados: input.creditosDebitados,
    custoRealUsd: realCostUsd(
      input.modeloIa,
      input.tokensInput,
      input.tokensOutput,
    ),
    status: input.status,
  });
}
