# 📋 Changelog — FinanSense 2.0

Todas as alterações notáveis, decisões de engenharia de software e revisões críticas humanas das propostas do agente de inteligência artificial (Google Antigravity) neste projeto estão documentadas neste arquivo.

O formato é baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/), e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [2.0.0] — Entrega Final da Disciplina (Versionamento, Deploy e Persistência Relacional) — 2026-10-27

### 🚀 Adicionado
- **Persistência Relacional MySQL 8.0+:**
  - Criação do script DDL/DML `database/schema.sql` contendo a modelagem das 5 tabelas relacionais (`usuarios`, `categorias`, `receitas`, `despesas`, `parcelamentos`).
  - Chaves estrangeiras com regras de integridade referencial (`ON DELETE CASCADE` para usuários e parcelas, `ON DELETE RESTRICT` para categorias nativas).
  - Sementes (*seeds*) automáticas com dados fictícios de teste, categorias padrão e transações que alimentam os cenários dos Critérios de Aceite (CA01 a CA06).
- **Servidor Backend RESTful em Node.js (Express):**
  - Implementação da API REST na pasta `server/` com rotas para `/api/auth`, `/api/categorias`, `/api/receitas`, `/api/despesas` e `/api/dashboard`.
  - Conexão assíncrona ao MySQL via `mysql2/promise` com pool de conexões gerenciado.
  - Endpoint de verificação de integridade (`GET /api/health`).
- **Segurança Reforçada (Checklist Anexo B da Apostila):**
  - Criptografia irreversível de senhas com `bcryptjs` utilizando *salt rounds 10* (RNF01).
  - Proteção estrita contra *SQL Injection* (RNF06) através do uso exclusivo de *Prepared Statements* parametrizados (`?`) em 100% das operações SQL.
  - Autenticação e isolamento *multi-tenant* (RNF03, RF04) com tokens JWT assinados.
  - Isolamento de segredos: criação do `.env.example` e inclusão do `.env` no `.gitignore`.
- **Arquitetura Resiliente de Alta Disponibilidade (Modo Híbrido):**
  - Integração do frontend React ao backend com detecção automática do status do banco.
  - Se o professor rodar localmente com o MySQL configurado, o sistema executa todas as operações diretamente no banco de dados relacional.
  - Se qualquer avaliador abrir o link publicado na Vercel (onde pode não haver um cluster MySQL dedicado ativo), o sistema ativa um *fallback* transparente com LocalStorage, permitindo navegar, criar despesas, testar filtros e ver os gráficos sem nenhum erro 500 ou tela em branco.
- **Documentação de Instalação e Execução na Spec:**
  - Criação do arquivo `spec.md` na raiz do repositório, contendo a especificação de engenharia e o guia passo a passo numerado de instalação para o professor.
- **Scripts de Execução Unificados no `package.json`:**
  - Adicionado comando `npm run dev:all` com `concurrently` para subir simultaneamente o servidor backend Express (porta 3001) e o frontend Vite (porta 3000).

---

## 🧠 Registro de Decisões e Revisão Crítica do Agente de IA

Nesta etapa, o desenvolvimento foi realizado em colaboração entre a aluna (**Raiany**) e o agente de IA (**Google Antigravity**). Conforme preconizado na apostila *"Programar com IA de forma responsável"*, **nenhuma sugestão da IA foi aceita de forma automática**. Todas as propostas passaram por revisão técnica e alinhamento aos critérios da atividade:

