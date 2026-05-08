<#
.SYNOPSIS
    Script de exclusão segura — Remove arquivos desnecessários do projeto
.DESCRIPTION
    Remove arquivos identificados no relatório cleanup-report.md como desnecessários.
    Cria backup automático antes da exclusão.
    Modo seguro: pergunta antes de cada etapa.
.PARAMETER AutoConfirm
    Se true, executa sem confirmação (uso em CI)
.PARAMETER SkipBackup
    Se true, pula a criação de backup
.EXAMPLE
    .\scripts\safe-cleanup.ps1
    .\scripts\safe-cleanup.ps1 -AutoConfirm
#>

param(
    [switch]$AutoConfirm,
    [switch]$SkipBackup
)

$ROOT = "c:\Users\crist\Desktop\PROJETOS\loja"
$BACKUP_DIR = "$ROOT\.cleanup-backup"
$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmmss"
$BACKUP_PATH = "$BACKUP_DIR\backup-$TIMESTAMP"
$LOG_FILE = "$BACKUP_DIR\log-$TIMESTAMP.txt"

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "HH:mm:ss"
    $line = "[$timestamp] $Message"
    Write-Host $line
    if (-not (Test-Path (Split-Path $LOG_FILE -Parent))) {
        New-Item -ItemType Directory -Path (Split-Path $LOG_FILE -Parent) -Force | Out-Null
    }
    Add-Content -Path $LOG_FILE -Value $line
}

function Confirm-Step {
    param([string]$Title, [string]$Description)
    if ($AutoConfirm) { return $true }
    Write-Host "`n=== $Title ===" -ForegroundColor Yellow
    Write-Host $Description -ForegroundColor Gray
    $response = Read-Host "Executar esta etapa? (s/n/todos/nenhum)"
    if ($response -eq 'todos') { $script:AutoConfirm = $true; return $true }
    return ($response -eq 's' -or $response -eq 'S')
}

