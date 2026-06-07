# Offs — Especificações de Negócio

> Versão 1.0 — documento base para geração de specs técnicas

---

## 1. Visão do produto

**Offs** é um assistente de projetos para criadores de YouTube que ajuda a planejar e produzir vídeos com apoio de agentes de IA. O nome vem de "narração em off" — tudo que acontece antes da câmera ligar.

**Proposta de valor central:**
Cada projeto representa um vídeo em produção. Dentro do projeto, o criador aciona agentes de IA especializados que analisam canais, identificam temas e escrevem roteiros. Os agentes podem ser usados em sequência guiada ou de forma avulsa.

**Público-alvo:**
Criadores de YouTube brasileiros — de iniciantes testando o primeiro vídeo a criadores estabelecidos com canal ativo. O produto não exige canal conectado para funcionar.

---

## 2. Entidades de negócio

### 2.1 Usuário

Atributos:
- Nome e e-mail
- Modelo de IA padrão global (Claude, GPT-4o, Gemini 2.5 Pro)
- Canal do YouTube (opcional — nome, handle, URL)
- Plano de assinatura (a definir)

Regras:
- O usuário pode operar sem canal conectado
- A preferência de modelo global pode ser sobrescrita por projeto ou por execução de agente
- Hierarquia de modelo: global → projeto → execução

---

### 2.2 Projeto

Representa um vídeo em produção. Um usuário pode ter múltiplos projetos simultâneos.

Atributos:
- Título (nome do vídeo em planejamento)
- Status: `ideia` → `roteiro` → `produção` → `publicado`
- Modelo de IA padrão do projeto (herda do usuário, pode ser sobrescrito)
- Data de criação e última atividade
- Lista de agentes executados (`done[]`)
- Biblioteca de artefatos gerados

Regras:
- O status avança manualmente — o produto não avança automático
- Um projeto pode ter zero artefatos (estado vazio = primeiro contato do usuário com o produto)
- Projetos podem ser arquivados mas não deletados (preservar histórico)
- Um projeto pode ser duplicado para reaproveitar estrutura

---

### 2.3 Artefato

Tudo que um agente produz fica salvo como artefato dentro do projeto.

Atributos:
- Nome (padrão = nome do artefato que o agente produz, editável pelo usuário)
- Agente que gerou
- Modelo de IA usado na execução
- Data e hora de geração
- Versão (inteiro incremental — começa em 1)
- Conteúdo estruturado (seções, tabelas, blocos narrativos — não texto bruto)
- Status: `ativo` | `arquivado`

Regras:
- Ao regenerar um artefato, o anterior é arquivado e uma nova versão é criada (não sobrescreve)
- O usuário pode visualizar versões anteriores
- O usuário pode renomear o artefato a qualquer momento
- O usuário pode promover uma versão anterior como ativa
- Artefatos podem ser usados como input para outros agentes dentro do mesmo projeto

---

### 2.4 Agente

Unidade de trabalho com IA. Cada agente tem inputs esperados, uma política de execução e produz um artefato específico.

Atributos:
- ID único
- Nome e descrição
- Categoria (`canal` | `roteiro`)
- Tipo (`produtor` | `revisor`)
- Tipos de input aceitos (`image` | `text` | `artifact` | `sources`)
- Artefato de input recomendado (pré-selecionado no compositor)
- Artefato que produz
- Flags especiais: `requiresSources`, `narrative`, `dualContext`
- Prompt base (editável pelo usuário avançado)

Regras:
- Todo agente pode ser executado avulsamente, sem pré-requisitos bloqueantes
- Agentes com `requiresSources: true` ficam bloqueados se nenhuma fonte for fornecida
- Agentes com `narrative: true` exibem seletor de modelo narrativo antes da execução
- Agentes com `dualContext: true` (Analista de Roteiro) podem ser acionados em dois momentos distintos do fluxo

---

### 2.5 Customização de agente

O usuário avançado pode personalizar qualquer agente.

Atributos:
- Referência ao agente original
- Prompt customizado
- Modelo de IA específico para o agente
- Escopo: `global` (vale para todos os projetos) | `projeto` (vale só para este projeto)
- Flag de restauração disponível

Regras:
- A customização não altera o agente padrão — cria uma sobreposição
- O usuário pode restaurar o padrão original a qualquer momento
- Customizações de escopo `projeto` têm prioridade sobre as de escopo `global`

---

## 3. Agentes — catálogo completo

### Categoria: Canal do YouTube
Foco em inteligência e estratégia do canal.

| ID | Nome | Tipo | Input | Artefato produzido | Flags |
|---|---|---|---|---|---|
| `analista-canais` | Analista de canais | Produtor | `image` | Perfil do canal | — |
| `analista-conteudo` | Analista de conteúdo | Produtor | `image` | Catálogo de vídeos | — |
| `analista-oportunidade` | Analista de oportunidade | Produtor | `artifact` (Catálogo de vídeos) | Guia do canal | — |
| `analista-temas` | Analista de temas | Produtor | `artifact` (Guia do canal) + `text` | Lista de temas | — |
| `analista-roteiro` | Analista de roteiro | Revisor | `text` ou `artifact` (Rascunho do roteiro) | Laudo estrutural | `dualContext` |