| # | Ponto Decisório | O que o Agente de IA Propôs Inicialmente | Revisão e Decisão Humana Realizada | Justificativa Técnica |
| :-: | :--- | :--- | :--- | :--- |
| **01** | **Persistência de Dados** | Manter o sistema funcionando apenas com `localStorage` no navegador, alegando que o deploy na Vercel seria mais simples. | **Rejeitado.** Exigida a criação do script SQL (`database/schema.sql`), da API Express e das tabelas relacionais com chaves estrangeiras. | O item 4 dos requisitos mínimos exige expressamente *"pelo menos um fluxo completo de cadastro e consulta de dados em um banco de dados"*. Para não perder a facilidade da Vercel, foi adotada a arquitetura híbrida com fallback. |
| **02** | **Segurança e Criptografia de Senhas** | Simular a validação de senhas com comparação direta de texto ou hash MD5 simples no cliente. | **Rejeitado e Corrigido.** Implementado hash bcrypt com salt de 10 rounds diretamente no backend e tokens JWT com expiração. | Atendimento obrigatório ao RNF01 e ao Checklist de Segurança (Anexo B), que veda senhas em texto puro e exige validação no servidor (RNF05). |
| **03** | **Consultas ao Banco de Dados** | Escrever queries SQL concatenando strings (ex.: `SELECT * FROM usuarios WHERE email = '` + email + `'`). | **Rejeitado com Correção Imediata.** O agente foi instruído a refatorar 100% das rotas para usar exclusivamente *Prepared Statements* com marcadores (`?`). | Prevenção contra vulnerabilidades críticas de SQL Injection (RNF06 e Anexo B da apostila). |
| **04** | **Gerenciamento de Segredos e `.env`** | Deixar credenciais padrão de banco de dados diretamente no código do servidor (`server/db.js`). | **Corrigido.** As credenciais foram extraídas para variáveis de ambiente via `dotenv`, criado o arquivo `.env.example` e atualizado o `.gitignore`. | O item 4 veda terminantemente qualquer credencial exposta no código-fonte no repositório do GitHub. |
| **05** | **Geração de Datas no Script de Teste** | Gerar datas estáticas fixas no script SQL para o ano de 2026. | **Revisado e Aprimorado.** As datas foram substituídas por cálculos dinâmicos baseados na data atual do sistema (`CURRENT_DATE()`, `DATE_SUB(...)` e `DATE_ADD(...)`). | Garante que, independentemente do dia em que o professor avaliar o sistema, as contas vencidas (CA03) e a janela dos próximos 15 dias (RF12) permaneçam sempre válidas. |
| **06** | **Experiência do Usuário na Avaliação** | Uma tela de login tradicional que obrigaria o professor a digitar credenciais decoradas da spec. | **Aprimorado pela aluna.** Adição de botões rápidos de preenchimento ("Raiany - Estudante" e "Docente Avaliador") e badge visual de status de conexão no cabeçalho. | Reduz o atrito de avaliação, permitindo ao professor alternar perfis e validar os dados com 1 clique. |

---

## [1.0.0] — Implementação do Frontend e Motor Preditivo — 2026-10-26

### 🚀 Adicionado
- Interface reativa construída com React 18, Vite e Tailwind CSS.
- Módulo de Autenticação com telas de Login, Autocadastro e Recuperação de Senha por token temporário.
- Dashboard financeiro com cálculo de Saldo Disponível em tempo real.
- Detecção e destaque visual de Contas Vencidas em vermelho (CA03).
- Agenda dos Próximos 15 Dias (RF12).
- Gráficos de distribuição percentual de despesas por categoria via Chart.js (RF13).
- Motor Preditivo de Gastos: cálculo da média histórica dos últimos 3 meses por categoria e alertas automáticos em linguagem natural para desvios $\ge 25\%$ (CA04).
- Alerta preventivo contra risco de déficit orçamentário no final do mês (CA05).
- Módulo de Lançamentos com suporte a receitas e compras parceladas em $N$ vezes (CA02).
- Gestão de Categorias personalizadas (CA06).
- Central Centelha 3 com apresentação acadêmica da proposta e incorporação do vídeo pitch do YouTube.

---

## [0.2.0] — Especificação Formal de Engenharia (SPEC) — 2026-09-22

### 🚀 Adicionado
- Elaboração do documento `SPEC.pdf` contendo:
  - Estudo de público-alvo baseado em pesquisas de mercado (CNDL, SPC Brasil e Sebrae).
  - Mapeamento de 4 subgrupos de usuários (Estudante, CLT, Freelancer e Arrimo).
  - Diagramas de Casos de Uso (UML).
  - 18 Requisitos Funcionais (RF01 a RF18) e 10 Requisitos Não Funcionais (RNF01 a RNF10).
  - Modelo Entidade-Relacionamento (DER) relacional completo.
  - 6 Critérios de Aceite detalhados (CA01 a CA06).
  - Decisão fundamentada de stack tecnológica e estratégia de deploy.

---

## [0.1.0] — Concepção da Ideia e Simulado Centelha 3 — 2026-08-15

### 🚀 Adicionado
- Definição do problema central: 47% dos jovens de 18 a 24 anos não realizam controle financeiro ou dependem de anotações em papel.
- Proposta de valor inovadora: transformar registros passivos em acompanhamento proativo e diagnósticos preditivos em linguagem natural.
- Gravação e publicação do vídeo pitch acadêmico: [https://youtu.be/iiRMwRVgXCI](https://youtu.be/iiRMwRVgXCI).
