# ReNTAI Teleconsultoria - Desafio Fullstack P01

Projeto para o desafio técnico **P01 - Desenvolvedor(a) Fullstack** do ReNTAI/LAVID/UFPB.

Usei como referência o PDF oficial do desafio P01 para definir requisitos, bônus, documentação e critérios de aceite.

## Visão geral

A aplicação implementa um módulo de teleconsultoria para profissionais da Atenção Primária à Saúde solicitarem apoio de especialistas remotos. O fluxo implementado em código cobre cadastro, autenticação, dashboard, criação de teleconsultoria com upload de documento, validação inteligente mockável, atribuição de especialista, registro de parecer, notificação em tempo real e exportação em PDF.

Estado atual do projeto:

- Implementado: API principal, frontend principal, Prisma/SQLite, Swagger, ADRs, C4 básico, testes automatizados de serviços da API e smoke test de regressão do frontend.
- Validado: fluxo principal pela UI, exportação em PDF, notificação em tempo real, rejeição por baixo score via API/HTTP, filtros de dashboard via API/HTTP e teste E2E mínimo com Playwright.
- Melhoria futura: ampliar a cobertura E2E para mais perfis, navegadores e cenários de erro.

## Stack

- Monorepo com npm workspaces.
- Backend: NestJS, Prisma, SQLite, JWT, Swagger, Socket.IO.
- Frontend: Next.js, React, TypeScript.
- Validação de IA: provider mockado, documentado e substituível por configuração.

## Execução rápida

Requisitos:

- Node.js 20 ou superior.
- npm 10 ou superior.
- Portas locais `3000` e `3333` livres.

Execute todos os comandos abaixo a partir da raiz do projeto, no mesmo diretório deste README.

### Caminho recomendado para subir do zero

```powershell
npm run setup
npm run dev
```

O comando `npm run setup` instala as dependências, cria `apps/api/.env` a partir de `.env.example` se o arquivo ainda não existir, aplica a migration SQLite e cria os usuários de exemplo.

O comando `npm run dev` sobe a API e o frontend juntos.

### Alternativa manual em dois terminais

Se preferir rodar os serviços separadamente, execute primeiro:

```powershell
npm install
npm run setup:env
npm run db:migrate
npm run db:seed
npm run dev:api
```

Em outro terminal, ainda na raiz do projeto:

```powershell
npm run dev:web
```

URLs previstas:

- Frontend: `http://localhost:3000`
- API: `http://localhost:3333`
- Swagger: `http://localhost:3333/docs`

Se o ambiente local apresentar erro de certificado durante downloads do npm ou Prisma, use somente no comando local:

```powershell
npm install --strict-ssl=false --no-audit --no-fund
$env:NODE_OPTIONS="--use-system-ca"; npm run db:migrate
```

## Usuários de exemplo

Depois do seed:

- Solicitante: `solicitante@rentai.local` / `123456`
- Especialista: `especialista@rentai.local` / `123456`

## Roteiro do fluxo principal de teste

1. Entrar como solicitante.
2. Criar uma nova teleconsultoria com documento PDF ou imagem.
3. Verificar se o documento foi validado e se o score ficou registrado.
4. Entrar como especialista.
5. Abrir a teleconsultoria e assumir o caso.
6. Registrar parecer.
7. Confirmar que o status mudou para `Concluida`.
8. Entrar novamente como solicitante e conferir a notificação.
9. Exportar o resumo em PDF.

Este roteiro serve para a validação manual final do fluxo ponta a ponta.

## Validação inteligente de documentos

A validação fica em `apps/api/src/document-validation/document-validation.service.ts`.

Variáveis principais:

- `DOCUMENT_VALIDATION_PROVIDER`: identifica o provider usado. O valor padrão é `mock`.
- `DOCUMENT_VALIDATION_THRESHOLD`: limiar mínimo de aceite. O padrão é `0.70`.

O provider mockado aceita PDF, PNG e JPEG. Arquivos com nomes como `laudo-clinico.pdf` recebem score alto para facilitar o fluxo feliz. Arquivos com `teste-baixo-score` ou `invalid` no nome simulam baixa confiança e retornam rejeição com score, motivo, provider e limiar.

