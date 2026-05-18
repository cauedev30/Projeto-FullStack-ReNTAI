# Arquitetura - ReNTAI Teleconsultoria

## Contexto

O sistema atende dois atores principais:

- Solicitante APS: cria teleconsultorias e acompanha pareceres.
- Especialista: assume casos e registra parecer tecnico.

## Containers

```mermaid
C4Container
title ReNTAI Teleconsultoria

Person(solicitante, "Solicitante APS", "Profissional da atencao primaria")
Person(especialista, "Especialista", "Profissional remoto responsavel pelo parecer")

System_Boundary(app, "Modulo de Teleconsultoria") {
  Container(web, "Web App", "Next.js", "Interface para solicitantes e especialistas")
  Container(api, "API", "NestJS", "Autenticacao, teleconsultorias, uploads, pareceres e notificacoes")
  ContainerDb(db, "SQLite", "Prisma", "Usuarios, teleconsultorias, validacoes, historico e pareceres")
  Container(ai, "Document Validation Provider", "Mock substituivel", "Classifica documentos clinicos e retorna score")
}

Rel(solicitante, web, "Usa")
Rel(especialista, web, "Usa")
Rel(web, api, "HTTP + WebSocket")
Rel(api, db, "Le/escreve")
Rel(api, ai, "Envia documento para validacao")
```

## Decisoes principais

- Monorepo para manter backend, frontend e documentacao juntos.
- SQLite para reproducao local simples.
- Prisma para schema versionado e client tipado.
- Provider de IA mockado e substituivel por configuracao.
- WebSocket para notificar solicitante sem recarregar a pagina.
