// data.jsx — Pauta mock data. Projects, agents, categories, artifacts.

// ── Status taxonomy: ideia → roteiro → produção → publicado ──
const STATUS = {
  ideia:     { label: 'Ideia',     tone: 'neutral', order: 0 },
  roteiro:   { label: 'Roteiro',   tone: 'rose',    order: 1 },
  producao:  { label: 'Produção',  tone: 'gold',    order: 2 },
  publicado: { label: 'Publicado', tone: 'success', order: 3 },
};

// ── AI models ──
const MODELS = {
  claude:  { name: 'Claude Sonnet 4.5', short: 'Claude', mono: 'C', tint: 'var(--rose-500)' },
  gpt:     { name: 'GPT-4o',            short: 'GPT-4o', mono: 'G', tint: 'var(--neutral-600)' },
  gemini:  { name: 'Gemini 2.5 Pro',    short: 'Gemini', mono: 'G', tint: 'var(--gold-500)' },
};

// ── Input types ──
const INPUT = {
  image:    { icon: 'image',    label: 'Imagem',          hint: 'Prints do YouTube' },
  text:     { icon: 'text',     label: 'Texto livre',     hint: 'Digitado por você' },
  artifact: { icon: 'layers',   label: 'Artefato',        hint: 'Saída de outro agente' },
  sources:  { icon: 'link',     label: 'Fontes',          hint: 'Obrigatório · bloqueia execução' },
};

// ── Agents ──────────────────────────────────────────────
const AGENTS = [
  // Categoria: Canal do YouTube
  {
    id: 'analista-canais', cat: 'canal', role: 'produtor', icon: 'compass',
    name: 'Analista de canais',
    blurb: 'Disseca um canal concorrente a partir de prints.',
    produces: 'Perfil do canal', producesIcon: 'compass',
    inputs: ['image'],
    startingPoint: true,
    desc: 'Analisa prints de um canal concorrente e devolve um perfil estratégico — forças, fraquezas e as métricas que importam. Um bom ponto de partida antes de mapear o seu próprio canal.',
  },
  {
    id: 'analista-conteudo', cat: 'canal', role: 'produtor', icon: 'video',
    name: 'Analista de conteúdo',
    blurb: 'Transforma prints da lista de vídeos em um catálogo estruturado.',
    produces: 'Catálogo de vídeos', producesIcon: 'video',
    inputs: ['image'],
    desc: 'Lê prints da aba de vídeos de um canal e organiza tudo em um catálogo estruturado: títulos, views, datas e padrões.',
  },
  {
    id: 'analista-oportunidade', cat: 'canal', role: 'produtor', icon: 'target',
    name: 'Analista de oportunidade',
    blurb: 'Lê o catálogo e revela o que funciona e o que não funciona.',
    produces: 'Guia do canal', producesIcon: 'target',
    inputs: ['artifact'],
    inputArtifact: 'Catálogo de vídeos',
    desc: 'A partir de um catálogo de vídeos, identifica os padrões de sucesso e as zonas mortas — um guia editorial do canal.',
  },
  {
    id: 'analista-temas', cat: 'canal', role: 'produtor', icon: 'trending',
    name: 'Analista de temas',
    blurb: 'Sugere temas rankeados pelo potencial de audiência.',
    produces: 'Lista de temas', producesIcon: 'trending',
    inputs: ['artifact', 'text'],
    inputArtifact: 'Guia do canal',
    desc: 'Cruza o guia do canal com o seu contexto e devolve uma lista de temas rankeados por potencial de retenção e busca.',
  },
  {
    id: 'analista-roteiro', cat: 'canal', role: 'revisor', icon: 'microscope',
    name: 'Analista de roteiro',
    blurb: 'Laudo estrutural de um roteiro — referência externa ou seu rascunho.',
    produces: 'Laudo estrutural', producesIcon: 'microscope',
    inputs: ['artifact'],
    inputArtifact: 'Rascunho do roteiro',
    dualContext: true,
    contexts: {
      referencia: {
        label: 'Roteiro de referência', sub: 'Antes de escrever',
        desc: 'Cole um roteiro externo (de um vídeo que você admira) para extrair o que faz ele funcionar — estrutura, ritmo e ganchos a imitar.',
        inputs: ['text'], produces: 'Laudo de referência',
      },
      rascunho: {
        label: 'Meu rascunho', sub: 'Depois de escrever',
        desc: 'Avalie o seu próprio rascunho antes de gravar — pontos fortes e o que melhorar na estrutura.',
        inputs: ['artifact'], inputArtifact: 'Rascunho do roteiro', produces: 'Laudo estrutural',
      },
    },
    desc: 'Avalia a estrutura de um roteiro apontando pontos fortes e o que melhorar. Funciona em dois momentos: analisando uma referência externa antes de escrever, ou revisando o seu próprio rascunho depois.',
  },
  // Categoria: Roteirista
  {
    id: 'resumidor-temas', cat: 'roteiro', role: 'produtor', icon: 'book',
    name: 'Resumidor de temas',
    blurb: 'Condensa contexto e fontes em um briefing enxuto.',
    produces: 'Briefing do tema', producesIcon: 'book',
    inputs: ['text', 'artifact'],
    inputArtifact: 'Lista de temas',
    desc: 'Pega seu texto livre e a lista de temas e condensa tudo em um briefing — os insumos essenciais para começar a roteirizar.',
  },
  {
    id: 'estruturador', cat: 'roteiro', role: 'produtor', icon: 'blocks',
    name: 'Estruturador de roteiros',
    blurb: 'Desenha a arquitetura do roteiro em blocos.',
    produces: 'Estrutura do roteiro', producesIcon: 'blocks',
    inputs: ['artifact'],
    inputArtifact: 'Briefing do tema',
    narrative: true,
    desc: 'A partir do briefing, propõe a estrutura do vídeo: blocos, função de cada um e o tamanho ideal para o ritmo.',
  },
  {
    id: 'roteirista', cat: 'roteiro', role: 'produtor', icon: 'edit',
    name: 'Roteirista',
    blurb: 'Escreve o rascunho completo — só com as suas fontes.',
    produces: 'Rascunho do roteiro', producesIcon: 'fileText',
    inputs: ['artifact', 'sources', 'text'],
    inputArtifact: 'Estrutura do roteiro',
    narrative: true,
    requiresSources: true,
    desc: 'Escreve o rascunho completo seguindo a estrutura. Política editorial: usa apenas as fontes que você fornecer.',
  },
  {
    id: 'roteirizador-intro', cat: 'roteiro', role: 'produtor', icon: 'sparkles',
    name: 'Roteirizador de introduções',
    blurb: 'Reescreve a abertura para segurar a retenção.',
    produces: 'Introdução refinada', producesIcon: 'sparkles',
    inputs: ['artifact'],
    inputArtifact: 'Rascunho do roteiro',
    desc: 'Reescreve os primeiros 30 segundos do roteiro com foco em retenção — gancho, promessa e ritmo.',
  },
];

