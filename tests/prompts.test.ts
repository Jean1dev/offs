import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { agentById } from "@/lib/catalog";

describe("buildSystemPrompt", () => {
  it("Roteirista inclui a política editorial (RN07)", () => {
    const agent = agentById("roteirista")!;
    const prompt = buildSystemPrompt(agent);
    expect(prompt).toContain("POLÍTICA EDITORIAL");
    expect(prompt).toContain("EXCLUSIVAMENTE as fontes");
  });

  it("agente sem fontes não inclui a política editorial", () => {
    const agent = agentById("analista-conteudo")!;
    const prompt = buildSystemPrompt(agent);
    expect(prompt).not.toContain("POLÍTICA EDITORIAL");
  });

  it("inclui o fragmento do modelo narrativo escolhido", () => {
    const agent = agentById("estruturador")!;
    const prompt = buildSystemPrompt(agent, { narrative: "hibrido" });
    expect(prompt).toContain("Híbrido");
  });

  it("sempre instrui saída estruturada e o artefato produzido", () => {
    const agent = agentById("analista-temas")!;
    const prompt = buildSystemPrompt(agent);
    expect(prompt).toContain("ESTRUTURADO");
    expect(prompt).toContain(agent.produces);
  });
});
