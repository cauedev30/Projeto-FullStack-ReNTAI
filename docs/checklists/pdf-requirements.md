# Checklist de Conformidade com o PDF

Fonte canonica: `C:\Users\CAUÊ\Desktop\Desafio_P01_Fullstack_ReNTAI.docx.pdf`

## Funcionalidades obrigatorias

- [ ] Cadastro com selecao de perfil: Solicitante ou Especialista.
- [ ] Autenticacao com sessao gerenciada por token.
- [ ] Controle de acesso por perfil nas rotas relevantes.
- [ ] Dashboard com ID, paciente, especialidade, data e status.
- [ ] Busca por especialidade ou nome do paciente.
- [ ] Filtros por status e intervalo de datas.
- [ ] Botao Nova Teleconsultoria apenas para Solicitante.
- [ ] Botao Ver detalhes em cada registro.
- [ ] Formulario com paciente, data de nascimento, especialidade, hipotese diagnostica e historia clinica.
- [ ] Upload de PDF ou imagem.
- [ ] Validacao inteligente no momento do upload.
- [ ] Provider de IA real/mockado com interface documentada e substituivel.
- [ ] Limiar configuravel por variavel de ambiente.
- [ ] Rejeicao do upload com mensagem clara e score quando abaixo do limiar.
- [ ] Persistencia de score, provedor, limiar e timestamp.
- [ ] Tela de detalhes com dados clinicos resumidos.
- [ ] Linha do tempo de status.
- [ ] Pareceres registrados pelo especialista.
- [ ] Botao Registrar Parecer apenas para especialista responsavel.
- [ ] Exportacao do resumo em PDF.
- [ ] Notificacao em tempo real ao solicitante quando parecer for registrado.
- [ ] Atualizacao automatica do status para Concluida ao registrar parecer.

## README

- [ ] Arquitetura da solucao.
- [ ] Instrucoes para subir do zero.
- [ ] Como configurar/substituir validacao de IA.
- [ ] Como testar fluxo completo.
- [ ] Limitacoes conhecidas e producao.
- [ ] Ferramentas de IA utilizadas.

## Bonus

- [ ] Swagger/OpenAPI.
- [ ] ADRs.
- [ ] Diagrama C4.
- [ ] Documentacao explicita de trade-offs.
- [ ] Testes dos fluxos criticos.
