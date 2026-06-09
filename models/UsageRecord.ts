// models/UsageRecord.ts — registro de consumo por execução (spec §7).
//
// Cada execução de agente gera um registro: quem rodou, qual modelo, tokens,
// créditos debitados e custo real em USD. É a base de dados que vai informar o
// modelo de billing futuro (spec §8) — guardamos custo_real_usd desde já para
// poder calibrar o preço por crédito contra o custo observado por agente/modelo.

import mongoose, { Schema, type Model, type Types } from "mongoose";
import { randomUUID } from "crypto";
import type { AIModelId } from "@/lib/types";

export type UsageStatus = "sucesso" | "erro_llm" | "bloqueado_credito";

export interface UsageRecordDoc {
  _id: Types.ObjectId;
  execucaoId: string;
  userId: Types.ObjectId;
  agenteId: string;
  projetoId: Types.ObjectId;
  modeloIa: AIModelId;
  tokensInput: number;
  tokensOutput: number;
  creditosDebitados: number;
  custoRealUsd: number;
  status: UsageStatus;
  createdAt: Date;
}

const UsageRecordSchema = new Schema<UsageRecordDoc>(
  {
    execucaoId: { type: String, required: true, default: () => randomUUID() },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    agenteId: { type: String, required: true },
    projetoId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    modeloIa: { type: String, required: true },
    tokensInput: { type: Number, default: 0 },
    tokensOutput: { type: Number, default: 0 },
    creditosDebitados: { type: Number, default: 0 },
    custoRealUsd: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["sucesso", "erro_llm", "bloqueado_credito"],
      required: true,
    },
  },
  // createdAt serve como o `timestamp` da execução (spec §7).
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

export const UsageRecord: Model<UsageRecordDoc> =
  (mongoose.models.UsageRecord as Model<UsageRecordDoc>) ??
  mongoose.model<UsageRecordDoc>("UsageRecord", UsageRecordSchema);
