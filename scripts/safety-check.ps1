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

function Get-RelativeRepoPath($fullPath) {
    $rootPath = [System.IO.Path]::GetFullPath($repoRoot).TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar
    $targetPath = [System.IO.Path]::GetFullPath($fullPath)
    $rootUri = [System.Uri]::new($rootPath)
    $targetUri = [System.Uri]::new($targetPath)
    return [System.Uri]::UnescapeDataString($rootUri.MakeRelativeUri($targetUri).ToString()).Replace('\', '/')
}

function Test-ScannableTextFile($file) {
    $name = $file.Name
    $extension = $file.Extension.ToLowerInvariant()
    $allowedExtensions = @(
        ".js", ".jsx", ".ts", ".tsx", ".json", ".md", ".ps1", ".yml", ".yaml",
        ".scss", ".css", ".html", ".txt", ".example", ".gitignore"
    )

    return $name -like ".env*" -or $name -eq ".gitignore" -or $allowedExtensions -contains $extension
}

function Get-ScanFiles($targets) {
    foreach ($target in $targets) {
        $absoluteTarget = Join-Path $repoRoot $target
        if (Test-Path -LiteralPath $absoluteTarget -PathType Leaf) {
            $file = Get-Item -LiteralPath $absoluteTarget
            if (Test-ScannableTextFile $file) {
                $file
            }
            continue
        }

        if (Test-Path -LiteralPath $absoluteTarget -PathType Container) {
            Get-ChildItem -LiteralPath $absoluteTarget -Recurse -File -Force -ErrorAction SilentlyContinue |
                Where-Object {
                    $relativePath = Get-RelativeRepoPath $_.FullName
                    (Test-ScannableTextFile $_) -and
                    $relativePath -notmatch '(^|/)node_modules/' -and
                    $relativePath -notmatch '(^|/)build/' -and
                    $relativePath -notmatch '(^|/)dist/' -and
                    $relativePath -notmatch '(^|/)logs/' -and
                    $relativePath -notmatch '^docs/backups/' -and
                    $relativePath -ne 'scripts/safety-check.ps1' -and
                    $relativePath -notmatch 'package-lock\.json$'
                }
        }
    }
}

function Find-ForbiddenPattern($pattern, $files) {
    $matches = foreach ($match in Select-String -LiteralPath $files.FullName -Pattern $pattern -ErrorAction SilentlyContinue) {
        $relativePath = Get-RelativeRepoPath $match.Path
        "${relativePath}:$($match.LineNumber):$($match.Line)"
    }

    return @{
        ExitCode = $(if ($matches) { 0 } else { 1 })
        Matches = $matches
    }
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

$scanFiles = @(Get-ScanFiles $existingScanTargets)

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
    $scanResult = Find-ForbiddenPattern $pattern $scanFiles
    if ($scanResult.ExitCode -eq 0 -and $scanResult.Matches) {
        $scanResult.Matches | ForEach-Object { Fail "Forbidden pattern match: $_" }
    } elseif ($scanResult.ExitCode -le 1) {
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
