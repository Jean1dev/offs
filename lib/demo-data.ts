// lib/demo-data.ts — demo content for seeding (validates the screens in later phases).
// Ported from design/project/app/{data,artifact_content}.jsx. Not product config —
// this is sample data a dev can load into their own account via /api/dev/seed.

import type { ArtifactContent } from "@/lib/artifact-content";
import type { ProjectStatus } from "@/lib/catalog";
import type { AIModelId } from "@/lib/types";

/** Structured output per agent (keyed by agentId). */
export const ARTIFACT_CONTENT: Record<string, ArtifactContent> = {
  "analista-conteudo": {
    summary:
      "62 vídeos catalogados a partir de 4 prints. Padrão claro: formatos longos de investigação rendem 3× mais que listas rápidas.",
    blocks: [
      {
        t: "metrics",
        items: [
          { value: "62", label: "vídeos" },
          { value: "18:40", label: "duração média" },
          { value: "184 mil", label: "inscritos" },
          { value: "3,2%", label: "engajamento" },
        ],
      },
      { t: "h", text: "Vídeos por desempenho" },
      {
        t: "table",
        cols: ["Título", "Views", "Duração", "Tema"],
        rows: [
          ["A verdade sobre o metrô de SP", "1,2 mi", "22:10", "Infraestrutura"],
          ["Por que o Brasil importa tudo", "840 mil", "19:05", "Economia"],
          ["O fim dos correios?", "610 mil", "16:30", "Serviços"],
          ["Como funciona o pré-sal", "430 mil", "24:00", "Energia"],
          ["5 obras que pararam no tempo", "95 mil", "08:12", "Lista rápida"],
        ],
      },
      {
        t: "p",
        text: "Os quatro vídeos de maior alcance compartilham a mesma fórmula: pergunta provocativa no título, formato acima de 16 minutos e tema de infraestrutura ou economia nacional.",
      },
    ],
  },
  "analista-oportunidade": {
    summary:
      "O canal cresce com investigações longas sobre infraestrutura nacional. Listas rápidas e temas internacionais não engajam a audiência atual.",
    blocks: [
      {
        t: "lead",
        text: 'O Mundo em Foco construiu autoridade num nicho específico: explicar por que o Brasil "não consegue" fazer coisas que outros países fazem. A audiência recompensa profundidade e provocação — e ignora conteúdo genérico.',
      },
      {
        t: "split",
        left: {
          title: "O que funciona",
          items: [
            'Títulos em formato de pergunta ("Por que o Brasil…")',
            "Investigações de 16–24 min com dados e fontes",
            "Temas de infraestrutura, transporte e economia",
            "Comparações Brasil × outros países",
          ],
        },
        right: {
          title: "O que não funciona",
          items: [
            "Listas rápidas abaixo de 10 min (queda de 70% em views)",
            "Temas internacionais sem ligação com o Brasil",
            "Thumbnails sem rosto ou número",
            "Aberturas que demoram a entregar a promessa",
          ],
        },
      },
      { t: "h", text: "Zonas de oportunidade" },
      {
        t: "list",
        items: [
          {
            title: "Transporte ferroviário",
            text: "Tema recorrente nos comentários, nunca abordado a fundo pelo canal.",
          },
          {
            title: "Megaprojetos engavetados",
            text: "Casado com o formato investigativo que já performa.",
          },
          {
            title: "Comparações com a Ásia",
            text: "Coreia, China e Japão geram alto compartilhamento.",
          },
        ],
      },
    ],
  },
  "analista-temas": {
    summary:
      '8 temas rankeados por potencial. "Por que o Brasil não tem trem-bala?" lidera — alto volume de busca e baixa concorrência qualificada.',
    blocks: [
      {
        t: "ranked",
        items: [
          {
            rank: 1,
            title: "Por que o Brasil não tem trem-bala?",
            score: 94,
            text: "Cruza ferrovia + comparação internacional + pergunta provocativa. Busca alta, concorrência fraca.",
          },
          {
            rank: 2,
            title: "A obra mais cara que o Brasil abandonou",
            score: 88,
            text: "Formato investigativo consolidado. Forte gancho emocional.",
          },
          {
            rank: 3,
            title: "Como a China construiu 40 mil km de trem-bala",
            score: 81,
            text: "Comparação com a Ásia — alto compartilhamento histórico.",
          },
          {
            rank: 4,
            title: "O metrô que nunca saiu do papel",
            score: 72,
            text: "Tema regional, audiência mais nichada.",
          },
          {
            rank: 5,
            title: "5 transportes do futuro que já existem",
            score: 51,
            text: "Formato lista — historicamente fraco no canal.",
          },
        ],
      },
    ],
  },
  "resumidor-temas": {
    summary:
      "Briefing condensado para o vídeo sobre trem-bala: ângulo, promessa ao espectador, perguntas-chave e tom de voz.",
    blocks: [
      {
        t: "lead",
        text: "Vídeo investigativo de ~18 minutos respondendo por que o Brasil, sendo uma das maiores economias do mundo, nunca construiu uma ferrovia de alta velocidade — enquanto países menores conseguiram.",
      },
      { t: "h", text: "Ângulo" },
      {
        t: "p",
        text: "Não é um vídeo técnico sobre trens. É um vídeo sobre decisões, prioridades e o ciclo político brasileiro — usando o trem-bala como símbolo de um padrão maior.",
      },
      { t: "h", text: "Promessa ao espectador" },
      {
        t: "p",
        text: "Ao final, o espectador entende exatamente por que o projeto falhou três vezes e o que precisaria mudar para sair do papel.",
      },
      { t: "h", text: "Perguntas que o roteiro precisa responder" },
      {
        t: "list",
        items: [
          {
            title: "Quantas vezes o projeto foi tentado?",
            text: "2007, 2013 e 2020 — cada tentativa com um motivo diferente de fracasso.",
          },
          {
            title: "Por que outros países conseguiram?",
            text: "Comparar com Espanha, Coreia e Marrocos.",
          },
          {
            title: "Quanto custaria hoje?",
            text: "Números atualizados para dar concretude.",
          },
        ],
      },
    ],
  },
  estruturador: {
    summary:
      "Estrutura híbrida de 7 blocos para ~18 minutos. Gancho de tensão na abertura, desenvolvimento elementar no miolo.",
    blocks: [
      {
        t: "blocks",
        items: [
          {
            tag: "Gancho",
            title: "A promessa quebrada",
            dur: "0:00–0:40",
            text: 'Imagem do trem-bala japonês cortando para um trecho de estrada esburacada. "O Brasil prometeu isso três vezes."',
          },
          {
            tag: "Contexto",
            title: "O que é e por que importa",
            dur: "0:40–3:00",
            text: "Explicar rapidamente o que é alta velocidade e por que vira símbolo de modernidade.",
          },
          {
            tag: "Bloco 1",
            title: "A primeira tentativa (2007)",
            dur: "3:00–7:00",
            text: "O projeto Rio–Campinas. Custos, licitação, o que deu errado.",
          },
          {
            tag: "Bloco 2",
            title: "As tentativas seguintes",
            dur: "7:00–11:00",
            text: "Por que cada governo reabriu e enterrou o projeto.",
          },
          {
            tag: "Contraste",
            title: "Como os outros fizeram",
            dur: "11:00–14:30",
            text: "Espanha e Coreia: o que eles tinham que faltou aqui.",
          },
          {
            tag: "Síntese",
            title: "O padrão por trás de tudo",
            dur: "14:30–17:00",
            text: "O trem-bala como sintoma, não doença. O ciclo político.",
          },
          {
            tag: "Fecho",
            title: "O que precisaria mudar",
            dur: "17:00–18:00",
            text: "Resposta direta à promessa + chamada para o próximo vídeo.",
          },
        ],
      },
    ],
  },
  roteirista: {
    summary:
      "Rascunho completo de ~18 minutos, escrito apenas a partir das fontes fornecidas. 2.840 palavras, ~16 min de narração.",
    blocks: [
      { t: "lead", text: "Bloco de abertura · 0:00–0:40" },
      {
        t: "script",
        speaker: "Narração",
        text: "Esse é o trem-bala japonês. Ele cruza 500 quilômetros em duas horas, sem atrasar um minuto sequer. O Brasil prometeu construir um igual. Não uma, mas três vezes. E três vezes a promessa virou pó.",
      },
      {
        t: "script",
        speaker: "Narração",
        text: 'Mas a pergunta que ninguém faz não é "por que não temos". É: por que sempre começamos — e nunca terminamos?',
      },
      { t: "h", text: "Bloco 1 · A primeira tentativa (2007)" },
      {
        t: "script",
        speaker: "Narração",
        text: "Em 2007, o governo federal anunciou o trem de alta velocidade entre Rio e Campinas. O orçamento previa 35 bilhões de reais. A previsão de entrega: a Copa de 2014.",
      },
      {
        t: "note",
        text: "Fonte aplicada: matéria do Estadão (2010) sobre a licitação fracassada.",
      },
    ],
  },
  "roteirizador-intro": {
    summary:
      "Introdução reescrita com 3 variações de gancho. A versão recomendada prioriza tensão visual nos primeiros 8 segundos.",
    blocks: [
      { t: "h", text: "Versão recomendada" },
      {
        t: "script",
        speaker: "0–8s · Gancho",
        text: "Esse trem anda a 320 km/h. Esse aqui… nem saiu da estação. Os dois custaram bilhões. A diferença? Um foi construído. O outro foi prometido três vezes.",
      },
      {
        t: "script",
        speaker: "8–20s · Promessa",
        text: "Nos próximos minutos eu vou te mostrar exatamente por que o Brasil nunca construiu um trem-bala — e por que isso diz muito mais sobre o país do que sobre trens.",
      },
      { t: "h", text: "Variações alternativas" },
      {
        t: "list",
        items: [
          {
            title: "Gancho de número",
            text: '"35 bilhões de reais. É quanto o Brasil já gastou planejando um trem que nunca andou."',
          },
          {
            title: "Gancho de pergunta",
            text: '"Por que um país do tamanho de um continente não tem um único trem rápido?"',
          },
        ],
      },
    ],
  },
  "analista-roteiro": {
    summary:
      "Laudo estrutural do rascunho: ritmo forte na abertura, mas o terceiro bloco perde tensão. Nota geral 8,2/10.",
    blocks: [
      {
        t: "score",
        value: "8,2",
        label: "Nota estrutural",
        sub: "Bom rascunho, pronto para refino",
      },
      {
        t: "split",
        left: {
          title: "Pontos fortes",
          items: [
            "Gancho dos primeiros 40s segura a retenção",
            "Comparação internacional bem posicionada",
            "Uso de dados concretos com fontes",
          ],
        },
        right: {
          title: "O que melhorar",
          items: [
            "Bloco 2 tem 4 min sem virada de ritmo — quebrar em dois",
            'A síntese antecipa o fecho; mover o "padrão político" para mais perto do fim',
            "Faltou um momento de respiro emocional antes do contraste",
          ],
        },
      },
      { t: "h", text: "Recomendação" },
      {
        t: "p",
        text: "Rode o Roteirizador de introduções para fortalecer ainda mais a abertura, e reestruture o bloco 2 antes de gravar.",
      },
    ],
  },
  "analista-canais": {
    summary:
      'Perfil do canal concorrente "Brasil Paralelo Tech": forte em produção, fraco em consistência. Publica pouco, mas com alto valor de produção.',
    blocks: [
      {
        t: "metrics",
        items: [
          { value: "1,1 mi", label: "inscritos" },
          { value: "2,4/mês", label: "frequência" },
          { value: "21:30", label: "duração média" },
          { value: "5,8%", label: "engajamento" },
        ],
      },
      {
        t: "split",
        left: {
          title: "Forças",
          items: [
            "Altíssimo valor de produção e motion graphics",
            "Roteiros densos e bem pesquisados",
            "Identidade visual forte e reconhecível",
          ],
        },
        right: {
          title: "Fraquezas",
          items: [
            "Frequência baixa e irregular",
            "Títulos pouco otimizados para busca",
            "Pouca interação com a audiência nos comentários",
          ],
        },
      },
      {
        t: "p",
        text: "Oportunidade direta: manter a profundidade deles, mas com frequência maior e títulos mais buscáveis.",
      },
    ],
  },
};

