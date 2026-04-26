$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$activateScript = Join-Path $projectRoot ".venv\Scripts\Activate.ps1"
$requirementsFile = Join-Path $projectRoot "requirements.txt"
$mainFile = Join-Path $projectRoot "main.py"

Write-Host "== WiFi Pro: inicio automatico ==" -ForegroundColor Cyan

# 1) Verificar Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    if (Get-Command py -ErrorAction SilentlyContinue) {
        $pythonCmd = "py"
    }
    else {
        throw "No se encontro Python en PATH. Instala Python y vuelve a intentar."
    }
}
else {
    $pythonCmd = "python"
}

# 2) Crear entorno virtual si no existe
if (-not (Test-Path $activateScript)) {
    Write-Host "Creando entorno virtual..." -ForegroundColor Yellow
    & $pythonCmd -m venv .venv
}

# 3) Activar entorno virtual
. $activateScript

# 4) Instalar dependencias
Write-Host "Instalando/actualizando dependencias..." -ForegroundColor Yellow
& $pythonCmd -m pip install --upgrade pip
& $pythonCmd -m pip install -r $requirementsFile

# 5) Ejecutar aplicacion
Write-Host "Iniciando aplicacion..." -ForegroundColor Green
& $pythonCmd $mainFile
