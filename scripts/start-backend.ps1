$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $repoRoot "backend"
Set-Location $backendPath

$package = Get-Content -Raw "package.json" | ConvertFrom-Json
if ($package.scripts.dev) {
    npm run dev
} else {
    npm start
}
