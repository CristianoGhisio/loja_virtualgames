#!/bin/bash
set -e

if [ $# -lt 1 ]; then
  echo "Uso: $0 <arquivo.sql.gz ou arquivo.sql>"
  echo ""
  echo "Exemplos:"
  echo "  $0 storage/db-dumps/loja_backup_2026-04-29_120000.sql.gz"
  echo "  $0 prisma/seed.sql"
  exit 1
fi

RESTORE_FILE="$1"

if [ ! -f "$RESTORE_FILE" ]; then
  echo "ERRO: Arquivo não encontrado: $RESTORE_FILE"
  exit 1
fi

echo "=== Iniciando restore do banco de dados ==="
echo "Arquivo: $RESTORE_FILE"
echo ""

echo "AVISO: Isso vai APAGAR todos os dados atuais e substituir pelo backup."
echo "Pressione CTRL+C para cancelar ou aguarde 5 segundos para continuar..."
sleep 5

echo ""
echo "=== Restaurando... ==="

if [[ "$RESTORE_FILE" == *.gz ]]; then
  gunzip -c "$RESTORE_FILE" | docker compose exec -T postgres sh -c '
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1
  '
else
  cat "$RESTORE_FILE" | docker compose exec -T postgres sh -c '
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1
  '
fi

echo ""
echo "=== Restore concluído com sucesso! ==="
