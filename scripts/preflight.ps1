$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot

& (Join-Path $PSScriptRoot "safety-check.ps1")
& (Join-Path $PSScriptRoot "backend-syntax-check.ps1")

Set-Location (Join-Path $repoRoot "backend")
npm test

Set-Location (Join-Path $repoRoot "frontend")
npm run build

Write-Host "Preflight completed"