### Categoria: Roteirista
Foco em criação do roteiro.

| ID | Nome | Tipo | Input | Artefato produzido | Flags |
|---|---|---|---|---|---|
| `resumidor-temas` | Resumidor de temas | Produtor | `text` + `artifact` (Lista de temas, opcional) | Briefing do tema | — |
| `estruturador` | Estruturador de roteiros | Produtor | `artifact` (Briefing do tema) | Estrutura do roteiro | `narrative` |
| `roteirista` | Roteirista | Produtor | `artifact` (Estrutura do roteiro) + `sources` | Rascunho do roteiro | `requiresSources`, `narrative` |
| `roteirizador-intro` | Roteirizador de introduções | Produtor | `artifact` (Rascunho do roteiro) | Introdução refinada | — |

---

## 4. Tipos de input de agente

| Tipo | Descrição | Comportamento |
|---|---|---|
| `image` | Prints do YouTube | Upload múltiplo, visualização em grid, remoção individual |
| `text` | Texto livre digitado | Textarea livre, sem restrição |
| `artifact` | Artefato gerado por outro agente no projeto | Seletor com lista de artefatos, destaque para o recomendado |
| `sources` | Fontes externas (artigos, matérias, dados) | Campo especializado, adição item a item, obrigatório quando presente |

Regras:
- Um agente pode aceitar múltiplos tipos de input combinados
- O tipo `sources` é exclusivo do Roteirista e bloqueia execução quando vazio
- O tipo `artifact` pré-seleciona o artefato recomendado mas permite seleção manual de qualquer outro artefato do projeto

---

## 5. Modelos narrativos

Aplicável aos agentes `estruturador` e `roteirista`.

| ID | Nome | Quando usar |
|---|---|---|
| `elementar` | Elementar | Temas históricos ou complexos que precisam de muito contexto |
| `problema` | Problema-Solução | Temas atuais, denúncias ou questões com causa e solução claras |
| `hibrido` | Híbrido | Temas que precisam de contexto breve antes de entrar no problema |

---

## 6. Fluxo guiado (pipeline padrão)

O modo guiado apresenta os agentes em sequência sugerida. O usuário pode pular etapas ou executá-las fora de ordem — o fluxo é uma sugestão, não um bloqueio.

```
1. Analista de conteúdo       → Catálogo de vídeos
2. Analista de oportunidade   → Guia do canal
3. Analista de temas          → Lista de temas
4. Resumidor de temas         → Briefing do tema
5. Estruturador de roteiros   → Estrutura do roteiro
6. Roteirista                 → Rascunho do roteiro
7. Roteirizador de introduções → Introdução refinada
8. Analista de roteiro        → Laudo estrutural
```

**Agentes fora do fluxo guiado (modo livre apenas):**
- Analista de canais — usado para análise de canais concorrentes, ponto de partida opcional antes do fluxo principal
- Analista de roteiro em contexto de referência externa — análise de roteiro externo como pesquisa, antes de começar a escrever

**Caso especial — Analista de roteiro (`dualContext`):**
- **Contexto 1 (pré-escrita):** o usuário fornece um roteiro externo como referência. O agente analisa a estrutura e devolve aprendizados. Acesso via modo livre ou como ponto de partida opcional do projeto.
- **Contexto 2 (revisão):** após o Roteirista gerar o rascunho, o agente revisa a estrutura do próprio roteiro. É o passo 8 do fluxo guiado e também aparece como ação direta no artefato "Rascunho do roteiro".

---

## 7. Funcionalidades de negócio

### F01 — Gestão de conta e preferências globais
O usuário gerencia seu perfil, define o modelo de IA padrão e conecta opcionalmente o canal do YouTube.

### F02 — Gestão de projetos
Criar, renomear, arquivar e duplicar projetos. Visualizar lista com filtro por status.

### F03 — Modo guiado
Dentro do projeto, checklist visual mostrando a sequência de agentes, o que já foi executado (com link para o artefato) e o próximo passo sugerido.

### F04 — Modo livre
Grid de todos os agentes disponíveis, organizados por categoria, para acionar qualquer um diretamente sem seguir a sequência.

### F05 — Compositor de input
Área de montagem de contexto antes de executar um agente. Combina upload de imagens, texto livre, seletor de artefatos e campo de fontes conforme o tipo de input do agente.

### F06 — Política editorial por agente
Agentes com restrições exibem aviso visível antes da execução. O Roteirista bloqueia o botão de rodar enquanto não houver fontes e exibe mensagem "Aguardando fontes".

### F07 — Seleção de modelo narrativo
Para Estruturador e Roteirista, o usuário escolhe entre Elementar, Problema-Solução ou Híbrido antes de executar.

