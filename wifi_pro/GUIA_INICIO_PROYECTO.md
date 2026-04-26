# Guía de inicio del proyecto WiFi Pro

Este documento explica cómo iniciar la aplicación WiFi Pro en su versión actual con Node.js.

---

## 1. Requisitos

Antes de iniciar, asegúrate de tener instalado:

- Node.js LTS
- npm

Puedes verificarlo con:

```powershell
node --version
npm --version
```

---

## 2. Estructura del proyecto

La aplicación se ejecuta desde la carpeta raíz del proyecto:

- `package.json` contiene el servidor Node.js
- `src/server.js` inicia la aplicación
- `public/` contiene la interfaz web
- `data/` guarda usuarios, redes e historial en JSON

---

## 3. Instalación de dependencias

Abre una terminal en la carpeta del proyecto y ejecuta:

```powershell
npm install
```

Esto instalará:

- `express`
- `express-session`
- `bcryptjs`

---

## 4. Formas de iniciar el proyecto

### Opción recomendada en Windows

Ejecuta el script de PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\iniciar_proyecto.ps1
```

Este script:

1. Verifica que Node.js y npm estén instalados
2. Instala las dependencias
3. Arranca la aplicación

### Opción en Bash o Git Bash

```bash
bash ./iniciar_proyecto.sh
```

Este script hace lo mismo en entornos Bash.

### Opción manual

Si prefieres hacerlo paso a paso:

```powershell
npm install
npm start
```

---

## 5. Abrir la aplicación

Una vez iniciado el servidor, abre en el navegador:

```text
http://localhost:3000
```

Ahí verás:

- Pantalla de inicio de sesión
- Registro de usuario
- Dashboard de redes WiFi
- Análisis de riesgo
- Historial y resumen

---

## 6. Primer uso

### Registro

Si es tu primera vez:

1. Escribe un usuario
2. Escribe una contraseña
3. Confirma la contraseña
4. Presiona `Registrarse`

### Inicio de sesión

1. Ingresa usuario y contraseña
2. Presiona `Ingresar`
3. Accede al dashboard

---

## 7. Uso básico del dashboard

### Agregar una red

1. Escribe el nombre de la red
2. Elige el tipo: `Pública` o `Privada`
3. Selecciona el cifrado
4. Agrega la contraseña si aplica
5. Presiona `Agregar`

### Analizar una red

1. Selecciona una red de la tabla
2. Presiona `Analizar`
3. Revisa el resultado, puntaje y barra de progreso

### Analizar todas las redes

1. Presiona `Analizar todo`
2. El sistema evaluará todas las redes registradas
3. Verás el resultado más riesgoso

### Editar o eliminar

1. Selecciona una red
2. Modifica los datos si deseas editarla
3. Presiona `Editar` o `Eliminar`

---

## 8. Datos guardados

La información se guarda localmente en JSON dentro de `data/`:

- `usuarios.json`
- `redes.json`
- `historial.json`

Esto significa que:

- no necesitas base de datos externa
- no necesitas PostgreSQL
- todo queda en tu máquina

---

## 9. Solución de problemas

### No abre la aplicación

Verifica que Node.js esté instalado correctamente:

```powershell
node --version
npm --version
```

### Error al instalar dependencias

Vuelve a ejecutar:

```powershell
npm install
```

### El puerto 3000 está ocupado

Cierra la aplicación que use ese puerto o cambia el valor de `PORT` antes de iniciar.

### Los datos no aparecen

Revisa la carpeta `data/` y confirma que los archivos JSON existan.

---

## 10. Resumen rápido

```powershell
npm install
npm start
```

Luego abre:

```text
http://localhost:3000
```

---

## 11. Resultado esperado

Al iniciar correctamente, el proyecto debe mostrar:

- Header azul con el título `WiFi Pro - Security Analyzer`
- Formulario para agregar redes
- Tarjeta de resultado con puntaje y barra
- Tabla de redes
- Resumen e historial

---

**WiFi Pro está listo para usarse.**
