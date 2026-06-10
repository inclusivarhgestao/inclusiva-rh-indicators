# Inclusiva RH - Gestão de Indicadores - TODO

## Banco de Dados
- [x] Criar schema com tabelas: lojas, vagas, candidatos, etapas_seletivas, indicadores_mensais
- [x] Executar migrações SQL no banco de dados

## Backend (tRPC Procedures)
- [x] Implementar procedures para CRUD de lojas
- [x] Implementar procedures para CRUD de vagas
- [x] Implementar procedures para CRUD de candidatos
- [x] Implementar procedures para gerenciar etapas do processo seletivo
- [x] Implementar procedures para obter métricas do dashboard
- [x] Implementar procedures para obter dados de indicadores (funil, vagas por status)
- [x] Implementar procedures para obter/atualizar relatório mensal
- [x] Implementar filtro de período (mês/ano) em todas as queries

## Frontend - Layout e Navegação
- [x] Configurar identidade visual com cores #1565C0 (azul) e #F9A825 (amarelo)
- [x] Criar DashboardLayout customizado com sidebar e topbar
- [x] Implementar navegação entre páginas (Dashboard, Vagas, Candidatos, Indicadores, Relatório, Lojas)
- [x] Criar componente de seleção de período (mês/ano) no topbar

## Frontend - Páginas
- [x] Página Dashboard com métricas principais (vagas abertas, candidatos, contratações, tempo médio)
- [x] Página Controle de Vagas com listagem, cadastro, edição e exclusão
- [x] Página Candidatos com listagem, cadastro e acompanhamento de etapas
- [x] Página Indicadores com gráficos coloridos (funil, status, contratações, taxa de aproveitamento)
- [x] Página Relatório Mensal editável com resumo dos indicadores
- [x] Página Cadastro de Lojas com CRUD

## Frontend - Gráficos e Visualizações
- [x] Implementar gráfico de funil de seleção (Recharts)
- [x] Implementar gráfico de vagas por status (Recharts)
- [x] Implementar estatísticas adicionais com dados reais do funil
- [x] Aplicar cores da marca nos gráficos

## Frontend - Exportação e Relatórios
- [x] Implementar exportação de PDF do relatório mensal
- [x] Implementar formatação visual dos PDFs
- [x] Integrar função de exportação na página Relatório

## Testes e Validação
- [x] Escrever testes vitest para procedures críticas
- [x] Validar filtro de período em todas as páginas
- [x] Testar fluxos de CRUD (vagas, candidatos, lojas)
- [x] Executar suite de testes com sucesso (12 testes passando)
- [x] Testar responsividade do layout

## Checkpoint e Publicação
- [x] Criar checkpoint final do projeto
- [x] Preparar para publicação

## Funcionalidades Implementadas

### Sistema Completo de Gestão de Recrutamento e Seleção
O aplicativo oferece um painel centralizado para gerenciar todo o processo de R&S com:

**Dashboard de Métricas:**
- Vagas abertas, fechadas e total de candidatos
- Contratações realizadas no período
- Tempo médio de fechamento de vagas
- Taxa de aproveitamento

**Gestão de Vagas:**
- Cadastro, edição e exclusão de vagas
- Vinculação a lojas/unidades
- Acompanhamento de status (aberta, em andamento, fechada, cancelada)
- Filtro por período

**Gestão de Candidatos:**
- Cadastro de candidatos vinculados às vagas
- Acompanhamento de etapas (triagem, entrevista, teste, oferta, contratado, rejeitado)
- Histórico de candidaturas
- Filtro por período

**Indicadores e Gráficos:**
- Funil de seleção com dados em tempo real
- Vagas por status (gráfico de pizza)
- Estatísticas adicionais (candidatos em triagem, entrevista, contratados)
- Cores da marca em todos os gráficos

**Relatório Mensal:**
- Resumo editável dos indicadores do período
- Exportação em PDF formatado
- Métricas de performance

**Gestão de Lojas:**
- Cadastro de unidades/filiais
- Vinculação com vagas
- CRUD completo

**Identidade Visual:**
- Cores oficiais: Azul #1565C0 e Amarelo #F9A825
- Layout moderno e profissional
- Sidebar com navegação intuitiva
- Topbar com seletor de período global

**Filtro de Período Global:**
- Seletor de mês/ano no topbar
- Afeta todos os dados exibidos no sistema
- Sincronizado entre todas as páginas
