# Correção — Erro 403 no Cadastro de Funcionário (Produção VPS)

## Resumo
Erro 403 em todas as chamadas de API durante o cadastro de novo funcionário + erro de validação de formulário com campos hidden com `required`. Duas causas raiz identificadas:
1. **403 nas APIs**: Nginx escuta apenas HTTP (porta 80) mas `NEXTAUTH_URL` usa `https://`. O `Origin` do navegador (`http://`) não casa com o `NEXTAUTH_URL` (`https://`). O `validateOrigin()` em `lib/api-auth.ts` rejeita a requisição com 403.
2. **Campos "not focusable"**: Campos `cargoFuncao`, `dataAdmissao`, `salarioBase` com atributo `required` ficam na aba "Dados Funcionais" (oculta com classe `hidden`). Ao submeter o formulário na aba "Dados Pessoais", o browser tenta validar campos não visíveis.

## Tarefas

### Tarefa 1 — Corrigir 403 (Origin mismatch HTTP vs HTTPS)
- (X) Atividade 1.1 — Alterar `validateOrigin()` em `lib/api-auth.ts` para comparar hostnames (ignorar protocolo)
  - Arquivo: `lib/api-auth.ts`, função `validateOrigin()` (~linha 70-86)
  - Nova função `extractHostname()` extrai o hostname da URL, descartando protocolo
  - Comparação agora usa apenas o hostname, permitindo `http://` e `https://` no mesmo domínio
- (X) Atividade 1.2 — Aplicar mesma correção em `lib/with-security.ts`
  - Arquivo: `lib/with-security.ts`, função `validateOrigin()` (~linha 28-47)
  - Mesma lógica: `extractHostname()` + comparação de hostnames

### Tarefa 2 — Corrigir validação de formulário (campos hidden com required)
- (X) Atividade 2.1 — Remover atributo `required` dos campos nas abas ocultas + validação programática
  - Arquivo: `app/dashboard/funcionarios/novo/page.tsx`
  - Removido `required` de: `cargoFuncao`, `dataAdmissao`, `salarioBase`
  - Adicionada validação manual no `handleSubmit` que verifica os 3 campos antes do envio
  - Se algum campo estiver vazio: muda para aba "funcional" e mostra toast de erro

### Tarefa 3 — Validar em ambiente local (antes de deploy na VPS)
- (X) Atividade 3.1 — Build e lint sem erros
  - `npm run lint` → 0 errors, 18 warnings (pré-existentes, não introduzidos)
- (X) Atividade 3.2 — Teste de validação: removido `required` dos campos ocultos, validação programática implementada
- (X) Atividade 3.3 — Verificação de API: `/api/admin/users` com `Origin: http://virtualgames.com.br` → **401** (sem sessão, antes: 403). Correção confirmada.

### Tarefa 4 — Deploy na VPS
- (X) Atividade 4.1 — Rebuild Docker
  - `docker compose -f docker-compose.vps.yml down`
  - `docker compose -f docker-compose.vps.yml up --build -d`
  - Build: 223s, imagem `loja_virtualgames-app`, Node 20 (builder) + Node 20-slim (runtime)
  - Status: `loja_vps_app` healthy, `loja_vps_postgres` healthy
  - Migrations: 28 aplicadas, nenhuma pendente
  - Next.js 16.2.6 iniciado na porta 3000/3002
- (X) Atividade 4.2 — Healthcheck: `/api/health` → `{"status":"ok","timestamp":"...","uptime":27,"checks":{"database":"ok"}}`
- (X) Atividade 4.3 — Validar Origin: `/api/admin/users` com `Origin: http://virtualgames.com.br` → 401 (antes: 403). Confirma que o `validateOrigin()` agora reconhece o hostname, independentemente do protocolo.
- ( ) Atividade 4.4 — Push no GitHub (aguardando autorização do responsável)

---

## Diagnóstico técnico (referência)

### 403 Forbidden — Fluxo da falha (ANTES)

```
1. Navegador acessa http://virtualgames.com.br/dashboard/funcionarios/novo
2. Nginx (porta 80) → proxy_pass http://127.0.0.1:3002 (container)
3. Página carrega, faz fetch para /api/admin/users, /api/admin/roles, etc.
4. Navegador envia header Origin: http://virtualgames.com.br
5. Middleware (middleware.ts) deixa passar — usuário está autenticado
6. API route chama checkAuth() → validateOrigin()
7. validateOrigin() compara "http://virtualgames.com.br" com "https://virtualgames.com.br"
8. NÃO casa → retorna 403 "Forbidden: invalid origin"
```

### 403 Corrigido (DEPOIS)

```
1. validateOrigin() extrai hostname de cada URL: "virtualgames.com.br"
2. allowedHostnames = ["virtualgames.com.br", "loja_vps_app:3000", "localhost"]
3. requestHostname = "virtualgames.com.br"
4. Casa com allowedHostnames[0] → valid: true → requisição continua
```

Arquivos relevantes:
- [nginx/virtualgames.com.br.conf](file:///opt/loja_virtualgames/nginx/virtualgames.com.br.conf#L1-L41) — escuta apenas porta 80 (HTTP)
- [lib/api-auth.ts](file:///opt/loja_virtualgames/lib/api-auth.ts#L70-L86) — `validateOrigin()` com comparação exata de URL (antes)
- [lib/with-security.ts](file:///opt/loja_virtualgames/lib/with-security.ts#L28-L47) — `validateOrigin()` duplicado, mesma lógica (antes)
- [.env.production](file:///opt/loja_virtualgames/.env.production#L28) — `NEXTAUTH_URL=https://virtualgames.com.br`

### Campos "not focusable" — Fluxo da falha

```
1. Formulário tem 3 abas: "pessoal", "funcional", "acesso"
2. Abas usam className={activeTab === 'funcional' ? 'block' : 'hidden'}
3. Campos cargoFuncao, dataAdmissao, salarioBase têm atributo required
4. Campos ficam na aba "funcional" que está hidden
5. Usuário clica "Cadastrar Funcionário" na aba "pessoal"
6. Browser executa validação HTML5 nativa
7. Primeiro campo required inválido é cargoFuncao (hidden)
8. Browser: "An invalid form control with name='cargoFuncao' is not focusable"
```

### Corrigido

```
1. handleSubmit() verifica se cargoFuncao, dataAdmissao e salarioBase estão preenchidos
2. Se algum campo obrigatório da aba "funcional" estiver vazio:
   - setActiveTab('funcional') → mostra a aba correta
   - toast.error() → mostra mensagem clara ao usuário
   - return → interrompe o envio do formulário
3. Se tudo OK → envia normalmente
```

Arquivo relevante:
- [app/dashboard/funcionarios/novo/page.tsx](file:///opt/loja_virtualgames/app/dashboard/funcionarios/novo/page.tsx#L188-L197) — validação programática no handleSubmit
- [app/dashboard/funcionarios/novo/page.tsx](file:///opt/loja_virtualgames/app/dashboard/funcionarios/novo/page.tsx#L385-L435) — campos com `required` removido na aba oculta

---

## Evidências de conclusão

| Verificação | Resultado |
|---|---|
| `npm run lint` | 0 errors, 18 warnings (pré-existentes) |
| Docker build | 223s, image `loja_virtualgames-app` criada com sucesso |
| Container `loja_vps_app` | healthy |
| Container `loja_vps_postgres` | healthy |
| `/api/health` | `{"status":"ok","uptime":27,"checks":{"database":"ok"}}` |
| `/api/admin/users` com Origin:http | **401** (antes: 403) — validação de Origin passando |
