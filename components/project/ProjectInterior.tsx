"use client";

// ProjectInterior.tsx — Tela 2: interior do projeto (guiado / livre / biblioteca /
// estado vazio). Ported from design/project/app/screen_project.jsx.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import {
  Button,
  Badge,
  RoleTag,
  StatusBadge,
  AgentGlyph,
  SectionLabel,
} from "@/components/ui";
import {
  AGENTS,
  CATEGORIES,
  GUIDED_FLOW,
  STATUS,
  agentById,
  type Agent,
  type AgentCategory,
  type ProjectStatus,
} from "@/lib/catalog";
import type { AIModelId } from "@/lib/types";
import type { ArtifactListItem } from "@/lib/projects";
import {
  renameProjectAction,
  setProjectStatusAction,
} from "@/app/(app)/projetos/actions";

export interface InteriorProject {
  id: string;
  title: string;
  status: ProjectStatus;
  model: AIModelId;
  updated: string;
  done: string[];
}

interface ChannelInfo {
  name: string;
  handle: string;
  initial: string;
}

interface Ctx {
  project: InteriorProject;
  agentArtifact: Map<string, string>; // agentId -> active artifact id
  artifacts: ArtifactListItem[];
}

function agentRoute(projectId: string, agentId: string) {
  return `/projetos/${projectId}/agentes/${agentId}`;
}
function artifactRoute(projectId: string, artifactId: string) {
  return `/projetos/${projectId}/artefatos/${artifactId}`;
}

// ── Guided stepper ──────────────────────────────────────
function GuidedStep({
  agent,
  index,
  isDone,
  isNext,
  ctx,
}: {
  agent: Agent;
  index: number;
  isDone: boolean;
  isNext: boolean;
  ctx: Ctx;
}) {
  const router = useRouter();
  const ring = isDone || isNext ? "var(--accent)" : "var(--border-strong)";
  const artifactId = ctx.agentArtifact.get(agent.id);

  return (
    <div style={{ display: "flex", gap: 16, position: "relative" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid " + ring,
            background: isDone
              ? "var(--accent)"
              : isNext
                ? "var(--accent-light)"
                : "var(--bg-surface)",
            color: isDone
              ? "#fff"
              : isNext
                ? "var(--accent)"
                : "var(--text-tertiary)",
            flexShrink: 0,
            zIndex: 1,
          }}
        >
          {isDone ? (
            <Icon name="check" size={17} sw={2.4} />
          ) : (
            <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600 }}>
              {index + 1}
            </span>
          )}
        </div>
        {index < GUIDED_FLOW.length - 1 && (
          <div
            style={{
              width: 2,
              flex: 1,
              minHeight: 26,
              background: isDone ? "var(--accent)" : "var(--border)",
              marginTop: 2,
            }}
          />
        )}
      </div>
      <div
        style={{
          flex: 1,
          marginBottom: 14,
          padding: isNext ? "16px 18px" : "8px 4px 16px",
          borderRadius: "var(--radius-lg)",
          border: isNext ? "1px solid var(--accent)" : "1px solid transparent",
          background: isNext ? "var(--accent-light)" : "transparent",
          transition: "all .18s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
            {agent.name}
          </span>
          <RoleTag role={agent.role} />
          {isNext && <Badge tone="rose" style={{ fontSize: 10 }}>Próximo passo</Badge>}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            lineHeight: 1.55,
            marginBottom: !isDone && !isNext ? 0 : 12,
            maxWidth: 520,
          }}
        >
          {agent.blurb}
        </div>

        {isDone && (
          <button
            onClick={() =>
              router.push(
                artifactId
                  ? artifactRoute(ctx.project.id, artifactId)
                  : agentRoute(ctx.project.id, agent.id),
              )
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "7px 12px 7px 9px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border)",
              background: "var(--bg-surface)",
              cursor: "pointer",
              transition: "all .15s",
            }}
          >
            <AgentGlyph agent={agent} size={26} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 500, color: "var(--text-primary)" }}>
              {agent.produces}
            </span>
            <Icon name="arrowR" size={14} color="var(--text-tertiary)" />
          </button>
        )}
        {isNext && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Button
              size="sm"
              icon="play"
              onClick={() => router.push(agentRoute(ctx.project.id, agent.id))}
            >
              Rodar {agent.name.toLowerCase()}
            </Button>
            {agent.requiresSources && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--gold-600)", fontWeight: 500 }}>
                <Icon name="lock" size={14} />
                Requer fontes suas
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GuidedMode({ ctx }: { ctx: Ctx }) {
  const router = useRouter();
  const done = ctx.project.done;
  const nextId = GUIDED_FLOW.find((id) => !done.includes(id));
  const canalAgent = agentById("analista-canais")!;
  const canalDone = done.includes("analista-canais");

  return (
    <div>
      {/* optional pre-step: competitor analysis */}
      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px dashed var(--gold-400)",
              background: "var(--gold-light)",
              color: "var(--gold-600)",
              flexShrink: 0,
            }}
          >
            <Icon name={canalDone ? "check" : "compass"} size={16} sw={canalDone ? 2.4 : 1.7} />
          </div>
          <div style={{ width: 2, flex: 1, minHeight: 18, background: "var(--border)", marginTop: 2 }} />
        </div>
        <div
          style={{
            flex: 1,
            marginBottom: 14,
            padding: "14px 16px",
            borderRadius: "var(--radius-lg)",
            border: "1px dashed var(--gold-300)",
            background: "color-mix(in srgb, var(--gold-light) 50%, transparent)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
              {canalAgent.name}
            </span>
            <Badge tone="gold" icon="compass" style={{ fontSize: 10 }}>
              Ponto de partida · opcional
            </Badge>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: 12, maxWidth: 520 }}>
            Antes de mapear o seu canal, vale analisar um concorrente a partir de
            prints. Não é obrigatório — mas dá contexto para os próximos passos.
          </div>
          <Button
            size="sm"
            variant={canalDone ? "ghost" : "gold"}
            icon={canalDone ? "check" : "image"}
            onClick={() => router.push(agentRoute(ctx.project.id, "analista-canais"))}
          >
            {canalDone ? "Perfil do canal pronto" : "Analisar um concorrente"}
          </Button>
        </div>
      </div>
      {GUIDED_FLOW.map((id, i) => {
        const agent = agentById(id)!;
        return (
          <GuidedStep
            key={id}
            agent={agent}
            index={i}
            isDone={done.includes(id)}
            isNext={id === nextId}
            ctx={ctx}
          />
        );
      })}
    </div>
  );
}

