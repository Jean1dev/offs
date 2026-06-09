// models/CreditBalance.ts — saldo de créditos por usuário (spec §2).
//
// O backend é o único guardião do limite (RN-C01). O saldo renova num ciclo
// rolling de 24h a partir do primeiro uso (RN-C05), não acumula (RN-C07) e nunca
// fica negativo (RN-C06). A reserva é antecipada: debitamos no `reserve` e só
// devolvemos no `release` se a LLM falhar (RN-C03) — assim a checagem e o débito
// são uma única operação atômica, segura sob concorrência.

import mongoose, { Schema, type Model, type Types } from "mongoose";
import { CYCLE_MS, type Plano } from "@/lib/credits";

export interface CreditBalanceDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  plano: Plano;
  creditosDiarios: number;
  creditosRestantes: number;
  ultimoReset: Date;
  proximoReset: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface CreditBalanceModel extends Model<CreditBalanceDoc> {
  /** Cria o saldo se ausente e aplica o reset rolling se o ciclo expirou. */
  ensureCycle(
    userId: Types.ObjectId | string,
    plano: Plano,
    dailyCredits: number,
  ): Promise<void>;
  /**
   * Reserva `cost` créditos de forma atômica: debita só se houver saldo
   * suficiente (RN-C02/RN-C06). Retorna o saldo restante após o débito, ou
   * `null` quando insuficiente. Chame `ensureCycle` antes.
   */
  reserve(
    userId: Types.ObjectId | string,
    cost: number,
  ): Promise<number | null>;
  /** Devolve `cost` créditos (falha de LLM), sem ultrapassar o limite diário (RN-C03). */
  release(userId: Types.ObjectId | string, cost: number): Promise<void>;
}

const CreditBalanceSchema = new Schema<CreditBalanceDoc, CreditBalanceModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    plano: { type: String, enum: ["free"], default: "free" },
    creditosDiarios: { type: Number, required: true, min: 0 },
    creditosRestantes: { type: Number, required: true, min: 0 },
    ultimoReset: { type: Date, required: true },
    proximoReset: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false },
);

CreditBalanceSchema.statics.ensureCycle = async function (
  this: CreditBalanceModel,
  userId: Types.ObjectId | string,
  plano: Plano,
  dailyCredits: number,
): Promise<void> {
  const now = new Date();
  // Cria o saldo na primeira execução, já iniciando o ciclo rolling (RN-C05).
  // Duas primeiras execuções concorrentes podem disputar o upsert: o índice
  // único em userId faz o perdedor lançar E11000. O doc já existe nesse caso,
  // então tratamos como sucesso — o reserve seguinte opera sobre ele.
  try {
    await this.updateOne(
      { userId },
      {
        $setOnInsert: {
          userId,
          plano,
          creditosDiarios: dailyCredits,
          creditosRestantes: dailyCredits,
          ultimoReset: now,
          proximoReset: new Date(now.getTime() + CYCLE_MS),
        },
      },
      { upsert: true },
    );
  } catch (e) {
    if ((e as { code?: number }).code !== 11000) throw e;
  }
  // Ciclo expirado → renova o saldo cheio (RN-C07: não acumula).
  await this.updateOne(
    { userId, proximoReset: { $lte: now } },
    {
      $set: {
        creditosDiarios: dailyCredits,
        creditosRestantes: dailyCredits,
        ultimoReset: now,
        proximoReset: new Date(now.getTime() + CYCLE_MS),
      },
    },
  );
};

CreditBalanceSchema.statics.reserve = async function (
  this: CreditBalanceModel,
  userId: Types.ObjectId | string,
  cost: number,
): Promise<number | null> {
  // Débito condicional atômico: só desce se o saldo cobrir o custo inteiro.
  const updated = await this.findOneAndUpdate(
    { userId, creditosRestantes: { $gte: cost } },
    { $inc: { creditosRestantes: -cost } },
    { new: true },
  );
  return updated ? updated.creditosRestantes : null;
};

CreditBalanceSchema.statics.release = async function (
  this: CreditBalanceModel,
  userId: Types.ObjectId | string,
  cost: number,
): Promise<void> {
  // Devolução atômica (pipeline update): soma e trava no teto diário num único
  // documento (RN-C06). Evita o lost-update de um read-modify-write quando duas
  // liberações concorrem — simétrico ao $inc atômico do reserve.
  await this.updateOne({ userId }, [
    {
      $set: {
        creditosRestantes: {
          $min: [
            "$creditosDiarios",
            { $add: ["$creditosRestantes", cost] },
          ],
        },
      },
    },
  ]);
};

export const CreditBalance: CreditBalanceModel =
  (mongoose.models.CreditBalance as CreditBalanceModel) ??
  mongoose.model<CreditBalanceDoc, CreditBalanceModel>(
    "CreditBalance",
    CreditBalanceSchema,
  );
