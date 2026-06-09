param(
    [string]$EnvFile = ".env.local"
)

$envPath = Join-Path (Get-Location) $EnvFile
if (-not (Test-Path -LiteralPath $envPath)) {
    throw "Local env file not found: $envPath"
}

Get-Content -LiteralPath $envPath | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#") -or $line -notmatch "^[^=]+=") {
        return
    }

    $key, $value = $line -split "=", 2
    [Environment]::SetEnvironmentVariable($key.Trim(), $value.Trim(), "Process")
}

node index.js
