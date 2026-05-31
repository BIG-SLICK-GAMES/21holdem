$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path $repoRoot "backend"

$files = @(
    "index.js",
    "server.js",
    "app/routers/middleware/index.js",
    "app/routers/game/auth/lib/controllers.js",
    "app/routers/game/poker/index.js",
    "app/utils/lib/system-bots.js",
    "app/utils/lib/ensure-bots-cli.js",
    "app/utils/lib/mongodb.js",
    "app/utils/lib/redis.js",
    "app/utils/lib/socialAuth.js"
)

Set-Location $backendRoot
foreach ($file in $files) {
    node --check $file
}

Write-Host "Backend syntax checks completed"
