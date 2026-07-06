Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

docker compose up -d --build --force-recreate game-frontend

Write-Host 'Frontend production nginx mode is running at http://192.168.0.114:3100'
