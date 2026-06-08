import { describe, it, expect } from "vitest";
import { resolveModel } from "@/lib/ai/models";

// RN06: execução > customização > projeto > global > default.
describe("resolveModel (hierarquia RN06)", () => {
  it("execução vence todos os níveis", () => {
    expect(
      resolveModel({
        execution: "gpt",
        customization: "gemini",
        project: "claude",
        global: "claude",
      }),
    ).toBe("gpt");
  });

  it("customização vence projeto e global quando não há execução", () => {
    expect(
      resolveModel({ customization: "gemini", project: "claude", global: "claude" }),
    ).toBe("gemini");
  });

  it("projeto vence global", () => {
    expect(resolveModel({ project: "gpt", global: "claude" })).toBe("gpt");
  });

  it("usa o global do usuário quando é o único definido", () => {
    expect(resolveModel({ global: "gemini" })).toBe("gemini");
  });

  it("cai no default quando nada é fornecido", () => {
    expect(resolveModel({})).toBe("claude");
  });

  it("ignora níveis null/undefined", () => {
    expect(
      resolveModel({ execution: null, customization: undefined, project: "gpt" }),
    ).toBe("gpt");
  });
});
