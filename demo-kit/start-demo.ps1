param(
  [string]$Host = "127.0.0.1",
  [int]$Port = 5000
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path "node_modules")) {
  Write-Host "node_modules missing; installing dependencies..." -ForegroundColor Cyan
  npm install
}

Write-Host "Starting demo on $Host:$Port" -ForegroundColor Green
npm run dev -- --host $Host --port $Port
