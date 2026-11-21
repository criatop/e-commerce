# Accesorios Chic - E-Commerce Microservices

Arquitectura de microservicios para tienda de accesorios femeninos (collares, aros, pulseras, anillos, tobilleras, broches). Frontend React + backend Spring Boot 3.5 integrados bajo un API Gateway único.

> **Estado:** arquitectura limpia (rama `limpieza_Back`). Se eliminaron Kafka, los módulos `ms-inventory`, `ms-review`, `ms-notification` y `ms-analytics`, el checkout de invitado y el envío de precios desde el cliente. Para el contrato completo entre front y back, ver **[docs/integracion-apis.md](docs/integracion-apis.md)**.

## Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Java | 21 | Runtime |
| Spring Boot | 3.5.13 | Framework principal |
| Spring Cloud | 2025.0.0 | Microservicios |
| Spring Cloud Gateway | - | API Gateway |
| Spring Cloud Netflix Eureka | - | Service Discovery |
| OpenFeign | - | Comunicación síncrona (sin Kafka) |
| PostgreSQL | 15 | Base de datos (8 DB separadas) |
| Spring Security + JWT (jjwt 0.12.6) | - | Autenticación HS384, 24h |
| Lombok + MapStruct | - | Boilerplate |
| Docker Compose | - | Orquestación |
| React + TypeScript + Vite | - | Frontend (`frontend-react/`) |
| Vitest + Testing Library | - | Pruebas frontend |

---

## Estructura del Proyecto

```
e-commerce/
├── pom.xml                    # Parent POM (cl.ecommerce:ecommerce-parent)
├── docker-compose.yml         # Servicios: postgres + eureka + gateway + 7 microservicios
│
├── common/                    # DTOs, ApiResponse<T>, seguridad, excepciones
├── eureka/                    # Service Discovery (8761)
├── api-gateway/               # Gateway (9000) + Swagger agregado
│
├── ms-auth/                   # Registro, login, perfil, usuarios, regiones/comunas
├── ms-product/                # Catálogo, stock, categorías, favoritos
├── ms-cart/                   # Carrito por uid + fusión del carrito anónimo
├── ms-order/                  # Órdenes, folio, checkout orquestado, estadísticas
├── ms-payment/                # Pagos idempotentes por orden
├── ms-shipping/               # Envíos y tracking, idempotentes por orden
├── ms-content/                # Noticias (blog) y mensajes de contacto
│
├── frontend-react/            # SPA React + TypeScript
│   └── src/api/               # Cliente HTTP tipado por dominio (auth, cart, catalog, orders, favorites, content)
│
├── init-multi-db/             # Única fuente del esquema (ddl-auto: validate)
└── postman/                   # Colección de la API con login automático
```

Cada microservicio tiene su propia base de datos PostgreSQL y se compila como JAR independiente.

---

## Puertos Externos

| Servicio | Puerto | URL |
|---|---|---|
| **API Gateway** | 9000 | `http://localhost:9000` |
| Eureka Dashboard | 8761 | `http://localhost:8761` |
| PostgreSQL | 5433 | `localhost:5433` (usuario `postgres`, password `123`) |

**Todos los endpoints se acceden a través del Gateway en el puerto 9000.** Swagger UI y `/actuator/health` son públicos.

---

## Cómo Lanzar

### 1. Pre-requisitos
- Docker y Docker Compose
- Java 21 y Maven (o `./mvnw`) para compilar/cambiar código
- Node 18+ y npm para el frontend

### 2. Levantar backend
```bash
docker compose up -d
```
Tardan ~2-3 min (Eureka ~60 s, luego los servicios). Verificar:
```bash
docker ps
curl http://localhost:9000/actuator/health
curl http://localhost:9000/api/v1/products
```

### 3. Levantar frontend
```bash
cd frontend-react
cp .env.example .env      # VITE_API_URL=http://localhost:9000
npm install
npm run dev
```

### 4. Compilar cambios
```bash
./mvnw clean package -DskipTests
docker compose build <nombre-servicio>
docker compose up -d <nombre-servicio>
```

### 5. Reset completo
```bash
docker compose down --volumes
docker compose up -d
```

---

## Base de Datos

Un PostgreSQL con **8 databases** separadas, creadas desde `init-multi-db/00-create-databases.sql`:

| Database | Servicio |
|---|---|
| `auth_db` | ms-auth |
| `products_db` | ms-product |
| `cart_db` | ms-cart |
| `order_db` | ms-order |
| `payment_db` | ms-payment |
| `shipping_db` | ms-shipping |
| `content_db` | ms-content |

`ddl-auto: validate`: Hibernate **no crea ni modifica** tablas; los scripts SQL de `init-multi-db/` son la única fuente del esquema. Cualquier cambio de columna requiere actualizar el script correspondiente.

---

## API Gateway - Endpoints

| Servicio | Prefijo | Ejemplo |
|---|---|---|
| Auth | `/api/v1/auth/` | `POST /api/v1/auth/login` |
| Maestras | `/api/v1/` | `GET /api/v1/regions` |
| Usuarios | `/api/v1/users/` | `GET /api/v1/users` |
| Product | `/api/v1/products/` | `GET /api/v1/products` |
| Categories | `/api/v1/categories/` | `GET /api/v1/categories` |
| Favorites | `/api/v1/favorites/` | `GET /api/v1/favorites` |
| Cart | `/api/v1/cart/` | `GET /api/v1/cart/{uid}` |
| Order | `/api/v1/orders/` | `POST /api/v1/orders/checkout` |
| Payment | `/api/payments/` | `POST /api/payments` |
| Shipping | `/api/shipping/` | `POST /api/shipping` |
| Content | `/api/v1/news/`, `/api/v1/contact/` | `GET /api/v1/news` |

