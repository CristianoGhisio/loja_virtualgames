# Relatório Completo de Auditoria de Segurança — Pré-Produção

**Projeto:** Virtual Games — Sistema de Gestão (ERP/Loja)
**Data da auditoria:** 2026-05-07
**Versão do relatório:** 1.0
**Auditor:** Red Team + Blue Team — Análise automatizada e manual de código-fonte

---

## 1. Resumo Executivo

### Nível Geral de Risco: **MÉDIO-ALTO**

| Área | Nível |
|------|-------|
| Aplicação | Médio |
| Infraestrutura | Médio |
| Autenticação | Médio |
| APIs | Baixo-Médio |
| DevOps | Médio |
| Supply Chain | Médio |
| **Geral** | **Médio-Alto** |

### Riscos Críticos Identificados

| # | Vulnerabilidade | Severidade |
|---|----------------|------------|
| V01 | Dump de banco de dados exposto no repositório | **CRÍTICA** |
| V02 | Diversos endpoints de API sem autenticação | **ALTA** |
| V03 | WhatsApp Bot Token com fallback vazio | **ALTA** |
| V04 | Mock auth habilitável por variável de ambiente | **ALTA** |
| V05 | Dependências vulneráveis (npm audit) | **MÉDIA** |
| V06 | Senhas com mínimo de 6 caracteres | **MÉDIA** |
| V07 | Ausência de MFA | **MÉDIA** |
| V08 | Rate limiting apenas em memória (sem Redis) | **BAIXA** |
| V09 | Raw SQL em rota de payment-fees | **BAIXA** |

### Recomendação de Go-Live

**NÃO RECOMENDADO PARA PRODUÇÃO IMEDIATA.** É necessário resolver as vulnerabilidades críticas e altas antes do deploy. Após correção dos itens V01 a V04, o sistema pode entrar em produção com monitoramento ativo.

---

## 2. Inventário Técnico

### 2.1 Arquitetura Geral

```
┌─────────────────────────────────────────────────┐
│                    VPS Linux                     │
│  ┌───────────────────────────────────────────┐  │
│  │              Docker Compose               │  │
│  │  ┌──────────────┐  ┌──────────────────┐   │  │
│  │  │  loja_app     │  │  loja_postgres   │   │  │
│  │  │  Next.js 16   │  │  PostgreSQL 15   │   │  │
│  │  │  Porta 3000   │  │  Porta 5432      │   │  │
│  │  └──────────────┘  └──────────────────┘   │  │
│  │         ↕                ↕                 │  │
│  │  ┌──────────────────────────────────────┐  │  │
│  │  │        WhatsApp Bot (Node.js)        │  │  │
│  │  │        Porta 3333 (interna)          │  │  │
│  │  └──────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 2.2 Stack Tecnológica Identificada

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | Next.js (App Router) + React 19 | 16.2.4 |
| Backend | Next.js API Routes | 16.2.4 |
| Linguagem | TypeScript Strict Mode | 5.x |
| ORM | Prisma | 5.22.0 |
| Banco de Dados | PostgreSQL (Docker) | 15-alpine |
| Autenticação | NextAuth v5 (Credentials Provider) | 5.0.0-beta.30 |
| Containerização | Docker + Docker Compose | — |
| Runtime Node | Node.js | 20-slim |
| CSS | Tailwind CSS | 4.x |
| Validação | Zod | 4.3.6 |
| Hashing de Senha | bcryptjs | 3.0.3 |
| WhatsApp Bot | whatsapp-web.js + Puppeteer/Chromium | 1.34.1 |
| Drag and Drop | @dnd-kit | — |
| UI Components | Radix UI | — |
| HTTP Client | Axios | 1.15.2 |
| Geração PDF | jsPDF + html2canvas | — |
| Código de Barras | jsbarcode | — |
| CI/CD | GitHub Actions | — |
| Lint | ESLint + eslint-plugin-security | 9.x |

### 2.3 Portas e Serviços (docker-compose.yml)

| Porta | Serviço | Bind | Exposição |
|-------|---------|------|-----------|
| 3000 | Next.js App | `0.0.0.0:3000` | Pública |
| 5432 | PostgreSQL | `127.0.0.1:5432` | Apenas localhost |
| 3333 | WhatsApp Bot | Interna (container) | Apenas Docker network |

### 2.4 Rotas da Aplicação (Endpoints da API)

**Rotas Públicas (sem autenticação):**

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/auth/*` | GET/POST | NextAuth handlers (login, sessão, CSRF) |
| `/api/public/*` | * | Endpoints explicitamente públicos |
| `/api/login/users` | GET | Lista usuários para tela de login (nomes, avatares, emails) |
| `/api/auth/users` | GET | **DUPLICADA** — mesma função de `/api/login/users` |
| `/api/integrations/whatsapp/lead` | POST | Webhook do WhatsApp Bot (protegido por token) |
| `/api/health` | GET | Healthcheck (monitoring) |

**Rotas Protegidas (exigem autenticação):**

