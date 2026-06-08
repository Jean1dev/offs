"use client";

// ArtifactView.tsx — Tela 4: visualização do artefato (T04, F09/F10/F11).
// Ported from design/project/app/screen_artifact.jsx, wired to real data + actions.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Button, IconBtn, AgentGlyph } from "@/components/ui";
import { ArtifactBlock } from "@/components/artifact/ArtifactBlock";
import { AGENTS, agentById } from "@/lib/catalog";
import type { ArtifactContent } from "@/lib/artifact-content";
import type { ArtifactDetail } from "@/lib/artifacts";
import {
  renameArtifactAction,
  promoteArtifactAction,
} from "@/app/(app)/projetos/[id]/artefatos/[artifactId]/actions";

function toPlainText(name: string, content: ArtifactContent): string {
  const lines = [name, "", content.summary, ""];
  for (const b of content.blocks) {
    switch (b.t) {
      case "h":
        lines.push(`\n${b.text}`);
        break;
      case "p":
      case "lead":
      case "note":
        lines.push(b.text);
        break;
      case "metrics":
        lines.push(b.items.map((m) => `${m.value} ${m.label}`).join(" · "));
        break;
      case "table":
        lines.push([b.cols.join(" | "), ...b.rows.map((r) => r.join(" | "))].join("\n"));
        break;
      case "split":
        lines.push(`${b.left.title}: ${b.left.items.join("; ")}`);
        lines.push(`${b.right.title}: ${b.right.items.join("; ")}`);
        break;
      case "list":
        lines.push(b.items.map((i) => `- ${i.title}: ${i.text}`).join("\n"));
        break;
      case "ranked":
        lines.push(b.items.map((i) => `${i.rank}. ${i.title} (${i.score}) — ${i.text}`).join("\n"));
        break;
      case "blocks":
        lines.push(b.items.map((i) => `[${i.tag}] ${i.title} (${i.dur}): ${i.text}`).join("\n"));
        break;
      case "script":
        lines.push(`${b.speaker}: ${b.text}`);
        break;
      case "score":
        lines.push(`${b.label}: ${b.value} — ${b.sub}`);
        break;
    }
  }
  return lines.join("\n");
}

// ── "use as input" picker ───────────────────────────────
function UsePicker({
  projectId,
  artifactId,
  onClose,
}: {
  projectId: string;
  artifactId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const eligible = AGENTS.filter((a) => a.inputs.includes("artifact"));
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(20,18,16,0.4)", zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 480, maxHeight: "80vh", overflowY: "auto", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)", padding: 26 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--text-primary)" }}>Usar como input</span>
          <IconBtn name="x" size={32} onClick={onClose} />
        </div>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: "0 0 18px", lineHeight: 1.55 }}>
          Escolha o agente que vai receber este artefato como contexto.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {eligible.map((a) => (
            <button
              key={a.id}
              onClick={() => router.push(`/projetos/${projectId}/agentes/${a.id}?fonte=${artifactId}`)}
              style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 13, padding: 12, borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}
            >
              <AgentGlyph agent={a} size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{a.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 1 }}>Produz: {a.produces}</div>
              </div>
              <Icon name="arrowR" size={16} color="var(--text-tertiary)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── version switcher ────────────────────────────────────
function VersionSwitcher({
  projectId,
  artifact,
}: {
  projectId: string;
  artifact: ArtifactDetail;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const total = artifact.versions.length;
  if (total <= 1)
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--text-tertiary)" }}>
        <Icon name="layers" size={13} color="var(--text-tertiary)" />v1 · única versão
      </span>
    );
  return (
    <span style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: "var(--radius-full)", border: "1px solid var(--border)", background: "var(--bg-surface)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: 600, color: "var(--accent)" }}
      >
        <Icon name="layers" size={13} color="var(--accent)" />v{artifact.version} de {total}
        <Icon name="chevronD" size={12} color="var(--text-tertiary)" />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 29 }} />
          <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 6, width: 230, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", zIndex: 30, overflow: "hidden" }}>
            {artifact.versions.map((v, idx) => {
              const cur = v.id === artifact.id;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setOpen(false);
                    if (!cur) router.push(`/projetos/${projectId}/artefatos/${v.id}`);
                  }}
                  style={{ all: "unset", cursor: "pointer", boxSizing: "border-box", width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "10px 13px", borderBottom: idx < total - 1 ? "1px solid var(--border)" : "none", background: cur ? "var(--accent-light)" : "transparent" }}
                >
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, color: cur ? "var(--accent)" : "var(--text-primary)" }}>v{v.version}</span>
                  <span style={{ flex: 1, fontSize: 11.5, color: "var(--text-tertiary)" }}>
                    {v.status === "ativo" ? "ativa" : "arquivada"} · {v.when}
                  </span>
                  {cur && <Icon name="check" size={14} color="var(--accent)" sw={2.4} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </span>
  );
}

