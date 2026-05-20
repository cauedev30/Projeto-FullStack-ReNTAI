# Rastreamento de Requisitos do PDF

Fonte canonica: `C:\Users\CAUÊ\Desktop\Desafio_P01_Fullstack_ReNTAI.docx.pdf`

Este documento registra o que ja existe no projeto e onde cada item pode ser verificado. A validacao manual final do fluxo deve ser registrada antes da entrega.

Primeira validacao manual registrada em `docs/validation/2026-05-18-primeira-validacao-manual.md`.

Revisao final contra o PDF canonico realizada em 2026-05-19. Nenhum requisito obrigatorio do PDF ficou marcado como ausente. Apos a revisao final, foi adicionado um teste E2E minimo com Playwright para cobrir o fluxo critico no navegador.

## Funcionalidades obrigatorias

- [x] Cadastro com selecao de perfil: Solicitante ou Especialista. Evidencia: `apps/web/src/app/page.tsx`, `apps/api/src/auth/auth.service.ts`.
- [x] Autenticacao com sessao gerenciada por token. Evidencia: JWT em `AuthService`, guarda em `AuthGuard`, storage web em `apps/web/src/lib/api.ts`.
- [x] Controle de acesso por perfil nas rotas relevantes. Evidencia: `RolesGuard`, `@Roles`, testes em `teleconsultations.service.spec.ts`.
- [x] Dashboard com ID, paciente, especialidade, data e status. Evidencia: `apps/web/src/app/dashboard/page.tsx`.
- [x] Busca por especialidade ou nome do paciente. Evidencia: `TeleconsultationsService.list` e validacao complementar registrada em `docs/validation/2026-05-18-primeira-validacao-manual.md`.
- [x] Filtros por status e intervalo de datas. Evidencia: dashboard, teste `inclui o dia inteiro no filtro final dateTo` e validacao complementar registrada em `docs/validation/2026-05-18-primeira-validacao-manual.md`.
- [x] Botao Nova Teleconsultoria apenas para Solicitante. Evidencia: `AppShell` e dashboard.
- [x] Botao Ver detalhes em cada registro. Evidencia: `apps/web/src/app/dashboard/page.tsx`.
- [x] Formulario com paciente, data de nascimento, especialidade, hipotese diagnostica e historia clinica. Evidencia: `apps/web/src/app/teleconsultations/new/page.tsx`.
- [x] Upload de PDF ou imagem. Evidencia: input web e `FileInterceptor` no controller.
- [x] Validacao inteligente no momento do upload. Evidencia: `TeleconsultationsService.create`.
- [x] Provider de IA mockado com interface documentada e substituivel. Evidencia: `DocumentValidationService`, README e ADR 0003.
- [x] Limiar configuravel por variavel de ambiente. Evidencia: `DOCUMENT_VALIDATION_THRESHOLD` e testes de validacao.
- [x] Rejeicao do upload com mensagem clara e score quando abaixo do limiar. Evidencia: `TeleconsultationsService.create`, teste de rejeicao e validacao funcional com `teste-baixo-score.pdf` registrada em `docs/validation/2026-05-18-primeira-validacao-manual.md`.
- [x] Persistencia de score, provedor, limiar e timestamp. Evidencia: modelo `DocumentValidation` no Prisma.
- [x] Tela de detalhes com dados clinicos resumidos. Evidencia: `apps/web/src/app/teleconsultations/[id]/page.tsx`.
- [x] Linha do tempo de status. Evidencia: `StatusHistory` e tela de detalhes.
- [x] Pareceres registrados pelo especialista. Evidencia: endpoint `POST /teleconsultations/:id/opinions`.
- [x] Botao Registrar Parecer apenas para especialista responsavel. Evidencia: condicional `canRegisterOpinion` na tela de detalhes.
- [x] Exportacao do resumo em PDF. Evidencia: `GET /teleconsultations/:id/export.pdf` e validacao manual registrada em `docs/validation/2026-05-18-primeira-validacao-manual.md`.
- [x] Notificacao em tempo real ao solicitante quando parecer for registrado. Evidencia: `TeleconsultationsGateway`, dashboard Socket.IO e validacao registrada em `docs/validation/2026-05-18-primeira-validacao-manual.md`.
- [x] Atualizacao automatica do status para Concluida ao registrar parecer. Evidencia: `registerOpinion` e teste dedicado.

## README

- [x] Arquitetura da solucao.
- [x] Instrucoes para subir do zero.
- [x] Como configurar/substituir validacao de IA.
- [x] Roteiro para testar o fluxo principal manualmente.
- [x] Limitacoes conhecidas e producao.
- [x] Ferramentas de IA utilizadas.

## Bonus

- [x] Swagger/OpenAPI. Evidencia: `SwaggerModule.setup("docs", ...)`.
- [x] ADRs. Evidencia: `docs/adr/`.
- [x] Diagrama C4. Evidencia: `docs/architecture.md`.
- [x] Documentacao explicita de trade-offs. Evidencia: README, arquitetura e ADRs.
- [x] Testes automatizados de regras criticas da API. Evidencia: `npm test` e specs em `apps/api/src`.
- [x] Teste automatizado E2E ou de UI do fluxo web. Evidencia: `npm run test:e2e`, `playwright.config.ts` e `tests/e2e/teleconsultoria.spec.ts`.

## Estado final da revisao

- Obrigatorios do PDF: cobertos por implementacao, testes automatizados, validacao manual ou validacao funcional por API/HTTP.
- Bonus atendidos: Swagger/OpenAPI, ADRs, C4 basico, trade-offs documentados, testes automatizados de regras criticas e E2E minimo com Playwright.
- Observacao: rejeicao por baixo score e filtros do dashboard foram validados por API/HTTP em 2026-05-19 e tambem cobertos pelo E2E minimo no navegador.
