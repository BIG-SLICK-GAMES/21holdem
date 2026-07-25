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

$rgCommand = Get-Command rg -ErrorAction SilentlyContinue
$textScanExtensions = @(
    ".css",
    ".env",
    ".example",
    ".html",
    ".js",
    ".json",
    ".jsx",
    ".md",
    ".ps1",
    ".scss",
    ".sh",
    ".ts",
    ".tsx",
    ".txt",
    ".yaml",
    ".yml"
)
$textScanFileNames = @(
    ".gitignore",
    "Dockerfile",
    "README"
)

function Get-RelativeRepoPath($path) {
    $basePath = [System.IO.Path]::GetFullPath($repoRoot).TrimEnd([char]'\', [char]'/')
    $fullPath = [System.IO.Path]::GetFullPath($path)
    if ($fullPath.StartsWith($basePath, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $fullPath.Substring($basePath.Length).TrimStart([char]'\', [char]'/').Replace('\', '/')
    }
    $fullPath.Replace('\', '/')
}

function Get-TextScanFiles($targets) {
    foreach ($target in $targets) {
        $targetPath = Join-Path $repoRoot $target
        if (-not (Test-Path -LiteralPath $targetPath)) {
            continue
        }

        $item = Get-Item -LiteralPath $targetPath
        $files = if ($item.PSIsContainer) {
            Get-ChildItem -LiteralPath $item.FullName -Recurse -File
        } else {
            @($item)
        }

        foreach ($file in $files) {
            $relative = Get-RelativeRepoPath $file.FullName
            if (
                $relative -eq "scripts/safety-check.ps1" -or
                $relative -like "docs/backups/*" -or
                $relative -like "*/node_modules/*" -or
                $relative -like "*/build/*" -or
                $relative -like "*/dist/*" -or
                $relative -like "*/logs/*" -or
                $relative -like "*/package-lock.json" -or
                $relative -eq "package-lock.json"
            ) {
                continue
            }

            $extension = [System.IO.Path]::GetExtension($file.Name).ToLowerInvariant()
            if (($textScanExtensions -notcontains $extension) -and ($textScanFileNames -notcontains $file.Name)) {
                continue
            }

            $file.FullName
        }
    }
}

function Find-ForbiddenMatches($pattern, $targets) {
    if ($rgCommand) {
        $matches = & $rgCommand.Source --glob '!docs/backups/**' --glob '!scripts/safety-check.ps1' --glob '!**/node_modules/**' --glob '!**/build/**' --glob '!**/dist/**' --glob '!**/logs/**' --glob '!**/package-lock.json' -n -- $pattern @targets 2>$null
        if ($LASTEXITCODE -eq 0 -and $matches) {
            return $matches
        }
        if ($LASTEXITCODE -le 1) {
            return @()
        }
        throw "rg exited with code $LASTEXITCODE"
    }

    $files = @(Get-TextScanFiles $targets | Where-Object { Test-Path -LiteralPath $_ })
    if (-not $files) {
        return @()
    }

    $matches = @()
    foreach ($file in $files) {
        $content = Get-Content -LiteralPath $file -Raw -ErrorAction SilentlyContinue
        if ($null -eq $content) {
            continue
        }

        $lineNumber = 0
        foreach ($line in ($content -split "\r?\n")) {
            $lineNumber += 1
            if ([regex]::IsMatch($line, $pattern)) {
                $matches += "$(Get-RelativeRepoPath $file):${lineNumber}:$line"
            }
        }
    }

    $matches
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
    try {
        $matches = @(Find-ForbiddenMatches $pattern $scanTargets)
    } catch {
        Fail "scan failed for pattern $pattern`: $($_.Exception.Message)"
        continue
    }

    if ($matches) {
        $matches | ForEach-Object { Fail "Forbidden pattern match: $_" }
    } else {
        Pass "no matches for $pattern"
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