const CATEGORIES = {
  canal:   { label: 'Canal do YouTube', blurb: 'Inteligência e estratégia do canal', icon: 'trending' },
  roteiro: { label: 'Roteirista',       blurb: 'Criação e refino do roteiro',         icon: 'edit' },
};

// guided pipeline order (agent ids)
const GUIDED_FLOW = [
  'analista-conteudo', 'analista-oportunidade', 'analista-temas',
  'resumidor-temas', 'estruturador', 'roteirista', 'roteirizador-intro', 'analista-roteiro',
];

const NARRATIVE_MODELS = [
  { id: 'elementar', name: 'Elementar', blurb: 'Linear e direto — informação na ordem natural.' },
  { id: 'problema',  name: 'Problema-Solução', blurb: 'Tensão no início, alívio no fim.' },
  { id: 'hibrido',   name: 'Híbrido', blurb: 'Gancho de tensão + desenvolvimento elementar.' },
];

const agentById = id => AGENTS.find(a => a.id === id);

// ── Projects ────────────────────────────────────────────
// artifacts[]: { id, name, agentId, model, when, kind(producesIcon) }
const PROJECTS = [
  {
    id: 'trem-bala', title: 'Por que o Brasil não tem trem-bala?',
    status: 'roteiro', model: 'claude', updated: 'há 2 horas',
    artifacts: [
      { id: 'a1', name: 'Catálogo de vídeos',  agentId: 'analista-conteudo',     model: 'claude', when: 'há 2 dias',  version: 1, versions: 1 },
      { id: 'a2', name: 'Guia do canal',        agentId: 'analista-oportunidade', model: 'claude', when: 'há 2 dias',  version: 1, versions: 1 },
      { id: 'a3', name: 'Lista de temas',       agentId: 'analista-temas',        model: 'claude', when: 'ontem',     version: 2, versions: 2 },
      { id: 'a4', name: 'Briefing do tema',     agentId: 'resumidor-temas',       model: 'claude', when: 'ontem',     version: 1, versions: 1 },
      { id: 'a5', name: 'Estrutura do roteiro', agentId: 'estruturador',          model: 'claude', when: 'há 5 horas', version: 3, versions: 3 },
    ],
    done: ['analista-conteudo', 'analista-oportunidade', 'analista-temas', 'resumidor-temas', 'estruturador'],
  },
  {
    id: 'pix', title: 'A história secreta do Pix',
    status: 'producao', model: 'claude', updated: 'ontem', artifactCount: 9, done: GUIDED_FLOW.slice(0, 7),
  },
  {
    id: 'bolsa', title: '5 erros de quem começa na bolsa', // playful
    status: 'ideia', model: 'gpt', updated: 'há 3 dias', artifactCount: 2, done: ['analista-conteudo', 'analista-oportunidade'],
  },
  {
    id: 'kpop', title: 'Como a Coreia do Sul dominou a cultura pop',
    status: 'publicado', model: 'gemini', updated: 'há 1 semana', artifactCount: 11, done: GUIDED_FLOW,
  },
  {
    id: 'dropshipping', title: 'O lado obscuro do dropshipping',
    status: 'roteiro', model: 'claude', updated: 'há 5 horas', artifactCount: 4, done: ['analista-conteudo', 'analista-oportunidade', 'analista-temas', 'resumidor-temas'],
  },
  {
    id: 'novo', title: 'Vídeo sem título', empty: true,
    status: 'ideia', model: 'claude', updated: 'agora', artifacts: [], done: [],
  },
];

const projectById = id => PROJECTS.find(p => p.id === id);

// channel (optional connection)
const CHANNEL = {
  connected: true, name: 'Mundo em Foco', handle: '@mundoemfoco',
  subs: '184 mil', videos: 62, initial: 'M',
};

Object.assign(window, {
  STATUS, MODELS, INPUT, AGENTS, CATEGORIES, GUIDED_FLOW, NARRATIVE_MODELS,
  agentById, PROJECTS, projectById, CHANNEL,
});
