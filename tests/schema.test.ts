import { describe, it, expect } from "vitest";
import { z } from "zod";
import { artifactContentSchema } from "@/lib/ai/schema";

describe("artifactContentSchema → JSON Schema", () => {
  it("usa anyOf (não oneOf) — OpenAI Structured Outputs rejeita oneOf", () => {
    const json = JSON.stringify(z.toJSONSchema(artifactContentSchema));
    expect(json).not.toContain("oneOf");
    expect(json).toContain("anyOf");
  });
});

describe("artifactContentSchema", () => {
  it("aceita conteúdo estruturado válido", () => {
    const res = artifactContentSchema.safeParse({
      summary: "Resumo do artefato.",
      blocks: [
        { t: "h", text: "Seção" },
        { t: "p", text: "Parágrafo." },
        {
          t: "metrics",
          items: [{ value: "62", label: "vídeos" }],
        },
        {
          t: "table",
          cols: ["A", "B"],
          rows: [["1", "2"]],
        },
      ],
    });
    expect(res.success).toBe(true);
  });

  it("rejeita quando falta o summary", () => {
    const res = artifactContentSchema.safeParse({
      blocks: [{ t: "p", text: "x" }],
    });
    expect(res.success).toBe(false);
  });

  it("rejeita um tipo de bloco desconhecido", () => {
    const res = artifactContentSchema.safeParse({
      summary: "s",
      blocks: [{ t: "desconhecido", text: "x" }],
    });
    expect(res.success).toBe(false);
  });

  it("rejeita bloco com campos faltando", () => {
    const res = artifactContentSchema.safeParse({
      summary: "s",
      blocks: [{ t: "score", value: "8,2" }], // faltam label e sub
    });
    expect(res.success).toBe(false);
  });
});
