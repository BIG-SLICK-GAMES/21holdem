$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendPath = Join-Path $repoRoot "frontend"

$dockerArgs = @(
    "run",
    "--rm",
    "-v", "${frontendPath}:/app",
    "-v", "holdem_frontend_node_modules:/app/node_modules",
    "-w", "/app",
    "-e", "CI=false",
    "-e", "REACT_APP_API_ENDPOINT=",
    "-e", "REACT_APP_SOCKET_URL=",
    "node:18-alpine",
    "sh",
    "-c",
    "npm ci && npm run build"
)

& docker @dockerArgs
