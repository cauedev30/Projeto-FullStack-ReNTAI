# Primeira validacao manual do fluxo de teleconsultoria

Data local: 2026-05-18

## Contexto

Validacao manual executada no clone local do projeto, com API e Web rodando em ambiente de desenvolvimento:

- Frontend: `http://localhost:3000`
- API/Swagger: `http://localhost:3333/docs`
- Banco local: SQLite com seed aplicado

## Fluxo validado

- Login como solicitante usando `solicitante@rentai.local`.
- Dashboard inicial carregou em estado vazio.
- Criacao de teleconsultoria pela UI com dados clinicos e documento de apoio.
- Retorno ao dashboard com a nova teleconsultoria listada como `Pendente`.
- Detalhes da teleconsultoria exibiram dados clinicos, score da validacao inteligente, provider `mock`, linha do tempo e ausencia inicial de pareceres.
- Login como especialista usando `especialista@rentai.local`.
- Especialista assumiu o caso.
- Status mudou para `Em andamento`.
- Formulario de parecer ficou disponivel apenas para o especialista responsavel.
- Parecer foi registrado.
- Status mudou para `Concluida`.
- Linha do tempo registrou a conclusao.
- Novo parecer registrado apos a correcao do bug abaixo, sem exibir erro na tela.
- Exportacao do resumo em PDF validada pelo endpoint autenticado e pelo botao da tela de detalhes.
- Notificacao em tempo real validada com uma sessao conectada como solicitante enquanto um novo parecer era registrado pelo especialista.

## Evidencias tecnicas observadas

- `npm test` passou com 13 testes automatizados.
- `npm run build` passou para API e Web.
- API respondeu `200` em `/docs`.
- Web respondeu `200` em `/`.
- Consulta da API confirmou teleconsultoria com:
  - status `PENDING` apos criacao;
  - score `0.94`;
  - provider `mock`;
  - validacao aceita;
  - status `IN_PROGRESS` apos assumir caso;
  - status `COMPLETED` apos registrar parecer.
- Exportacao autenticada retornou arquivo com cabecalho `%PDF-` e conteudo esperado do resumo da teleconsultoria.
- PDF aberto pela interface exibiu dados do paciente, informacoes clinicas, validacao do documento e pareceres registrados.
- Cliente Socket.IO conectado com token do solicitante recebeu o evento `opinion.registered` apos o registro de um novo parecer.
- Payload recebido na notificacao:

```json
{
  "teleconsultationId": "cmpbvlwwr0001uyrof8wmqd9p",
  "patientName": "caue",
  "status": "COMPLETED",
  "message": "Um parecer foi registrado para sua teleconsultoria."
}
```

## Bug encontrado

Ao registrar o primeiro parecer pela tela de detalhes, o parecer foi salvo corretamente e o status mudou para `Concluida`, mas a UI exibiu o erro:

```text
Cannot read properties of null (reading 'reset')
```

Causa identificada: o componente tentava executar `event.currentTarget.reset()` depois de uma chamada assincrona. Nesse momento, o `currentTarget` podia estar nulo.

## Correcao aplicada

O formulario agora e capturado em uma constante antes da chamada assincrona:

```ts
const form = event.currentTarget;
const data = new FormData(form);
```

Depois do retorno da API, o reset usa a referencia estavel:

```ts
form.reset();
```

## Validacao da correcao

- `npm run lint -w apps/web` passou.
- `npm run build -w apps/web` passou.
- Novo parecer foi registrado pela UI sem exibir o erro.

## Ainda nao validado nesta rodada

- Teste automatizado E2E ou de UI para o fluxo web.

## Validacao complementar em 2026-05-19

Validacao funcional executada no repositorio oficial `https://github.com/cauedev30/Projeto-FullStack-ReNTAI`.

### Rejeicao por baixo score

- API compilada iniciada com `node dist/src/main.js`.
- `/docs` respondeu `200`.
- Login como solicitante usando `solicitante@rentai.local`.
- Tentativa de criar teleconsultoria com arquivo `teste-baixo-score.pdf`.
- Resultado: API retornou `400`.
- Mensagem retornada pela API, exibivel pela UI via `apiFetch`:

```text
Documento rejeitado pela validacao inteligente. Score: 0.32. Limiar: 0.7.
```

- Payload de validacao observado:

```json
{
  "score": 0.32,
  "threshold": 0.7,
  "accepted": false
}
```

### Filtros e busca do dashboard

- Criada teleconsultoria aceita com `laudo-clinico.pdf`.
- Busca por paciente retornou a teleconsultoria criada.
- Busca por especialidade `Cardiologia` retornou a teleconsultoria criada.
- Filtro por `status=PENDING`, `dateFrom` e `dateTo` no dia da criacao retornou a teleconsultoria criada.

Resultado observado nos filtros:

```json
{
  "status": 200,
  "found": true,
  "patientName": "Filtro Oficial 1779208722746",
  "statusLabel": "PENDING",
  "specialty": "CARDIOLOGY"
}
```

