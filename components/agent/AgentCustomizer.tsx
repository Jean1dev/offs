"use client";

// AgentCustomizer.tsx — Tela 5: customização de agente (T05, F12).
// Ported from design/project/app/screen_customize.jsx, wired to save/restore.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Button, Badge, Card, SectionLabel } from "@/components/ui";
import { MODELS, type Agent } from "@/lib/catalog";
import { trackEvent } from "@/lib/analytics";
import type { AIModelId } from "@/lib/types";
import type { EditOverlay, CustomizationScope } from "@/lib/customization";
import {
  saveCustomizationAction,
  restoreCustomizationAction,
} from "@/app/(app)/projetos/[id]/agentes/[agentId]/customizar/actions";

export function AgentCustomizer({
  project,
  agent,
  basePrompt,
  initial,
}: {
  project: { id: string; title: string; model: AIModelId };
  agent: Agent;
  basePrompt: string;
  initial: EditOverlay | null;
}) {
  const router = useRouter();
  const [prompt, setPrompt] = useState(initial?.prompt || basePrompt);
  const [model, setModel] = useState<AIModelId>(initial?.model ?? project.model);
  const [scope, setScope] = useState<CustomizationScope>(initial?.scope ?? "projeto");

  const dirty =
    prompt !== basePrompt ||
    model !== project.model ||
    scope !== (initial?.scope ?? "projeto");

  const resetToDefault = () => {
    setPrompt(basePrompt);
    setModel(project.model);
  };

  const scopeOptions: [CustomizationScope, string, string][] = [
    [
      "projeto",
      "Só neste projeto",
      `Vale apenas para "${project.title.slice(0, 22)}${project.title.length > 22 ? "…" : ""}"`,
    ],
    ["global", "Padrão global", "Aplica a todos os seus projetos futuros"],
  ];

  return (
    <form action={saveCustomizationAction} style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 40px 90px" }}>
      <input type="hidden" name="projectId" value={project.id} />
      <input type="hidden" name="agentId" value={agent.id} />
      <input type="hidden" name="model" value={model} />
      <input type="hidden" name="scope" value={scope} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 28 }}>
        <span
          style={{
            width: 50,
            height: 50,
            borderRadius: "var(--radius-md)",
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: agent.role === "revisor" ? "var(--gold-light)" : "var(--accent-light)",
            color: agent.role === "revisor" ? "var(--gold-600)" : "var(--accent)",
          }}
        >
          <Icon name={agent.icon} size={25} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
            <SectionLabel>Customização de agente</SectionLabel>
            <Badge tone="gold" icon="sparkle" style={{ fontSize: 10 }}>
              Avançado
            </Badge>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "var(--text-primary)", margin: 0, lineHeight: 1.15 }}>
            {agent.name}
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/projetos/${project.id}/agentes/${agent.id}`)}
        >
          Cancelar
        </Button>
      </div>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        {/* prompt editor */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
              Prompt base
            </span>
            <button
              type="button"
              onClick={resetToDefault}
              disabled={!dirty}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: dirty ? "pointer" : "default",
                fontFamily: "var(--font-body)",
                fontSize: 12.5,
                fontWeight: 500,
                color: dirty ? "var(--accent)" : "var(--text-tertiary)",
                padding: 0,
              }}
            >
              <Icon name="refresh" size={14} />
              Restaurar padrão original
            </button>
          </div>
          <textarea
            name="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              minHeight: 420,
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "16px 18px",
              fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
              fontSize: 13,
              lineHeight: 1.7,
              color: "var(--text-primary)",
              outline: "none",
              resize: "vertical",
              background: "var(--bg-surface)",
              tabSize: 2,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 12, color: "var(--text-tertiary)" }}>
            <Icon name="alert" size={14} color="var(--text-tertiary)" />
            Edite com cuidado — o prompt define como o agente interpreta seus inputs e
            estrutura o artefato.
          </div>
        </div>

        {/* right rail */}
        <aside style={{ width: 300, flexShrink: 0, position: "sticky", top: 84, display: "flex", flexDirection: "column", gap: 18 }}>
          <Card style={{ padding: 20 }}>
            <SectionLabel style={{ marginBottom: 12 }}>Modelo de IA</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(Object.keys(MODELS) as AIModelId[]).map((k) => {
                const on = model === k;
                return (
                  <button
                    key={k}
                    type="button"
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
                    {on && <Icon name="check" size={15} color="var(--accent)" sw={2.4} />}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card style={{ padding: 20 }}>
            <SectionLabel style={{ marginBottom: 12 }}>Salvar como</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {scopeOptions.map(([k, t, d]) => {
                const on = scope === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setScope(k)}
                    style={{
                      all: "unset",
                      cursor: "pointer",
                      display: "flex",
                      gap: 11,
                      padding: "11px 12px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid " + (on ? "var(--accent)" : "var(--border)"),
                      background: on ? "var(--accent-light)" : "transparent",
                      transition: "all .15s",
                    }}
                  >
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 999,
                        flexShrink: 0,
                        marginTop: 2,
                        border: "1.5px solid " + (on ? "var(--accent)" : "var(--border-strong)"),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {on && <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--accent)" }} />}
                    </span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{t}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 2, lineHeight: 1.4 }}>{d}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Button
            full
            size="lg"
            icon="check"
            disabled={!dirty}
            onClick={() =>
              void trackEvent("customize_agent", {
                agent_id: agent.id,
                agent_name: agent.name,
                model,
                scope,
                prompt_changed: prompt !== basePrompt,
              })
            }
          >
            Salvar versão
          </Button>

          {initial && <input type="hidden" name="restoreScope" value={initial.scope} />}
          {initial && (
            <button
              type="submit"
              formAction={restoreCustomizationAction}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 18px",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--danger)",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-full)",
                cursor: "pointer",
              }}
            >
              <Icon name="refresh" size={16} />
              Remover personalização salva
            </button>
          )}
        </aside>
      </div>
    </form>
  );
}
