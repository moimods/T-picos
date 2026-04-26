# Arquitectura y rutas del proyecto

## Enfoque general

La aplicacion sigue una arquitectura por capas para mantener separadas la interfaz, la logica de negocio y el acceso a datos.

No usa PostgreSQL ni servicios externos. Toda la persistencia se realiza en JSON local.

## Estructura actual

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
├── iniciar_proyecto.ps1
├── iniciar_proyecto.sh
└── requirements.txt
```

## Responsabilidad por modulo

- `main.py`: punto de entrada y orquestacion de vistas/controladores.
- `controllers/auth_controller.py`: login y registro con validaciones.
- `controllers/dashboard_controller.py`: CRUD, analisis individual/general, historial y resumen.
- `models/storage.py`: utilidades para lectura/escritura JSON y creacion de archivos.
- `models/user_model.py`: persistencia de usuarios y verificacion de password con bcrypt.
- `models/network_model.py`: persistencia de redes y del historial de analisis.
- `security/risk_engine.py`: reglas de puntaje y clasificacion de riesgo.
- `ui/login_view.py`: pantalla de autenticacion.
- `ui/dashboard_view.py`: dashboard principal (formulario, tabla, resultado, historial, resumen).
- `utils/validators.py`: validaciones de entrada para auth y redes.

## Flujo principal

1. `main.py` inicializa almacenamiento local (`data/*.json`).
2. Se muestra `LoginView`.
3. `AuthController` valida login o registro.
4. Si el login es exitoso, se abre `DashboardView`.
5. `DashboardController` gestiona CRUD, analisis y resumen.
6. Cada analisis se guarda en `historial.json`.

## Persistencia local

- `data/usuarios.json`: usuarios y hash de contraseña.
- `data/redes.json`: redes por usuario.
- `data/historial.json`: historial de puntajes por red.

## Comandos recomendados

```powershell
powershell -ExecutionPolicy Bypass -File .\iniciar_proyecto.ps1
```

```bash
bash ./iniciar_proyecto.sh
```
