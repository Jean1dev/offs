// Topbar.tsx — sticky breadcrumb header (ported from design/project/app/app.jsx).

import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Icon } from "@/components/Icon";

export interface Crumb {
  label: string;
  href?: string;
}

export function Topbar({
  crumbs,
  right,
}: {
  crumbs: Crumb[];
  right?: ReactNode;
}) {
  return (
    <header
      style={{
        height: 60,
        flexShrink: 0,
        borderBottom: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--bg-surface) 80%, transparent)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          minWidth: 0,
        }}
      >
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          const label = (
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13.5,
                color: last ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: last ? 600 : 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 340,
              }}
            >
              {c.label}
            </span>
          );
          return (
            <Fragment key={i}>
              {i > 0 && (
                <Icon
                  name="chevronR"
                  size={15}
                  color="var(--text-tertiary)"
                  style={{ flexShrink: 0 }}
                />
              )}
              {c.href && !last ? <Link href={c.href}>{label}</Link> : label}
            </Fragment>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        {right}
      </div>
    </header>
  );
}
