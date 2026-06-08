"use client";

// ArtifactBlock.tsx — renders one structured content block (F10).
// Ported from the Block() renderer in design/project/app/screen_artifact.jsx.

import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui";
import type { ArtifactBlock as Block } from "@/lib/artifact-content";

const wrap: React.CSSProperties = { marginBottom: 26 };

export function ArtifactBlock({ b }: { b: Block }) {
  switch (b.t) {
    case "lead":
      return (
        <p style={{ ...wrap, fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400, lineHeight: 1.45, color: "var(--text-primary)" }}>
          {b.text}
        </p>
      );
    case "h":
      return (
        <h3 style={{ ...wrap, marginTop: 36, marginBottom: 14, fontFamily: "var(--font-display)", fontSize: 23, fontWeight: 500, color: "var(--text-primary)" }}>
          {b.text}
        </h3>
      );
    case "p":
      return (
        <p style={{ ...wrap, fontFamily: "var(--font-body)", fontSize: 15.5, lineHeight: 1.75, color: "var(--text-secondary)" }}>
          {b.text}
        </p>
      );
    case "metrics":
      return (
        <div style={{ ...wrap, display: "grid", gridTemplateColumns: `repeat(${b.items.length}, 1fr)`, gap: 12 }}>
          {b.items.map((m, i) => (
            <div key={i} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "16px 18px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "var(--text-primary)", lineHeight: 1 }}>{m.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 6 }}>{m.label}</div>
            </div>
          ))}
        </div>
      );
    case "split":
      return (
        <div style={{ ...wrap, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[b.left, b.right].map((col, ci) => (
            <div key={ci} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Icon name={ci === 0 ? "checkCircle" : "alert"} size={17} color={ci === 0 ? "var(--success-fg)" : "var(--gold-600)"} />
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{col.title}</span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {col.items.map((it, i) => (
                  <li key={i} style={{ display: "flex", gap: 9, fontSize: 13.5, lineHeight: 1.5, color: "var(--text-secondary)" }}>
                    <span style={{ color: ci === 0 ? "var(--success-fg)" : "var(--gold-600)", flexShrink: 0, marginTop: 1 }}>{ci === 0 ? "+" : "–"}</span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    case "list":
      return (
        <div style={{ ...wrap, display: "flex", flexDirection: "column", gap: 12 }}>
          {b.items.map((it, i) => (
            <div key={i} style={{ display: "flex", gap: 13 }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--accent)", flexShrink: 0, marginTop: 8 }} />
              <div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 14.5, fontWeight: 600, color: "var(--text-primary)" }}>{it.title}</div>
                <div style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.55, marginTop: 2 }}>{it.text}</div>
              </div>
            </div>
          ))}
        </div>
      );
    case "table":
      return (
        <div style={{ ...wrap, border: "1px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-body)" }}>
            <thead>
              <tr style={{ background: "var(--bg-subtle)" }}>
                {b.cols.map((c, i) => (
                  <th key={i} style={{ textAlign: i === 0 ? "left" : "right", padding: "11px 16px", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, ri) => (
                <tr key={ri} style={{ borderTop: "1px solid var(--border)" }}>
                  {r.map((cell, ci) => (
                    <td key={ci} style={{ textAlign: ci === 0 ? "left" : "right", padding: "11px 16px", fontSize: 13.5, color: ci === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: ci === 0 ? 500 : 400 }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "ranked":
      return (
        <div style={{ ...wrap, display: "flex", flexDirection: "column", gap: 10 }}>
          {b.items.map((it, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 16, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 400, color: i === 0 ? "var(--accent)" : "var(--text-tertiary)", lineHeight: 1, width: 24, flexShrink: 0 }}>{it.rank}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 14.5, fontWeight: 600, color: "var(--text-primary)" }}>{it.title}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                    <span style={{ width: 56, height: 5, borderRadius: 999, background: "var(--bg-subtle)", overflow: "hidden", display: "inline-block" }}>
                      <span style={{ display: "block", width: `${it.score}%`, height: "100%", background: it.score > 60 ? "var(--accent)" : "var(--text-tertiary)" }} />
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", width: 22 }}>{it.score}</span>
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginTop: 4 }}>{it.text}</div>
              </div>
            </div>
          ))}
        </div>
      );
    case "blocks":
      return (
        <div style={{ ...wrap, display: "flex", flexDirection: "column", gap: 0 }}>
          {b.items.map((it, i) => (
            <div key={i} style={{ display: "flex", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <span style={{ width: 11, height: 11, borderRadius: 999, border: "2.5px solid var(--accent)", background: "var(--bg)", marginTop: 5 }} />
                {i < b.items.length - 1 && <span style={{ width: 2, flex: 1, background: "var(--border)" }} />}
              </div>
              <div style={{ paddingBottom: 18, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <Badge tone="rose" style={{ fontSize: 10 }}>{it.tag}</Badge>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 14.5, fontWeight: 600, color: "var(--text-primary)" }}>{it.title}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--text-tertiary)", fontVariantNumeric: "tabular-nums" }}>{it.dur}</span>
                </div>
                <div style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>{it.text}</div>
              </div>
            </div>
          ))}
        </div>
      );
    case "script":
      return (
        <div style={{ ...wrap, paddingLeft: 16, borderLeft: "2px solid var(--accent)" }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 6 }}>{b.speaker}</div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15.5, lineHeight: 1.7, color: "var(--text-primary)", margin: 0 }}>{b.text}</p>
        </div>
      );
    case "note":
      return (
        <div style={{ ...wrap, display: "flex", gap: 9, alignItems: "center", fontSize: 12.5, color: "var(--text-tertiary)", fontStyle: "italic" }}>
          <Icon name="link" size={14} color="var(--text-tertiary)" />
          {b.text}
        </div>
      );
    case "score":
      return (
        <div style={{ ...wrap, display: "flex", alignItems: "center", gap: 18, padding: 22, background: "linear-gradient(135deg, var(--rose-50), var(--bg-surface))", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 300, color: "var(--accent)", lineHeight: 1 }}>{b.value}</div>
          <div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{b.label}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 3 }}>{b.sub}</div>
          </div>
        </div>
      );
    default:
      return null;
  }
}
