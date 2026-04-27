# Documentacion Completa de la Logica del Dashboard (dashboard.html)

## 1. Objetivo del dashboard
El dashboard es la vista principal de la aplicacion MovilWiFi para:
- Gestionar redes WiFi (crear, editar, eliminar).
- Analizar riesgo de una red o de todas las redes.
- Visualizar resultado de seguridad (nivel, score, porcentaje, color, recomendaciones).
- Consultar historial por red.
- Ver resumen global (total, seguras, medio, alto).

Aunque la estructura visual esta en `public/dashboard.html`, la logica de comportamiento se ejecuta en `public/dashboard.js`.

## 2. Estructura de `dashboard.html`

### 2.1 Header (sesion)
Elementos principales:
- `#usernameLabel`: muestra el usuario autenticado.
- `#btnLogout`: cierra la sesion.

### 2.2 Bloque de gestion de red
Campos:
- `#networkName`: nombre de red.
- `#networkType`: tipo de red (select).
- `#networkEncryption`: cifrado (select).
- `#networkPassword`: password.

Acciones:
- `#btnAnalyzeSelected`: analiza la red seleccionada.
- `#btnAdd`: agrega nueva red.
- `#btnUpdate`: actualiza red seleccionada.
- `#btnDelete`: elimina red seleccionada.
- `#btnClear`: limpia formulario y seleccion.

### 2.3 Bloque de resultado de seguridad
Elementos:
- `#riskLevel`: nivel textual (SEGURO, MEDIO, ALTO) + indicador.
- `#riskScore`: score numerico, por ejemplo `72 / 100`.
- `#riskFill`: barra de progreso interna (ancho porcentual).
- `#riskPercent`: porcentaje textual, por ejemplo `72%`.
- `#riskRecommendations`: lista de recomendaciones automáticas.
- `#btnAnalyzeAll`: analiza todas las redes y muestra el peor caso.

### 2.4 Tabla de redes
- `#networksTableBody`: se llena dinamicamente con filas de redes.
- Al hacer click en una fila, se marca seleccion y se cargan datos al formulario.

### 2.5 Resumen general
- `#sumTotal`, `#sumSafe`, `#sumMedium`, `#sumHigh`.

### 2.6 Historial
- `#historyList`: historial de analisis de la red seleccionada.

### 2.7 Mensajes de estado global
- `#statusMessage`: feedback operativo (exito/error).

## 3. Flujo general de ejecucion

1. Se carga `dashboard.html`.
2. Se ejecuta `bootstrap()` en `dashboard.js`.
3. `bootstrap()` valida sesion con `GET /api/me`.
4. Si no hay sesion, redirige a `login.html`.
5. Si hay sesion:
   - Muestra usuario en `#usernameLabel`.
   - Registra eventos con `bindDashboard()`.
   - Carga configuracion con `loadConfig()`.
   - Refresca datos visibles con `refreshDashboard()`.
   - Muestra mensaje flash de `localStorage` si existe.

## 4. Funciones clave en `dashboard.js`

## 4.1 `setStatus(message, isError)`
Actualiza el texto de `#statusMessage` y agrega/quita clase `error` para indicar fallo.

## 4.2 `api(path, options)`
Wrapper de `fetch` para todas las llamadas API:
- Envia JSON.
- Parsea respuesta.
- Si hay error HTTP o `ok: false`, lanza excepcion.
- Si es `401`, redirige a `login.html`.

## 4.3 `updateUI(resultado)`
Funcion central de integracion visual del analisis.
Recibe un objeto resultado y actualiza:
- `#riskLevel`
- `#riskScore`
- `#riskFill`
- `#riskPercent`
- `#riskRecommendations`

Estructura esperada de `resultado`:

```js
{
  score: number,
  nivel: "SEGURO" | "MEDIO" | "ALTO",
  color: string,
  recomendaciones: string[],
  indicator?: string
}
```

