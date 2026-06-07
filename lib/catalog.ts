// lib/catalog.ts — static, typed agent catalog & taxonomies.
// Ported from the design's data layer (design/project/app/data.jsx). This is product
// configuration, not user data: agents, categories, the guided pipeline, narrative
// models, input types, project statuses and AI-model display metadata.

import type { IconName } from "@/components/Icon";
import type { AIModelId } from "@/lib/types";

// ── Project status taxonomy: ideia → roteiro → produção → publicado ──
export type ProjectStatus = "ideia" | "roteiro" | "producao" | "publicado";
export type StatusTone = "neutral" | "rose" | "gold" | "success";

export const STATUS: Record<
  ProjectStatus,
  { label: string; tone: StatusTone; order: number }
> = {
  ideia: { label: "Ideia", tone: "neutral", order: 0 },
  roteiro: { label: "Roteiro", tone: "rose", order: 1 },
  producao: { label: "Produção", tone: "gold", order: 2 },
  publicado: { label: "Publicado", tone: "success", order: 3 },
};

// ── AI models — display metadata (registry that actually calls them is Phase 3) ──
export const MODELS: Record<
  AIModelId,
  { name: string; short: string; mono: string; tint: string }
> = {
  claude: { name: "Claude Sonnet 4.5", short: "Claude", mono: "C", tint: "var(--rose-500)" },
  gpt: { name: "GPT-4o", short: "GPT-4o", mono: "G", tint: "var(--neutral-600)" },
  gemini: { name: "Gemini 2.5 Pro", short: "Gemini", mono: "G", tint: "var(--gold-500)" },
};

// ── Agent input types ──
export type InputType = "image" | "text" | "artifact" | "sources";

export const INPUT: Record<
  InputType,
  { icon: IconName; label: string; hint: string }
> = {
  image: { icon: "image", label: "Imagem", hint: "Prints do YouTube" },
  text: { icon: "text", label: "Texto livre", hint: "Digitado por você" },
  artifact: { icon: "layers", label: "Artefato", hint: "Saída de outro agente" },
  sources: { icon: "link", label: "Fontes", hint: "Obrigatório · bloqueia execução" },
};

// ── Narrative models (for `estruturador` and `roteirista`) ──
export type NarrativeModelId = "elementar" | "problema" | "hibrido";

export const NARRATIVE_MODELS: { id: NarrativeModelId; name: string; blurb: string }[] = [
  { id: "elementar", name: "Elementar", blurb: "Linear e direto — informação na ordem natural." },
  { id: "problema", name: "Problema-Solução", blurb: "Tensão no início, alívio no fim." },
  { id: "hibrido", name: "Híbrido", blurb: "Gancho de tensão + desenvolvimento elementar." },
];

// ── Categories ──
export type AgentCategory = "canal" | "roteiro";

export const CATEGORIES: Record<
  AgentCategory,
  { label: string; blurb: string; icon: IconName }
> = {
  canal: { label: "Canal do YouTube", blurb: "Inteligência e estratégia do canal", icon: "trending" },
  roteiro: { label: "Roteirista", blurb: "Criação e refino do roteiro", icon: "edit" },
};

// ── Agents ──
export type AgentRole = "produtor" | "revisor";

/** Alternate input/output configuration for a dual-context agent. */
export interface AgentContext {
  label: string;
  sub: string;
  desc: string;
  inputs: InputType[];
  inputArtifact?: string;
  produces: string;
}

export interface Agent {
  id: string;
  cat: AgentCategory;
  role: AgentRole;
  icon: IconName;
  name: string;
  blurb: string;
  produces: string;
  producesIcon: IconName;
  inputs: InputType[];
  desc: string;
  /** Recommended input artifact (pre-selected in the composer). */
  inputArtifact?: string;
  /** Highlighted optional starting point, surfaced outside the guided flow. */
  startingPoint?: boolean;
  /** Shows the narrative-model selector before running. */
  narrative?: boolean;
  /** Blocks execution until at least one source is provided (RN03). */
  requiresSources?: boolean;
  /** Operates in two distinct contexts, chosen at run time (RN08). */
  dualContext?: boolean;
  contexts?: { referencia: AgentContext; rascunho: AgentContext };
}