### F08 — Execução do agente
Chamada à API do modelo de IA selecionado com o prompt do agente + contexto montado pelo usuário. Feedback visual durante o processamento.

### F09 — Biblioteca de artefatos
Todos os artefatos do projeto, com nome, agente, modelo, data e versão. Acesso rápido a qualquer artefato gerado.

### F10 — Visualização de artefato
Renderização estruturada do artefato (seções, tabelas, métricas, blocos narrativos). Não texto bruto.

Ações disponíveis sobre um artefato:
- Copiar conteúdo
- Usar como input em outro agente (abre seletor de agente)
- Regenerar (arquiva versão atual, cria nova)
- Renomear
- Ver versões anteriores
- Acionar Analista de Roteiro diretamente (disponível no artefato "Rascunho do roteiro")

### F11 — Versionamento de artefatos
Ao regenerar, a versão anterior é arquivada. O usuário pode visualizar e restaurar versões anteriores.

### F12 — Customização de agente
Edição do prompt base, seleção de modelo específico para o agente, definição de escopo (global ou projeto) e restauração do padrão original.

### F13 — Seleção de modelo de IA por execução
O usuário pode trocar o modelo de IA em qualquer execução de agente, sem alterar o padrão do projeto. A interface indica claramente que a troca é válida apenas para aquela execução.

### F14 — Estado vazio do projeto
Quando nenhum agente foi executado, o projeto exibe uma tela de boas-vindas com o fluxo guiado sugerido e acesso ao modo livre. É o primeiro contato real do usuário com o produto.

---

## 8. Regras de negócio críticas

**RN01 — Canal opcional**
Nenhuma funcionalidade exige canal conectado. Agentes de canal operam com dados fornecidos manualmente (prints, texto).

**RN02 — Sem bloqueio de sequência**
Nenhum agente bloqueia a execução de outro. O fluxo guiado é sugestivo, não obrigatório.

**RN03 — Política de fontes**
O Roteirista só executa com pelo menos uma fonte fornecida. Sem fontes, o botão de execução fica desabilitado e a mensagem "Aguardando fontes" é exibida.

**RN04 — Dados extraídos de imagem**
Os agentes de canal (Analista de canais, Analista de conteúdo, Analista de temas) extraem dados diretamente de prints do YouTube enviados pelo usuário. Não há integração com a API do YouTube na v1.

**RN05 — Artefato nunca é sobrescrito**
Ao regenerar, sempre se cria uma nova versão. A versão anterior é arquivada e acessível.

**RN06 — Hierarquia de modelo de IA**
Preferência global do usuário → modelo padrão do projeto → modelo selecionado na execução. Cada nível pode sobrescrever o anterior.

**RN07 — Roteirista não inventa**
O prompt do Roteirista instrui explicitamente o modelo a não usar conhecimento próprio. Toda informação deve vir das fontes fornecidas. Violações desta política são um erro de produto, não de UX.

**RN08 — Analista de Roteiro em dois contextos**
O mesmo agente opera de forma diferente dependendo do contexto de acionamento: análise de referência externa (input: texto livre) ou revisão do rascunho próprio (input: artefato "Rascunho do roteiro"). O contexto deve ser selecionável na tela de execução do agente.

---

## 9. Telas principais

| Tela | Descrição |
|---|---|
| T01 — Lista de projetos | Home do usuário. Cards com nome, status, artefatos, última atividade e modelo. |
| T02 — Interior do projeto | Visão geral do projeto. Modo guiado + modo livre + biblioteca de artefatos. |
| T02b — Interior vazio | Estado quando nenhum agente foi executado. Boas-vindas e orientação de primeiro passo. |
| T03 — Execução de agente | Compositor de input + seleções de modelo narrativo e modelo de IA + botão de execução. |
| T04 — Visualização de artefato | Conteúdo estruturado + ações (copiar, usar, regenerar, renomear, versões). |
| T05 — Customização de agente | Editor de prompt + seletor de modelo + escopo + restaurar padrão. |

---

## 10. Fora de escopo (v1)

- Integração com API do YouTube (métricas em tempo real, dados de canal automáticos)
- Colaboração entre usuários no mesmo projeto
- Exportação para Google Docs / Notion
- Mobile (foco em desktop/laptop)
- Histórico de execuções com diff visual
- Agentes de thumbnail, título ou descrição
- Publicação direta no YouTube

---

## 11. Decisões em aberto

| # | Questão | Impacto |
|---|---|---|
| D01 | Analista de Canais entra no fluxo guiado ou fica só no modo livre? | UX do modo guiado |
| D02 | Modelo de precificação — por execução de agente, por projeto ou assinatura fixa? | Arquitetura de billing |
| D03 | Limite de projetos por plano? | Modelo de dados e planos |
| D04 | O usuário pode criar agentes próprios do zero ou só customizar os existentes? | Roadmap de produto |
| D05 | Artefatos são exportáveis (PDF, DOCX) na v1? | Escopo de v1 |
