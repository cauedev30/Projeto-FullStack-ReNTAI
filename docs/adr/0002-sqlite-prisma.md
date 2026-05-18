# ADR 0002 - SQLite e Prisma

## Status

Aceita

## Contexto

O avaliador precisa conseguir rodar o projeto do zero com pouco atrito. PostgreSQL seria mais proximo de producao, mas adiciona dependencia de Docker ou banco externo.

## Decisao

Usar SQLite com Prisma.

## Consequencias

- O projeto roda localmente sem container.
- O schema continua versionado e tipado.
- A migracao futura para PostgreSQL e viavel, mas exigiria revisar provider, migrations e alguns detalhes operacionais.
