// lib/ai/prompts.ts — base system prompts per agent.
// A user's AgentCustomization can override the base prompt (Phase 8); when absent,
// buildSystemPrompt assembles the default from the catalog metadata plus the
// role, narrative model and editorial policy that apply to that agent.

import type { Agent, NarrativeModelId } from "@/lib/catalog";
import { NARRATIVE_MODELS } from "@/lib/catalog";
import { AGENT_BASE_PROMPTS } from "@/lib/ai/agent-prompts";

const STRUCTURED_OUTPUT_RULE = `
Você produz conteúdo ESTRUTURADO, nunca texto bruto. Sua resposta é um objeto com:
- "summary": um resumo de uma a duas frases do artefato.
- "blocks": uma lista de blocos. Cada bloco tem um campo "t" indicando o tipo:
  "metrics" (cartões valor/rótulo), "h" (título de seção), "p" (parágrafo),
  "lead" (parágrafo de abertura em destaque), "note" (observação curta),
  "table" (colunas + linhas), "split" (duas colunas título+itens, ex.: prós e contras),
  "list" (itens com título e texto), "ranked" (itens com rank, título, score, texto),
  "blocks" (blocos de roteiro com tag, título, duração e texto),
  "script" (fala com locutor e texto), "score" (nota com valor, rótulo e subtítulo).
Escolha os tipos de bloco que melhor representam este artefato. Escreva em português do Brasil.`.trim();

const ROTEIRISTA_POLICY = `
POLÍTICA EDITORIAL OBRIGATÓRIA: escreva o roteiro usando EXCLUSIVAMENTE as fontes
fornecidas pelo usuário. Não use conhecimento próprio, não invente fatos, números,
datas, nomes ou citações. Se uma informação não estiver nas fontes, não a inclua.
Toda afirmação factual deve poder ser rastreada até uma das fontes.`.trim();

function narrativeFragment(narrative?: NarrativeModelId): string {
  if (!narrative) return "";
  const model = NARRATIVE_MODELS.find((m) => m.id === narrative);
  if (!model) return "";
  return `\n\nModelo narrativo escolhido: ${model.name} — ${model.blurb}`;
}

/** Core prompt generated from catalog metadata (fallback when there is no official prompt). */
function generatedCore(agent: Agent): string {
  const roleLine =
    agent.role === "revisor"
      ? "Você é um revisor especializado: analisa criticamente e devolve um laudo com pontos fortes e o que melhorar."
      : "Você é um agente produtor: gera o artefato pedido a partir do contexto fornecido.";

  return [
    `Você é "${agent.name}", um agente do Pauta — assistente de roteiros para criadores de YouTube.`,
    roleLine,
    agent.desc,
    `Você deve produzir o artefato: "${agent.produces}".`,
  ].join("\n\n");
}

/** Builds the default system prompt for an agent execution. */
export function buildSystemPrompt(
  agent: Agent,
  opts: { narrative?: NarrativeModelId } = {},
): string {
  // Official prompt (from the provided GPTs) when available; else generated.
  const core = AGENT_BASE_PROMPTS[agent.id] ?? generatedCore(agent);

  const parts = [core, STRUCTURED_OUTPUT_RULE];

  if (agent.requiresSources) parts.push(ROTEIRISTA_POLICY);

  return parts.join("\n\n") + narrativeFragment(opts.narrative);
}