---

## Seguridad y Control de Roles

JWT Bearer + Spring Security + `@PreAuthorize`. Tres roles:

| Rol | Permisos |
|---|---|
| `ADMIN` | Todo: usuarios, categorías, productos, órdenes, estadísticas, contacto |
| `SELLER` | Productos y órdenes |
| `CUSTOMER` | Carrito, checkout, historial propio, favoritos |

| Grupo de endpoints | Acceso |
|---|---|
| `POST /api/v1/auth/register`, `/login`, catálogo GET, `POST /products/batch` | Público |
| `POST /api/v1/auth/admin/register`, categorías POST/PUT/DELETE | Solo ADMIN |
| Productos POST/PUT/DELETE | ADMIN o SELLER |
| Carrito, favoritos, checkout, historial propio | Autenticado (`requireSelfOrAdmin(uid)`) |
| `GET /api/v1/orders`, `/stats` | ADMIN o SELLER |
| `POST /api/v1/products/stock/*` | Solo servicios (clave interna) |

### Identidad y reglas de negocio

- `user_id` = `uid` (id numérico de `ms-auth`), nunca email ni `guest_id`.
- `product_id` = UUID; `sku` se denormaliza en orden/carrito.
- El frontend **nunca envía precios**: `ms-order` los consulta en `ms-product` al hacer checkout.
- Sin compra de invitado; el carrito local se fusiona al iniciar sesión.

Códigos de error: `401` token inválido (cerrar sesión), `403` sin permisos, `400` validación/negocio, `404` no encontrado, `409` conflicto.

---

## Comunicación Síncrona (Feign)

```
ms-cart   ──Feign──> ms-product   (validar producto, precios de lote)
ms-order  ──Feign──> ms-product   (batch, reservar/confirmar/liberar stock)
ms-order  ──Feign──> ms-payment   (crear pago por orderId)
ms-order  ──Feign──> ms-shipping  (crear envío por orderId)
```

No hay ningún broker de mensajes. Ver la justificación en [docs/integracion-apis.md](docs/integracion-apis.md#por-qué-rest-síncrono-y-no-mensajería).

---

## Flujo Completo de Compra

1. `POST /api/v1/auth/login` → JWT + rol.
2. `GET /api/v1/products` → catálogo (público).
3. Carrito local sin sesión; al iniciar sesión `POST /api/v1/cart/{uid}/merge`.
4. `POST /api/v1/orders/checkout` con `items[{productId,quantity}]` + dirección/región/comuna/teléfono + método de pago.
5. `ms-order` orquesta: precios vigentes → reserva de stock → pago → envío → confirmación de stock y orden con folio `CH-YYYYMMDD-NNNNNN`.
6. Si un paso falla, compensaciones automáticas (libera stock, anula pago, cancela envío).
7. `GET /api/v1/orders/user/{uid}` → historial.

Pagos y envíos son idempotentes por `order_id` (`UNIQUE`), por lo que reintentar no duplica cargos ni guías.

---

## Modelos de Datos Principales

- **Producto**: `id UUID`, `sku`, `name`, `description`, `price`, `category UUID`, `imageUrl`, `active`, `stockQuantity`, `reservedQuantity`, `available`, `lowStockThreshold`.
- **Categoría**: `id UUID`, `name`, `description`, `activa`.
- **Orden**: `id UUID`, `folio`, `userId`, `status`, snapshot de cliente/envío, `items[]` (`productId`, `sku`, `unitPrice`, `lineTotal`), `totalAmount`.
- **Carrito**: `id UUID`, `userId`, `items[]`, `totalAmount`.
- **Favorito**: `userId` + `productId` con `UNIQUE(user_id, product_id)`.

---

## Credenciales de Prueba

| Rol | Email | Password |
|---|---|---|
| **ADMIN** | `admin@gmail.com` | `admin123` |
| **SELLER** | `vendedor@gmail.com` | `vend1234` |
| **CUSTOMER** | `camila@gmail.com` | `cliente1` |
| **CUSTOMER** | `diego@gmail.com` | `diego123` |

Sembradas en `init-multi-db/01-create-auth.sql` (BCrypt fuerza 10). Para crear más ADMIN/SELLER:

```
POST /api/v1/auth/admin/register
Authorization: Bearer <token-de-admin>

{ "run": "666666666", "email": "vendedor2@gmail.com", "password": "123456",
  "nombre": "Vendedor", "apellidos": "Nuevo", "rol": "SELLER" }
```

---

## Pruebas

Backend (todos los módulos):
```bash
mvn -o -pl common,ms-auth,ms-product,ms-cart,ms-order,ms-payment,ms-shipping,ms-content -am -Dsurefire.failIfNoSpecifiedTests=false test
```

Frontend:
```bash
cd frontend-react
npm test -- --run
npm run build
npm run lint
```

Colección Postman: importar `postman/Accesorios-Chic.postman_collection.json`. El primer request guarda el JWT automáticamente.

---

## Documentación

- [Guía de integración API](docs/integracion-apis.md) — contratos, roles, diagrama del checkout, compensaciones.
- [Colección Postman](postman/Accesorios-Chic.postman_collection.json) — endpoints listos para ejecutar.
- [Plan de integración](docs/superpowers/plans/2026-11-18-integracion-frontend-backend.md).
- [Diseño de arquitectura](docs/superpowers/specs/2026-11-18-integracion-frontend-backend-design.md).