// ── Free mode ───────────────────────────────────────────
function AgentCard({ agent, ctx }: { agent: Agent; ctx: Ctx }) {
  const router = useRouter();
  const [h, setH] = useState(false);
  const ran = ctx.project.done.includes(agent.id);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={() => router.push(agentRoute(ctx.project.id, agent.id))}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid " + (h ? "var(--accent)" : "var(--border)"),
        borderRadius: "var(--radius-lg)",
        padding: 18,
        cursor: "pointer",
        transition: "all .18s",
        boxShadow: h ? "var(--shadow-md)" : "none",
        transform: h ? "translateY(-2px)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 13, marginBottom: 12 }}>
        <AgentGlyph agent={agent} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 14.5, fontWeight: 600, color: "var(--text-primary)" }}>
              {agent.name}
            </span>
            {agent.startingPoint && (
              <Badge tone="gold" style={{ fontSize: 9.5, padding: "1px 7px" }}>
                Ponto de partida
              </Badge>
            )}
          </div>
          <div style={{ marginTop: 4 }}>
            <RoleTag role={agent.role} />
          </div>
        </div>
        {ran && <Icon name="checkCircle" size={18} color="var(--success-fg)" />}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: 14, flex: 1 }}>
        {agent.blurb}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 12,
          borderTop: "1px solid var(--border)",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--text-tertiary)" }}>
          <Icon name={agent.producesIcon} size={14} />
          {agent.produces}
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            fontWeight: 600,
            color: h ? "var(--accent)" : "var(--text-tertiary)",
            transition: "color .15s",
          }}
        >
          Rodar <Icon name="arrowR" size={14} />
        </span>
      </div>
    </div>
  );
}

