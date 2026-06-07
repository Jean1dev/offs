"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { SectionLabel } from "@/components/ui";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { createProjectAction } from "@/app/(app)/projetos/actions";
import { type ProjectStatus } from "@/lib/catalog";
import type { ProjectSummary } from "@/lib/projects";

type FilterKey = "todos" | ProjectStatus;

const FILTERS: [FilterKey, string][] = [
  ["todos", "Todos"],
  ["ideia", "Ideia"],
  ["roteiro", "Roteiro"],
  ["producao", "Produção"],
  ["publicado", "Publicado"],
];

export function ProjectsBrowser({ projects }: { projects: ProjectSummary[] }) {
  const [filter, setFilter] = useState<FilterKey>("todos");
  const filtered =
    filter === "todos" ? projects : projects.filter((p) => p.status === filter);

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 40px 80px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
          marginBottom: 28,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <SectionLabel style={{ marginBottom: 10 }}>Seu estúdio</SectionLabel>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 40,
              fontWeight: 300,
              letterSpacing: "-0.01em",
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Seus{" "}
            <span style={{ fontStyle: "italic", color: "var(--accent)" }}>
              projetos
            </span>
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: "var(--text-secondary)",
              margin: "14px 0 0",
              maxWidth: 540,
              lineHeight: 1.6,
            }}
          >
            Cada projeto é um vídeo em produção. Acione os agentes para analisar
            seu canal, achar temas e escrever o roteiro.
          </p>
        </div>
        <form action={createProjectAction} style={{ flexShrink: 0 }}>
          <button
            type="submit"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 24px",
              fontFamily: "var(--font-body)",
              fontSize: 14,
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
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {FILTERS.map(([k, label]) => {
          const active = filter === k;
          const n =
            k === "todos"
              ? projects.length
              : projects.filter((p) => p.status === k).length;
          return (
            <button
              key={k}
              onClick={() => setFilter(k)}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 500,
                padding: "7px 15px",
                borderRadius: "var(--radius-full)",
                cursor: "pointer",
                transition: "all .15s",
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: active ? "var(--accent)" : "var(--bg-surface)",
                color: active ? "#fff" : "var(--text-secondary)",
                border: "1px solid " + (active ? "var(--accent)" : "var(--border)"),
                boxShadow: active ? "var(--shadow-accent)" : "none",
              }}
            >
              {label}
              <span style={{ fontSize: 11, opacity: active ? 0.8 : 0.6 }}>{n}</span>
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
          gap: 18,
        }}
      >
        {filtered.map((p) => (
          <ProjectCard key={p.id} p={p} />
        ))}
        <form action={createProjectAction} style={{ display: "flex" }}>
          <button
            type="submit"
            style={{
              all: "unset",
              cursor: "pointer",
              minHeight: 196,
              width: "100%",
              boxSizing: "border-box",
              border: "1.5px dashed var(--border-strong)",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: "var(--text-tertiary)",
              transition: "all .18s",
            }}
          >
            <span
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                border: "1.5px solid currentColor",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="plus" size={22} />
            </span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13.5,
                fontWeight: 500,
              }}
            >
              Criar novo projeto
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