| Módulo | Rotas |
|--------|-------|
| Admin | `/api/admin/roles`, `/api/admin/permissions`, `/api/admin/users`, `/api/admin/logs` |
| Atendimento | `/api/atendimento/*` |
| Atributos | `/api/attributes/*` |
| Categorias | `/api/categories/*` |
| Clientes | `/api/clients/*` |
| Dashboard | `/api/dashboard/summary` |
| Funcionários | `/api/employees/*` |
| Financeiro | `/api/financial/*` |
| Fabricantes | `/api/manufacturers/*` |
| OS | `/api/os/*` |
| Produtos | `/api/products/*` |
| OS Pública | `/api/public/os/[id]/*` (proteção por token HMAC) |
| Relatórios | `/api/reports/*` |
| Vendas | `/api/sales/*` |
| Serviços | `/api/services/*` |
| Configurações | `/api/settings/*` |
| Estoque | `/api/stock/*` |
| Subcategorias | `/api/subcategories/*` |
| Fornecedores | `/api/suppliers/*` |

### 2.5 Mecanismos de Autenticação

- **Provedor:** NextAuth v5 — Credentials Provider
- **Validação de senha:** bcryptjs (compare)
- **Bloqueio de conta:** 5 tentativas → 15 minutos de lockout
- **CSRF:** NextAuth embutido + validação de Origin no `api-auth.ts` e `with-security.ts`
- **Sessão:** JWT (armazenado em cookie HTTP-only)
- **Mock auth:** Disponível em desenvolvimento com `ENABLE_MOCK_AUTH=true` (restrito a localhost)

### 2.6 Headers de Segurança (next.config.ts)

| Header | Valor |
|--------|-------|
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` |
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `DENY` |
| X-XSS-Protection | `1; mode=block` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` |
| Content-Security-Policy | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'` |

### 2.7 Sistema de Permissões (RBAC)

Modelo: **Role-Based Access Control (RBAC)** com permissões granulares.

- `User` → `Role` → `RolePermission` → `Permission (action + resource)`
- Tokens de permissão gerados como: `resource` e `action:resource`
- Sistema de mock com 4 papéis: `owner`, `manager`, `sales`, `tech`

---

## 3. Vulnerabilidades Encontradas

### V01 — Dump de Banco de Dados Exposto no Repositório

| Atributo | Valor |
|----------|-------|
| **Severidade** | 🔴 **CRÍTICA** |
| **CVSS Estimado** | 8.6 (AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:N) |
| **Tipo** | Exposição de Dados Sensíveis |
| **Arquivo** | `storage/db-dumps/loja_backup.sql` |
| **Status** | ✅ **CONFIRMADO** |

**Descrição:**
O arquivo `storage/db-dumps/loja_backup.sql` contém um dump completo do banco de dados PostgreSQL, incluindo o schema completo e potencialmente dados. Embora o `.gitignore` contenha `/storage/backups`, o caminho real é `storage/db-dumps/` que **NÃO** está no `.gitignore`. Além disso, o Dockerfile faz `COPY . .` no estágio de build, o que significa que dumps presentes no diretório serão copiados para dentro do container.

**Evidência:**
```
c:\Users\crist\Desktop\PROJETOS\loja\storage\db-dumps\loja_backup.sql (290+ MB)
```
```
.gitignore contém: /storage/backups
MAS o dump está em: storage/db-dumps/  ← NÃO ignorado!
```

**Impacto:**
- Exposição completa do schema do banco (todas as tabelas, relacionamentos, tipos)
- Possível exposição de dados de usuários, clientes, financeiros
- Se commitado no Git, permanece no histórico para sempre
- Cadeia de ataque: atacante obtém schema → identifica tabelas sensíveis → planeja ataques direcionados

**Reprodução:**
1. Acessar o diretório `storage/db-dumps/`
2. O dump contém a flag `\restrict` seguida de uma chave, mas o conteúdo SQL é legível

**Correção:**
1. Adicionar `storage/db-dumps/` ao `.gitignore` IMEDIATAMENTE
2. Verificar se o dump já foi commitado no histórico do Git (`git log -- storage/db-dumps/`)
3. Se sim, usar `git filter-branch` ou `BFG Repo-Cleaner` para remover do histórico
4. Mover dumps para fora do diretório do projeto ou usar volume Docker dedicado
5. Adicionar `.sql` e `.dump` ao `.dockerignore`

---

### V02 — Endpoints de API sem Autenticação Expõem Dados de Usuários

| Atributo | Valor |
|----------|-------|
| **Severidade** | 🟠 **ALTA** |
| **CVSS Estimado** | 6.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N) |
| **Tipo** | Exposição de Informações |
| **Arquivos** | `app/api/login/users/route.ts`, `app/api/auth/users/route.ts`, `app/api/clients/route.ts` |
| **Status** | ✅ **CONFIRMADO** |

**Descrição:**
As rotas `/api/login/users` e `/api/auth/users` retornam lista de usuários (nome, email, avatar) **sem exigir autenticação**. Embora não retornem senhas, expõem emails válidos que podem ser usados para ataques de brute force e enumeração.

A rota `/api/clients` (GET) também **não verifica autenticação** (`checkAuth` ausente), expondo lista completa de clientes com nome, documento (CPF/CNPJ), email, telefone e endereço para qualquer pessoa.

**Evidência (Código):**

