"use client";

// ui.tsx — Pauta shared atoms, built on BeautyBook tokens.
// Ported from design/project/app/ui.jsx. Data-dependent atoms
// (StatusBadge, ModelChip, AgentGlyph) land with the catalog/types in a later phase.

import { useState, type CSSProperties, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export function SectionLabel({
  children,
  style = {},
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--text-tertiary)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Button ──────────────────────────────────────────────
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "gold"
  | "subtle"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export function Button({
  variant = "primary",
  size = "md",
  full = false,
  icon,
  iconR,
  disabled = false,
  children,
  onClick,
  style = {},
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  icon?: IconName;
  iconR?: IconName;
  disabled?: boolean;
  children?: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  const [hover, setHover] = useState(false);
  const base: CSSProperties = {
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    letterSpacing: "0.01em",
    border: "1px solid transparent",
    borderRadius: "var(--radius-full)",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all .16s",
    lineHeight: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: full ? "100%" : undefined,
    whiteSpace: "nowrap",
    padding: size === "sm" ? "8px 14px" : size === "lg" ? "13px 24px" : "10px 18px",
    fontSize: size === "sm" ? 12.5 : size === "lg" ? 14 : 13,
    opacity: disabled ? 0.5 : 1,
  };
  const variants: Record<ButtonVariant, CSSProperties> = {
    primary: {
      background: hover && !disabled ? "var(--accent-dark)" : "var(--accent)",
      color: "#fff",
      boxShadow: disabled ? "none" : "var(--shadow-accent)",
      transform: hover && !disabled ? "translateY(-1px)" : "none",
    },
    secondary: {
      background: hover ? "var(--accent-light)" : "transparent",
      color: "var(--accent)",
      borderColor: "var(--accent)",
    },
    ghost: {
      background: hover ? "var(--bg-subtle)" : "transparent",
      color: "var(--text-secondary)",
      borderColor: "var(--border)",
    },
    gold: {
      background: hover ? "var(--gold-500)" : "var(--gold)",
      color: "#fff",
      letterSpacing: "0.03em",
    },
    subtle: {
      background: hover ? "var(--bg-subtle)" : "transparent",
      color: "var(--text-secondary)",
    },
    danger: {
      background: hover ? "rgba(196,88,88,0.12)" : "transparent",
      color: "var(--danger)",
      borderColor: "var(--border)",
    },
  };
  const iconSize = size === "sm" ? 15 : 17;
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconR && <Icon name={iconR} size={iconSize} />}
    </button>
  );
}

// ── Badge ───────────────────────────────────────────────
export type BadgeTone = "rose" | "gold" | "success" | "neutral";

export function Badge({
  tone = "neutral",
  dot = false,
  icon,
  children,
  style = {},
}: {
  tone?: BadgeTone;
  dot?: boolean;
  icon?: IconName;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const tones: Record<BadgeTone, CSSProperties> = {
    rose: { background: "var(--accent-light)", color: "var(--rose-700)" },
    gold: { background: "var(--gold-light)", color: "var(--gold-600)" },
    success: { background: "var(--success-bg)", color: "var(--success-fg)" },
    neutral: {
      background: "var(--bg-subtle)",
      color: "var(--text-secondary)",
      border: "1px solid var(--border)",
    },
  };
  const dotColor: Record<BadgeTone, string> = {
    rose: "var(--accent)",
    gold: "var(--gold)",
    success: "var(--success-fg)",
    neutral: "var(--text-tertiary)",
  };
  return (
    <span
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 11.5,
        fontWeight: 500,
        letterSpacing: "0.02em",
        padding: "3px 11px",
        borderRadius: "var(--radius-full)",
        lineHeight: 1.5,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        ...tones[tone],
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: dotColor[tone],
            flexShrink: 0,
          }}
        />
      )}
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}

// ── RoleTag ─────────────────────────────────────────────
export function RoleTag({ role }: { role: "produtor" | "revisor" }) {
  return role === "revisor" ? (
    <Badge tone="gold" style={{ fontSize: 10, padding: "2px 8px" }}>
      Revisor
    </Badge>
  ) : (
    <Badge tone="rose" style={{ fontSize: 10, padding: "2px 8px" }}>
      Produtor
    </Badge>
  );
}

// ── Card ────────────────────────────────────────────────
export function Card({
  hover = false,
  onClick,
  children,
  style = {},
}: {
  hover?: boolean;
  onClick?: () => void;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={hover ? () => setH(true) : undefined}
      onMouseLeave={hover ? () => setH(false) : undefined}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: h ? "var(--shadow-lg)" : "var(--shadow-sm)",
        transform: h ? "translateY(-2px)" : "none",
        transition: "box-shadow .2s, transform .2s, border-color .2s",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── IconBtn (square ghost) ──────────────────────────────
export function IconBtn({
  name,
  onClick,
  active = false,
  title,
  size = 36,
  style = {},
}: {
  name: IconName;
  onClick?: () => void;
  active?: boolean;
  title?: string;
  size?: number;
  style?: CSSProperties;
}) {
  const [h, setH] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        border: "1px solid " + (active ? "var(--accent)" : "var(--border)"),
        background: active
          ? "var(--accent-light)"
          : h
            ? "var(--bg-subtle)"
            : "transparent",
        color: active ? "var(--accent)" : "var(--text-secondary)",
        cursor: "pointer",
        transition: "all .15s",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        ...style,
      }}
    >
      <Icon name={name} size={size * 0.5} />
    </button>
  );
}

// ── ProgressRing ────────────────────────────────────────
export function ProgressRing({
  value,
  total,
  size = 38,
  stroke = 3.5,
}: {
  value: number;
  total: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total ? value / total : 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0 }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--border)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset .5s" }}
      />
    </svg>
  );
}
