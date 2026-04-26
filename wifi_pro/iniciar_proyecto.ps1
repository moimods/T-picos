$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "== WiFi Pro Node.js: inicio automatico ==" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "No se encontro Node.js en PATH. Instala Node.js (LTS) y vuelve a intentar."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "No se encontro npm en PATH. Reinstala Node.js y vuelve a intentar."
}

Write-Host "Instalando dependencias de Node.js..." -ForegroundColor Yellow
npm install

Write-Host "Iniciando aplicacion Node.js..." -ForegroundColor Green
npm start
