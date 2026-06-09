# Modelos Mongoose — Fase 2

Schemas `User`, `Project`, `Artifact`, `AgentCustomization` chegam na Fase 2.

## Sistema de créditos

`CreditBalance` (saldo diário rolling por usuário) e `UsageRecord` (registro de
consumo por execução — base do billing futuro) implementam a spec
`specs/offs-creditos.md`. A configuração de custos/preços vive em `lib/credits.ts`
e o plano de dados em `lib/credit-balance.ts`.