export function ArtifactView({
  projectId,
  artifact,
  justNew,
}: {
  projectId: string;
  artifact: ArtifactDetail;
  justNew: boolean;
}) {
  const router = useRouter();
  const [picker, setPicker] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const agent = agentById(artifact.agentId);
  const activeVersion = artifact.versions.find((v) => v.status === "ativo");
  const isArchived = artifact.status === "arquivado";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toPlainText(artifact.name, artifact.content));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 40px 90px" }}>
      {justNew && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", marginBottom: 22, background: "var(--success-bg)", borderRadius: "var(--radius-md)", border: "1px solid color-mix(in srgb, var(--success-fg) 25%, transparent)" }}>
          <Icon name="checkCircle" size={18} color="var(--success-fg)" />
          <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--success-fg)" }}>
            Artefato gerado e salvo na biblioteca do projeto.
          </span>
        </div>
      )}

      {isArchived && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", marginBottom: 22, background: "var(--gold-light)", borderRadius: "var(--radius-md)", border: "1px solid var(--gold-300)", flexWrap: "wrap" }}>
          <Icon name="layers" size={17} color="var(--gold-600)" />
          <span style={{ flex: 1, fontSize: 13, color: "var(--gold-600)", fontWeight: 500 }}>
            Você está vendo uma versão arquivada (v{artifact.version}).
          </span>
          <form action={promoteArtifactAction}>
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="artifactId" value={artifact.id} />
            <button type="submit" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 14px", fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 500, color: "#fff", background: "var(--gold)", border: "none", borderRadius: "var(--radius-full)", cursor: "pointer" }}>
              <Icon name="check" size={14} color="#fff" />
              Tornar esta a versão ativa
            </button>
          </form>
          {activeVersion && (
            <Button variant="ghost" size="sm" onClick={() => router.push(`/projetos/${projectId}/artefatos/${activeVersion.id}`)}>
              Ver versão ativa
            </Button>
          )}
        </div>
      )}

      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 20 }}>
        {agent && <AgentGlyph agent={agent} size={52} style={{ borderRadius: "var(--radius-md)" }} />}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 400, color: "var(--text-primary)", margin: "0 0 8px", lineHeight: 1.12 }}>
            {artifact.name}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", fontSize: 12.5, color: "var(--text-tertiary)" }}>
            {agent && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name={agent.icon} size={14} color="var(--text-tertiary)" />
                {agent.name}
              </span>
            )}
            <span>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Icon name="clock" size={13} color="var(--text-tertiary)" />
              {artifact.when}
            </span>
            <span>·</span>
            <VersionSwitcher projectId={projectId} artifact={artifact} />
          </div>
        </div>
      </div>

      {/* actions */}
      <div style={{ marginBottom: 28, paddingBottom: 22, borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Button variant="secondary" size="sm" icon={copied ? "check" : "copy"} onClick={copy}>
            {copied ? "Copiado" : "Copiar"}
          </Button>
          <Button size="sm" icon="arrowR" onClick={() => setPicker(true)}>
            Usar como input
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon="refresh"
            onClick={() => router.push(`/projetos/${projectId}/agentes/${artifact.agentId}?regenerar=${artifact.id}`)}
          >
            Regenerar
          </Button>
          <Button variant="ghost" size="sm" icon="edit" onClick={() => setRenaming(true)}>
            Renomear
          </Button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 11.5, color: "var(--text-tertiary)" }}>
          <Icon name="layers" size={13} color="var(--text-tertiary)" />
          Regenerar cria uma nova versão — a anterior fica preservada no histórico.
        </div>
      </div>

      {/* summary */}
      <div style={{ display: "flex", gap: 13, padding: "16px 18px", background: "var(--accent-light)", borderRadius: "var(--radius-lg)", marginBottom: 32 }}>
        <Icon name="sparkles" size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 5 }}>Resumo</div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--rose-800)", margin: 0 }}>{artifact.content.summary}</p>
        </div>
      </div>

      {/* source prints */}
      {artifact.inputImages.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
              marginBottom: 10,
            }}
          >
            Prints usados
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 10,
            }}
          >
            {artifact.inputImages.map((src, i) => (
              <a
                key={i}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  aspectRatio: "16/10",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                  background: "var(--bg-subtle)",
                  display: "block",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Print ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* body */}
      <div>
        {artifact.content.blocks.map((b, i) => (
          <ArtifactBlock key={i} b={b} />
        ))}
      </div>

      {picker && (
        <UsePicker projectId={projectId} artifactId={artifact.id} onClose={() => setPicker(false)} />
      )}

      {renaming && (
        <div
          onClick={() => setRenaming(false)}
          style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(20,18,16,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <form
            action={renameArtifactAction}
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 420, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
          >
            <h2 className="bb-h3" style={{ margin: 0, color: "var(--text-primary)" }}>Renomear artefato</h2>
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="artifactId" value={artifact.id} />
            <input
              name="name"
              defaultValue={artifact.name}
              autoFocus
              style={{ width: "100%", padding: "10px 12px", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", background: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", outline: "none" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={() => setRenaming(false)} style={{ padding: "9px 16px", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", cursor: "pointer" }}>
                Cancelar
              </button>
              <button type="submit" onClick={() => setRenaming(false)} style={{ padding: "9px 18px", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color: "#fff", background: "var(--accent)", border: "1px solid transparent", borderRadius: "var(--radius-full)", boxShadow: "var(--shadow-accent)", cursor: "pointer" }}>
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
