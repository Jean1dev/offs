"use client";

// CreditMeter.tsx — indicador de saldo de créditos (spec §6.1).
// Visível em toda a interface do app. Apenas reflete o BalanceView vindo do
// backend: créditos restantes / total, barra de progresso e o próximo reset.

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { formatResetCountdown, type BalanceView } from "@/lib/credits";

export function CreditMeter({ balance }: { balance: BalanceView }) {
  const { creditosRestantes, creditosDiarios, proximoReset } = balance;
  const pct =
    creditosDiarios > 0
      ? Math.max(0, Math.min(100, (creditosRestantes / creditosDiarios) * 100))
      : 0;
  const empty = creditosRestantes <= 0;

  // Recalcula o "renova em…" a cada minuto sem pedir nada ao servidor.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (proximoReset == null) return;
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, [proximoReset]);

  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        background: "var(--bg-subtle)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
        }}
      >
        <Icon
          name="sparkle"
          size={13}
          color={empty ? "var(--danger)" : "var(--accent)"}
          filled
        />
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {creditosRestantes} / {creditosDiarios}
        </span>
        <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
          créditos
        </span>
      </div>
      <div
        style={{
          height: 5,
          borderRadius: 999,
          background: "var(--border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 999,
            background: empty ? "var(--danger)" : "var(--accent)",
            transition: "width .3s",
          }}
        />
      </div>
      <div
        style={{
          marginTop: 7,
          fontSize: 10.5,
          color: "var(--text-tertiary)",
          lineHeight: 1.3,
        }}
      >
        {proximoReset != null
          ? `Renova em ${formatResetCountdown(proximoReset, now)}`
          : empty
            ? "Sem créditos disponíveis"
            : "Renova 24h após o primeiro uso"}
      </div>
    </div>
  );
}
