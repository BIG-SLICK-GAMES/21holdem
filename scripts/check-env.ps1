$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$required = @(
    "frontend\.env",
    "backend\.env"
)

$missing = @()
foreach ($relativePath in $required) {
    $path = Join-Path $repoRoot $relativePath
    if (Test-Path -LiteralPath $path) {
        Write-Host "$relativePath exists"
    } else {
        Write-Host "$relativePath is missing"
        $missing += $relativePath
    }
}

if ($missing.Count -gt 0) {
    exit 1
}