function FreeMode({ ctx }: { ctx: Ctx }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {(Object.keys(CATEGORIES) as AgentCategory[]).map((key) => {
        const cat = CATEGORIES[key];
        return (
          <div key={key}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Icon name={cat.icon} size={17} color="var(--accent)" />
              <span style={{ fontFamily: "var(--font-display)", fontSize: 19, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                {cat.label}
              </span>
              <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>· {cat.blurb}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(258px, 1fr))", gap: 14 }}>
              {AGENTS.filter((a) => a.cat === key).map((a) => (
                <AgentCard key={a.id} agent={a} ctx={ctx} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Artifact library panel ──────────────────────────────
function LibraryPanel({ ctx }: { ctx: Ctx }) {
  const router = useRouter();
  const arts = ctx.artifacts;
  return (
    <aside style={{ width: 320, flexShrink: 0 }}>
      <div style={{ position: "sticky", top: 84 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 19, color: "var(--text-primary)" }}>
            Biblioteca
          </span>
          <Badge tone="neutral">{arts.length}</Badge>
        </div>
        {arts.length === 0 ? (
          <div style={{ border: "1.5px dashed var(--border-strong)", borderRadius: "var(--radius-lg)", padding: "32px 20px", textAlign: "center" }}>
            <span
              style={{
                display: "inline-flex",
                width: 46,
                height: 46,
                borderRadius: 999,
                background: "var(--bg-subtle)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
                color: "var(--text-tertiary)",
              }}
            >
              <Icon name="layers" size={22} />
            </span>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
              Nenhum artefato ainda
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Tudo que os agentes gerarem aparece aqui, pronto para reusar.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {arts.map((a) => {
              const agent = agentById(a.agentId);
              return (
                <button
                  key={a.id}
                  onClick={() => router.push(artifactRoute(ctx.project.id, a.id))}
                  style={{
                    all: "unset",
                    cursor: "pointer",
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: 12,
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    background: "var(--bg-surface)",
                    transition: "all .15s",
                  }}
                >
                  {agent && <AgentGlyph agent={agent} size={36} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {a.name}
                      </span>
                      {a.versionsCount > 1 && (
                        <span
                          style={{
                            flexShrink: 0,
                            fontSize: 10,
                            fontWeight: 600,
                            color: "var(--accent)",
                            background: "var(--accent-light)",
                            padding: "1px 6px",
                            borderRadius: "var(--radius-full)",
                          }}
                        >
                          v{a.version}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 2 }}>
                      {agent?.name ?? a.agentId} · {a.when}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

// ── Header actions (rename + status) ────────────────────
function HeaderActions({ project }: { project: InteriorProject }) {
  const [renaming, setRenaming] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const statuses = Object.keys(STATUS) as ProjectStatus[];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      <Button variant="ghost" size="sm" icon="edit" onClick={() => setRenaming(true)}>
        Renomear
      </Button>
      <span style={{ position: "relative" }}>
        <Button variant="ghost" size="sm" iconR="chevronD" onClick={() => setStatusOpen((v) => !v)}>
          Mudar status
        </Button>
        {statusOpen && (
          <>
            <div onClick={() => setStatusOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 30 }} />
            <div
              style={{
                position: "absolute",
                top: 40,
                right: 0,
                zIndex: 31,
                minWidth: 170,
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                padding: 6,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {statuses.map((s) => (
                <form key={s} action={setProjectStatusAction} onClick={() => setStatusOpen(false)}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <input type="hidden" name="status" value={s} />
                  <button
                    type="submit"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      width: "100%",
                      padding: "8px 12px",
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      fontWeight: s === project.status ? 600 : 500,
                      color: s === project.status ? "var(--accent)" : "var(--text-secondary)",
                      background: "transparent",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {STATUS[s].label}
                    {s === project.status && <Icon name="check" size={14} />}
                  </button>
                </form>
              ))}
            </div>
          </>
        )}
      </span>

      {renaming && (
        <div
          onClick={() => setRenaming(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(20,18,16,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <form
            action={renameProjectAction}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)",
              padding: "var(--space-6)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            <h2 className="bb-h3" style={{ margin: 0, color: "var(--text-primary)" }}>
              Renomear projeto
            </h2>
            <input type="hidden" name="projectId" value={project.id} />
            <input
              name="title"
              defaultValue={project.title}
              autoFocus
              style={{
                width: "100%",
                padding: "10px 12px",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--text-primary)",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-md)",
                outline: "none",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                onClick={() => setRenaming(false)}
                style={{
                  padding: "9px 16px",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-full)",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={() => setRenaming(false)}
                style={{
                  padding: "9px 18px",
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
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ── Project header ──────────────────────────────────────
function ProjectHeader({
  project,
  channel,
}: {
  project: InteriorProject;
  channel: ChannelInfo | null;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <StatusBadge status={project.status} />
        <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>·</span>
        <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>
          Atualizado {project.updated}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 34,
            fontWeight: 400,
            letterSpacing: "-0.01em",
            color: "var(--text-primary)",
            margin: 0,
            lineHeight: 1.18,
            maxWidth: 640,
          }}
        >
          {project.title}
        </h1>
        <HeaderActions project={project} />
      </div>
      {channel && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginTop: 18,
            padding: "14px 18px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                background: "linear-gradient(135deg, var(--rose-200), var(--rose-300))",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: 14,
                color: "var(--rose-700)",
              }}
            >
              {channel.initial}
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                {channel.name}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>
                {channel.handle}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────
function EmptyProjectBody({ ctx }: { ctx: Ctx }) {
  const router = useRouter();
  const firstAgent = agentById(GUIDED_FLOW[0])!;
  return (
    <div>
      <div
        style={{
          background: "linear-gradient(135deg, var(--rose-50), var(--bg-surface))",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: "40px 40px 36px",
          textAlign: "center",
          maxWidth: 620,
          margin: "0 auto 28px",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            width: 60,
            height: 60,
            borderRadius: 999,
            background: "var(--accent-light)",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
            color: "var(--accent)",
          }}
        >
          <Icon name="sparkles" size={28} />
        </span>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 400, color: "var(--text-primary)", margin: "0 0 10px", lineHeight: 1.2 }}>
          Seu projeto está pronto para{" "}
          <span style={{ fontStyle: "italic", color: "var(--accent)" }}>começar</span>
        </h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 440, margin: "0 auto 22px" }}>
          Nenhum agente rodou ainda. Siga o modo guiado para construir seu vídeo do
          zero — ou pule direto para qualquer agente no modo livre.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Button size="lg" icon="play" onClick={() => router.push(agentRoute(ctx.project.id, firstAgent.id))}>
            Começar pelo {firstAgent.name.toLowerCase()}
          </Button>
          <Button variant="ghost" size="lg" icon="image" onClick={() => router.push(agentRoute(ctx.project.id, "analista-canais"))}>
            Analisar um concorrente
          </Button>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <Icon name="route" size={17} color="var(--text-tertiary)" />
        <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.01em" }}>
          O caminho sugerido
        </span>
      </div>
      <GuidedMode ctx={ctx} />
    </div>
  );
}

// ── Screen ──────────────────────────────────────────────
export function ProjectInterior({
  project,
  artifacts,
  channel,
}: {
  project: InteriorProject;
  artifacts: ArtifactListItem[];
  channel: ChannelInfo | null;
}) {
  const [mode, setMode] = useState<"guided" | "free">("guided");
  const isEmpty = project.done.length === 0 && artifacts.length === 0;

  const agentArtifact = new Map<string, string>();
  for (const a of artifacts) {
    if (!agentArtifact.has(a.agentId)) agentArtifact.set(a.agentId, a.id);
  }
  const ctx: Ctx = { project, agentArtifact, artifacts };

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 40px 80px" }}>
      <ProjectHeader project={project} channel={channel} />
      <div style={{ display: "flex", gap: 36, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 26,
              background: "var(--bg-subtle)",
              padding: 4,
              borderRadius: "var(--radius-full)",
              width: "fit-content",
            }}
          >
            {(
              [
                ["guided", "route", "Modo guiado"],
                ["free", "grid", "Modo livre"],
              ] as const
            ).map(([k, ic, label]) => (
              <button
                key={k}
                onClick={() => setMode(k)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 18px",
                  borderRadius: "var(--radius-full)",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all .16s",
                  background: mode === k ? "var(--bg-surface)" : "transparent",
                  color: mode === k ? "var(--accent)" : "var(--text-secondary)",
                  boxShadow: mode === k ? "var(--shadow-sm)" : "none",
                }}
              >
                <Icon name={ic} size={16} />
                {label}
              </button>
            ))}
          </div>
          {mode === "free" ? (
            <FreeMode ctx={ctx} />
          ) : isEmpty ? (
            <EmptyProjectBody ctx={ctx} />
          ) : (
            <GuidedMode ctx={ctx} />
          )}
        </div>
        <LibraryPanel ctx={ctx} />
      </div>
    </div>
  );
}