export interface DemoProject {
  title: string;
  status: ProjectStatus;
  model: AIModelId;
  done: string[];
  /** Optional per-agent version count (to seed archived history). Default 1. */
  versions?: Record<string, number>;
  empty?: boolean;
}

const GUIDED_DONE = [
  "analista-conteudo",
  "analista-oportunidade",
  "analista-temas",
  "resumidor-temas",
  "estruturador",
  "roteirista",
  "roteirizador-intro",
  "analista-roteiro",
];

export const DEMO_PROJECTS: DemoProject[] = [
  {
    title: "Por que o Brasil não tem trem-bala?",
    status: "roteiro",
    model: "claude",
    done: [
      "analista-conteudo",
      "analista-oportunidade",
      "analista-temas",
      "resumidor-temas",
      "estruturador",
    ],
    versions: { "analista-temas": 2, estruturador: 3 },
  },
  {
    title: "A história secreta do Pix",
    status: "producao",
    model: "claude",
    done: GUIDED_DONE.slice(0, 7),
  },
  {
    title: "5 erros de quem começa na bolsa",
    status: "ideia",
    model: "gpt",
    done: ["analista-conteudo", "analista-oportunidade"],
  },
  {
    title: "Como a Coreia do Sul dominou a cultura pop",
    status: "publicado",
    model: "gemini",
    done: GUIDED_DONE,
  },
  {
    title: "O lado obscuro do dropshipping",
    status: "roteiro",
    model: "claude",
    done: [
      "analista-conteudo",
      "analista-oportunidade",
      "analista-temas",
      "resumidor-temas",
    ],
  },
  // Empty project — exercises the empty state (T02b).
  { title: "Vídeo sem título", status: "ideia", model: "claude", done: [], empty: true },
];
