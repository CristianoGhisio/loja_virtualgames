#!/bin/bash
set -e

BACKUP_DIR="/opt/loja_virtualgames/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/loja_backup_${TIMESTAMP}.sql"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Iniciando backup do banco Loja Virtual Games..."
echo "Container: loja_postgres"
echo "Destino: $BACKUP_FILE"

docker exec loja_postgres pg_dump -U loja_vps_user -d loja_vps_db \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges > "$BACKUP_FILE"

echo "[$(date)] Backup concluído: $BACKUP_FILE"

gzip -f "$BACKUP_FILE"
echo "[$(date)] Backup compactado: ${BACKUP_FILE}.gz"

find "$BACKUP_DIR" -name "loja_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "[$(date)] Limpeza: removidos backups com mais de ${RETENTION_DAYS} dias"
