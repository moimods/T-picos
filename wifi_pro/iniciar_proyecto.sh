#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "== WiFi Pro: inicio automatico con Bash =="

# 1) Detectar comando de Python
if command -v python >/dev/null 2>&1; then
  PYTHON_CMD="python"
elif command -v py >/dev/null 2>&1; then
  PYTHON_CMD="py"
else
  echo "No se encontro Python en PATH. Instala Python y vuelve a intentar."
  exit 1
fi

# 2) Crear entorno virtual si no existe
if [[ ! -f ".venv/Scripts/activate" ]]; then
  echo "Creando entorno virtual..."
  "$PYTHON_CMD" -m venv .venv
fi

# 3) Activar entorno virtual (Git Bash en Windows)
# shellcheck disable=SC1091
source ".venv/Scripts/activate"

# 4) Instalar dependencias
"$PYTHON_CMD" -m pip install --upgrade pip
"$PYTHON_CMD" -m pip install -r requirements.txt

# 5) Iniciar app
"$PYTHON_CMD" ./main.py
