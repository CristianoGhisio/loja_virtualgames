# 🎮 Virtual Games — Sistema de Gestão

Sistema fullstack para gestão de loja de games, assistência técnica e serviços. Construído com Next.js, PostgreSQL e Prisma ORM.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| **Backend** | Next.js API Routes (Turbopack) |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | NextAuth.js v5 (Auth.js) |
| **Infra** | Docker Compose (dev), Vercel (deploy) |

## Funcionalidades

- **Dashboard** — Visão geral com métricas em tempo real
- **Ordens de Serviço** — Fluxo completo: entrada, diagnóstico, orçamento, aprovação, reparo, entrega
- **Vendas (PDV)** — Balcão, garantias, trocas, histórico, recebíveis
- **Financeiro** — Contas a pagar/receber, fluxo de caixa, DRE, conciliação
- **Estoque** — Controle de entrada/saída, inventário, movimentações
- **Cadastros** — Produtos, categorias, fabricantes, atributos, fornecedores, marketplaces
- **Administrativo** — Usuários, perfis, permissões, auditoria
- **Relatórios** — Vendas, OS, gerencial, satisfação, financeiro
- **WhatsApp** — Bot integrado para notificações e lead capture
- **Backup** — Agendamento e exportação de dados

## Requisitos

- Node.js >= 20
- Docker Desktop
- PostgreSQL (via Docker ou local)

## Setup

```bash
# 1. Subir banco de dados
docker compose up -d

# 2. Instalar dependências
npm install

# 3. Copiar variáveis de ambiente
cp .env.example .env.local

# 4. Rodar migrações
npx prisma migrate dev

# 5. Popular banco (opcional)
npx prisma db seed

# 6. Iniciar servidor de desenvolvimento
npm run dev
```

## Ambiente

```bash
npm run dev      # Desenvolvimento (http://localhost:3000)
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Verificação de código
```

## Banco de Dados

```bash
docker compose up -d db    # Iniciar PostgreSQL
docker compose down        # Parar tudo
npx prisma studio          # Interface gráfica do banco
npx prisma migrate dev     # Nova migração
npx prisma db push         # Sincronizar schema
```

## Estrutura

```
src/
├── app/           # Rotas e páginas (App Router)
├── components/    # Componentes React
├── lib/           # Utilitários, serviços, auth
├── prisma/        # Schema, migrations, seeds
├── public/        # Assets estáticos
├── automation/    # Bot WhatsApp
├── types/         # Tipos TypeScript
└── scripts/       # Utilitários
```

## Licença

Proprietário — Virtual Games
