param(
    [Parameter(Mandatory = $true)]
    [string]$RestoreFile
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $RestoreFile)) {
    Write-Error "ERRO: Arquivo não encontrado: $RestoreFile"
    exit 1
}

Write-Host "=== Iniciando restore do banco de dados ===" -ForegroundColor Cyan
Write-Host "Arquivo: $RestoreFile"
Write-Host ""

Write-Host "AVISO: Isso vai APAGAR todos os dados atuais e substituir pelo backup." -ForegroundColor Yellow
Write-Host "Pressione CTRL+C para cancelar ou aguarde 5 segundos para continuar..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "=== Restaurando... ===" -ForegroundColor Cyan

if ($RestoreFile -match '\.gz$') {
    & gzip -dc $RestoreFile | docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1'
} else {
    Get-Content $RestoreFile -Raw | docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1'
}

Write-Host ""
Write-Host "=== Restore concluído com sucesso! ===" -ForegroundColor Green
