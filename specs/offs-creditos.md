# Offs — Especificação: Sistema de Créditos e Limite de Uso

> Complemento às Especificações de Negócio v1.0
> Escopo: plano gratuito (free tier) — base para billing futuro

---

## 1. Visão geral

O sistema de créditos controla o consumo de execuções de agentes por usuário. Cada execução de agente debita uma quantidade de créditos do saldo diário do usuário. Quando o saldo zera, o usuário não consegue rodar novos agentes até o ciclo seguinte.

**Objetivos imediatos:**
- Proteger o custo de LLM no plano gratuito
- Criar a base de dados de consumo que vai informar o modelo de billing futuro
- Dar ao usuário visibilidade sobre o próprio uso

**Princípio central:** o controle real é no backend. O frontend reflete o estado — não é o guardião.

---

## 2. Entidade: Saldo de Créditos

### Atributos

| Campo | Tipo | Descrição |
|---|---|---|
| `usuario_id` | referência | Usuário dono do saldo |
| `plano` | enum | `free` \| (futuros planos pagos) |
| `creditos_diarios` | inteiro | Limite total por ciclo diário |
| `creditos_restantes` | inteiro | Saldo atual disponível |
| `ultimo_reset` | datetime | Quando o saldo foi renovado pela última vez |
| `proximo_reset` | datetime | Quando o próximo reset vai ocorrer |

### Regras

- O saldo é renovado automaticamente a cada 24h a partir do primeiro uso do dia (rolling daily), não em horário fixo global — evita picos de requisição em massa.
- O `creditos_restantes` nunca vai abaixo de zero. Se uma execução custaria mais do que o saldo disponível, ela é bloqueada inteiramente — não há execução parcial.
- O reset não acumula: créditos não usados em um dia não carregam para o dia seguinte.

---

## 3. Custo por agente

Modelo de pesos fixos por agente. Simples de comunicar ao usuário e justo o suficiente para a fase atual.

### Plano gratuito: 10 créditos/dia

| ID | Agente | Custo | Justificativa |
|---|---|---|---|
| `analista-canais` | Analista de canais | 2 créditos | Input pesado — múltiplas imagens |
| `analista-conteudo` | Analista de conteúdo | 2 créditos | Input pesado — múltiplas imagens |
| `analista-oportunidade` | Analista de oportunidade | 1 crédito | Input leve — apenas artefato |
| `analista-temas` | Analista de temas | 1 crédito | Input leve — artefato + texto |
| `analista-roteiro` | Analista de roteiro | 1 crédito | Output estruturado médio |
| `resumidor-temas` | Resumidor de temas | 1 crédito | Agente mais leve do produto |
| `estruturador` | Estruturador de roteiros | 1 crédito | Output médio |
| `roteirista` | Roteirista | 3 créditos | Agente mais pesado — maior contexto e output |
| `roteirizador-intro` | Roteirizador de introduções | 1 crédito | Output pequeno e focado |

**Custo do pipeline completo (fluxo guiado):** 13 créditos
**Créditos diários no free tier:** 10

Isso é intencional: o usuário gratuito consegue rodar quase um pipeline completo por dia, mas não um completo + extras. Incentiva conversão futura sem bloquear a experiência real do produto.

### Nota sobre regeneração

Regenerar um artefato é uma nova execução do agente — consome créditos normalmente. O sistema não distingue execução original de regeneração. Isso deve ser comunicado claramente na UX (ver seção 6).

---

## 4. Fluxo de controle (backend)

O backend é o único guardião real do limite. O frontend apenas reflete o estado retornado pelo backend.

```
Usuário dispara execução de agente
             ↓
[BACKEND] Busca saldo atual do usuário
             ↓
     saldo < custo do agente?
        ↓ sim              ↓ não
  Retorna erro          Reserva os créditos
  402 Payment           (bloqueia concorrência)
  Required                     ↓
        ↓              Chama a API da LLM
  Frontend exibe               ↓
  bloqueio               Sucesso ou erro?
                       ↓ sucesso    ↓ erro LLM
                  Debita créditos  Libera reserva
                  Salva artefato   Retorna erro
                  Retorna resultado ao usuário
```

**Detalhe importante — reserva antecipada:** os créditos são reservados antes da chamada à LLM e só debitados após sucesso. Se a LLM retornar erro, a reserva é liberada e o usuário não perde créditos por falha técnica. Isso evita frustração e reclamação de suporte.

---

## 5. Regras de negócio

**RN-C01 — Verificação sempre no backend**
A verificação de saldo acontece no backend antes de qualquer chamada à LLM. O frontend não é autoridade sobre o limite.

**RN-C02 — Bloqueio total, sem execução parcial**
Se o saldo for insuficiente para o custo do agente, a execução não ocorre. Não existe desconto ou execução degradada.

**RN-C03 — Falha de LLM não consome créditos**
Erros técnicos (timeout, erro de API, rate limit da LLM) liberam a reserva de créditos. O usuário só perde créditos quando um artefato é gerado com sucesso.