Si `recomendaciones` esta vacio, muestra un mensaje por defecto.

## 4.4 `clearForm()`
- Limpia inputs del formulario.
- Resetea selects.
- Quita seleccion en la tabla.
- Deja `selectedNetworkId` en `null`.

## 4.5 `loadConfig()`
Llama `GET /api/config` y rellena:
- opciones de `#networkType`
- opciones de `#networkEncryption`

## 4.6 `loadNetworks()`
Llama `GET /api/networks`, renderiza filas en la tabla y enlaza evento click por fila para:
- establecer `selectedNetworkId`
- cargar los datos de la red al formulario
- marcar fila seleccionada
- cargar historial de esa red

## 4.7 `loadSummary()`
Llama `GET /api/summary` y actualiza contadores de resumen.

## 4.8 `loadHistory()`
- Si no hay red seleccionada, muestra "Sin selección de red.".
- Si hay red, llama `GET /api/networks/:id/history`.
- Renderiza entradas de historial en formato fecha + indicador + score.

## 4.9 `refreshDashboard()`
Ejecuta en paralelo:
- `loadNetworks()`
- `loadSummary()`
- `loadHistory()`

## 4.10 `bindDashboard()`
Registra todos los listeners de botones:
- `#btnAdd` -> `POST /api/networks`
- `#btnUpdate` -> `PUT /api/networks/:id`
- `#btnDelete` -> `DELETE /api/networks/:id`
- `#btnAnalyzeSelected` -> `POST /api/networks/:id/analyze` + `updateUI()`
- `#btnAnalyzeAll` -> `POST /api/networks/analyze-all` + seleccion de score mas alto + `updateUI()`
- `#btnClear` -> limpia formulario
- `#btnLogout` -> `POST /api/logout` y redireccion

## 5. Endpoints consumidos por el dashboard
- `GET /api/me`
- `GET /api/config`
- `GET /api/networks`
- `POST /api/networks`
- `PUT /api/networks/:id`
- `DELETE /api/networks/:id`
- `POST /api/networks/:id/analyze`
- `POST /api/networks/analyze-all`
- `GET /api/networks/:id/history`
- `GET /api/summary`
- `POST /api/logout`

## 6. Relacion HTML <-> JavaScript
El dashboard depende de IDs del DOM. Si cambias un `id` en `dashboard.html`, debes actualizar la referencia correspondiente en `dashboard.js`.

IDs criticos:
- Formulario: `networkName`, `networkType`, `networkEncryption`, `networkPassword`
- Resultado: `riskLevel`, `riskScore`, `riskFill`, `riskPercent`, `riskRecommendations`
- Tabla/Historial: `networksTableBody`, `historyList`
- Resumen: `sumTotal`, `sumSafe`, `sumMedium`, `sumHigh`
- Sesion/estado: `usernameLabel`, `statusMessage`, `btnLogout`

## 7. Manejo de estados y UX
- Mensajes de exito/error por operacion en `#statusMessage`.
- Proteccion de acciones que requieren seleccion de red.
- Refresco automatico despues de operaciones CRUD o analisis.
- Redireccion automatica al login cuando sesion expira.

## 8. Ejemplo de ciclo completo (analizar red seleccionada)
1. Usuario hace click en una fila de la tabla.
2. Se guarda `selectedNetworkId` y se rellena el formulario.
3. Usuario pulsa `Analizar`.
4. Front hace `POST /api/networks/:id/analyze`.
5. El backend retorna score, nivel, color, recomendaciones.
6. `updateUI(resultado)` actualiza panel de seguridad.
7. Se refrescan tabla/resumen/historial.

## 9. Observaciones de mantenimiento
- La vista esta orientada a arquitectura API-first.
- Toda regla de negocio vive en backend; frontend solo pinta resultado.
- Para ampliar analisis (nuevos factores), idealmente extender backend y mantener `updateUI()` estable.
