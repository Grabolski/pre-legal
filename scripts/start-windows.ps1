$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
docker compose up -d --build
Write-Host "Pre-Legal running at http://localhost:8000"