### Correcoes tecnicas aplicadas na retomada

- `apps/api/package.json`: script `start` corrigido para `node dist/src/main.js`, que corresponde ao caminho real gerado pelo build TypeScript.
- `apps/api/src/main.ts`: bootstrap agora carrega `apps/api/.env` antes de iniciar a aplicacao, permitindo que a API compilada encontre `DATABASE_URL`, `JWT_SECRET`, `PORT`, `WEB_ORIGIN` e configuracoes do provider mockado.
- `apps/web/scripts/smoke-test.mjs`: smoke test de regressao cobre a referencia estavel do formulario de parecer.

### Verificacoes desta retomada

- `npm test`: passou com 13 testes da API e smoke test do frontend.
- `npm run build`: passou para API e Web fora do sandbox, apos falha conhecida `spawn EPERM` no build Next dentro do sandbox.
- `node dist/src/main.js`: API compilada iniciou e `/docs` respondeu `200`.

## Revisao de aderencia contra o PDF em 2026-05-19

O checklist `docs/checklists/pdf-requirements.md` foi revisado contra o PDF oficial do desafio P01.

Resultado da revisao:

- Todos os requisitos obrigatorios do PDF permanecem cobertos.
- README contem arquitetura, execucao do zero, configuracao/substituicao da IA, roteiro de teste, limitacoes e declaracao de ferramentas de IA.
- Bonus documentais atendidos: Swagger/OpenAPI, ADRs, C4 basico e trade-offs.
- Bonus tecnico atendido: testes automatizados cobrem regras criticas da API, smoke test de regressao do frontend e E2E minimo com Playwright para o fluxo critico no navegador.

Observacao de honestidade da validacao:

- Fluxo principal, parecer, PDF e notificacao em tempo real foram validados manualmente pela UI ou por endpoint autenticado conforme registrado acima.
- Rejeicao por baixo score e filtros/busca foram validados por API/HTTP em 2026-05-19 e tambem cobertos pelo E2E minimo com Playwright.

## E2E minimo com Playwright em 2026-05-19

Adicionado teste E2E em `tests/e2e/teleconsultoria.spec.ts`, com configuracao em `playwright.config.ts` e script `npm run test:e2e`.

Fluxo coberto no navegador:

- Login como solicitante.
- Tentativa de criar teleconsultoria com `teste-baixo-score.pdf`.
- Validacao da mensagem de rejeicao com score `0.32` e limiar `0.7`.
- Criacao de teleconsultoria com `laudo-clinico.pdf`.
- Busca e filtros no dashboard por paciente, status e intervalo de datas.
- Login como especialista.
- Busca do mesmo caso no dashboard.
- Especialista assume o caso.
- Especialista registra parecer.
- Status muda para `Concluida` e parecer aparece na tela.

## Validacao complementar em 2026-05-20

Revisao executada no repositorio oficial, usando como referencia o PDF oficial do desafio P01.

Resultado da revisao:

- Repositorio remoto confirmado: `https://github.com/cauedev30/Projeto-FullStack-ReNTAI`.
- Branch `main` sincronizada com `origin/main` antes do registro desta validacao.
- Ultimo commit validado antes desta anotacao: `91b3ff1 teste: cobre fluxo critico com Playwright E2E`.
- Nenhum requisito obrigatorio do PDF foi identificado como ausente na revisao de aderencia.
- README, checklist, arquitetura, ADRs, Swagger, testes automatizados e E2E foram conferidos contra o escopo.

Verificacoes executadas:

- `npm test`: passou com 13 testes da API e smoke test do frontend.
- `npm run lint`: passou para API e Web.
- `npm run build`: falhou apenas dentro do sandbox com o erro conhecido `spawn EPERM` do Next no Windows; repetido fora do sandbox, passou para API e Web.
- `$env:PLAYWRIGHT_CHANNEL='chrome'; npm run test:e2e`: passou com 1 teste E2E no Chrome do sistema.
- API compilada em execucao respondeu `200` em `http://localhost:3333/docs`.
- Frontend compilado em execucao respondeu `200` em `http://localhost:3000`.

Smoke funcional adicional via API:

```json
{
  "loginSolicitante": true,
  "loginEspecialista": true,
  "rejeicaoBaixoScoreHttp": 400,
  "rejeicaoMensagem": "Documento rejeitado pela validacao inteligente. Score: 0.32. Limiar: 0.7.",
  "criadoStatus": "PENDING",
  "scoreCriado": 0.94,
  "provider": "mock",
  "filtroEncontrou": true,
  "statusAposAssumir": "IN_PROGRESS",
  "statusAposParecer": "COMPLETED",
  "pareceres": 1,
  "pdfHttp": 200,
  "pdfHeader": "%PDF-"
}
```

Conclusao: projeto revisado e validado para submissao, sem bloqueadores conhecidos de aderencia ao PDF.
