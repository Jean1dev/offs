"use client";

import { useState } from "react";
import { IconBtn } from "@/components/ui";
import { Icon } from "@/components/Icon";
import {
  renameProjectAction,
  archiveProjectAction,
  duplicateProjectAction,
} from "@/app/(app)/projetos/actions";

const itemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  width: "100%",
  padding: "8px 12px",
  fontFamily: "var(--font-body)",
  fontSize: 13,
  color: "var(--text-secondary)",
  background: "transparent",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  textAlign: "left",
};

/** Stops card-level navigation when interacting with the menu. */
function stop(e: React.MouseEvent) {
  e.stopPropagation();
}

export function ProjectMenu({
  projectId,
  title,
}: {
  projectId: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);

  return (
    <span onClick={stop} style={{ position: "relative" }}>
      <IconBtn
        name="more"
        size={28}
        title="Opções"
        onClick={() => setOpen((v) => !v)}
      />

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 30 }}
          />
          <div
            style={{
              position: "absolute",
              top: 34,
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
            <button
              style={itemStyle}
              onClick={() => {
                setRenaming(true);
                setOpen(false);
              }}
            >
              <Icon name="edit" size={15} />
              Renomear
            </button>
            <form action={duplicateProjectAction}>
              <input type="hidden" name="projectId" value={projectId} />
              <button type="submit" style={itemStyle}>
                <Icon name="copy" size={15} />
                Duplicar
              </button>
            </form>
            <form action={archiveProjectAction}>
              <input type="hidden" name="projectId" value={projectId} />
              <button type="submit" style={{ ...itemStyle, color: "var(--danger)" }}>
                <Icon name="trash" size={15} />
                Arquivar
              </button>
            </form>
          </div>
        </>
      )}

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
            onClick={stop}
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
            <h2
              className="bb-h3"
              style={{ margin: 0, color: "var(--text-primary)" }}
            >
              Renomear projeto
            </h2>
            <input type="hidden" name="projectId" value={projectId} />
            <input
              name="title"
              defaultValue={title}
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
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
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
    </span>
  );
}
