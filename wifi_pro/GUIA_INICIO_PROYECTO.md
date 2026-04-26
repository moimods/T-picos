# Guia de inicio del proyecto

Esta guia resume los pasos minimos para iniciar `wifi_pro`.

## Requisitos previos

- Python 3.10+ instalado
- No se requiere base de datos externa (todo es local)

Nota de compatibilidad:

- Si usas Python muy nuevo (por ejemplo 3.14), asegúrate de tener pip actualizado para instalar `bcrypt` sin problemas.

## 1) Ir a la carpeta del proyecto

En PowerShell:

```powershell
cd C:\Users\moise\OneDrive\Desktop\Topicos_programacion\wifi_pro
```

En Git Bash:

```bash
cd /c/Users/moise/OneDrive/Desktop/Topicos_programacion/wifi_pro
```

## 2) Configurar variables de entorno

No necesitas variables `DB_*`. El proyecto usa almacenamiento local en JSON dentro de `data/`.

## 3) Inicio recomendado (automatico)

### Windows PowerShell

```powershell
powershell -ExecutionPolicy Bypass -File .\iniciar_proyecto.ps1
```

### Git Bash

```bash
bash ./iniciar_proyecto.sh
```

Estos scripts hacen automaticamente:

- crear `.venv` si no existe
- instalar dependencias de `requirements.txt`
- ejecutar `main.py`

## 4) Inicio manual (opcional)

En PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python .\main.py
```

Si PowerShell bloquea la activacion por ExecutionPolicy, usa esta alternativa:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe .\main.py
```

## 5) Credenciales iniciales

No hay credenciales predefinidas. En la pantalla inicial usa el botón de registro y crea tu usuario.

## 6) Verificacion rapida

```powershell
python --version
Test-Path .\requirements.txt
Test-Path .\data\usuarios.json
Test-Path .\data\redes.json
Test-Path .\data\historial.json
```

Si algo falla, revisa `README.md` y `ARQUITECTURA.md`.
