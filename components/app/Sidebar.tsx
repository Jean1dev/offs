"use client";

// Sidebar.tsx — app shell sidebar (ported from design/project/app/app.jsx).

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { SectionLabel } from "@/components/ui";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { CreditMeter } from "@/components/app/CreditMeter";
import { STATUS, type ProjectStatus } from "@/lib/catalog";
import { createProjectAction } from "@/app/(app)/projetos/actions";
import type { RecentProject } from "@/lib/projects";
import type { BalanceView } from "@/lib/credits";

function Wordmark() {
  return (
    <Link
      href="/projetos"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        userSelect: "none",
      }}
    >
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          background: "var(--accent)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-accent)",
        }}
      >
        <Icon name="sparkle" size={18} color="#fff" filled />
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 25,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: "var(--text-primary)",
          lineHeight: 1,
        }}
      >
        Pauta
      </span>
    </Link>
  );
}

function NavItem({
  icon,
  label,
  active,
  href,
  badge,
}: {
  icon: IconName;
  label: string;
  active: boolean;
  href: string;
  badge?: number;
}) {
  const [h, setH] = useState(false);
  return (
    <Link
      href={href}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        width: "100%",
        padding: "9px 12px",
        borderRadius: 10,
        transition: "all .14s",
        background: active
          ? "var(--accent-light)"
          : h
            ? "var(--bg-subtle)"
            : "transparent",
        color: active ? "var(--accent)" : "var(--text-secondary)",
        fontFamily: "var(--font-body)",
        fontSize: 13.5,
        fontWeight: active ? 600 : 500,
      }}
    >
      <Icon name={icon} size={18} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && (
        <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500 }}>
          {badge}
        </span>
      )}
    </Link>
  );
}

function dotColor(status: ProjectStatus): string {
  const tone = STATUS[status].tone;
  return tone === "rose"
    ? "var(--accent)"
    : tone === "gold"
      ? "var(--gold)"
      : tone === "success"
        ? "var(--success-fg)"
        : "var(--text-tertiary)";
}

export function Sidebar({
  recents,
  user,
  projectCount,
  credits,
}: {
  recents: RecentProject[];
  user: { name: string; plan: string; initial: string };
  projectCount: number;
  credits: BalanceView;
}) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 248,
        flexShrink: 0,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "20px 14px",
      }}
    >
      <div style={{ padding: "0 6px 18px" }}>
        <Wordmark />
      </div>

      <form action={createProjectAction} style={{ marginBottom: 18 }}>
        <button
          type="submit"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "10px 18px",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 500,
            color: "#fff",
            background: "var(--accent)",
            border: "1px solid transparent",
            borderRadius: "var(--radius-full)",
            boxShadow: "var(--shadow-accent)",
            cursor: "pointer",
          }}
        >
          <Icon name="plus" size={17} color="#fff" />
          Novo projeto
        </button>
      </form>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <NavItem
          icon="folder"
          label="Projetos"
          href="/projetos"
          active={pathname === "/projetos" || pathname.startsWith("/projetos/")}
          badge={projectCount}
        />
        <NavItem
          icon="settings"
          label="Conta & preferências"
          href="/conta"
          active={pathname === "/conta"}
        />
      </nav>

      <div style={{ marginTop: 24, marginBottom: 8, padding: "0 12px" }}>
        <SectionLabel>Projetos recentes</SectionLabel>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          overflowY: "auto",
          flex: 1,
        }}
      >
        {recents.map((p) => {
          const active = pathname === `/projetos/${p.id}`;
          return (
            <Link
              key={p.id}
              href={`/projetos/${p.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                width: "100%",
                padding: "8px 12px",
                borderRadius: 9,
                background: active ? "var(--bg-subtle)" : "transparent",
                transition: "all .14s",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  flexShrink: 0,
                  background: dotColor(p.status),
                }}
              />
              <span
                style={{
                  flex: 1,
                  fontFamily: "var(--font-body)",
                  fontSize: 12.5,
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: active ? 600 : 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {p.title}
              </span>
            </Link>
          );
        })}
      </div>

      <div style={{ marginTop: 8 }}>
        <CreditMeter balance={credits} />
      </div>

      <div style={{ marginTop: 8 }}>
        <a
          href="https://calendly.com/jeanlucafp/consultoria"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            fontSize: 13,
            fontFamily: "var(--font-body)",
            textDecoration: "none",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-hover, rgba(0,0,0,0.04))";
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "";
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Suporte &amp; Informações
        </a>
      </div>

      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: 14,
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Link
          href="/conta"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "4px 6px",
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              background:
                "linear-gradient(135deg, var(--rose-200), var(--rose-300))",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              color: "var(--rose-700)",
              flexShrink: 0,
              fontSize: 15,
            }}
          >
            {user.initial}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
              {user.plan}
            </div>
          </div>
        </Link>
        <ThemeToggle />
      </div>
    </aside>
  );
}
