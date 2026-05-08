#!/bin/bash
set -e

BACKUP_DIR="storage/db-dumps"
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/loja_backup_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "=== Iniciando backup do banco de dados ==="
echo "Container: loja_postgres"
echo "Destino: $BACKUP_FILE"

docker compose exec -T postgres sh -c '
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges
' > "$BACKUP_FILE"

echo "Backup concluído: $BACKUP_FILE"

echo "=== Compactando backup ==="
gzip -f "$BACKUP_FILE"
echo "Backup compactado: ${BACKUP_FILE}.gz"
echo "Tamanho: $(ls -lh "${BACKUP_FILE}.gz" | awk "{print \$5}")"
