"use client";

// AgentRunner.tsx — Tela 3: execução de um agente (compositor de input).
// Ported from design/project/app/screen_agent.jsx, wired to runAgentAction.

import { useState, useEffect, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";
import {
  Button,
  Badge,
  RoleTag,
  Card,
  AgentGlyph,
  SectionLabel,
} from "@/components/ui";
import {
  INPUT,
  MODELS,
  CATEGORIES,
  NARRATIVE_MODELS,
  agentById,
  type Agent,
  type InputType,
  type NarrativeModelId,
} from "@/lib/catalog";
import type { AIModelId } from "@/lib/types";
import type { ArtifactListItem } from "@/lib/projects";
import { formatResetCountdown, type BalanceView } from "@/lib/credits";
import { trackEvent } from "@/lib/analytics";
import { runAgentAction } from "@/app/(app)/projetos/[id]/agentes/[agentId]/actions";

const fieldInput: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  padding: "12px 14px",
  fontFamily: "var(--font-body)",
  fontSize: 13.5,
  color: "var(--text-primary)",
  outline: "none",
  resize: "vertical",
  lineHeight: 1.6,
  background: "var(--bg-surface)",
};

interface ImageItem {
  name: string;
  url: string;
}

function InputTypePills({ inputs }: { inputs: InputType[] }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {inputs.map((t) => (
        <span
          key={t}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11.5,
            fontWeight: 500,
            color: "var(--text-secondary)",
            padding: "4px 11px",
            borderRadius: "var(--radius-full)",
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
          }}
        >
          <Icon name={INPUT[t].icon} size={13} color="var(--accent)" />
          {INPUT[t].label}
        </span>
      ))}
    </div>
  );
}

