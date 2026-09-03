Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root 'website'

docker run --rm `
  -v "${frontend}:/app" `
  -v "holdem_frontend_node_modules:/app/node_modules" `
  -w /app `
  -e NEXT_TELEMETRY_DISABLED=1 `
  -e BACKEND_INTERNAL_URL=http://game-backend:4000 `
  node:20-alpine `
  sh -lc "if [ ! -d node_modules/next ]; then npm ci; fi; npm run build"

docker compose build game-frontend
docker compose up -d --no-deps game-frontend
