Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root 'frontend'

docker run --rm `
  -v "${frontend}:/app" `
  -v "holdem_frontend_node_modules:/app/node_modules" `
  -w /app `
  -e CI=false `
  -e GENERATE_SOURCEMAP=false `
  -e DISABLE_ESLINT_PLUGIN=true `
  -e REACT_APP_API_ENDPOINT= `
  -e REACT_APP_SOCKET_URL= `
  node:18-alpine `
  sh -lc "if [ ! -d node_modules/react-scripts ]; then npm ci; fi; npm run build"

docker cp "$(Join-Path $frontend 'build')/." holdem-game-frontend:/usr/share/nginx/html/
docker compose up -d --no-deps game-frontend
