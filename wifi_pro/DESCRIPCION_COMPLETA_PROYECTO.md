# Descripcion completa del proyecto WiFi Pro - Security Analyzer

## 1. Resumen

WiFi Pro es una aplicacion de escritorio en Python con Tkinter (ttk), diseñada para uso academico y demostraciones de ciberseguridad.

La aplicacion permite:

- autenticar usuarios con registro local
- gestionar redes WiFi por usuario
- analizar el riesgo de cada red con un sistema de puntuacion realista
- guardar historial de analisis
- visualizar resultados en un dashboard moderno

Todo funciona de forma local, sin PostgreSQL ni servicios externos.

## 2. Objetivo

Simular un analizador de seguridad WiFi educativo que combine usabilidad, diseño profesional y arquitectura modular.

## 3. Tecnologias

- Python 3.x
- Tkinter + ttk
- JSON para almacenamiento local
- bcrypt para hash de contraseñas

Dependencias:

- bcrypt>=4.2.0

## 4. Requisitos funcionales implementados

### Autenticacion

- Login y registro en la misma pantalla.
- Usuarios almacenados en `data/usuarios.json`.
- Passwords hasheadas con bcrypt.
- Validacion de credenciales y mensajes amigables.

### Gestion de redes WiFi

- Alta, edicion y eliminacion de redes.
- Campos por red:
  - nombre
  - tipo (`Pública` / `Privada`)
  - cifrado (`Ninguno`, `WEP`, `WPA`, `WPA2`, `WPA3`)
  - contraseña opcional
- Tabla central con Treeview.

### Analisis de seguridad

Sistema de puntuacion implementado:

- Pública: +40
- Ninguno: +50
- WEP: +40
- WPA: +25
- WPA2: +10
- WPA3: +0
- Contraseña debil (<8): +20

Clasificacion implementada:

- 0-30: SEGURO (🟢)
- 31-70: RIESGO MEDIO (🟠)
- 71-100: ALTO RIESGO (🔴)

Se muestra:

- puntaje numerico
- nivel de riesgo
- indicador visual y color

### Historial

- Cada analisis se guarda en `data/historial.json`.
- Se muestra historial basico por red seleccionada.

### UX y visual

- Estilos ttk personalizados (tema claro, tarjetas, botones).
- Barra de progreso para simular analisis.
- Validaciones de campos y feedback claro.

### Extra solicitado

- Boton "Analizar todo".
- Resumen dashboard:
  - total de redes
  - seguras
  - riesgo medio
  - alto riesgo

## 5. Arquitectura modular

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

## 6. Flujo de uso

1. Usuario abre la app.
2. Se registra o inicia sesion.
3. En dashboard, crea/edita/elimina redes.
4. Analiza una red o todas.
5. Observa puntaje, nivel y color.
6. Revisa historial por red y resumen general.

## 7. Almacenamiento local

### usuarios.json

Guarda usuarios con:

- id
- username
- password_hash (bcrypt)
- created_at

### redes.json

Guarda redes por usuario con:

- id
- user_id
- name
- network_type
- encryption
- password (opcional)
- last_score
- last_level
- last_indicator
- created_at
- updated_at

### historial.json

Guarda analisis con:

- id
- network_id
- user_id
- score
- level
- indicator
- created_at

## 8. Ejecucion

PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\iniciar_proyecto.ps1
```

Git Bash:

```bash
bash ./iniciar_proyecto.sh
```

Manual:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe .\main.py
```

## 9. Calidad y mantenibilidad

- Logica de UI separada de controladores.
- Logica de negocio separada del almacenamiento.
- Funciones pequenas con responsabilidad clara.
- Validaciones centralizadas.

## 10. Alcance final

El proyecto cumple los parametros solicitados:

- aplicacion desktop con Tkinter/ttk
- diseño moderno y presentable
- JSON local como persistencia
- autenticacion segura con bcrypt
- analisis por puntaje realista
- historial + analisis general + dashboard
- sin bases de datos externas y sin frameworks web
