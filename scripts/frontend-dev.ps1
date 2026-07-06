Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

docker compose -f docker-compose.yml -f docker-compose.frontend-dev.yml `
  up -d --no-deps --force-recreate game-frontend

Write-Host 'Frontend dev mode is running at http://192.168.0.114:3100'
Write-Host 'Edits under frontend/src should hot reload without rebuilding the Docker image.'
