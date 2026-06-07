"use client";

import { useActionState } from "react";
import {
  updatePreferences,
  type PreferencesState,
} from "@/app/conta/actions";
import { type AIModelId, type Channel } from "@/lib/types";
import { MODELS } from "@/lib/catalog";
import { SectionLabel } from "@/components/ui";

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  color: "var(--text-primary)",
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-body)",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--text-secondary)",
  marginBottom: 6,
};

export function PreferencesForm({
  initialModel,
  initialChannel,
}: {
  initialModel: AIModelId;
  initialChannel: Channel | null;
}) {
  const [state, formAction, pending] = useActionState<
    PreferencesState,
    FormData
  >(updatePreferences, { ok: false, message: "" });

  return (
    <form
      action={formAction}
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}
    >
      <section>
        <SectionLabel style={{ marginBottom: 10 }}>Modelo de IA padrão</SectionLabel>
        <label style={labelStyle} htmlFor="defaultModel">
          Usado por novos projetos (pode ser sobrescrito por projeto ou execução).
        </label>
        <select
          id="defaultModel"
          name="defaultModel"
          defaultValue={initialModel}
          style={fieldStyle}
        >
          {(Object.keys(MODELS) as AIModelId[]).map((id) => (
            <option key={id} value={id}>
              {MODELS[id].name}
            </option>
          ))}
        </select>
      </section>

      <section>
        <SectionLabel style={{ marginBottom: 10 }}>
          Canal do YouTube (opcional)
        </SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label style={labelStyle} htmlFor="channelName">
              Nome do canal
            </label>
            <input
              id="channelName"
              name="channelName"
              defaultValue={initialChannel?.name ?? ""}
              placeholder="Mundo em Foco"
              style={fieldStyle}
            />
          </div>
          <div style={{ display: "flex", gap: "var(--space-4)" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle} htmlFor="channelHandle">
                Handle
              </label>
              <input
                id="channelHandle"
                name="channelHandle"
                defaultValue={initialChannel?.handle ?? ""}
                placeholder="@mundoemfoco"
                style={fieldStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle} htmlFor="channelUrl">
                URL
              </label>
              <input
                id="channelUrl"
                name="channelUrl"
                defaultValue={initialChannel?.url ?? ""}
                placeholder="youtube.com/@mundoemfoco"
                style={fieldStyle}
              />
            </div>
          </div>
        </div>
      </section>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <button
          type="submit"
          disabled={pending}
          style={{
            padding: "10px 20px",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 500,
            color: "#fff",
            background: "var(--accent)",
            border: "1px solid transparent",
            borderRadius: "var(--radius-full)",
            boxShadow: pending ? "none" : "var(--shadow-accent)",
            cursor: pending ? "not-allowed" : "pointer",
            opacity: pending ? 0.6 : 1,
          }}
        >
          {pending ? "Salvando…" : "Salvar preferências"}
        </button>
        {state.message && (
          <span
            className="bb-small"
            style={{
              color: state.ok ? "var(--success-fg)" : "var(--danger)",
            }}
          >
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