export const AGENTS: Agent[] = [
  // Categoria: Canal do YouTube
  {
    id: "analista-canais",
    cat: "canal",
    role: "produtor",
    icon: "compass",
    name: "Analista de canais",
    blurb: "Disseca um canal concorrente a partir de prints.",
    produces: "Perfil do canal",
    producesIcon: "compass",
    inputs: ["image"],
    startingPoint: true,
    desc: "Analisa prints de um canal concorrente e devolve um perfil estratégico — forças, fraquezas e as métricas que importam. Um bom ponto de partida antes de mapear o seu próprio canal.",
  },
  {
    id: "analista-conteudo",
    cat: "canal",
    role: "produtor",
    icon: "video",
    name: "Analista de conteúdo",
    blurb: "Transforma prints da lista de vídeos em um catálogo estruturado.",
    produces: "Catálogo de vídeos",
    producesIcon: "video",
    inputs: ["image"],
    desc: "Lê prints da aba de vídeos de um canal e organiza tudo em um catálogo estruturado: títulos, views, datas e padrões.",
  },
  {
    id: "analista-oportunidade",
    cat: "canal",
    role: "produtor",
    icon: "target",
    name: "Analista de oportunidade",
    blurb: "Lê o catálogo e revela o que funciona e o que não funciona.",
    produces: "Guia do canal",
    producesIcon: "target",
    inputs: ["artifact"],
    inputArtifact: "Catálogo de vídeos",
    desc: "A partir de um catálogo de vídeos, identifica os padrões de sucesso e as zonas mortas — um guia editorial do canal.",
  },
  {
    id: "analista-temas",
    cat: "canal",
    role: "produtor",
    icon: "trending",
    name: "Analista de temas",
    blurb: "Sugere temas rankeados pelo potencial de audiência.",
    produces: "Lista de temas",
    producesIcon: "trending",
    inputs: ["artifact", "text"],
    inputArtifact: "Guia do canal",
    desc: "Cruza o guia do canal com o seu contexto e devolve uma lista de temas rankeados por potencial de retenção e busca.",
  },
  {
    id: "analista-roteiro",
    cat: "canal",
    role: "revisor",
    icon: "microscope",
    name: "Analista de roteiro",
    blurb: "Laudo estrutural de um roteiro — referência externa ou seu rascunho.",
    produces: "Laudo estrutural",
    producesIcon: "microscope",
    inputs: ["artifact"],
    inputArtifact: "Rascunho do roteiro",
    dualContext: true,
    contexts: {
      referencia: {
        label: "Roteiro de referência",
        sub: "Antes de escrever",
        desc: "Cole um roteiro externo (de um vídeo que você admira) para extrair o que faz ele funcionar — estrutura, ritmo e ganchos a imitar.",
        inputs: ["text"],
        produces: "Laudo de referência",
      },
      rascunho: {
        label: "Meu rascunho",
        sub: "Depois de escrever",
        desc: "Avalie o seu próprio rascunho antes de gravar — pontos fortes e o que melhorar na estrutura.",
        inputs: ["artifact"],
        inputArtifact: "Rascunho do roteiro",
        produces: "Laudo estrutural",
      },
    },
    desc: "Avalia a estrutura de um roteiro apontando pontos fortes e o que melhorar. Funciona em dois momentos: analisando uma referência externa antes de escrever, ou revisando o seu próprio rascunho depois.",
  },
  // Categoria: Roteirista
  {
    id: "resumidor-temas",
    cat: "roteiro",
    role: "produtor",
    icon: "book",
    name: "Resumidor de temas",
    blurb: "Condensa contexto e fontes em um briefing enxuto.",
    produces: "Briefing do tema",
    producesIcon: "book",
    inputs: ["text", "artifact"],
    inputArtifact: "Lista de temas",
    desc: "Pega seu texto livre e a lista de temas e condensa tudo em um briefing — os insumos essenciais para começar a roteirizar.",
  },
  {
    id: "estruturador",
    cat: "roteiro",
    role: "produtor",
    icon: "blocks",
    name: "Estruturador de roteiros",
    blurb: "Desenha a arquitetura do roteiro em blocos.",
    produces: "Estrutura do roteiro",
    producesIcon: "blocks",
    inputs: ["artifact"],
    inputArtifact: "Briefing do tema",
    narrative: true,
    desc: "A partir do briefing, propõe a estrutura do vídeo: blocos, função de cada um e o tamanho ideal para o ritmo.",
  },
  {
    id: "roteirista",
    cat: "roteiro",
    role: "produtor",
    icon: "edit",
    name: "Roteirista",
    blurb: "Escreve o rascunho completo — só com as suas fontes.",
    produces: "Rascunho do roteiro",
    producesIcon: "fileText",
    inputs: ["artifact", "sources", "text"],
    inputArtifact: "Estrutura do roteiro",
    narrative: true,
    requiresSources: true,
    desc: "Escreve o rascunho completo seguindo a estrutura. Política editorial: usa apenas as fontes que você fornecer.",
  },
  {
    id: "roteirizador-intro",
    cat: "roteiro",
    role: "produtor",
    icon: "sparkles",
    name: "Roteirizador de introduções",
    blurb: "Reescreve a abertura para segurar a retenção.",
    produces: "Introdução refinada",
    producesIcon: "sparkles",
    inputs: ["artifact"],
    inputArtifact: "Rascunho do roteiro",
    desc: "Reescreve os primeiros 30 segundos do roteiro com foco em retenção — gancho, promessa e ritmo.",
  },
];

// ── Guided pipeline order (agent ids). Sugestivo, não bloqueante (RN02). ──
export const GUIDED_FLOW: string[] = [
  "analista-conteudo",
  "analista-oportunidade",
  "analista-temas",
  "resumidor-temas",
  "estruturador",
  "roteirista",
  "roteirizador-intro",
  "analista-roteiro",
];

export const agentById = (id: string): Agent | undefined =>
  AGENTS.find((a) => a.id === id);
