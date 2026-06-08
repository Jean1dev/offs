"use client";

import { useRouter } from "next/navigation";
import { Card, StatusBadge } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { GUIDED_FLOW } from "@/lib/catalog";
import { ProjectMenu } from "@/components/projects/ProjectMenu";
import type { ProjectSummary } from "@/lib/projects";

export function ProjectCard({ p }: { p: ProjectSummary }) {
  const router = useRouter();
  const total = GUIDED_FLOW.length;
  const pct = (p.doneCount / total) * 100;

  return (
    <Card
      hover
      onClick={() => router.push(`/projetos/${p.id}`)}
      style={{
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "18px 20px 16px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <StatusBadge status={p.status} />
          <ProjectMenu projectId={p.id} title={p.title} />
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 21,
            lineHeight: 1.22,
            color: "var(--text-primary)",
            fontWeight: 500,
            marginBottom: 14,
            minHeight: 52,
          }}
        >
          {p.title}
        </div>

        <div style={{ marginTop: "auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 5,
                borderRadius: 999,
                background: "var(--bg-subtle)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: "var(--accent)",
                }}
              />
            </div>
            <span
              style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500 }}
            >
              {p.doneCount}/{total}
            </span>
          </div>
        </div>
      </div>
      <div
        style={{
          borderTop: "1px solid var(--border)",
          padding: "11px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg)",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "var(--text-secondary)",
          }}
        >
          <Icon name="layers" size={14} color="var(--text-tertiary)" />
          {p.artifactCount} {p.artifactCount === 1 ? "artefato" : "artefatos"}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
            {p.updated}
          </span>
        </span>
      </div>
    </Card>
  );
}
