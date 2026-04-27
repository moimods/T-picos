# Documentacion Tecnica del Proyecto MovilWiFi

## 1. Resumen ejecutivo
MovilWiFi es una aplicacion web full-stack basada en Node.js + Express para:
- Autenticacion de usuarios (registro/inicio de sesion).
- Gestion CRUD de redes WiFi por usuario.
- Analisis de riesgo de seguridad de redes (motor basado en reglas con score 0-100).
- Visualizacion de resultados, historial y resumen agregado.

Persistencia local:
- No usa base de datos externa.
- Guarda informacion en archivos JSON dentro de `data/`.

## 2. Stack tecnologico
### Backend
- Node.js
- Express
- express-session
- bcryptjs

### Frontend
- HTML, CSS y JavaScript vanilla
- Render dinamico del dashboard con consumo de API REST

### Persistencia
- Archivos JSON:
  - `data/usuarios.json`
  - `data/redes.json`
  - `data/historial.json`

## 3. Estructura del proyecto
```
wifi_pro/
  data/
    historial.json
    redes.json
    usuarios.json
  public/
    dashboard.html
    dashboard.js
    fondo-montana.svg
    index.html
    login.html
    login.js
    register.html
    register.js
    styles.css
  src/
    server.js
    lib/
      risk-engine.js
      storage.js
      validators.js
    services/
      network-service.js
      user-service.js
  package.json
```

## 4. Arquitectura logica
El sistema sigue un patron por capas:

1. Capa de presentacion (frontend)
- Pantallas HTML + logica JS cliente.
- Consume endpoints REST del backend.

2. Capa de API (server)
- `src/server.js` define rutas, middleware y control de sesion.

3. Capa de dominio/servicios
- `user-service.js`: reglas de autenticacion/registro.
- `network-service.js`: reglas de negocio de redes, analisis, historial y resumen.

4. Capa de utilidades/infra
- `validators.js`: validaciones de entrada.
- `risk-engine.js`: motor de riesgo.
- `storage.js`: lectura/escritura JSON y utilidades de IDs.

## 5. Backend en detalle

## 5.1 `src/server.js`
Responsabilidades:
- Inicializa almacenamiento con `initializeStorage()`.
- Configura middleware de parseo JSON y URL-encoded.
- Configura sesiones con `express-session`.
- Publica estaticos desde `public/`.
- Expone endpoints API.
- Implementa fallback de puertos: intenta `PORT` y hasta 9 puertos adicionales si el inicial esta ocupado.

Autenticacion:
- Middleware `authRequired` bloquea endpoints protegidos cuando no hay `req.session.user`.

## 5.2 API REST
### Configuracion y sesion
- `GET /api/config`: retorna tipos de red y cifrado permitidos.
- `GET /api/me`: estado de autenticacion actual.
- `POST /api/register`: alta de usuario.
- `POST /api/login`: autenticacion.
- `POST /api/logout`: cierre de sesion.

### Redes (protegidos)
- `GET /api/networks`: listar redes del usuario.
- `POST /api/networks`: crear red.
- `PUT /api/networks/:id`: actualizar red.
- `DELETE /api/networks/:id`: eliminar red.
- `POST /api/networks/:id/analyze`: analizar red individual.
- `POST /api/networks/analyze-all`: analizar todas las redes del usuario.
- `GET /api/networks/:id/history`: historial de analisis por red.
- `GET /api/summary`: resumen global por nivel de riesgo.

## 5.3 Servicio de usuarios (`src/services/user-service.js`)
- Registro:
  - valida existencia previa por username (case-insensitive).
  - hashea password con bcrypt (salt rounds = 10).
- Login:
  - busca usuario por username.
  - compara password plano vs hash.

Campos persistidos de usuario:
- `id`
- `username`
- `password_hash`
- `created_at`

## 5.4 Servicio de redes (`src/services/network-service.js`)
Funciones principales:
- CRUD de redes por `user_id`.
- Analisis individual y masivo usando `analyzeNetwork()`.
- Persistencia de ultimo resultado (`last_score`, `last_level`, `last_indicator`).
- Registro de historico por analisis.
- Resumen agregado por niveles.

Campos persistidos de red:
- `id`, `user_id`, `name`, `network_type`, `encryption`, `password`
- `last_score`, `last_level`, `last_indicator`
- `created_at`, `updated_at`

Campos de historial:
- `id`, `network_id`, `user_id`, `score`, `level`, `indicator`, `created_at`

## 5.5 Motor de riesgo (`src/lib/risk-engine.js`)
Funciones publicas principales:
- `calcularRiesgo(red)`
- `clasificarRiesgo(score)`
- `obtenerColor(score)`
- `generarRecomendaciones(red, score)`
- `analizarRed(red)`
- `analizarTodas(redes)`

Compatibilidad:
- expone tambien `analyzeNetwork(...)` para integrarse con servicios existentes.

Reglas implementadas:
- Tipo de red:
  - publica: +30
  - privada: +0
- Cifrado:
  - none: +40
  - wep: +30
  - wpa: +20
  - wpa2: +10
  - wpa3: +0
