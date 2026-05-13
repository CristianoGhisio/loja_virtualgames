Resumo
WhatsApp corrigido; Solução: copiar node_modules completo no Dockerfile

Tarefas

Tarefa 1 — Corrigir erro do WhatsApp Bot
(X) Atividade A — Identificar causa raiz — Módulos Node.js faltando no container Docker
(X) Atividade B — Tentativa inicial — Adicionar módulos individuais ao Dockerfile (qrcode-terminal, whatsapp-web.js, axios, etc.)
(X) Atividade C — Problema descobriu — Dependências transitivas em cascata (proxy-agent, agent-base, etc.)
(X) Atividade D — Solução definitiva — Copiar node_modules completo do builder para o runner
(X) Atividade E — Rebuild e validação — Container reconstruído com sucesso

Tarefa 2 — Investigar erro de permissão no cache de imagens
(~) Atividade A — Verificar causa — Erro: `EACCES: permission denied, mkdir '/app/.next/cache/images'`
( ) Atividade B — Corrigir permissões — Ajustar ownership das pastas de cache dentro do container
( ) Atividade C — Validar não recorrência — Verificar logs após correção

Análise técnica completa

REQUISITO                          | STATUS   | ARQUIVO/CONFIG
================================== | ======== | ===============================
WHATSAPP_BOT_TOKEN                | ✅ OK    | .env.production
WHATSAPP_BOT_BASE_URL             | ✅ OK    | .env.production
WHATSAPP_BOT_PORT                 | ✅ OK    | .env.production
Chromium instalado                | ✅ OK    | /usr/bin/chromium
Pasta .wwebjs_auth                | ✅ OK    | /app/.wwebjs_auth
node_modules completo             | ✅ OK    | /app/node_modules
Arquivo whatsapp-bot.mjs           | ✅ OK    | /app/automation
Permissão Next.js (não-root)      | ✅ OK    | Dockerfile (USER nextjs)
SQLite/LevelDB (wwebjs_auth)       | ✅ OK    | Permissão 755

Causa raiz identificadas:
1. Dockerfile original copiou apenas @prisma e outros módulos específicos, deixando 450+ módulos de fora
2. O bot precisa de todas as dependências do whatsapp-web.js E de todas as dependências do puppeteer
3. Dependências transitivas formam uma cadeia complexa que não pode ser resolvida manualmente

Solução aplicada:
- Alterado o Dockerfile para copiar TODO node_modules do builder para o runner
- Adicionada cópia da pasta automation para garantir script disponível

Correção no Dockerfile (antes):
  COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
  COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
  ... (~20 módulos específicos listados manualmente)

Correção no Dockerfile (depois):
  COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

Pendências:
- Erro de permissão no cache de imagens (não crítico, não afeta WhatsApp)