"use client";

// ThemeToggle.tsx — light/dark switch. Persists to localStorage and flips
// data-theme on <html>. Anti-FOUC bootstrap lives inline in app/layout.tsx.

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Sync to the theme the anti-FOUC bootstrap already applied on <html>.
    const current =
      (document.documentElement.getAttribute("data-theme") as Theme) ?? "light";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("pauta-theme", next);
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Tema claro" : "Tema escuro"}
      aria-label="Alternar tema"
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        border: "1px solid var(--border)",
        background: "transparent",
        color: "var(--text-secondary)",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} size={17} />
    </button>
  );
}