- Password:
  - vacia: +30
  - longitud < 8: +20
- Nombre sospechoso (`free|wifi|public`): +20
- Score final limitado a 100.

Clasificacion:
- 0-39: SEGURO
- 40-69: MEDIO
- 70-100: ALTO

Colores:
- SEGURO: `#16a34a`
- MEDIO: `#f59e0b`
- ALTO: `#dc2626`

Recomendaciones:
- Derivadas de cifrado, tipo, password y nombre de red.

## 5.6 Validaciones (`src/lib/validators.js`)
- Login: usuario y password obligatorios.
- Registro:
  - todos los campos obligatorios.
  - username minimo 3.
  - password minimo 6.
  - confirmacion igual a password.
- Red:
  - nombre obligatorio.
  - tipo en `['Pública', 'Privada']`.
  - cifrado en `['Ninguno', 'WEP', 'WPA', 'WPA2', 'WPA3']`.

## 5.7 Persistencia (`src/lib/storage.js`)
- Crea directorio/archivos si no existen.
- Lectura segura de JSON con fallback a contenido por defecto si hay corrupcion.
- `nextId(items)` calcula IDs incrementales.

## 6. Frontend en detalle

## 6.1 Rutas/paginas
- `public/index.html`: redireccion inmediata a login.
- `public/login.html` + `public/login.js`: autenticacion.
- `public/register.html` + `public/register.js`: alta de usuario.
- `public/dashboard.html` + `public/dashboard.js`: gestion y analitica.

## 6.2 Flujo de login (`login.js`)
- Envio a `POST /api/login`.
- Estado de carga en boton (`Cargando...`).
- Soporte opcional de remember user (`localStorage`).
- Si ya existe sesion (`/api/me` autenticado), redirecciona a dashboard.

## 6.3 Flujo de registro (`register.js`)
- Envio a `POST /api/register`.
- Estado de carga en boton.
- Guarda mensaje flash en `localStorage` y redirige a login.
- Si ya hay sesion activa, redirecciona a dashboard.

## 6.4 Dashboard (`dashboard.js`)
Responsabilidades:
- Carga configuracion (`/api/config`).
- Lista redes (`/api/networks`) y sincroniza seleccion con formulario.
- Ejecuta CRUD sobre redes.
- Ejecuta analisis individual/masivo.
- Actualiza visual del riesgo con `updateUI(resultado)`:
  - nivel
  - score
  - barra porcentual
  - color
  - recomendaciones
- Carga historial (`/api/networks/:id/history`) y resumen (`/api/summary`).

## 6.5 Estilos (`public/styles.css`)
- Define estilos globales de app y auth.
- Dashboard: tarjetas, tabla, resumen, indicadores de riesgo.
- Auth: layout con fondo de montaña (`fondo-montana.svg`) y paneles visuales.

## 7. Modelo de datos (JSON)

## 7.1 `usuarios.json`
```json
{
  "users": [
    {
      "id": 1,
      "username": "admin",
      "password_hash": "...",
      "created_at": "2026-04-26T12:00:00"
    }
  ]
}
```

## 7.2 `redes.json`
```json
{
  "networks": [
    {
      "id": 1,
      "user_id": 1,
      "name": "MiRed",
      "network_type": "Pública",
      "encryption": "WPA2",
      "password": "12345678",
      "last_score": 40,
      "last_level": "MEDIO",
      "last_indicator": "🟠",
      "created_at": "2026-04-26T12:00:00",
      "updated_at": "2026-04-26T12:10:00"
    }
  ]
}
```

## 7.3 `historial.json`
```json
{
  "history": [
    {
      "id": 1,
      "network_id": 1,
      "user_id": 1,
      "score": 40,
      "level": "MEDIO",
      "indicator": "🟠",
      "created_at": "2026-04-26T12:10:00"
    }
  ]
}
```

## 8. Seguridad y consideraciones tecnicas
- Passwords hasheadas con bcrypt.
- Sesion en cookie con expiracion de 8 horas.
- Endpoints protegidos por middleware de autenticacion.
- Validaciones basicas en backend antes de persistir.

Limitaciones actuales:
- Sesiones almacenadas en memoria (no recomendado para produccion distribuida).
- Persistencia en JSON local (sin concurrencia avanzada ni transacciones reales).
- No hay CSRF token ni rate-limiting.

## 9. Ejecucion y operacion
Comandos:
- `npm install`
- `npm start`

Entrada principal:
- `src/server.js`

Puerto:
- `PORT` por variable de entorno (default 3000)
- fallback automatico a puertos siguientes si el base esta ocupado.

## 10. Observaciones de mantenimiento
- Existe documentacion historica orientada a Python/PostgreSQL en `INSTALACION_COMPLETA_WINDOWS.md`; no representa el runtime actual Node/JSON.
- El nombre visible de marca en frontend es MovilWiFi.
- Para evolucionar a produccion se recomienda:
  - migrar persistencia a DB real (PostgreSQL/MySQL).
  - usar store de sesiones externo (Redis).
  - agregar tests unitarios/integracion.
  - agregar control de errores centralizado y observabilidad.
