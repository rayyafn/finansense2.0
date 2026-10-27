# 💰 FinanSense 2.0: Controle Financeiro Pessoal Inteligente

> **Projeto Desenvolvido por:** Raiany Alexandra Felix do Nascimento  
> **Curso / Turma:** 3º ano do Curso Técnico em Informática Integrado ao Ensino Médio (3º B)  
> **Docente Avaliador:** Prof. Rafael Pitwak  
> **Repositório GitHub:** [https://github.com/rayyafn/finansense2.0](https://github.com/rayyafn/finansense2.0)  
> **Sistema Publicado no Ar (Vercel):** [https://finansense2-0.vercel.app](https://finansense2-0.vercel.app) *(ou link da sua Vercel)*  
> 🎥 **Vídeo Pitch Acadêmico (YouTube):** [Assistir no YouTube](https://youtu.be/iiRMwRVgXCI)  

---

## 📌 Sobre o Projeto

O **FinanSense** é uma aplicação web completa de gestão e inteligência financeira pessoal desenvolvida especialmente para jovens de 18 a 24 anos (Geração Z). 

Diferente de sistemas convencionais de simples registro contábil (como Mobills e Organizze), o FinanSense atua como um **sistema de acompanhamento e orientação ativa**:
- Transforma registros contábeis em **diagnósticos em linguagem natural**.
- Compara seus gastos com a **sua própria evolução histórica dos últimos 3 meses**.
- **Projeta o saldo até o fim do mês** considerando compras parceladas e contas fixas agendadas, emitindo alertas preventivos de risco de déficit orçamentário.
- Persistência robusta com **banco de dados relacional MySQL 8.0+** e arquitetura híbrida de alta disponibilidade.

---

## 📁 Documentos Oficiais da Entrega

| Arquivo / Recurso | Descrição |
| :--- | :--- |
| **[`spec.md`](./spec.md)** | **Especificação Completa (Spec Final):** Casos de uso, requisitos funcionais e não funcionais, DER, critérios de aceite, variáveis de ambiente e **guia detalhado de instalação e execução para o professor**. |
| **[`database/schema.sql`](./database/schema.sql)** | **Script SQL do Banco de Dados:** Criação do banco `finansense_db`, das 5 tabelas relacionais com PKs, FKs (`ON DELETE CASCADE`) e inserção das sementes (*seeds*) iniciais. |
| **[`CHANGELOG.md`](./CHANGELOG.md)** | **Registro de Decisões e Revisão da IA:** Histórico de versões e descrição aprofundada de tudo que a aluna revisou e corrigiu do que o agente de IA propôs (rejeição de propostas inseguras, adoção de Prepared Statements, bcrypt e arquitetura híbrida). |
| **[`.env.example`](./.env.example)** | **Modelo de Variáveis de Ambiente:** Exemplo seguro com as variáveis necessárias para rodar o backend e o banco local sem expor credenciais reais. |

---

## 📊 Evidências de Mercado (Pesquisa CNDL / SPC Brasil / Sebrae)

- **47%** dos jovens de 18 a 24 anos não realizam nenhum controle financeiro (19% não sabem como fazer, 18% preguiça, 18% falta de disciplina).
- **26%** dos que controlam ainda utilizam papel ou bloquinhos de anotação.
- **78%** possuem renda própria e **65%** contribuem diretamente para o sustento do lar.
- **52%** possuem potencial de poupança, demonstrando a necessidade de ferramentas intuitivas.

---

## 🚀 Funcionalidades Principais

1. **Gestão de Acesso & Segurança (Multi-tenant)**:
   - Autocadastro de usuários, login seguro com criptografia de senha via hash **bcrypt** e sessão via **JWT** (RF01 a RF04 / RNF01).
   - Isolamento de dados: cada usuário acessa unicamente seus próprios registros.
2. **Dashboard Interativo & Indicadores**:
   - Saldo disponível em tempo real, projeção de saldo até o encerramento do mês, agenda para os próximos 15 dias e contas vencidas em destaque vermelho (RF07, RF11, RF12, RF17 / CA03).
   - Gráfico de distribuição percentual por categorias via Chart.js (RF13).
3. **Lançamentos & Parcelamentos Automáticos**:
   - Registro de receitas e despesas com recorrência mensal (RF05, RF06).
   - Divisão e cálculo automático de compras parceladas em $N$ vezes, gerando o cronograma futuro no banco (RF08 / CA02).
   - Edição e exclusão completa com filtros rápidos (RF09).
4. **Categorias Customizadas**:
   - Categorias padrão nativas + criação, edição e exclusão de categorias personalizadas vinculadas ao jovem (RF10 / CA06).
5. **Motor Preditivo & Inteligência Financeira**:
   - Análise dos últimos 3 meses por categoria com alertas automáticos para desvios $\ge 25\%$ (RF14 a RF16 / CA04).
   - Alerta preventivo contra endividamento e déficit orçamentário (RF18 / CA05).
6. **Central do Projeto Centelha 3**:
   - Apresentação acadêmica da proposta e player do vídeo pitch embutido diretamente na interface (`https://youtu.be/iiRMwRVgXCI`).

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React 18](https://react.dev/), [Vite](https://vite.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend / API**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [mysql2](https://github.com/sidorares/node-mysql2)
- **Segurança**: [bcryptjs](https://www.npmjs.com/package/bcryptjs) (salt rounds 10), [jsonwebtoken](https://jwt.io/), [dotenv](https://www.npmjs.com/package/dotenv), [cors](https://www.npmjs.com/package/cors)
- **Banco de Dados**: [MySQL 8.0+](https://www.mysql.com/) / [MariaDB](https://mariadb.org/)
- **Gráficos & Ícones**: [Chart.js](https://www.chartjs.org/) + [React-ChartJS-2](https://react-chartjs-2.js.org/), [Lucide React](https://lucide.dev/)

---

## 💻 Instalação e Execução Local

Consulte a seção 9 de [`spec.md`](./spec.md) para o guia completo. Em resumo:

```bash
# 1. Clonar o repositório
git clone https://github.com/rayyafn/finansense2.0.git

# 2. Entrar na pasta do projeto
cd finansense2.0

# 3. Instalar as dependências do projeto
npm install

# 4. Criar o banco e importar o script SQL
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS finansense_db;"
mysql -u root -p finansense_db < database/schema.sql

# 5. Criar o arquivo de variáveis de ambiente
cp .env.example .env

# 6. Iniciar a aplicação completa (Backend Express + Frontend Vite)
npm run dev:all
```

A aplicação estará disponível em `http://localhost:3000`.

### Contas de Teste Pré-configuradas:
- **Estudante:** `raiany@finansense.com` | Senha: `123456`
- **Docente Avaliador:** `professor@finansense.com` | Senha: `teste123`

---

## 📄 Licença e Contexto
Desenvolvido para fins educacionais e de avaliação acadêmica pelo **3º B do Técnico em Informática** e submissão ao **Programa Centelha 3 Rondônia**.