function Backup-Files {
    param([string[]]$Paths, [string]$GroupName)
    if ($SkipBackup) { return }

    $groupDir = "$BACKUP_PATH\$GroupName"
    New-Item -ItemType Directory -Path $groupDir -Force | Out-Null

    foreach ($item in $Paths) {
        if (Test-Path $item) {
            $dest = "$groupDir\" + ($item -replace [regex]::Escape($ROOT + "\"), "")
            $destDir = Split-Path $dest -Parent
            if ($destDir -and -not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            if (Test-Path $item -PathType Container) {
                Copy-Item -Path $item -Destination $dest -Recurse -Force
                Write-Log "  Backup criado: $item -> $dest"
            } else {
                Copy-Item -Path $item -Destination $dest -Force
                Write-Log "  Backup criado: $item -> $dest"
            }
        } else {
            Write-Log "  AVISO: Caminho não encontrado: $item"
        }
    }
}

function Remove-ItemSafe {
    param([string]$Path)
    if (Test-Path $Path) {
        if (Test-Path $Path -PathType Container) {
            Remove-Item -Path $Path -Recurse -Force
        } else {
            Remove-Item -Path $Path -Force
        }
        Write-Log "  REMOVIDO: $Path"
        return $true
    } else {
        Write-Log "  SKIP (não encontrado): $Path"
        return $false
    }
}

# ============================================================
# INÍCIO
# ============================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "    SAFE CLEANUP - LOJA PROJECT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Data: $(Get-Date)" -ForegroundColor Gray
Write-Host "Root: $ROOT" -ForegroundColor Gray
Write-Host "Backup: $BACKUP_PATH" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan

# Fase 0: Criar diretório de backup
if (-not $SkipBackup) {
    Write-Log "Criando diretório de backup..."
    New-Item -ItemType Directory -Path $BACKUP_PATH -Force | Out-Null
}

# ============================================================
# FASE 1: Artefatos de Build e Cache (ALTA confiança)
# ============================================================
if (Confirm-Step -Title "FASE 1: Artefatos de Build e Cache" -Description "Remove .next/, node_modules/, .wwebjs_cache/`nRisco: Mínimo — todos regeneráveis") {
    Write-Log "`n--- FASE 1: Artefatos de Build e Cache ---"

    $paths1 = @(
        "$ROOT\.next",
        "$ROOT\node_modules",
        "$ROOT\.wwebjs_cache"
    )

    if (-not $SkipBackup) {
        Write-Log "Criando backup..."
        Backup-Files -Paths $paths1 -GroupName "01-build-cache"
    }

    foreach ($p in $paths1) {
        Remove-ItemSafe -Path $p
    }

    Write-Log "FASE 1 concluída."
}

# ============================================================
# FASE 2: Scripts de Depuração (ALTA confiança)
# ============================================================
if (Confirm-Step -Title "FASE 2: Scripts de Depuração (ALTA confiança)" -Description "Remove scripts com IDs fixos de depuração única:`n  - check-orphan-products.js`n  - delete-blocking-product.js`n  - force-delete-product.js`n  - delete-users.ts`n  - insert-store-settings.sql`nRisco: Mínimo — operações únicas já realizadas") {
    Write-Log "`n--- FASE 2: Scripts de Depuração ---"

    $paths2 = @(
        "$ROOT\scripts\check-orphan-products.js",
        "$ROOT\scripts\delete-blocking-product.js",
        "$ROOT\scripts\force-delete-product.js",
        "$ROOT\scripts\delete-users.ts",
        "$ROOT\scripts\insert-store-settings.sql"
    )

    if (-not $SkipBackup) {
        Backup-Files -Paths $paths2 -GroupName "02-debug-scripts"
    }

    foreach ($p in $paths2) {
        Remove-ItemSafe -Path $p
    }

    Write-Log "FASE 2 concluída."
}

# ============================================================
# FASE 3: Scripts de Segurança (MÉDIA confiança)
# NOTA: Requer remover referências do package.json
# ============================================================
if (Confirm-Step -Title "FASE 3: Scripts de Teste de Segurança" -Description "Remove scripts de teste/validação de segurança:`n  - global-contract-test.mjs`n  - security-regression-test.mjs`n  - security-check.ts`n  - validate-security.mjs`n`nATENÇÃO: Também remove hooks 'prestart' e 'presecurity:test' do package.json`nRisco: Baixo — scripts de teste, não de produção") {
    Write-Log "`n--- FASE 3: Scripts de Teste de Segurança ---"

    $paths3 = @(
        "$ROOT\scripts\global-contract-test.mjs",
        "$ROOT\scripts\security-regression-test.mjs",
        "$ROOT\scripts\security-check.ts",
        "$ROOT\scripts\validate-security.mjs"
    )

    if (-not $SkipBackup) {
        Backup-Files -Paths $paths3 -GroupName "03-security-scripts"
    }

    # Remover scripts do package.json
    $pkgPath = "$ROOT\package.json"
    if (Test-Path $pkgPath) {
        $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
        $scriptsToRemove = @('security:check', 'security:test', 'security:validate', 'security:contract', 'security:all', 'presecurity:test', 'prestart')
        $changed = $false
        foreach ($key in $scriptsToRemove) {
            if ($pkg.scripts.$key) {
                $pkg.scripts.PSObject.Properties.Remove($key)
                $changed = $true
                Write-Log "  Removido script package.json: $key"
            }
        }
        if ($changed) {
            $pkg | ConvertTo-Json -Depth 10 | Set-Content $pkgPath -Encoding UTF8
            Write-Log "  package.json atualizado."
        }
    }

    foreach ($p in $paths3) {
        Remove-ItemSafe -Path $p
    }

    Write-Log "FASE 3 concluída."
}

# ============================================================
# FASE 4: Endpoint de Teste (MÉDIA confiança)
# ============================================================
if (Confirm-Step -Title "FASE 4: Endpoint de Teste" -Description "Remove app/api/test-flow/route.ts`nRisco: Baixo — acessível apenas em dev com flag") {
    Write-Log "`n--- FASE 4: Endpoint de Teste ---"

    $paths4 = @(
        "$ROOT\app\api\test-flow\route.ts"
    )

    if (-not $SkipBackup) {
        Backup-Files -Paths $paths4 -GroupName "04-test-endpoint"
    }

    foreach ($p in $paths4) {
        Remove-ItemSafe -Path $p
    }

    Write-Log "FASE 4 concluída."
}

# ============================================================
# FASE 5: Assets Padrão Não Utilizados
# ============================================================
if (Confirm-Step -Title "FASE 5: Assets Padrão Não Utilizados" -Description "Remove SVGs padrão do create-next-app:`n  - file.svg, globe.svg, next.svg, vercel.svg, window.svg`n  - public/team/emerson-gabriel.png (não referenciado)`nRisco: Mínimo — sem impacto visual") {
    Write-Log "`n--- FASE 5: Assets Padrão ---"

    $paths5 = @(
        "$ROOT\public\file.svg",
        "$ROOT\public\globe.svg",
        "$ROOT\public\next.svg",
        "$ROOT\public\vercel.svg",
        "$ROOT\public\window.svg",
        "$ROOT\public\team\emerson-gabriel.png"
    )

    if (-not $SkipBackup) {
        Backup-Files -Paths $paths5 -GroupName "05-default-assets"
    }

    foreach ($p in $paths5) {
        Remove-ItemSafe -Path $p
    }

    Write-Log "FASE 5 concluída."
}

# ============================================================
# FASE 6: Documentação Obsoleta
# ============================================================
if (Confirm-Step -Title "FASE 6: Documentação Obsoleta" -Description "Remove:`n  - README.md (genérico, não personalizado)`n  - documentation/prompts/01_with-security-middleware.md (fase concluída)`nRisco: Baixo") {
    Write-Log "`n--- FASE 6: Documentação Obsoleta ---"

    $paths6 = @(
        "$ROOT\README.md",
        "$ROOT\documentation\prompts\01_with-security-middleware.md"
    )

    if (-not $SkipBackup) {
        Backup-Files -Paths $paths6 -GroupName "06-docs"
    }

    foreach ($p in $paths6) {
        Remove-ItemSafe -Path $p
    }

    Write-Log "FASE 6 concluída."
}

# ============================================================
# FASE 7: Arquivos Vazios
# ============================================================
if (Confirm-Step -Title "FASE 7: Arquivos Vazios" -Description "Remove csrf.json (arquivo vazio)`nRisco: Mínimo") {
    Write-Log "`n--- FASE 7: Arquivos Vazios ---"

    $paths7 = @(
        "$ROOT\csrf.json"
    )

    if (-not $SkipBackup) {
        Backup-Files -Paths $paths7 -GroupName "07-empty-files"
    }

    foreach ($p in $paths7) {
        Remove-ItemSafe -Path $p
    }

    Write-Log "FASE 7 concluída."
}

# ============================================================
# FASE 8: Limpar diretórios vazios
# ============================================================
if (Confirm-Step -Title "FASE 8: Limpeza de Diretórios Vazios" -Description "Remove diretórios que ficaram vazios após a limpeza") {
    Write-Log "`n--- FASE 8: Limpeza de Diretórios Vazios ---"

    $emptyDirs = @(
        "$ROOT\public\team"
    )

    foreach ($d in $emptyDirs) {
        if (Test-Path $d) {
            $items = Get-ChildItem $d -Force
            if ($items.Count -eq 0) {
                Remove-Item -Path $d -Force
                Write-Log "  REMOVIDO (vazio): $d"
            }
        }
    }

    Write-Log "FASE 8 concluída."
}

# ============================================================
# RESUMO FINAL
# ============================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "    CLEANUP CONCLUÍDO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Log salvo em: $LOG_FILE" -ForegroundColor Green
if (-not $SkipBackup) {
    Write-Host "Backup salvo em: $BACKUP_PATH" -ForegroundColor Green
}
Write-Host "`nPRÓXIMOS PASSOS RECOMENDADOS:" -ForegroundColor Yellow
Write-Host "1. Execute 'npm install' para restaurar node_modules" -ForegroundColor Gray
Write-Host "2. Execute 'npm run build' para validar o build" -ForegroundColor Gray
Write-Host "3. Execute 'npm run lint' para verificar lint" -ForegroundColor Gray
Write-Host "4. Se tudo ok, remova o backup com:" -ForegroundColor Gray
Write-Host "   Remove-Item -Path '$BACKUP_DIR' -Recurse -Force" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan
