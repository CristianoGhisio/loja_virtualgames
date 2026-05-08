#!/bin/sh
set -e

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"; }

trap 'log "SIGTERM recebido — encerrando..."; exit 0' TERM
trap 'log "SIGINT recebido — encerrando..."; exit 0' INT

log "=== Verificando variáveis de ambiente ==="
: "${POSTGRES_USER:?POSTGRES_USER nao definida}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD nao definida}"
: "${POSTGRES_DB:?POSTGRES_DB nao definida}"
: "${DB_HOST:?DB_HOST nao definida}"
DB_PORT="${DB_PORT:-5432}"
export PGPASSWORD="$POSTGRES_PASSWORD"
export npm_config_cache=/app/.npm
log "Variaveis de ambiente OK"

log "=== Aguardando PostgreSQL ==="
log "Destino: $POSTGRES_USER@$DB_HOST:$DB_PORT/$POSTGRES_DB"

MAX_RETRIES=60
RETRIES=0
while [ $RETRIES -lt $MAX_RETRIES ]; do
  if psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1" > /dev/null 2>&1; then
    log "PostgreSQL pronto (tentativa $((RETRIES + 1)))"
    break
  fi
  RETRIES=$((RETRIES + 1))
  if [ $RETRIES -ge $MAX_RETRIES ]; then
    log "ERRO: PostgreSQL nao respondeu apos ${MAX_RETRIES}x tentativas"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1" 2>&1 || true
    exit 1
  fi
  sleep 2
done

log "=== Executando Prisma Migrations ==="
node node_modules/prisma/build/index.js migrate deploy
if [ $? -ne 0 ]; then
  log "ERRO: Prisma migrate falhou"
  exit 1
fi
log "Migrations OK"

log "=== Iniciando Next.js (producao) ==="
exec node server.js
