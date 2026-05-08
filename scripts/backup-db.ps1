param(
    [string]$OutputDir = "storage/db-dumps"
)

$ErrorActionPreference = "Stop"

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$backupDir = Join-Path (Get-Location) $OutputDir
$backupFile = Join-Path $backupDir "loja_backup_${timestamp}.sql"

New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Write-Host "=== Iniciando backup do banco de dados ===" -ForegroundColor Cyan
Write-Host "Container: loja_postgres"
Write-Host "Destino: $backupFile"
Write-Host ""

docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --no-privileges' *>` "$backupFile"

Write-Host "Backup concluído: $backupFile" -ForegroundColor Green

Write-Host "=== Compactando backup ===" -ForegroundColor Cyan
& gzip -f "$backupFile"
$compressedFile = "${backupFile}.gz"
Write-Host "Backup compactado: $compressedFile" -ForegroundColor Green
$fileInfo = Get-Item $compressedFile
Write-Host "Tamanho: $($fileInfo.Length / 1MB -as [int]) MB" -ForegroundColor Green
