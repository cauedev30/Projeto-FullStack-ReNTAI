# ADR 0003 - Validacao de IA mockavel

## Status

Aceita

## Contexto

O PDF permite API externa real, modelo proprio ou servico mockado, desde que a interface seja real, documentada e substituivel por configuracao.

## Decisao

Implementar um provider mockado com interface explicita e selecao por variavel de ambiente.

## Consequencias

- O avaliador consegue rodar o fluxo sem credenciais externas.
- O contrato fica pronto para trocar por servico real.
- O README precisa explicar como configurar/substituir o provider.