Para substituir por uma IA real, mantenha o contrato de retorno `{ score, provider, threshold, accepted, reason }` e troque a implementação do service por uma chamada a API/modelo externo. A persistência já grava score, provider, limiar, aceite, motivo e timestamp.

## Testes e qualidade

```powershell
npm test
npm run build
```

Teste E2E mínimo com Playwright:

```powershell
npm run test:e2e
```

Esse teste sobe a API e o frontend compilados e valida no navegador:

- rejeição de `teste-baixo-score.pdf` com score e limiar;
- criação de teleconsultoria com documento aceito;
- busca/filtros no dashboard;
- especialista assumindo o caso;
- registro de parecer e status `Concluida`.

Se o navegador do Playwright ainda não estiver instalado no ambiente, rode uma vez:

```powershell
npx playwright install chromium
```

Em ambientes Windows que já possuem Google Chrome instalado, também é possível executar usando o navegador do sistema:

```powershell
$env:PLAYWRIGHT_CHANNEL="chrome"; npm run test:e2e
```

Cobertura atual de testes automatizados da API:

- Cadastro/login e regras básicas de perfil.
- Validação mockável de documentos, incluindo limiar configurável e rejeição.
- Listagem com escopo por solicitante e filtro de datas.
- Bloqueio de criação por especialista.
- Rejeição de upload abaixo do limiar.
- Registro de parecer apenas pelo especialista responsável, conclusão de status e notificação.

No frontend, o script `npm test -w apps/web` é um smoke test de regressão para proteger o reset do formulário de parecer. O script `npm run test:e2e` executa um fluxo mínimo no navegador com Playwright. A validação funcional do fluxo web está descrita no roteiro manual acima e documentada em `docs/validation/2026-05-18-primeira-validacao-manual.md`.

## Documentação técnica

- Checklist de aderência ao PDF: `docs/checklists/pdf-requirements.md`.
- Registro de validação manual e complementar: `docs/validation/2026-05-18-primeira-validacao-manual.md`.
- Arquitetura e C4 básico: `docs/architecture.md`.
- ADRs: `docs/adr/`.
- Swagger/OpenAPI em runtime: `http://localhost:3333/docs`.

## Ferramentas de IA utilizadas

Durante o desenvolvimento deste desafio, utilizei o ChatGPT/Codex como ferramenta de apoio ao desenvolvimento de software.

A IA foi usada principalmente para apoiar a leitura e organização do escopo do PDF, estruturar a documentação técnica, revisar a aderência entre requisitos e implementação, refinar trechos de código, apoiar a criação de testes e melhorar a clareza do README, ADRs, checklist e registros de validação.

Também utilizei a IA como apoio operacional durante o desenvolvimento, incluindo revisão de diffs, organização de commits, mensagens de commit, validações antes de versionar alterações e publicação dos incrementos no GitHub.

A ferramenta foi orientada com o contexto do desafio, as decisões técnicas adotadas no projeto e critérios de qualidade, rastreabilidade, reprodutibilidade local e aderência aos requisitos obrigatórios.

A aceitação das funcionalidades foi conferida por meio de testes automatizados, fluxo E2E com Playwright, validações manuais documentadas e revisão final dos requisitos do PDF.

O que funcionou bem:

- Organização do escopo em etapas.
- Estruturação inicial do monorepo.
- Criação de documentação rastreável aos requisitos.
- Apoio na definição de testes e critérios de aceite.

O que precisou ser ajustado:

- A validação de IA foi mantida mockada para evitar dependência de credenciais externas.
- O banco foi definido como SQLite para facilitar reprodução local.
- A regra de especialista responsável foi explicitada como "assumir caso", pois o PDF não define o mecanismo.

O que foi descartado:

- Integração real com serviço externo de IA na primeira versão.
- Banco PostgreSQL obrigatório com Docker, para reduzir atrito na avaliação.

## Limitações conhecidas

- SQLite foi escolhido pela simplicidade de execução local; em produção, PostgreSQL seria recomendado.
- O provider de IA é mockado; em produção, ele seria substituído por um serviço real com auditoria, privacidade e políticas de tratamento de dados clínicos.
- A autenticação usa JWT simples; em produção, cookies HttpOnly, refresh tokens e rotação de segredo seriam recomendados.


