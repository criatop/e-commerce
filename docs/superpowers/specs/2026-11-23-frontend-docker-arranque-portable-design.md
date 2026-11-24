# Diseño corto: arranque portable con frontend en Docker

## Intento

Que cualquier PC con **Docker Desktop + JDK 21** levante el stack completo (backend + frontend) con un doble-clic, sin rutas `D:\` fijas y sin instalar Node en la máquina.

## Approaches considerados

1. **Arreglar los `.bat` existentes** — Descartado: `run-all.bat` arranca con `mvnw spring-boot:run` (no Docker) y `docker-setup.bat` usa `down -v` (borra las BD). Reescribirlos casi por completo sale más caro que hacer uno nuevo.
2. **`.bat` portable + Node local** — Descartado por elección del usuario: exige instalar Node/npm en cada PC.
3. **Frontend dentro de Docker (elegido)** — Un solo `docker compose up -d --build` levanta los 11 contenedores; la PC solo necesita Docker + JDK 21 (para generar los JARs, porque los Dockerfiles actuales solo hacen `COPY target/*.jar`).

## Decisiones de implementación

### 1. `frontend-react/Dockerfile` (nuevo)
Multi-stage con Node 22 Alpine (Vite 8 requiere Node ≥ 20.19):

- **build**: `COPY package*.json` → `npm ci` → `COPY . .` → `ARG VITE_API_URL=http://localhost:9000` → `ENV VITE_API_URL=$VITE_API_URL` → `npm run build`.
- **runtime**: copiar `/app` completo desde build (incluye Vite, que es devDependency) y `npm run preview -- --host 0.0.0.0 --port 5173`. Se elige `vite preview` sobre nginx porque ya hace SPA fallback automático (evita 404 al recargar `/admin`) y no requiere un `nginx.conf` extra. Imagen más grande, aceptable para demo.

> `VITE_API_URL` se inyecta en tiempo de **build** (Vite lo reemplaza al compilar). El valor por defecto `http://localhost:9000` es correcto porque el navegador está en la máquina anfitriona. `client.ts` ya tiene el mismo `??` como plan B.

### 2. `frontend-react/.dockerignore` (nuevo)
Excluir `node_modules`, `dist`, `coverage`, `.git`, `*.log`. Sin esto, el `COPY . .` del host (Windows) contaminaría la instalación de Alpine.

### 3. `docker-compose.yml` (modificar: agregar 1 servicio)
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
El CORS del gateway ya permite `http://localhost:5173`, así que no hay que cambiarlo. El compose pasa de 10 a 11 contenedores.

### 4. `levantar-todo.bat` (nuevo, en la raíz)
- `cd /d "%~dp0"` → funciona desde cualquier unidad/carpeta.
- Verifica `docker info` (daemon activo) y `java -version` (JDK presente).
- `call mvnw.cmd clean package -DskipTests` → genera los 9 JARs que copian los Dockerfiles.
- `docker compose up -d --build` → construye las 11 imágenes y levanta todo.
- Espera el health de `http://localhost:9000/actuator/health` y abre `http://localhost:5173`.
- Sin `down -v`, sin rutas absolutas.

### 5. `detener-todo.bat` (nuevo, en la raíz)
`cd /d "%~dp0"` + `docker compose down` (sin `-v`, conserva datos). Contraparte segura del anterior.

## Fuera de alcance (no se toca)

- **Seed de imágenes**: `init-multi-db/02-create-products.sql` sigue con `https://img.tienda/...`. En una PC con volumen vacío volverá el placeholder. NO se corrige en este cambio porque es backend/seed y no fue aprobado; queda como pendiente explícito.
- Scripts viejos (`run-all.bat`, `docker-setup.bat`, `create-databases.bat`, `stop-all.bat`, `init-multi-db/docker_*.bat`): se dejan intactos.
- Código Java, CORS, contrato axios, `.gitignore`: sin cambios.

## Verificación

1. `docker compose config` → sintaxis válida, 11 servicios.
2. En esta PC: detener el vite local si sigue corriendo en `:5173` para liberar el puerto.
3. `levantar-todo.bat` → 11 contenedores Up.
4. `curl http://localhost:9000/actuator/health` → 200; `curl http://localhost:5173/` → 200 con HTML.
5. `curl http://localhost:5173/admin` → 200 con el mismo HTML (SPA fallback).
6. Login `admin@gmail.com/admin123` desde la app en Docker → 200; imágenes `/img/productos/*.jpg` → 200.
7. `detener-todo.bat` → contenedores detenidos, volumen `postgres_data` conservado.

## Riesgos conocidos

- Otra PC con puertos 5173/9000/5433/8761 ocupados → fallo de arranque (se documenta en el `.bat`).
- JDK distinto de 21 → Maven falla con mensaje claro; se documenta el requisito.
- Primera compilación descarga dependencias Maven/npm (lento la primera vez).
