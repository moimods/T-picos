# Instalacion completa y rutas del proyecto (Windows)

Esta guia explica como instalar Python, PostgreSQL, pgAdmin y como dejar configurado el proyecto para ejecutarlo sin errores.

## 1. Estructura y rutas del proyecto

Estructura recomendada en tu carpeta de trabajo:

```text
Topicos_programacion/
└── wifi_pro/
    ├── .env.example
    ├── requirements.txt
    ├── wifi_seguridad.sql
    ├── iniciar_proyecto.ps1
    ├── main.py
    ├── db.py
    ├── modelo.py
    ├── login.py
    ├── seguridad.py
    ├── ui.py
    ├── README.md
    ├── ARQUITECTURA.md
    └── INSTALACION_COMPLETA_WINDOWS.md
```

Tu ruta local base:
`C:\Users\moise\OneDrive\Desktop\Topicos_programacion\wifi_pro`

## 2. Instalar Python

1. Descarga Python para Windows:
https://www.python.org/downloads/windows/

2. Durante la instalacion marca la opcion **Add Python to PATH**.

3. Verifica instalacion en PowerShell:

```powershell
python --version
pip --version
```

Si `python` no esta disponible, prueba:

```powershell
py --version
```

## 3. Instalar PostgreSQL y pgAdmin

1. Descarga PostgreSQL (incluye pgAdmin):
https://www.postgresql.org/download/windows/

2. En el instalador:
- Instala PostgreSQL Server.
- Instala pgAdmin 4.
- Define password para el usuario `postgres`.
- Deja el puerto en `5432`.

3. Verifica servicio en Windows:
- Abre `services.msc`.
- Confirma que el servicio de PostgreSQL este en estado **Running**.

## 4. Crear base de datos y tablas

### Opcion A: con pgAdmin

1. Abre pgAdmin y conectate al servidor local.
2. En `Databases` crea la base `wifi_seguridad`.
3. Abre `Query Tool` sobre esa base.
4. Ejecuta el contenido de `wifi_seguridad.sql`.

### Opcion B: con psql

En PowerShell dentro de la carpeta del proyecto:

```powershell
psql -U postgres -c "CREATE DATABASE wifi_seguridad;"
psql -U postgres -d wifi_seguridad -f .\wifi_seguridad.sql
```

## 5. Configurar variables de entorno DB_*

El proyecto usa estas variables:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

Archivo de referencia: `.env.example`

Carga para la sesion actual de PowerShell:

```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="wifi_seguridad"
$env:DB_USER="postgres"
$env:DB_PASSWORD="TU_PASSWORD_POSTGRES"
```

Persistir en Windows (opcional):

```powershell
setx DB_HOST "localhost"
setx DB_PORT "5432"
setx DB_NAME "wifi_seguridad"
setx DB_USER "postgres"
setx DB_PASSWORD "TU_PASSWORD_POSTGRES"
```

Nota: despues de `setx`, abre una terminal nueva.

## 6. Instalar dependencias del proyecto

Desde PowerShell, dentro de `wifi_pro`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

## 7. Iniciar el proyecto

### Inicio manual

```powershell
.\.venv\Scripts\Activate.ps1
python .\main.py
```

### Inicio automatico (recomendado)

```powershell
powershell -ExecutionPolicy Bypass -File .\iniciar_proyecto.ps1
```

Este script:
- Crea `.venv` si no existe.
- Activa entorno virtual.
- Instala dependencias.
- Carga variables desde `.env` o `.env.example`.
- Inicia la app.

### Inicio con Bash (Git Bash)

Desde la carpeta del proyecto:

```bash
cd /c/Users/moise/OneDrive/Desktop/Topicos_programacion/wifi_pro
bash ./iniciar_proyecto.sh
```

Alternativa (manual) en Bash:

```bash
cd /c/Users/moise/OneDrive/Desktop/Topicos_programacion/wifi_pro

export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=wifi_seguridad
export DB_USER=postgres
export DB_PASSWORD=TU_PASSWORD_POSTGRES

python ./main.py
```

## 8. Credenciales iniciales

El script SQL crea el usuario inicial:

- Usuario: `admin`
- Password: `1234`

## 9. Verificacion rapida

```powershell
python --version
psql --version
Test-Path .\wifi_seguridad.sql
Test-Path .\requirements.txt
```

## 10. Errores comunes

1. `No se pudo conectar a PostgreSQL`
- Verifica servicio activo.
- Verifica `DB_*`.
- Verifica password real de `postgres`.

2. `No module named psycopg2`
- Activa `.venv`.
- Ejecuta `python -m pip install -r requirements.txt`.

3. `psql` no reconocido
- Reinicia terminal tras instalar PostgreSQL.
- Agrega al PATH el `bin` de PostgreSQL.
