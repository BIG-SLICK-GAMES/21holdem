$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$failed = $false

function Fail($message) {
    Write-Error $message
    $script:failed = $true
}

function Pass($message) {
    Write-Host "OK $message"
}

$envScanRoots = @(
    $repoRoot,
    (Join-Path $repoRoot "frontend"),
    (Join-Path $repoRoot "backend"),
    (Join-Path $repoRoot "env-templates")
)

$realEnvFiles = foreach ($scanRoot in $envScanRoots) {
    Get-ChildItem -LiteralPath $scanRoot -Force -File -ErrorAction SilentlyContinue |
        Where-Object {
            $_.Name -eq '.env' -or ($_.Name -like '.env.*' -and $_.Name -notmatch '\.example$')
        }
}

if ($realEnvFiles) {
    $realEnvFiles | ForEach-Object { Fail "Real env file found: $($_.FullName)" }
} else {
    Pass "no real .env files found"
}

$gitignorePath = Join-Path $repoRoot ".gitignore"
$gitignore = Get-Content -Raw $gitignorePath
$requiredIgnorePatterns = @(
    ".env",
    ".env.*",
    "node_modules",
    "build",
    "dist",
    "logs",
    "*.log",
    "coverage",
    "backups",
    "cache",
    ".cache",
    "tmp",
    "temp",
    "*.pem",
    "*.key",
    "*.crt",
    ".codex-mailbox/",
    "**/_backup*",
    "*.zip",
    "*.code-workspace"
)

foreach ($pattern in $requiredIgnorePatterns) {
    if ($gitignore.Contains($pattern)) {
        Pass ".gitignore contains $pattern"
    } else {
        Fail ".gitignore missing $pattern"
    }
}

$scanTargets = @(
    "backend/app",
    "backend/.env.example",
    "backend/.env.local.example",
    "backend/.env.production.example",
    "backend/.env.docker.example",
    "frontend/src",
    "docs",
    "env-templates",
    "deployment-notes",
    "scripts",
    "README.md",
    ".gitignore"
)

$existingScanTargets = $scanTargets | Where-Object {
    Test-Path -LiteralPath (Join-Path $repoRoot $_)
}

$forbiddenPatterns = @(
    ("River" + "Shift2026"),
    "http://52\.90\.29\.30",
    "https://52\.90\.29\.30",
    "192\.168\.0\.205",
    "AKIA[0-9A-Z]{16}",
    "-----BEGIN .*PRIVATE KEY",
    "sk_live_[A-Za-z0-9]+",
    "sk_test_[A-Za-z0-9]{10,}",
    "whsec_[A-Za-z0-9]{10,}",
    "mongodb://[^\s'`"]+:[^\s'`"@]+@",
    "redis://[^\s'`"]+:[^\s'`"@]+@"
)

foreach ($pattern in $forbiddenPatterns) {
    $matches = & rg --glob '!docs/backups/**' --glob '!scripts/safety-check.ps1' --glob '!**/node_modules/**' --glob '!**/build/**' --glob '!**/dist/**' --glob '!**/logs/**' --glob '!**/package-lock.json' -n -- $pattern @existingScanTargets 2>$null
    if ($LASTEXITCODE -eq 0 -and $matches) {
        $matches | ForEach-Object { Fail "Forbidden pattern match: $_" }
    } elseif ($LASTEXITCODE -le 1) {
        Pass "no matches for $pattern"
    } else {
        Fail "scan failed for pattern $pattern"
    }
}

$systemBotsPath = Join-Path $repoRoot "backend/app/utils/lib/system-bots.js"
$systemBots = Get-Content -Raw $systemBotsPath
$oldBotPasswordPattern = "River" + "Shift2026"
if ($systemBots -match "process\.env\.SYSTEM_BOT_PASSWORD" -and $systemBots -notmatch $oldBotPasswordPattern) {
    Pass "system bot password is env-only"
} else {
    Fail "system bot password must be env-only with no committed fallback"
}

if ($failed) {
    exit 1
}

Pass "safety check completed"