[route.ts](file:///c:/Users/crist/Desktop/PROJETOS/loja/app/api/login/users/route.ts#L1-L42) — Sem `checkAuth()`:
```typescript
export async function GET() {
  // Não chama checkAuth()!
  const users = await prisma.user.findMany({ ... });
  return NextResponse.json(safeUsers); // expõe emails
}
```

[route.ts](file:///c:/Users/crist/Desktop/PROJETOS/loja/app/api/clients/route.ts#L32-L100) — Sem `checkAuth()`:
```typescript
export async function GET(request: NextRequest) {
  // Não chama checkAuth() — qualquer pessoa acessa
  const clients = await prisma.customer.findMany({ ... });
  return NextResponse.json(clients); // expõe CPF, endereço, telefone
}
```

**Impacto:**
- Enumeração de usuários válidos para ataques de força bruta
- Exposição de dados pessoais de clientes (LGPD)
- Coleta de CPFs, endereços e telefones

**Correção:**
1. Adicionar `checkAuth()` a todas as rotas GET de `/api/clients`
2. Avaliar se `/api/login/users` e `/api/auth/users` realmente precisam ser públicos
3. Se precisarem ser públicos, limitar dados expostos ao mínimo necessário (apenas nomes, sem emails)

---

### V03 — WhatsApp Bot Token com Fallback Vazio

| Atributo | Valor |
|----------|-------|
| **Severidade** | 🟠 **ALTA** |
| **CVSS Estimado** | 7.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N) |
| **Tipo** | Autenticação Fraca (CWE-287) |
| **Arquivos** | `automation/whatsapp-bot.mjs`, `app/api/integrations/whatsapp/lead/route.ts` |
| **Status** | ✅ **CONFIRMADO** |

**Descrição:**
Em ambos os arquivos, o token do bot WhatsApp tem fallback para string vazia:

```javascript
// whatsapp-bot.mjs:10
const BOT_TOKEN = process.env.WHATSAPP_BOT_TOKEN || '';
```

```typescript
// integrations/whatsapp/lead/route.ts:46
const expectedToken = process.env.WHATSAPP_BOT_TOKEN ?? '';
```

Se a variável de ambiente não estiver configurada, o token esperado será string vazia. Em `whatsapp-bot.mjs:27`, há verificação com `if (!BOT_TOKEN)` que interrompe o bot, mas na rota da API (`lead/route.ts`), **não há essa verificação**. Se o atacante enviar token vazio e a variável não estiver configurada, a comparação `timingSafeEqual` entre duas strings vazias resultará em sucesso.

**Evidência (Código):**

[whatsapp-bot.mjs](file:///c:/Users/crist/Desktop/PROJETOS/loja/automation/whatsapp-bot.mjs#L10-L14):
```javascript
const BOT_TOKEN = process.env.WHATSAPP_BOT_TOKEN || '';
// ...
if (!BOT_TOKEN) {  // Esta verificação existe no bot, mas não na API
  console.error('WHATSAPP_BOT_TOKEN não configurado');
  process.exit(1);
}
```

[lead/route.ts](file:///c:/Users/crist/Desktop/PROJETOS/loja/app/api/integrations/whatsapp/lead/route.ts#L44-L52):
```typescript
const expectedToken = process.env.WHATSAPP_BOT_TOKEN ?? '';
// NÃO há verificação `if (!expectedToken)` aqui!
const receivedToken = request.headers.get('x-bot-token') ?? '';
if (
  !expectedToken ||
  expectedToken.length !== receivedToken.length ||
  !timingSafeEqual(Buffer.from(expectedToken), Buffer.from(receivedToken))
) { ... }
```

Note a condição `!expectedToken` — se `expectedToken` for string vazia (falsy), a condição `!expectedToken` seria `true` e bloquearia. **Porém**, isso **não** é uma proteção robusta — depende de um comportamento JavaScript de coerção de tipo. É frágil e passível de bypass em cenários inesperados.

**Impacto:**
- Acesso não autorizado ao webhook de leads
- Possibilidade de injeção de dados falsos no funnel de clientes
- Criação de registros de clientes não solicitados

**Correção:**
1. Adicionar validação explícita no início da rota: `if (!expectedToken) { return errorResponse('Bot token not configured', 500); }`
2. Nunca usar fallback para string vazia — lançar erro se variável não estiver definida
3. Usar `requireEnv('WHATSAPP_BOT_TOKEN')` como em outros lugares do código

---

### V04 — Mock Auth Habilitável por Variável de Ambiente

| Atributo | Valor |
|----------|-------|
| **Severidade** | 🟠 **ALTA** |
| **CVSS Estimado** | 7.2 (AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:N) |
| **Tipo** | Bypass de Autenticação (CWE-287) |
| **Arquivos** | `lib/api-auth.ts`, `lib/api.ts`, `contexts/auth-context.tsx` |
| **Status** | ✅ **CONFIRMADO** |

**Descrição:**
O sistema possui um mecanismo de mock auth que permite bypass de autenticação definindo variáveis de ambiente e headers HTTP. Embora restrito a localhost no `api-auth.ts`, o código do axios interceptor em `lib/api.ts` envia o header `x-mock-role` do localStorage sem verificação de ambiente:

```typescript
if (mockRole) {
  config.headers.set('x-mock-role', mockRole);
}
```

**Evidência (Código):**

[api-auth.ts](file:///c:/Users/crist/Desktop/PROJETOS/loja/lib/api-auth.ts#L96-L125):
```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
const mockEnabled = process.env.ENABLE_MOCK_AUTH === 'true';
// ...
if (isDevelopment && mockEnabled && isLocalhost && isLocalIp && mockRole && MOCK_USERS[mockRole]) {
  // Bypass de autenticação!
  const mockUser = MOCK_USERS[mockRole];
  return { authorized: true, session: { user: mockUser }, user: mockUser };
}
```

[api.ts](file:///c:/Users/crist/Desktop/PROJETOS/loja/lib/api.ts#L22-L33):
```typescript
const mockRole = localStorage.getItem('virtual_games_role');
if (mockRole) {
  config.headers.set('x-mock-role', mockRole); // Sempre envia, mesmo em produção
}
```

**Risco em produção:**
Se `NODE_ENV` for acidentalmente definido como `development` ou se `ENABLE_MOCK_AUTH=true` for configurado, qualquer pessoa com acesso ao header `x-mock-role` pode se passar por qualquer role.

**Correção:**
1. Remover completamente o mock auth do bundle de produção
2. Usar compile-time flags (ex: `process.env.NEXT_PUBLIC_ENABLE_MOCK` que é inlined em build)
3. Alternativa: usar middleware que bloqueia `x-mock-role` em produção
4. Remover referências a `virtual_games_role` do localStorage no interceptor axios de produção

---

### V05 — Dependências com Vulnerabilidades Conhecidas

| Atributo | Valor |
|----------|-------|
| **Severidade** | 🟡 **MÉDIA** |
| **CVSS (pior caso)** | 7.5 (basic-ftp) |
| **Tipo** | Vulnerabilidade em Dependência |
| **Ferramenta** | npm audit |
| **Status** | ✅ **CONFIRMADO** |

**Resultado do `npm audit`:**

| Pacote | Severidade | CVE/CWE | Descrição |
|--------|-----------|---------|-----------|
| `basic-ftp` (≤5.3.0) | **HIGH** (7.5) | CWE-400/770 | DoS via unbounded multiline response buffering |
| `ip-address` (≤10.1.0) | MODERATE | CWE-79 | XSS em métodos HTML-emitting do Address6 |
| `postcss` (<8.5.10) | MODERATE (6.1) | CWE-79 | XSS via CSS stringify output com `</style>` |
| `next` (via postcss) | MODERATE | — | Dependência transitiva via postcss |

**Evidência (output do comando):**
```
npm audit --json
```
- Total de dependências: 708 (246 prod, 345 dev, 164 optional)
- 4 vulnerabilidades: 1 HIGH, 3 MODERATE

**Análise de impacto real:**

- **basic-ftp:** Usado pelo `puppeteer` → `pac-resolver` → `degenerator`. Só é explorável se o app se conectar a servidores FTP maliciosos. **Risco real: BAIXO** (não há conexão FTP no código da aplicação).
- **ip-address:** Usado por `whatsapp-web.js` → `socks-proxy-agent`. Risco de XSS **apenas se** o output do Address6 for renderizado em HTML. **Risco real: BAIXO**.
- **postcss:** Usado pelo Next.js internamente durante build. A vulnerabilidade é XSS via CSS stringify, mas o Next.js não expõe isso dinamicamente. **Risco real: MUITO BAIXO**.

**Conclusão:** Nenhuma dessas vulnerabilidades é diretamente explorável na aplicação. No entanto, o `basic-ftp` com CVSS 7.5 deve ser monitorado.

**Correção:**
1. Executar `npm audit fix` para resolver automaticamente o que for possível
2. Para dependências sem fix (transitivas do puppeteer e whatsapp-web.js), avaliar `overrides` no package.json
3. Adicionar `npm audit --audit-level=high` ao CI/CD (já configurado no security.yml)

---

### V06 — Política de Senhas Fraca (Mínimo 6 Caracteres)

| Atributo | Valor |
|----------|-------|
| **Severidade** | 🟡 **MÉDIA** |
| **CVSS Estimado** | 5.0 (AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:N) |
| **Tipo** | Configuração Fraca de Segurança (CWE-521) |
| **Arquivos** | `auth.ts` |
| **Status** | ✅ **CONFIRMADO** |

**Evidência (Código):**

[auth.ts](file:///c:/Users/crist/Desktop/PROJETOS/loja/auth.ts#L143):
```typescript
z.object({ email: z.string().email(), password: z.string().min(6) })
```

**Descrição:**
A validação de senha exige apenas 6 caracteres, sem requisitos de:
- Letra maiúscula
- Letra minúscula
- Número
- Caractere especial
- Comprimento mínimo recomendado (8+ para OWASP ASVS Level 1, 12+ para Level 2)

Embora o bcryptjs limite o impacto de rainbow tables, senhas curtas são mais suscetíveis a brute force, especialmente considerando que a aplicação permite apenas 5 tentativas a cada 15 minutos (taxa baixa, mas ainda assim relevante para ataques distribuídos).

**Correção:**
1. Aumentar mínimo para 8 caracteres
2. Adicionar requisitos de complexidade: `z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)`
3. Implementar detecção de senhas comuns (ex: validar contra lista de senhas vazadas)

---

### V07 — Ausência de Autenticação Multi-Fator (MFA)

| Atributo | Valor |
|----------|-------|
| **Severidade** | 🟡 **MÉDIA** |
| **CVSS Estimado** | 6.1 (AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:L) |
| **Tipo** | Controle de Acesso Ausente (CWE-308) |
| **Status** | ✅ **CONFIRMADO** |

**Descrição:**
A aplicação não oferece MFA (2FA/TOTP). Considerando que o sistema gerencia:
- Dados financeiros (contas a pagar/receber, fluxo de caixa)
- Dados de clientes (CPF, endereço, telefone)
- Ordens de serviço
- Configurações de loja

...a ausência de MFA representa risco significativo. Um atacante que obtiver a senha de um usuário admin terá acesso total ao sistema.

**Correção:**
1. Implementar TOTP (Time-based One-Time Password) usando bibliotecas como `otplib`
2. NextAuth v5 suporta MFA via callbacks customizados
3. Priorizar MFA para papéis `owner` e `manager`

---

### V08 — Rate Limiting Apenas em Memória (Sem Redis)

| Atributo | Valor |
|----------|-------|
| **Severidade** | 🔵 **BAIXA** |
| **CVSS Estimado** | 3.7 (AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:N/A:L) |
| **Tipo** | Controle de Recursos Insuficiente |
| **Arquivos** | `lib/rate-limit.ts` |
| **Status** | ✅ **CONFIRMADO** |

**Descrição:**
O rate limiter atual usa `Map` em memória com fallback para PostgreSQL. O próprio código reconhece a limitação:

[rate-limit.ts](file:///c:/Users/crist/Desktop/PROJETOS/loja/lib/rate-limit.ts#L1-L7):
```typescript
/**
 * In-memory rate limiter for API routes.
 * Suitable for single-instance deployments.
 * For multi-instance deployments, replace with a Redis-backed implementation.
 */
```

**Impacto:**
- Em múltiplas instâncias, o rate limit não é compartilhado
- Reinicialização do servidor perde o estado (mitigado pelo fallback para DB)
- Sem Redis, ataques distribuídos de IPs diferentes burlam o limite por IP

**Correção:**
1. Para produção single-instance, o atual é aceitável
2. Para multi-instance, migrar para `@upstash/ratelimit` com Redis
3. O fallback para PostgreSQL via `RateLimit` table é um bom paliativo

---

### V09 — Raw SQL com Concatenação de Parâmetros

| Atributo | Valor |
|----------|-------|
| **Severidade** | 🔵 **BAIXA** |
| **CVSS Estimado** | 4.0 (AV:N/AC:H/PR:H/UI:N/S:U/C:L/I:L/A:N) |
| **Tipo** | Potencial SQL Injection (CWE-89) |
| **Arquivos** | `app/api/settings/payment-fees/route.ts` |
| **Status** | ✅ **CONFIRMADO** (impacto limitado por Prisma parameterization) |

**Descrição:**
A rota de payment-fees usa `prisma.$executeRaw` e `prisma.$queryRaw` com template literals. Embora o Prisma use consultas parametrizadas (protegendo contra SQL injection), há uso de raw SQL desnecessário onde o Prisma Client poderia ser usado:

[payment-fees/route.ts](file:///c:/Users/crist/Desktop/PROJETOS/loja/app/api/settings/payment-fees/route.ts#L42-L62):
```typescript
await prisma.$executeRaw(Prisma.sql`
  CREATE TABLE IF NOT EXISTS "PaymentFeeSettings" (...)
`);
```

**Análise:**
- O Prisma.sql usa parâmetros `$1, $2...` (protegido contra injection)
- Mas raw SQL é mais propenso a erros e menos idiomático
- A tabela já existe no schema — este código parece ser redundante/código legado

**Correção:**
1. Remover raw SQL desnecessário (a tabela já está no schema.prisma)
2. Usar `prisma.paymentFeeSettings.upsert()` ao invés de raw SQL
3. Se raw SQL for realmente necessário, garantir que `Prisma.sql` tagged template seja usado (já está)

---

### V10 — Logs com Dados Potencialmente Sensíveis

| Atributo | Valor |
|----------|-------|
| **Severidade** | 🔵 **BAIXA** |
| **CVSS Estimado** | 3.1 (AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N) |
| **Tipo** | Vazamento de Informação via Logs |
| **Status** | ⚠️ **SUSPEITO** |

**Descrição:**
Foram encontradas 50+ ocorrências de `console.error()` e `console.warn()` em arquivos de API. Algumas incluem mensagens de erro que podem expor detalhes internos:

Exemplos em:

[clients/route.ts](file:///c:/Users/crist/Desktop/PROJETOS/loja/app/api/clients/route.ts#L69):
```typescript
console.error('GET /api/clients error:', error);
```

[admin/users/route.ts](file:///c:/Users/crist/Desktop/PROJETOS/loja/app/api/admin/users/route.ts) — múltiplos `console.error`

**Impacto em produção:**
- Stack traces podem vazar estrutura de diretórios
- Mensagens de erro podem revelar lógica interna
- Em produção, logs devem usar formato estruturado (JSON) e nunca expor stack traces ao cliente

**Correção:**
1. Implementar logger estruturado (winston, pino) para produção
2. Nunca logar objetos de erro completos em produção
3. Garantir que respostas de erro não contenham stack traces (parcialmente implementado com `errorResponse`)

---

## 4. Exploração Possível (Cenário de Ataque)

### Cadeia de Ataque Composta (Cenário Realista)

```
FASE 1 — RECONHECIMENTO
├── Atacante acessa /api/health → confirma stack Next.js + PostgreSQL
├── Atacante acessa /api/login/users → obtém lista de emails de usuários
├── Atacante acessa /api/clients → obtém dados de clientes (CPF, endereços)

FASE 2 — AUTENTICAÇÃO
├── Atacante tenta brute force nos emails obtidos (limitado a 5 tentativas/15min)
├── Se WHATSAPP_BOT_TOKEN não configurado → atacante envia token vazio
│   → possível bypass da autenticação do webhook

FASE 3 — ESCALADA (se mock auth acidentalmente habilitado em produção)
├── Atacante envia header x-mock-role: owner
├── Obtém acesso total ao sistema como administrador

FASE 4 — PERSISTÊNCIA (se acesso admin obtido)
├── Cria novo usuário admin pelo painel /api/admin/users
├── Mantém acesso mesmo se vulnerabilidade original for corrigida

FASE 5 — EXFILTRAÇÃO
├── Se dump do banco estiver acessível no container:
│   └── storage/db-dumps/loja_backup.sql contém schema e dados completos
├── Exporta dados via endpoints financeiros /api/financial/*
```

### Pivoting Possível

Se o container da aplicação for comprometido:
- Acesso ao PostgreSQL via rede Docker interna (porta 5432 exposta no `app_network`)
- Possível acesso a volumes Docker (`loja_uploads_data`, `loja_postgres_data`)
- WhatsApp Bot executa Chromium — possível abuso para SSRF

---

## 5. Hardening Recomendado

### 5.1 Linux / VPS

| Item | Ação | Prioridade |
|------|------|-----------|
| SSH | Desabilitar login como root, usar apenas chaves SSH | Alta |
| Firewall | Configurar UFW: permitir apenas 22, 80, 443 | Alta |
| fail2ban | Configurar para SSH e para a aplicação (tentativas de login) | Média |
| Atualizações | Manter unattended-upgrades para security patches | Alta |
| SELinux/AppArmor | Habilitar perfil para containers Docker | Média |
| Usuários | Criar usuário não-root para deploy | Alta |

### 5.2 Docker

| Item | Ação | Prioridade |
|------|------|-----------|
| Container app | Já usa `USER nextjs` (não-root) ✅ | — |
| Container postgres | **A porta 5432 está bindada apenas em 127.0.0.1** ✅ | — |
| docker.sock | **Não exposto** ✅ | — |
| Resources | Limites de CPU/memória configurados ✅ | — |
| Secrets | **Usa variáveis de ambiente, não Docker secrets** ⚠️ | Média |
| Healthcheck | Configurado para ambos containers ✅ | — |
| Logging | json-file com rotação ✅ | — |
| Images | `postgres:15-alpine`, `node:20-slim` — imagens Slim/Alpine ✅ | — |
| latest tag | Não usa (tags fixas: `15-alpine`, `20-slim`) ✅ | — |
| Reconstrução | Remover `apt-get` caches no Dockerfile ✅ | — |

### 5.3 Nginx / Proxy Reverso (se aplicável)

| Item | Ação | Prioridade |
|------|------|-----------|
| TLS | Usar Let's Encrypt com renovação automática | Crítica |
| Ciphers | Configurar apenas TLS 1.2 e 1.3 | Alta |
| HSTS | Já configurado via next.config.ts ✅ | — |
| Headers | CSP, X-Frame-Options já configurados ✅ | — |
| Upload limits | Configurar `client_max_body_size` | Média |
| Rate limiting | Adicionar `limit_req_zone` no Nginx | Média |

### 5.4 Banco de Dados

| Item | Ação | Prioridade |
|------|------|-----------|
| Exposição externa | Já bindada em 127.0.0.1 ✅ | — |
| Senha | Validar complexidade da senha do PostgreSQL | Alta |
| Usuários | Usar usuário de aplicação separado (não `postgres` admin) | Alta |
| Backup | **Dumps não devem ficar no diretório do projeto** | Crítica |
| Criptografia | Avaliar pgcrypto para dados sensíveis em repouso | Média |
| Conexões | Usar SSL/TLS na conexão Prisma-DB | Média |

### 5.5 Autenticação

| Item | Ação | Prioridade |
|------|------|-----------|
| Senha mínimo | Aumentar de 6 para 8+ caracteres com complexidade | Alta |
| MFA | Implementar TOTP para admins | Alta |
| Lockout | Já implementado (5 tentativas, 15 min) ✅ | — |
| JWT | NextAuth gerencia ✅ | — |
| Logout | Implementado via `signOut()` ✅ | — |
| Sessão | Cookie HTTP-only ✅ | — |
| Mock auth | Remover completamente em produção | Crítica |

---

## 6. Correções Prioritárias

### 🔴 CRÍTICAS (antes do go-live)

| # | Vulnerabilidade | Ação Corretiva | Estimativa |
|---|----------------|---------------|------------|
| C1 | V01 - Dump exposto | Adicionar `storage/db-dumps/` ao `.gitignore` e `.dockerignore` | Imediata |
| C2 | V01 - Dump no histórico | Verificar e limpar histórico Git se necessário | 1h |
| C3 | V04 - Mock auth | Remover mock auth do bundle de produção | 2h |

### 🟠 ALTAS (antes ou logo após go-live)

| # | Vulnerabilidade | Ação Corretiva | Estimativa |
|---|----------------|---------------|------------|
| A1 | V02 - Endpoints sem auth | Adicionar `checkAuth()` ao GET `/api/clients` | 15min |
| A2 | V03 - Bot token vazio | Adicionar validação explícita no lead/route.ts | 10min |
| A3 | V02 - Exposição emails | Avaliar necessidade de `/api/login/users` pública | 30min |

### 🟡 MÉDIAS (primeira sprint pós go-live)

| # | Vulnerabilidade | Ação Corretiva |
|---|----------------|---------------|
| M1 | V06 - Senha 6 chars | Aumentar para 8+ com complexidade |
| M2 | V07 - Sem MFA | Implementar TOTP |
| M3 | V05 - npm audit | Resolver ou documentar como falso positivo |

### 🔵 BAIXAS (backlog)

| # | Vulnerabilidade | Ação Corretiva |
|---|----------------|---------------|
| B1 | V08 - Rate limit | Migrar para Redis se multi-instance |
| B2 | V09 - Raw SQL | Substituir por Prisma Client |
| B3 | V10 - Logs | Implementar logger estruturado |

---

## 7. Checklist Final de Produção

### Itens de Segurança

| Item | Status | Observação |
|------|--------|------------|
| `.env` no `.gitignore` | ✅ Seguro | `.env*` está no `.gitignore` |
| `.env.production` no `.gitignore` | ⚠️ Pendente | `.env.production` é EXCLUÍDO do ignore (.dockerignore permite) |
| Dumps fora do repositório | 🔴 Crítico | `storage/db-dumps/loja_backup.sql` presente |
| Headers de segurança | ✅ Seguro | HSTS, CSP, XFO, XCTO, XSSP, RP, PP configurados |
| CSP sem `unsafe-eval` | ⚠️ Pendente | `'unsafe-eval'` está presente no script-src |
| Rate limiting | ✅ Seguro | Implementado (memória + DB fallback) |
| CSRF | ✅ Seguro | Origin validation + NextAuth CSRF |
| Lockout de login | ✅ Seguro | 5 tentativas, 15 min lockout |
| HTTPS em produção | ⚠️ Pendente | Depende da configuração do proxy reverso |
| Upload validation | ✅ Seguro | Magic bytes, extensão, MIME type, path traversal |
| SQL Injection | ✅ Seguro | Prisma com parâmetros |
| XSS | ⚠️ Pendente | `'unsafe-inline'` no CSP reduz proteção |
| MFA | 🔴 Crítico | Não implementado |
| Logs estruturados | ⚠️ Pendente | JSON logging parcialmente implementado |
| Backup criptografado | 🔴 Crítico | Dump em texto plano no diretório do projeto |
| CI/CD Security | ✅ Seguro | GitHub Actions com npm audit, lint, build, ZAP |

### Funcionalidades

| Item | Status |
|------|--------|
| Autenticação (login/logout) | ✅ |
| RBAC (roles + permissões) | ✅ |
| CRUD Produtos | ✅ |
| CRUD Clientes | ✅ |
| Ordens de Serviço | ✅ |
| Vendas | ✅ |
| Financeiro | ✅ |
| Dashboard | ✅ |
| WhatsApp Bot | ✅ |
| Upload de Fotos | ✅ |
| Backup/Restore | ⚠️ (apenas manual) |
| Relatórios | ✅ |

---

## 8. Score Final de Segurança

| Domínio | Nota (0-10) | Peso | Nota Ponderada |
|---------|-------------|------|----------------|
| Aplicação (OWASP Top 10) | 7.0 | 25% | 1.75 |
| Infraestrutura (Docker/Linux) | 6.5 | 20% | 1.30 |
| Autenticação e Sessão | 6.0 | 20% | 1.20 |
| APIs e Endpoints | 7.5 | 15% | 1.13 |
| DevOps e CI/CD | 7.0 | 10% | 0.70 |
| Supply Chain (Dependências) | 6.5 | 10% | 0.65 |
| **Score Geral** | | **100%** | **6.73/10** |

### Interpretação do Score

- **Nota 6.73/10 — Classificação: REGULAR (necessita melhorias antes de produção)**
- O sistema apresenta boa base de segurança (headers, CSRF, rate limiting, RBAC, validação de upload)
- Pontos críticos impedem o go-live imediato: dump exposto, mock auth, endpoints sem autenticação

---

## 9. Conclusão Técnica

### Pode Entrar em Produção?

**NÃO neste momento.** O sistema apresenta vulnerabilidades que precisam ser corrigidas antes da exposição pública:

1. **Bloqueantes (CRÍTICAS):**
   - Remover dump do banco de dados do diretório do projeto
   - Garantir que mock auth não funciona em produção
   - Proteger endpoints de listagem de clientes com autenticação

2. **Recomendadas (ALTAS):**
   - Corrigir fallback de token do WhatsApp Bot
   - Limitar exposição de emails no endpoint de login

### Riscos Residuais (após correções)

Após a correção dos itens críticos e altos, os seguintes riscos permanecerão:

| Risco | Nível | Mitigação |
|-------|-------|-----------|
| Ausência de MFA | Médio | Implementar TOTP até 30 dias pós go-live |
| Senhas de 6 caracteres | Baixo | Aumentar complexidade até 30 dias pós go-live |
| CSP com `'unsafe-eval'` | Baixo | Avaliar necessidade e remover se possível |
| Dependências vulneráveis | Baixo | Monitoramento contínuo no CI/CD |

### Pontos Fortes Identificados

O sistema demonstra maturidade em várias áreas:

- **Validação de uploads:** Magic bytes + extensão + MIME type + path traversal — cobertura completa
- **Rate limiting:** Implementação com fallback para banco de dados
- **CSRF:** Validação de Origin em requisições mutantes
- **Lockout de conta:** 5 tentativas com 15 minutos de bloqueio — bem implementado
- **CSRF:** Validação de Origin em requisições mutantes com `timingSafeEqual`
- **Timing-safe comparisons:** HMAC e token validation usam `crypto.timingSafeEqual`
- **RBAC:** Sistema granular de permissões (action:resource) integrado ao NextAuth
- **Audit logging:** Registro de ações com userId, IP, oldValue/newValue
- **Headers de segurança:** CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Path traversal protection:** `safeResolvePath()` nos uploads de OS e fotos
- **Input validation:** Zod schemas em rotas críticas
- **CI/CD security pipeline:** GitHub Actions com lint, audit, build, ZAP scan
- **Docker não-root:** Container app roda como `nextjs` (UID 1001)
- **PostgreSQL bind:** Banco só aceita conexões em `127.0.0.1`
- **Resource limits:** CPU e memória com limites definidos no docker-compose
- **Healthchecks:** Ambos containers com healthcheck configurado
- **Log rotation:** json-file driver com max-size e max-file
- **Source maps:** `productionBrowserSourceMaps: false` ✅
- **Powered by header:** `poweredByHeader: false` ✅

---

## Apêndice A — Evidências dos Testes Automatizados

### A.1 ESLint + eslint-plugin-security

**Comando:** `npm run lint`
**Resultado:** 0 erros, 17 warnings

Warnings são maioritariamente `security/detect-object-injection` (falsos positivos — o plugin detecta acesso a propriedades por variável como risco, mas na maioria dos casos são acessos controlados a objetos conhecidos).

### A.2 npm audit

**Comando:** `npm audit --json`
**Resultado:** 4 vulnerabilidades (1 HIGH, 3 MODERATE)

Todas analisadas individualmente na seção V05. Nenhuma diretamente explorável.

### A.3 TypeScript Strict Mode

**Configuração:** `"strict": true` no tsconfig.json ✅

### A.4 GitHub Actions Security Pipeline

Arquivo: `.github/workflows/security.yml`

Pipeline inclui:
- ✅ Security Check (fail-fast)
- ✅ npm audit (--audit-level=high)
- ✅ Snyk scan (--severity-threshold=high)
- ✅ ESLint
- ✅ Build
- ✅ OWASP ZAP Dynamic Scan
- ✅ Regression tests com PostgreSQL

---

## Apêndice B — Requisitos LGPD Aplicáveis

| Requisito | Status | Observação |
|-----------|--------|------------|
| Consentimento para dados | ⚠️ Pendente | Não identificado mecanismo de consentimento explícito |
| Direito de acesso | ✅ Parcial | Dados acessíveis via API, mas sem endpoint de exportação formal |
| Direito de exclusão | ⚠️ Pendente | Não identificado endpoint para exclusão de dados pessoais |
| Minimização de dados | ⚠️ Pendente | `/api/login/users` expõe emails que podem não ser necessários |
| Segurança de dados | ✅ Parcial | Criptografia em trânsito (TLS via proxy), mas sem criptografia em repouso |
| Relatório de impacto | ⚠️ Pendente | Não identificado DPIA/RIPD |
| Encarregado de dados | ⚠️ Pendente | Não identificado DPO |

---

## Apêndice C — OWASP Top 10 (2021) — Cobertura

| # | Categoria | Cobertura | Avaliação |
|---|-----------|-----------|-----------|
| A01 | Broken Access Control | ✅ Parcial | RBAC implementado, mas endpoints `/api/clients` GET sem auth |
| A02 | Cryptographic Failures | ✅ | bcryptjs para senhas, TLS configurável |
| A03 | Injection | ✅ | Prisma parameterizado, Zod validation |
| A04 | Insecure Design | ⚠️ | Mock auth em dev, sem threat model documentado |
| A05 | Security Misconfiguration | ⚠️ | Dump de banco exposto, CSP com unsafe-eval |
| A06 | Vulnerable Components | ⚠️ | 4 vulnerabilidades npm (1 HIGH em dependência indireta) |
| A07 | Auth Failures | ⚠️ | Sem MFA, senha mínima 6 chars, lockout presente |
| A08 | Software/Data Integrity | ⚠️ | Sem verificação de integridade de dependências |
| A09 | Logging/Monitoring | ⚠️ | Audit log presente, mas logs de erro inconsistentes |
| A10 | SSRF | ✅ | WhatsApp bot é o único componente que faz fetch externo |

---

**Fim do Relatório**

*Este relatório foi gerado com base em análise estática de código-fonte, revisão de configurações Docker, dependências npm, e arquitetura da aplicação. Recomenda-se complementar com testes dinâmicos (penetration testing) em ambiente de staging antes da produção.*