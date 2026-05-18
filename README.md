# ReNTAI Teleconsultoria - Desafio Fullstack P01

Projeto novo e independente para o desafio tecnico **P01 - Desenvolvedor(a) Fullstack** do ReNTAI/LAVID/UFPB.

Fonte canonica local do escopo:

```text
C:\Users\CAUÊ\Desktop\Desafio_P01_Fullstack_ReNTAI.docx.pdf
```

Este arquivo PDF deve ser usado sempre que houver duvida sobre requisitos, bonus, documentacao ou criterio de aceite.

## Visao geral

A aplicacao implementa um modulo de teleconsultoria para profissionais da Atencao Primaria a Saude solicitarem apoio de especialistas remotos. O fluxo cobre cadastro, autenticacao, dashboard, criacao de teleconsultoria com upload de documento, validacao inteligente mockavel, atribuicao de especialista, registro de parecer, notificacao em tempo real e exportacao em PDF.

## Stack

- Monorepo com npm workspaces.
- Backend: NestJS, Prisma, SQLite, JWT, Swagger, Socket.IO.
- Frontend: Next.js, React, TypeScript.
- Validacao de IA: provider mockado, documentado e substituivel por configuracao.

## Execucao rapida

```powershell
npm install
npm run db:migrate
npm run db:seed
npm run dev:api
npm run dev:web
```

URLs previstas:

- Frontend: `http://localhost:3000`
- API: `http://localhost:3333`
- Swagger: `http://localhost:3333/docs`

## Usuarios de exemplo

Depois do seed:

- Solicitante: `solicitante@rentai.local` / `123456`
- Especialista: `especialista@rentai.local` / `123456`

## Fluxo principal de teste

1. Entrar como solicitante.
2. Criar uma nova teleconsultoria com documento PDF ou imagem.
3. Verificar se o documento foi validado e se o score ficou registrado.
4. Entrar como especialista.
5. Abrir a teleconsultoria e assumir o caso.
6. Registrar parecer.
7. Confirmar que o status mudou para `Concluida`.
8. Entrar novamente como solicitante e conferir a notificacao.
9. Exportar o resumo em PDF.

## Ferramentas de IA utilizadas

Durante o desenvolvimento deste desafio, utilizei o ChatGPT/Codex como ferramenta de apoio ao desenvolvimento de software.

A IA foi utilizada para analisar o escopo do PDF, apoiar a definicao da arquitetura, gerar trechos iniciais de codigo, revisar consistencia entre requisitos e implementacao, apoiar testes e melhorar a clareza da documentacao.

A ferramenta foi orientada com o PDF do desafio, decisoes tecnicas escolhidas para o projeto e instrucoes especificas sobre qualidade, rastreabilidade, documentacao passo a passo e aderencia aos requisitos obrigatorios.

As decisoes finais de escopo, arquitetura, tecnologias e aceitacao das funcionalidades devem ser revisadas pelo candidato antes da entrega.

O que funcionou bem:

- Organizacao do escopo em etapas.
- Estruturacao inicial do monorepo.
- Criacao de documentacao rastreavel aos requisitos.
- Apoio na definicao de testes e criterios de aceite.

O que precisou ser ajustado:

- A validacao de IA foi mantida mockada para evitar dependencia de credenciais externas.
- O banco foi definido como SQLite para facilitar reproducao local.
- A regra de especialista responsavel foi explicitada como "assumir caso", pois o PDF nao define o mecanismo.

O que foi descartado:

- Integracao real com servico externo de IA na primeira versao.
- Banco PostgreSQL obrigatorio com Docker, para reduzir atrito na avaliacao.

## Limitacoes conhecidas

- SQLite foi escolhido pela simplicidade de execucao local; em producao, PostgreSQL seria recomendado.
- O provider de IA e mockado; em producao, ele seria substituido por um servico real com auditoria, privacidade e politicas de tratamento de dados clinicos.
- A autenticacao usa JWT simples; em producao, cookies HttpOnly, refresh tokens e rotacao de segredo seriam recomendados.
