#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "== WiFi Pro Node.js: inicio automatico con Bash =="

# 1) Detectar Node.js y npm
if ! command -v node >/dev/null 2>&1; then
  echo "No se encontro Node.js en PATH. Instala Node.js (LTS) y vuelve a intentar."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "No se encontro npm en PATH. Reinstala Node.js y vuelve a intentar."
  exit 1
fi

echo "Instalando dependencias de Node.js..."
npm install

# 2) Iniciar app
npm start
