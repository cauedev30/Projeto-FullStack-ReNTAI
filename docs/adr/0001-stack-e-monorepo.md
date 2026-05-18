# ADR 0001 - Stack e monorepo

## Status

Aceita

## Contexto

O desafio exige uma solucao fullstack funcional, documentada e facil de avaliar. A stack e livre e a decisao arquitetural faz parte da avaliacao.

## Decisao

Usar monorepo com `apps/api` em NestJS e `apps/web` em Next.js, ambos em TypeScript.

## Consequencias

- A separacao entre backend e frontend fica clara.
- O backend consegue demonstrar API, RBAC, Swagger e WebSocket.
- O frontend consome contratos HTTP reais.
- O setup continua simples por usar npm workspaces.
