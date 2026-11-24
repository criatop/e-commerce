# Arranque Portable (frontend en Docker) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que cualquier PC con Docker + JDK 21 pueda levantar backend y frontend con un solo `.bat`, sin rutas absolutas ni pasos manuales, mostrando además las fotos reales de producto desde el primer arranque.

**Architecture:** El backend sigue en 10 contenedores con JARs compilados en el host (los Dockerfiles son `JRE + COPY target/*.jar`). Se agrega un 11º servicio `frontend` con imagen multi-stage `node:22-alpine` que compila el build de Vite y lo sirve con `vite preview --host 0.0.0.0 --port 5173` (SPA fallback incluido). Un `.bat` de arranque hace `cd /d %~dp0`, compila con `mvnw.cmd`, levanta con `docker compose up -d --build` (sin `-v`) y abre el navegador.

**Tech Stack:** Docker Compose, Java 21 + Maven Wrapper, Node 22 / Vite 8, React 19, axios ^1.21.1, PostgreSQL 15, Windows Batch.

**Spec:** `docs/superpowers/specs/2026-11-23-frontend-docker-arranque-portable-design.md`

## Global Constraints

- Todo path del `.bat` debe ser relativo al directorio del script (`cd /d "%~dp0"`). Prohibido `D:\Proyectos\e-commerce` y `C:\Users\...`.
- Nunca usar `docker compose down -v` ni `docker-compose down -v` (los datos de BD se conservan).
- Puerto frontend 5173 (CORS del gateway solo permite `http://localhost:5173`).
- `VITE_API_URL=http://localhost:9000` se inyecta en tiempo de build de la imagen del frontend.
- No tocar: scripts viejos (`run-all.bat`, `docker-setup.bat`, `create-databases.bat`, `stop-all.bat`, `init-multi-db/docker_*.bat`), código Java, CORS, `client.ts`/axios, `.gitignore`.
- Redacción: decir "importamos la librería axios", nunca "migramos de fetch a axios".
- No hacer commit salvo que se pida.

## Review Focus

- **Primera install en PC vacía:** `npm ci` requiere `package-lock.json` presente y sin `node_modules` host contaminando el build → cubierto por Task 1 (`.dockerignore`).
- **Recarga de SPA en `/admin`:** si el servidor estático no hace fallback, da 404 → cubierto por Task 3 (`curl /admin` debe devolver el HTML).
- **Seed con URLs falsas:** volumen `postgres_data` nuevo recrea `https://img.tienda/...` y las fotos no salen → cubierto por Task 2 (seed corregido).
- **Puerto 5173 ocupado por un vite local:** el contenedor no puede arrancar → cubierto por Task 3 (verificar/liberar antes de levantar).
- **JDK distinto de 21:** `mvnw` compila pero los Dockerfiles son `temurin:21-jre` → cubierto por Task 4 (`java -version` en el `.bat`).

---

### Task 1: Imagen del frontend

**Files:**
- Create: `frontend-react/Dockerfile`
- Create: `frontend-react/.dockerignore`

**Interfaces:**
- Produces: imagen `ecommerce-frontend` expuesta en `0.0.0.0:5173`, con `ARG VITE_API_URL` en build.

- [x] **Step 1: Escribir `frontend-react/.dockerignore`**

```
node_modules
dist
coverage
.git
*.log
```

- [x] **Step 2: Escribir `frontend-react/Dockerfile`**

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=http://localhost:9000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=build /app ./
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
```

Nota: se copia `/app` completo (incluye `vite`, que es devDependency) para que `npm run preview` exista sin instalar de nuevo.

- [x] **Step 3: Verificar sintaxis**

Run: `cd D:\Proyectos\e-commerce\frontend-react && docker build --build-arg VITE_API_URL=http://localhost:9000 -t ecommerce-frontend .`
Expected: exit 0, imagen creada.

### Task 2: Corregir seed de imágenes

**Files:**
- Modify: `init-multi-db/02-create-products.sql:60-79`

