# WiFi Pro - Security Analyzer

Aplicacion de escritorio en Python con Tkinter (ttk), orientada a analisis educativo de seguridad WiFi.

El proyecto funciona 100% local, sin PostgreSQL ni servicios externos. Todo se guarda en archivos JSON.

## Funcionalidades principales

- Login y registro de usuario.
- Contraseñas con hash seguro usando bcrypt.
- CRUD de redes WiFi (agregar, editar, eliminar).
- Analisis de riesgo con puntaje realista.
- Historial de analisis por red.
- Dashboard con resumen general y boton "Analizar todo".

## Reglas de puntaje

- Publica: +40
- Sin cifrado: +50
- WEP: +40
- WPA: +25
- WPA2: +10
- WPA3: +0
- Contraseña debil (<8): +20

Clasificacion:

- 0-30: SEGURO (🟢)
- 31-70: RIESGO MEDIO (🟠)
- 71-100: ALTO RIESGO (🔴)

## Arquitectura

```text
wifi_pro/
├── main.py
├── controllers/
│   ├── auth_controller.py
│   └── dashboard_controller.py
├── models/
│   ├── storage.py
│   ├── user_model.py
│   └── network_model.py
├── security/
│   └── risk_engine.py
├── ui/
│   ├── login_view.py
│   └── dashboard_view.py
├── utils/
│   └── validators.py
├── data/
│   ├── usuarios.json
│   ├── redes.json
│   └── historial.json
└── requirements.txt
```

## Inicio rapido

PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\iniciar_proyecto.ps1
```

Git Bash:

```bash
bash ./iniciar_proyecto.sh
```

## Inicio manual

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe .\main.py
```

## Archivos de almacenamiento local

- data/usuarios.json
- data/redes.json
- data/historial.json

## Dependencias

- bcrypt>=4.2.0

## Documentos relacionados

- GUIA_INICIO_PROYECTO.md
- ARQUITECTURA.md
- DESCRIPCION_COMPLETA_PROYECTO.md
