// lib/ai/research.ts — web-search research step.
// generateObject (saída estruturada) não combina com tools; então a pesquisa real
// roda num passo separado de generateText com a ferramenta de web search do provider,
// e o texto pesquisado vira contexto factual para o passo de estruturação.

import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import type { AIModelId } from "@/lib/types";

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";
const GOOGLE_MODEL = process.env.GOOGLE_MODEL ?? "gemini-2.5-pro";

const RESEARCH_SYSTEM =
  "Você é um pesquisador. Busque na web fatos, dados e contexto confiáveis sobre o tema pedido, " +
  "priorizando artigos acadêmicos, relatórios oficiais e portais jornalísticos reconhecidos " +
  "(BBC, Reuters, CNN Brasil, Folha, Estadão). Evite a Wikipedia. " +
  "Ao final, liste as fontes consultadas com as URLs completas.";

/**
 * Runs a web-search-grounded research pass for the given model/provider.
 * Returns the researched text (with sources), or null on failure / no result.
 */
export async function researchTopic(
  model: AIModelId,
  query: string,
): Promise<string | null> {
  const prompt = `Pesquise sobre o seguinte tema para embasar um vídeo de YouTube:\n\n${query}`;
  try {
    if (model === "gpt") {
      const { text } = await generateText({
        model: openai.responses(OPENAI_MODEL),
        system: RESEARCH_SYSTEM,
        prompt,
        tools: { web_search: openai.tools.webSearchPreview({}) },
      });
      return text?.trim() || null;
    }
    if (model === "gemini") {
      const { text } = await generateText({
        model: google(GOOGLE_MODEL),
        system: RESEARCH_SYSTEM,
        prompt,
        tools: { google_search: google.tools.googleSearch({}) },
      });
      return text?.trim() || null;
    }
    // claude (default)
    const { text } = await generateText({
      model: anthropic(ANTHROPIC_MODEL),
      system: RESEARCH_SYSTEM,
      prompt,
      tools: { web_search: anthropic.tools.webSearch_20250305({ maxUses: 5 }) },
    });
    return text?.trim() || null;
  } catch (e) {
    console.error("researchTopic failed:", e);
    return null;
  }
}
