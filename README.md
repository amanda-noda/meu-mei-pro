# Meu MEI Pro

Plataforma para Microempreendedores Individuais (MEI) totalmente digital. Centralize boletos, impostos, notas fiscais e relatórios em um painel elegante e fluido, pensado para o dia a dia de quem empreende sozinho.

## Sobre o Projeto

O **Meu MEI Pro** é uma aplicação web que ajuda MEIs a:

- **Organizar finanças**: controle de receitas, despesas e lançamentos financeiros
- **Precificar produtos e serviços**: calculadoras interativas para definir preços com margem e custos
- **Acompanhar DAS**: informações sobre vencimento e obrigações do MEI
- **Gerenciar notas fiscais**: registro de notas emitidas
- **Visualizar painel financeiro**: visão mensal e anual de receitas e despesas

### Tecnologias

- **React 19** + **TypeScript**
- **Vite 7** (build e dev server)
- **Supabase** (autenticação, banco de dados PostgreSQL)

## Estrutura do Projeto

```
meu-mei-pro/
├── public/                 # Assets estáticos
│   └── logo-meu-mei-pro.png
├── src/
│   ├── api/                # Chamadas à API e Supabase
│   │   ├── dashboard.ts    # Dados do dashboard (faturamento, DAS, notas)
│   │   ├── signup.ts
│   │   └── signupSupabase.ts
│   ├── components/         # Componentes React
│   │   ├── Dashboard.tsx           # Painel principal (resumo)
│   │   ├── DashboardConfiguracoes.tsx
│   │   ├── DashboardFinanceiro.tsx
│   │   └── DashboardPrecificacao.tsx
│   ├── lib/
│   │   └── supabase.ts     # Cliente Supabase
│   ├── App.tsx             # App principal (landing + auth)
│   ├── main.tsx            # Entry point
│   └── style.css           # Estilos globais
├── supabase/
│   ├── migrations/        # Migrações SQL
│   │   └── 001_dashboard_tables.sql
│   └── README.md
├── .env.example            # Exemplo de variáveis de ambiente
├── index.html
├── package.json
└── tsconfig.json
```

## Pré-requisitos

- **Node.js** 18+ (recomendado: LTS)
- **npm** ou **yarn**
- Conta no [Supabase](https://supabase.com) (para autenticação e banco)

## Como Rodar

### 1. Clonar e instalar dependências

```bash
# Entre na pasta do projeto
cd meu-mei-pro

# Instale as dependências
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (copie do `.env.example`):

```bash
cp .env.example .env
```

Edite o `.env` e preencha com suas credenciais do Supabase:

```env
# Supabase (cadastro e autenticação)
# Crie um projeto em https://supabase.com e pegue em: Project Settings > API
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_publica
```

> **Importante:** O arquivo `.env` não é versionado (está no `.gitignore`). Nunca commite suas chaves.

### 3. Configurar o banco de dados (Supabase)

Execute a migração SQL no seu projeto Supabase para criar as tabelas:

- Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
- Abra seu projeto → **SQL Editor**
- Execute o conteúdo de `supabase/migrations/001_dashboard_tables.sql`

Isso cria as tabelas: `lancamentos`, `mei_profile`, `notas_fiscais` com RLS (Row Level Security).

### 4. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O Vite inicia em **http://localhost:5173** (ou outra porta se 5173 estiver em uso).

### 5. Build para produção

```bash
npm run build
```

A saída fica em `dist/`. Para visualizar o build:

```bash
npm run preview
```

## Scripts Disponíveis

| Comando       | Descrição                          |
|---------------|------------------------------------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Compila o projeto para produção   |
| `npm run preview` | Preview do build de produção    |

## Funcionalidades Principais

### Landing Page (não logado)

- Hero com proposta de valor
- Seções: Sobre, Recursos, Precificação, Planos, FAQ
- Modais de **Criar conta** e **Entrar**
- Calculadoras de precificação (produtos e serviços) na página pública (com limite de usos sem assinatura)

### Dashboard (logado)

- **Resumo**: faturamento do mês, DAS, notas fiscais, alertas
- **Financeiro**: lançamentos, painel por mês, cadastro de receitas/despesas
- **Precificação**: calculadoras de produtos e serviços
- **Configurações**: perfil MEI (atividade, CNPJ, razão social)

### Autenticação

- Cadastro e login via **Supabase Auth**
- Sessão persistida no navegador

## Variáveis de Ambiente

| Variável               | Obrigatória | Descrição                    |
|------------------------|-------------|------------------------------|
| `VITE_SUPABASE_URL`    | Sim         | URL do projeto Supabase      |
| `VITE_SUPABASE_ANON_KEY` | Sim       | Chave anônima (pública)      |

## Licença

Projeto privado. Todos os direitos reservados.