function Field({
  label,
  hint,
  optional,
  icon,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  icon?: IconName;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
        {icon && (
          <Icon name={icon} size={15} color="var(--text-tertiary)" style={{ alignSelf: "center" }} />
        )}
        <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
          {label}
        </span>
        {optional && <span style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>opcional</span>}
        {hint && (
          <span style={{ fontSize: 12, color: "var(--text-tertiary)", marginLeft: "auto" }}>{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function ImageInput({
  images,
  setImages,
}: {
  images: ImageItem[];
  setImages: React.Dispatch<React.SetStateAction<ImageItem[]>>;
}) {
  const onPick = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      // Functional updater so concurrent FileReader callbacks don't clobber each other.
      reader.onload = () =>
        setImages((prev) => [
          ...prev,
          { name: file.name, url: String(reader.result) },
        ]);
      reader.readAsDataURL(file);
    });
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(116px, 1fr))", gap: 10 }}>
      {images.map((im, i) => (
        <div
          key={i}
          style={{
            position: "relative",
            aspectRatio: "16/10",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            border: "1px solid var(--border)",
            background: "var(--bg-subtle)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={im.url}
            alt={im.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <button
            onClick={() => setImages(images.filter((_, j) => j !== i))}
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              width: 20,
              height: 20,
              borderRadius: 999,
              border: "none",
              background: "rgba(255,255,255,0.9)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
            }}
          >
            <Icon name="x" size={12} sw={2.2} />
          </button>
        </div>
      ))}
      <label
        style={{
          cursor: "pointer",
          aspectRatio: "16/10",
          border: "1.5px dashed var(--border-strong)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          color: "var(--text-tertiary)",
        }}
      >
        <Icon name="upload" size={20} />
        <span style={{ fontSize: 11.5, fontWeight: 500 }}>Adicionar print</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onPick(e.target.files)}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
}

function ArtifactSelect({
  artifacts,
  selected,
  setSelected,
  expected,
}: {
  artifacts: ArtifactListItem[];
  selected: string[];
  setSelected: (v: string[]) => void;
  expected?: string;
}) {
  if (artifacts.length === 0)
    return (
      <div style={{ padding: "16px 18px", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-strong)", fontSize: 13, color: "var(--text-secondary)" }}>
        Nenhum artefato disponível neste projeto ainda.
      </div>
    );
  const toggle = (id: string) =>
    setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {artifacts.map((a) => {
        const agent = agentById(a.agentId);
        const on = selected.includes(a.id);
        const rec = expected && a.name === expected;
        return (
          <div
            key={a.id}
            onClick={() => toggle(a.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 12,
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              transition: "all .15s",
              border: "1px solid " + (on ? "var(--accent)" : "var(--border)"),
              background: on ? "var(--accent-light)" : "var(--bg-surface)",
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                flexShrink: 0,
                border: on ? "none" : "1.5px solid var(--border-strong)",
                background: on ? "var(--accent)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {on && <Icon name="check" size={13} color="#fff" sw={2.6} />}
            </span>
            {agent && <AgentGlyph agent={agent} size={32} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                  {a.name}
                </span>
                {rec && (
                  <Badge tone="rose" style={{ fontSize: 9.5, padding: "1px 7px" }}>
                    Recomendado
                  </Badge>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 1 }}>
                {agent?.name ?? a.agentId} · {a.when}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NarrativeSelect({
  value,
  setValue,
}: {
  value: NarrativeModelId;
  setValue: (v: NarrativeModelId) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
      {NARRATIVE_MODELS.map((m) => {
        const on = value === m.id;
        return (
          <button
            key={m.id}
            onClick={() => setValue(m.id)}
            style={{
              all: "unset",
              cursor: "pointer",
              padding: "13px 15px",
              borderRadius: "var(--radius-md)",
              transition: "all .15s",
              border: "1px solid " + (on ? "var(--accent)" : "var(--border)"),
              background: on ? "var(--accent-light)" : "var(--bg-surface)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, color: on ? "var(--accent)" : "var(--text-primary)" }}>
                {m.name}
              </span>
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 999,
                  border: "1.5px solid " + (on ? "var(--accent)" : "var(--border-strong)"),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {on && <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--accent)" }} />}
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.45 }}>{m.blurb}</div>
          </button>
        );
      })}
    </div>
  );
}

function SourcesInput({
  sources,
  setSources,
}: {
  sources: string[];
  setSources: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    if (draft.trim()) {
      setSources([...sources, draft.trim()]);
      setDraft("");
    }
  };
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: sources.length ? 12 : 0 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Cole o link ou trecho de uma fonte (artigo, matéria, dado)…"
          style={{ ...fieldInput, padding: "11px 14px" }}
        />
        <Button variant="secondary" icon="plus" onClick={add}>
          Adicionar
        </Button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sources.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <Icon name="link" size={15} color="var(--accent)" />
            <span style={{ flex: 1, fontSize: 13, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {s}
            </span>
            <button
              onClick={() => setSources(sources.filter((_, j) => j !== i))}
              style={{ all: "unset", cursor: "pointer", color: "var(--text-tertiary)" }}
            >
              <Icon name="x" size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spinner({ size = 16, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        border: `2px solid ${color}`,
        borderTopColor: "transparent",
        display: "inline-block",
        animation: "pauta-spin .7s linear infinite",
      }}
    />
  );
}

function RunOverlay({ agent }: { agent: Agent }) {
  const steps = [
    "Lendo o contexto…",
    "Aplicando a política do agente…",
    `Gerando ${agent.produces.toLowerCase()}…`,
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => Math.min(p + 1, steps.length - 1)), 1600);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "color-mix(in srgb, var(--bg) 70%, transparent)",
        backdropFilter: "blur(3px)",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <span
          style={{
            position: "relative",
            width: 64,
            height: 64,
            borderRadius: 18,
            background: "var(--accent-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent)",
          }}
        >
          <Icon name={agent.icon} size={30} />
          <span
            style={{
              position: "absolute",
              inset: -4,
              borderRadius: 20,
              border: "2px solid var(--accent)",
              borderTopColor: "transparent",
              animation: "pauta-spin .9s linear infinite",
            }}
          />
        </span>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
          {steps[i]}
        </div>
      </div>
    </div>
  );
}

export function AgentRunner({
  project,
  agent,
  artifacts,
  preselectArtifactId,
  regenerateOf,
  initialModel,
  cost,
  balance,
}: {
  project: { id: string; model: AIModelId };
  agent: Agent;
  artifacts: ArtifactListItem[];
  preselectArtifactId?: string;
  regenerateOf?: string;
  /** Pre-selected model (e.g. from an agent customization); falls back to project. */
  initialModel?: AIModelId;
  /** Custo em créditos desta execução (spec §3). */
  cost: number;
  /** Saldo atual do usuário — apenas reflete o estado do backend (spec §6). */
  balance: BalanceView;
}) {
  const router = useRouter();
  const dual = !!agent.dualContext;
  const [ctxMode, setCtxMode] = useState<"referencia" | "rascunho" | null>(
    dual ? "rascunho" : null,
  );
  const ctx = dual && ctxMode ? agent.contexts?.[ctxMode] : undefined;
  const effInputs = ctx ? ctx.inputs : agent.inputs;
  const effInputArtifact = ctx ? ctx.inputArtifact : agent.inputArtifact;
  const produces = ctx ? ctx.produces : agent.produces;

  const [images, setImages] = useState<ImageItem[]>([]);
  const [text, setText] = useState("");
  const [selArts, setSelArts] = useState<string[]>(() => {
    if (preselectArtifactId && artifacts.some((x) => x.id === preselectArtifactId)) {
      return [preselectArtifactId];
    }
    const a = artifacts.find((x) => x.name === agent.inputArtifact);
    return a ? [a.id] : [];
  });
  const [narrative, setNarrative] = useState<NarrativeModelId>("hibrido");
  const [sources, setSources] = useState<string[]>([]);
  const [model, setModel] = useState<AIModelId>(initialModel ?? project.model);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const refMissing = dual && ctxMode === "referencia" && text.trim().length === 0;
  // O backend é o guardião real (RN-C01); aqui só refletimos o saldo (spec §6.2).
  const insufficient = balance.creditosRestantes < cost;
  const empty = balance.creditosRestantes <= 0;
  const resetLabel =
    balance.proximoReset != null
      ? formatResetCountdown(balance.proximoReset)
      : null;
  const canRun = !refMissing && !pending && !insufficient;
  const creditWord = (n: number) => (n === 1 ? "crédito" : "créditos");

  const doRun = () => {
    setConfirming(false);
    setError(null);
    startTransition(async () => {
      const res = await runAgentAction({
        projectId: project.id,
        agentId: agent.id,
        ctxMode,
        model,
        narrative,
        text,
        sources,
        selectedArtifactIds: selArts,
        images: images.map((im) => im.url),
        regenerateOf,
      });
      // Telemetria de produto (só dispara com consentimento): qual agente, qual
      // modelo e em que contexto as pessoas estão rodando.
      void trackEvent("run_agent", {
        agent_id: agent.id,
        agent_name: agent.name,
        agent_role: agent.role,
        agent_category: agent.cat,
        model,
        regenerate: Boolean(regenerateOf),
        context_mode: ctxMode ?? undefined,
        narrative: agent.narrative ? narrative : undefined,
        status: res?.error ? "error" : "success",
      });
      if (res?.error) setError(res.error);
    });
  };

  const run = () => {
    if (!canRun) return;
    // Regenerar consome créditos como uma nova execução (RN-C04): confirma antes (spec §6.4).
    if (regenerateOf && !confirming) {
      setConfirming(true);
      return;
    }
    doRun();
  };

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 40px 90px" }}>
      {/* Banner de saldo esgotado (spec §6.3): navegação livre, execução bloqueada. */}
      {empty && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            marginBottom: 24,
            borderRadius: "var(--radius-md)",
            background: "var(--gold-light)",
            border: "1px solid var(--gold-300)",
          }}
        >
          <Icon name="alert" size={17} color="var(--gold-600)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Créditos diários esgotados.{" "}
            {resetLabel ? `Renova em ${resetLabel}.` : "Renova 24h após o primeiro uso."}{" "}
            Você ainda pode ver e ler tudo — só não rodar novos agentes.
          </span>
        </div>
      )}

      {/* header */}
      <div style={{ display: "flex", gap: 18, marginBottom: 28 }}>
        <AgentGlyph agent={agent} size={56} style={{ borderRadius: "var(--radius-md)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <SectionLabel>{CATEGORIES[agent.cat].label}</SectionLabel>
            <RoleTag role={agent.role} />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 400, color: "var(--text-primary)", margin: "0 0 8px", lineHeight: 1.15 }}>
            {agent.name}
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0, maxWidth: 620 }}>
            {ctx ? ctx.desc : agent.desc}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon="settings"
          onClick={() => router.push(`/projetos/${project.id}/agentes/${agent.id}/customizar`)}
          style={{ flexShrink: 0 }}
        >
          Customizar
        </Button>
      </div>

      {/* dual-context switch */}
      {dual && agent.contexts && (
        <div style={{ marginBottom: 28 }}>
          <SectionLabel style={{ marginBottom: 10 }}>Em que momento você está?</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {(["referencia", "rascunho"] as const).map((k) => {
              const c = agent.contexts![k];
              const on = ctxMode === k;
              return (
                <button
                  key={k}
                  onClick={() => setCtxMode(k)}
                  style={{
                    all: "unset",
                    cursor: "pointer",
                    display: "flex",
                    gap: 13,
                    padding: "15px 17px",
                    borderRadius: "var(--radius-lg)",
                    transition: "all .16s",
                    border: "1px solid " + (on ? "var(--accent)" : "var(--border)"),
                    background: on ? "var(--accent-light)" : "var(--bg-surface)",
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      flexShrink: 0,
                      marginTop: 2,
                      border: "1.5px solid " + (on ? "var(--accent)" : "var(--border-strong)"),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {on && <span style={{ width: 9, height: 9, borderRadius: 999, background: "var(--accent)" }} />}
                  </span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 14.5, fontWeight: 600, color: on ? "var(--accent)" : "var(--text-primary)" }}>
                        {c.label}
                      </span>
                      <Badge tone={k === "referencia" ? "gold" : "rose"} style={{ fontSize: 9.5, padding: "1px 7px" }}>
                        {c.sub}
                      </Badge>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.45, marginTop: 4 }}>
                      {k === "referencia"
                        ? "Aprende com um roteiro externo que você admira."
                        : "Revisa o seu próprio rascunho antes de gravar."}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        {/* composer */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--text-primary)", whiteSpace: "nowrap", flexShrink: 0 }}>
              Monte o contexto
            </span>
            <span style={{ marginLeft: "auto" }}>
              <InputTypePills inputs={effInputs} />
            </span>
          </div>

          {agent.requiresSources && (
            <div style={{ display: "flex", gap: 12, padding: "14px 16px", borderRadius: "var(--radius-md)", marginBottom: 24, background: "var(--gold-light)", border: "1px solid var(--gold-300)" }}>
              <Icon name="lock" size={18} color="var(--gold-600)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--gold-600)", marginBottom: 2 }}>
                  Política editorial
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                  O Roteirista prioriza as fontes que você fornecer. Sem fontes, ele
                  escreve a partir do contexto do projeto — mas fontes deixam o
                  resultado mais preciso.
                </div>
              </div>
            </div>
          )}

          {effInputs.includes("image") && (
            <Field label="Prints do YouTube" icon="image" hint={`${images.length} ${images.length === 1 ? "imagem" : "imagens"}`}>
              <ImageInput images={images} setImages={setImages} />
            </Field>
          )}

          {effInputs.includes("artifact") && (
            <Field label="Artefatos do projeto" icon="layers" optional={effInputs.length > 1 && !effInputArtifact}>
              <ArtifactSelect artifacts={artifacts} selected={selArts} setSelected={setSelArts} expected={effInputArtifact} />
            </Field>
          )}

          {dual && ctxMode === "referencia" && (
            <Field label="Roteiro de referência" icon="fileText" hint={refMissing ? "obrigatório" : `${text.trim().split(/\s+/).filter(Boolean).length} palavras`}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
                placeholder="Cole aqui a transcrição ou roteiro do vídeo de referência que você quer analisar…"
                style={fieldInput}
              />
            </Field>
          )}

          {effInputs.includes("sources") && (
            <Field label="Fontes" icon="link" optional hint={sources.length ? `${sources.length} ${sources.length === 1 ? "fonte" : "fontes"}` : undefined}>
              <SourcesInput sources={sources} setSources={setSources} />
            </Field>
          )}

          {/* Texto livre disponível para todos os agentes (exceto no modo referência,
              onde o textarea acima já captura o texto). Sempre opcional. */}
          {!(dual && ctxMode === "referencia") && (
            <Field
              label={agent.requiresSources ? "Direcionamentos extras" : "Texto livre"}
              icon="text"
              optional
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder={agent.requiresSources ? "Tom de voz, ênfases, o que evitar…" : "Contexto, tema, ângulo, instruções que você quer adicionar…"}
                style={fieldInput}
              />
            </Field>
          )}

          {agent.narrative && (
            <Field label="Modelo narrativo" icon="blocks">
              <NarrativeSelect value={narrative} setValue={setNarrative} />
            </Field>
          )}
        </div>

        {/* right rail */}
        <aside style={{ width: 300, flexShrink: 0, position: "sticky", top: 84 }}>
          <Card style={{ padding: 20 }}>
            <SectionLabel style={{ marginBottom: 12 }}>Vai produzir</SectionLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid var(--border)" }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, background: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
                <Icon name={agent.producesIcon} size={19} />
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--text-primary)" }}>{produces}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <SectionLabel>Modelo de IA</SectionLabel>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--text-tertiary)" }}>
                <Icon name="clock" size={11} color="var(--text-tertiary)" />só nesta execução
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {(Object.keys(MODELS) as AIModelId[]).map((k) => {
                const on = model === k;
                return (
                  <button
                    key={k}
                    onClick={() => setModel(k)}
                    style={{
                      all: "unset",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "8px 10px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid " + (on ? "var(--accent)" : "var(--border)"),
                      background: on ? "var(--accent-light)" : "transparent",
                      transition: "all .15s",
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 12.5, fontWeight: on ? 600 : 500, color: on ? "var(--text-primary)" : "var(--text-secondary)" }}>
                      {MODELS[k].name}
                    </span>
                    {on && k === project.model && (
                      <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>padrão</span>
                    )}
                    {on && <Icon name="check" size={15} color="var(--accent)" sw={2.4} />}
                  </button>
                );
              })}
            </div>
            {/* Custo visível antes de executar (spec §6.5). */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                padding: "9px 12px",
                marginBottom: 12,
                borderRadius: "var(--radius-md)",
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-secondary)" }}>
                <Icon name="sparkle" size={13} color="var(--accent)" filled />
                {regenerateOf ? "Regenerar custa" : "Custa"} {cost} {creditWord(cost)}
              </span>
              <span style={{ fontSize: 11.5, color: insufficient ? "var(--danger)" : "var(--text-tertiary)" }}>
                {balance.creditosRestantes} {creditWord(balance.creditosRestantes)} disponíveis
              </span>
            </div>

            {confirming ? (
              /* Confirmação de regeneração com o custo (spec §6.4). */
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, textAlign: "center" }}>
                  Regenerar custa {cost} {creditWord(cost)}. Você tem{" "}
                  {balance.creditosRestantes}. Confirmar?
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button variant="secondary" full onClick={() => setConfirming(false)}>
                    Cancelar
                  </Button>
                  <Button full icon="play" onClick={doRun}>
                    Confirmar
                  </Button>
                </div>
              </div>
            ) : (
              <Button full size="lg" icon={pending ? undefined : "play"} onClick={run} disabled={!canRun}>
                {pending ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                    <Spinner />
                    Gerando…
                  </span>
                ) : (
                  "Rodar agente"
                )}
              </Button>
            )}
            {refMissing && !confirming && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10, fontSize: 12, color: "var(--text-tertiary)", justifyContent: "center" }}>
                <Icon name="alert" size={14} />
                Cole o roteiro de referência
              </div>
            )}
            {/* Saldo insuficiente para este agente (spec §6.2). */}
            {insufficient && !confirming && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginTop: 10, fontSize: 12, color: "var(--text-tertiary)", justifyContent: "center", textAlign: "center", lineHeight: 1.5 }}>
                <Icon name="lock" size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  Este agente custa {cost} {creditWord(cost)}. Você tem{" "}
                  {balance.creditosRestantes}.
                  {resetLabel ? ` Renova em ${resetLabel}.` : ""}
                </span>
              </div>
            )}
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10, fontSize: 12, color: "var(--danger)", justifyContent: "center", textAlign: "center" }}>
                <Icon name="alert" size={14} />
                {error}
              </div>
            )}
            <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
              O artefato será salvo na biblioteca do projeto.
            </div>
          </Card>
        </aside>
      </div>

      {pending && <RunOverlay agent={agent} />}
    </div>
  );
}
