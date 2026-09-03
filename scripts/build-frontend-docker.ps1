$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendPath = Join-Path $repoRoot "website"

$dockerArgs = @(
    "run",
    "--rm",
    "-v", "${frontendPath}:/app",
    "-v", "holdem_frontend_node_modules:/app/node_modules",
    "-w", "/app",
    "-e", "NEXT_TELEMETRY_DISABLED=1",
    "-e", "BACKEND_INTERNAL_URL=http://game-backend:4000",
    "node:20-alpine",
    "sh",
    "-c",
    "npm ci && npm run build"
)

& docker @dockerArgs
