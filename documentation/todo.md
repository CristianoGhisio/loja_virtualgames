# Deploy VPS — Correção de Build (Next.js 16 Turbopack + TypeScript)

## Resumo
Compilação Next.js resolvida (NextAuth lazy init). Erro restante: TypeScript type check — tipo quebrado do wrapper auth.

## Tarefas

### Tarefa 1 — Planejamento e diagnóstico
- (X) Identificar causa raiz: wrapper lazy do auth.ts perdeu tipos
- (X) Build compila (68s) mas TypeScript type check falha (107.4s)
- ( ) Mapear todas as rotas que usam `session?.user` do checkAuth

### Tarefa 2 — Corrigir tipos do auth.ts
- ( ) Restaurar tipos corretos no auth export (preservar NextAuth Session | null)
- ( ) handlers: usar tipo correto do NextAuth
- ( ) signIn/signOut: preservar tipos originais

### Tarefa 3 — Corrigir checkAuth
- ( ) Tipar return type de checkAuth explicitamente
- ( ) Garantir que session.user.id existe no tipo

### Tarefa 4 — Corrigir erro específico cash-flow/route.ts:328
- ( ) Tipar session corretamente no destructuring

### Tarefa 5 — Verificar TODAS as rotas com session.user
- ( ) Buscar todas as ocorrências de session?.user ou session.user

### Tarefa 6 — Build final
- ( ) Commit, push, pull VPS, rebuild
- ( ) Validar: compilação + type check sem erros