**RN-C04 — Regeneração é nova execução**
Regenerar um artefato consome créditos normalmente. Não há desconto por ser uma repetição.

**RN-C05 — Reset diário por usuário (rolling)**
O ciclo de 24h começa a partir do momento do primeiro uso do dia, não em um horário fixo global. Isso distribui os resets ao longo do dia.

**RN-C06 — Saldo nunca negativo**
O campo `creditos_restantes` não aceita valores negativos. A lógica de bloqueio deve garantir isso.

**RN-C07 — Créditos não acumulam**
Créditos não utilizados em um ciclo são perdidos no reset. Não há carryover entre dias.

---

## 6. Comportamentos de UX (o que o frontend deve refletir)

O frontend consome o estado retornado pelo backend. Nunca calcula ou decide por conta própria.

### 6.1 — Indicador de saldo

Visível em toda a interface do projeto. Mostra:
- Créditos restantes / total do dia
- Barra de progresso visual
- Horário do próximo reset (ex: "renova em 6h 30min")

### 6.2 — Agente com custo maior que o saldo

Quando o usuário não tem créditos suficientes para um agente específico:
- O botão "Rodar agente" fica desabilitado
- Uma mensagem exibe o custo do agente e o saldo atual
- Exibe o horário do próximo reset
- Exemplo: *"Este agente custa 3 créditos. Você tem 1 crédito disponível. Renova em 4h 12min."*

### 6.3 — Saldo zerado

Quando o saldo chega a zero:
- Todos os botões de execução ficam desabilitados
- Banner discreto no topo do projeto: *"Créditos diários esgotados. Renova em X horas."*
- O usuário ainda pode navegar, ver artefatos e ler conteúdo gerado — só não pode executar novos agentes

### 6.4 — Aviso antes de regenerar

Antes de regenerar um artefato, exibir confirmação com o custo:
- *"Regenerar este artefato custa 1 crédito. Você tem 4 créditos. Confirmar?"*
- Isso reduz regenerações acidentais e surpresa com consumo

### 6.5 — Custo visível antes de executar

No compositor de input (T03), antes do botão de execução, exibir o custo do agente:
- *"Executar este agente custa 2 créditos"*
- Saldo atual visível ao lado

---

## 7. Dados a registrar por execução

Cada execução deve gerar um registro de consumo. Esses dados são a base do billing futuro.

| Campo | Tipo | Descrição |
|---|---|---|
| `execucao_id` | uuid | ID único da execução |
| `usuario_id` | referência | Usuário que executou |
| `agente_id` | string | ID do agente executado |
| `projeto_id` | referência | Projeto no qual ocorreu |
| `modelo_ia` | string | Modelo utilizado (claude-sonnet, gpt-4o etc.) |
| `tokens_input` | inteiro | Tokens enviados à LLM |
| `tokens_output` | inteiro | Tokens recebidos da LLM |
| `creditos_debitados` | inteiro | Créditos consumidos nesta execução |
| `custo_real_usd` | decimal | Custo real calculado via tokens × preço do modelo |
| `status` | enum | `sucesso` \| `erro_llm` \| `bloqueado_credito` |
| `timestamp` | datetime | Data e hora da execução |

**Por que registrar `custo_real_usd` agora:** quando você migrar para billing real, terá histórico suficiente para calibrar o preço por crédito com base no custo real observado por agente e por modelo.

---

## 8. Considerações para billing futuro

Esta especificação foi desenhada para que a migração para billing pago seja uma evolução, não uma reescrita.

- A tabela de pesos por agente pode ser ajustada sem mudar a arquitetura
- O campo `creditos_diarios` na entidade de saldo permite planos diferentes com valores distintos
- O registro de `custo_real_usd` por execução permite auditar se os pesos refletem o custo real
- Quando billing for implementado, créditos extras ou planos pagos só precisam atualizar `creditos_diarios` e o ciclo de renovação — o restante da lógica permanece igual

---

## 9. Itens fora de escopo (v1)

- Compra de créditos extras (usuário só espera o reset)
- Notificação por e-mail ao esgotar créditos
- Dashboard administrativo de consumo agregado
- Diferentes limites por agente individual no mesmo plano
- Rollover de créditos não usados

---

## Implementação

| Camada | Arquivo |
|---|---|
| Configuração + funções puras (custos, preços, formatação) | `lib/credits.ts` |
| Saldo (rolling reset, reserva/release atômica) | `models/CreditBalance.ts` |
| Registro de consumo (spec §7) | `models/UsageRecord.ts` |
| Plano de dados (getBalanceView, reserveCredits, releaseCredits, recordUsage) | `lib/credit-balance.ts` |
| Integração no fluxo de execução (reserva → LLM → débito/liberação) | `lib/agent-run.ts` |
| Indicador de saldo (§6.1) | `components/app/CreditMeter.tsx` |
| Custo, bloqueio, confirmação e banner (§6.2–6.5) | `components/agent/AgentRunner.tsx` |
| Testes das funções puras | `tests/credits.test.ts` |