**Interfaces:**
- Consumes: mapeo de 20 SKUs ya aplicado a la BD local.
- Produces: mismo `imagen_url` en cualquier BD nueva creada desde el seed.

- [x] **Step 1: Reemplazar las 20 URLs `https://img.tienda/...` por rutas `/img/productos/...`**

Mapeo exacto (SKU → archivo):
`COL-001→collar1.jpg`, `COL-002→collar2.jpg`, `COL-003→collar3.jpg`, `ARO-001→aros1.jpg`, `ARO-002→diadema5.jpg`, `ARO-003→collar2.jpg`, `PUL-001→pulsera.jpg`, `PUL-002→pulsera2.jpg`, `PUL-003→pulsera3.jpg`, `ANI-001→collar4.jpg`, `ANI-002→aros1.jpg`, `ANI-003→collar3.jpg`, `TOB-001→pulsera5.jpg`, `TOB-002→llavero1.jpg`, `BRC-001→diadema2.jpeg`, `BRC-002→diadema4.jpeg`, `COL-004→collar4.jpg`, `ARO-004→pulsera4.jpg`, `PUL-004→pulsera4.jpg`, `ANI-004→pulsera2.jpg`.

- [x] **Step 2: Verificar que no queden URLs falsas**

Run: `grep -n "img.tienda" init-multi-db/02-create-products.sql`
Expected: 0 coincidencias.

### Task 3: Servicio frontend en Compose

**Files:**
- Modify: `docker-compose.yml:161` (añadir servicio al final)

**Interfaces:**
- Consumes: imagen `ecommerce-frontend` de Task 1.
- Produces: 11º servicio `frontend`, puerto host 5173.

- [x] **Step 1: Agregar el servicio `frontend`**

```yaml
  frontend:
    build:
      context: ./frontend-react
      args:
        VITE_API_URL: http://localhost:9000
    image: ecommerce-frontend
    container_name: frontend
    ports:
      - "5173:5173"
    depends_on:
      - api-gateway
    networks:
      - ecommerce-network
```

- [x] **Step 2: Validar Compose**

Run: `cd D:\Proyectos\e-commerce && docker compose config --services`
Expected: 11 líneas, incluyendo `frontend`.

### Task 4: Scripts .bat de arranque y parada

**Files:**
- Create: `levantar-todo.bat`
- Create: `detener-todo.bat`

**Interfaces:**
- Consumes: servicios de Task 3 y JDK 21 del host.
- Produces: arranque/parada reproducibles sin rutas fijas.

- [x] **Step 1: Escribir `levantar-todo.bat`**

Contenido: `@echo off`, `cd /d "%~dp0"`, verificar `docker info >nul 2>&1` y `java -version`, `call mvnw.cmd clean package -DskipTests`, `docker compose up -d --build`, `docker compose ps`, `start "" http://localhost:5173`. Sin `-v`.

- [x] **Step 2: Escribir `detener-todo.bat`**

Contenido: `@echo off`, `cd /d "%~dp0"`, `docker compose down`, `docker compose ps`. Sin `-v`.

- [x] **Step 3: Verificar que no haya rutas absolutas**

Run: `grep -nE "[A-Z]:\\\\" levantar-todo.bat detener-todo.bat`
Expected: 0 coincidencias.

### Task 5: Verificación integral en vivo

**Files:** (ninguno; solo ejecución)

- [x] **Step 1: Liberar puerto 5173 si hay un vite local corriendo**

- [x] **Step 2: Ejecutar `levantar-todo.bat`**
Expected: 11 contenedores Up.

- [x] **Step 3: Comprobar endpoints**

Run:
```
curl http://localhost:9000/actuator/health
curl http://localhost:5173/
curl http://localhost:5173/admin
```
Expected: health 200; `/` y `/admin` devuelven el mismo HTML (SPA fallback).

- [x] **Step 4: Comprobar login e imágenes**

Login `admin@gmail.com/admin123` → 200; `curl -I http://localhost:5173/img/productos/collar1.jpg` → 200.

- [x] **Step 5: Ejecutar `detener-todo.bat`**
Expected: contenedores detenidos, volumen `postgres_data` conservado.
