# Diseño: integración frontend ↔ backend y limpieza de microservicios

Fecha: 2026-11-18
Rama: `limpieza_Back`
Enfoque elegido: **Opción B — ajustado al frontend**
Revisión: 2 (incorpora el builder-check)

## 1. Intención y por qué

El frontend React funciona hoy 100% sobre `localStorage` (11 claves `chic_*`, contraseñas en texto plano, cero llamadas HTTP). El backend Spring Boot es un proyecto antiguo con 11 microservicios, 10 bases PostgreSQL y tablas que el frontend nunca usa. La evaluación N°3 exige integrar ambos: REST versionada, Swagger, JWT con roles, sesión persistente y restricciones de vista por rol.

El objetivo es que **el backend se adapte al modelo de datos que el frontend ya tiene**, no reescribir el frontend para un modelo ajeno. Se elimina todo microservicio cuyo dominio no exista en la tienda.

## 2. Objetivos

- Un único contrato REST versionado (`/api/v1/...`) consumido por el frontend con `fetch`.
- JWT con roles `ADMIN`, `SELLER`, `CUSTOMER`, sesión persistente tras recargar.
- Modelo de datos que cubra las 11 claves `chic_*` (9 tablas + sesión).
- Swagger en cada microservicio que se queda.
- Restricciones de vista por rol según el anexo: ADMIN todo; SELLER solo productos y órdenes; CUSTOMER solo tienda.

## 3. No objetivos

- No se reescribe el backend en otro framework ni se cambia PostgreSQL.
- No se implementa pasarela de pago real: `payments` simula la transacción.
- No se implementan envíos reales: `shipments` guarda estado y tracking.
- No se migran datos históricos de `localStorage` (son datos de semilla).
- No se toca la carpeta `frontend/` (versión vanilla antigua); se declarará obsoleta aparte.

## 4. Anti-objetivos (fallo aunque compile)

- Dejar dos fuentes de verdad (localStorage y API) para el mismo dato.
- Mantener contraseñas en texto plano o en localStorage.
- Un microservicio sin ninguna entidad ni endpoint usado por el frontend.
- Endpoints sin versión o sin documentación Swagger.
- Que un SELLER pueda entrar por URL directa a usuarios, categorías o dashboard.
- Endpoints internos abiertos (`permitAll`) para que los microservicios se hablen.

## 5. Restricciones

- Spring Boot + PostgreSQL (ya montado, puerto 5433, `postgres/123`).
- **Una sola fuente de esquema**: los scripts de `init-multi-db/` definen tablas, constraints e índices. `ddl-auto` pasa de `update` a `validate` en los 8 servicios que se quedan. No hay `ALTER TABLE` idempotente: en desarrollo se recrean las bases con los scripts.
- JWT ya implementado en `common` (jjwt 0.12.6, HS384, 24 h). Se agrega el claim `uid`.
- Envoltorio de respuesta existente: `ApiResponse<T> { exitoso, datos, mensaje, timestamp }`.
- Frontend React 19 + Vite 8. No tiene axios instalado; se usa `fetch` nativo.
- Roles con ids explícitos 1/2/3 (`ADMIN`, `SELLER`, `CUSTOMER`) fijados en el `INSERT`, no por orden de inserción.

## 6. Alternativas consideradas

| Opción | Qué hace | Por qué no |
|---|---|---|
| A — Conservador | Mantiene los 11 servicios y solo agrega tablas | Deja 4 servicios que el frontend nunca llama; el inventario obliga a un request extra por producto |
| **B — Ajustado al frontend** | Elimina inventario/reseñas/notificaciones/analítica; crea `ms-content` | **Elegida por el usuario** |
| C — Mínimo | Además fusiona pagos y envíos dentro de órdenes | Pierde granularidad y desarma código ya escrito y funcional |

## 7. Arquitectura objetivo

### Se quedan (8 + infraestructura)

| Servicio | Base | Responsabilidad |
|---|---|---|
| `api-gateway` (9000) | — | Enrutamiento `/api/v1/**`, CORS |
| `eureka` | — | Descubrimiento |
| `ms-auth` | `auth_db` | Usuarios, roles, regiones, comunas, auditoría, JWT |
| `ms-product` | `products_db` | Categorías, productos (con stock), imágenes, favoritos |
| `ms-cart` | `cart_db` | Carrito por usuario |
| `ms-order` | `order_db` | Órdenes, ítems, orquestación del checkout, métricas |
| `ms-payment` | `payment_db` | Registro de pagos simulados |
| `ms-shipping` | `shipping_db` | Envíos y tracking |
| `ms-content` (nuevo) | `content_db` | Blog (`news` + párrafos) y mensajes de contacto |

### Se eliminan

`ms-inventory`, `ms-review`, `ms-notification`, `ms-analytics` y sus bases (`inventory_db`, `review_db`, `notification_db`, `analytics_db`). También sus rutas en el gateway, sus clases de evento en `common`, sus dependencias del `pom.xml` raíz y **Kafka por completo** (dependencias, topics, configuración y el servicio en `docker-compose`).

Justificación:
- **Inventario**: el frontend ve stock dentro del producto. Se mueve a `products.stock_quantity` y `products.low_stock_threshold`. Elimina un salto de red por cada listado y el problema de mantener dos fuentes.
- **Reseñas, notificaciones, analítica**: ninguna pantalla las consume. Las métricas del `AdminDashboard` se calculan con agregados en `ms-order` y `ms-product`.
- **Kafka**: la única comunicación real que queda es el checkout, que necesita ser síncrono y con compensación. Sin eventos no hay razón para mantener el broker; se justifica en el documento de integración.

## 8. Modelo de datos objetivo

Nombres de tabla/columna en inglés (consistencia con el 90% del backend ya escrito), UI en español. Las bases se crean desde cero con los scripts.

### Identidad: `uid`

**Decisión:** todas las referencias a un usuario usan `user_id VARCHAR(64)` con el **`users.id` numérico convertido a string** (el `uid`), en `cart_db`, `order_db`, `payment_db`, `shipping_db` y `products_db.favorites`. El JWT agrega el claim `uid`.

Motivo: el email es mutable (el usuario puede cambiarlo desde su perfil) y hoy es la clave de 5 bases sin FK. Con `uid` una edición de email no deja huérfanos. Se descarta `guest_id`: el checkout exige sesión.

`JwtTokenProvider.generateToken` pasa a recibir `(id, email, nombre, rol)` y emite `sub=email`, `uid`, `nombre`, `rol`. `SecurityUtils.requireSelfPrincipal(userId, resource)` compara contra el `uid` del token y deja pasar a `ADMIN` cuando el recurso es administrativo.

### `auth_db`

```
roles(id SERIAL PK, name VARCHAR(50) UNIQUE)          -- ids fijos 1=ADMIN, 2=SELLER, 3=CUSTOMER
regions(id SERIAL PK, name VARCHAR(100) UNIQUE, orden INT)          -- NUEVA
comunas(id SERIAL PK, name VARCHAR(100), region_id INT FK regions, UNIQUE(region_id,name))  -- NUEVA
users(
  id SERIAL PK,
  run VARCHAR(12) UNIQUE NOT NULL,        -- NUEVO, clave visible del frontend
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,          -- BCrypt
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100),                  -- NUEVO
  fecha_nacimiento DATE,                   -- NUEVO
  role_id INT FK roles NOT NULL,
  region_id INT FK regions,                -- NUEVO
  comuna_id INT FK comunas,                -- NUEVO
  direccion VARCHAR(255),                  -- NUEVO
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP
)
audit_log(...)  -- se mantiene
```

Se siembran 16 regiones y las comunas del `seed.ts` del frontend con **ids explícitos y estables**. Los 4 usuarios demo (`admin@gmail.com`, `vendedor@gmail.com`, `camila@gmail.com`, `diego@gmail.com`) se siembran con hashes BCrypt precalculados de sus claves actuales.

### `products_db`

```
categories(id UUID PK, name VARCHAR(100) UNIQUE, description TEXT, activa BOOLEAN)
products(
  id UUID PK, sku VARCHAR(50) UNIQUE,       -- sku = codigo del frontend (CH-001)
  name VARCHAR(200), description TEXT,
  price DECIMAL(12,2) CHECK (price >= 0),
  category_id UUID FK categories,
  imagen_url VARCHAR(500),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),   -- NUEVO
  low_stock_threshold INT NOT NULL DEFAULT 5,
  activo BOOLEAN DEFAULT TRUE, created_at, updated_at
)
product_images(...)   -- se mantiene
favorites(id UUID PK, user_id VARCHAR(64), product_id UUID FK products, created_at, UNIQUE(user_id,product_id))
```

**Decisión:** `product_id` es **UUID** en `cart_items`, `order_items`, `favorites` y en los endpoints de stock. El `sku` se guarda denormalizado en `cart_items`/`order_items` solo para mostrar y como snapshot histórico. Los seeds actuales de `order_items` que usan `COL-001` se reemplazan por UUID.

Disponible = `stock_quantity - reserved_quantity`. La reserva es atómica:

```sql
UPDATE products SET reserved_quantity = reserved_quantity + :q
WHERE id = :id AND stock_quantity - reserved_quantity >= :q
```

Si afecta 0 filas → `InsufficientStockException` (409). No hay sobreventa posible.

### `cart_db`

Sin cambios estructurales. `carts.user_id` es el `uid`. **No hay carrito de invitado en el servidor**: el carrito anónimo vive en `localStorage` (`chic_carrito_pendiente`) y al iniciar sesión se fusiona con `POST /cart/{uid}/merge`, sumando cantidades y recortando contra el disponible. Después se borra la clave local.

### `order_db`

```
orders(
  id UUID PK,
  folio VARCHAR(30) UNIQUE NOT NULL,        -- CH-YYYYMMDD-NNNNNN
  user_id VARCHAR(64) NOT NULL,
  customer_run VARCHAR(12),
  customer_name VARCHAR(200),
  customer_email VARCHAR(150),
  status VARCHAR(20) CHECK (PENDING,CONFIRMED,PAID,SHIPPED,DELIVERED,CANCELLED),
  total_amount DECIMAL(12,2),
  shipping_address TEXT,
  shipping_region VARCHAR(100),
  shipping_comuna VARCHAR(100),
  shipping_phone VARCHAR(30),
  created_at, updated_at
)
order_items(id UUID, order_id UUID FK, product_id UUID, sku VARCHAR(50), product_name VARCHAR(200), price DECIMAL(12,2), quantity INT CHECK (>0))
```

Folio: `CH-YYYYMMDD-` + `nextval('order_folio_seq')` con 6 dígitos. La secuencia de Postgres garantiza unicidad con checkouts concurrentes; no se cuenta por filas.

`payments` y `shipments` agregan `UNIQUE(order_id)`, lo que hace idempotente el checkout: un reintento no crea un segundo pago ni un segundo envío.

El estado se mapea en el frontend: `PENDING→Pendiente`, `CONFIRMED→Confirmada`, `PAID→Pagada`, `SHIPPED→Enviada`, `DELIVERED→Entregada`, `CANCELLED→Cancelada`.

### `content_db` (nueva)

```
news(id UUID PK, titulo VARCHAR(200), resumen TEXT, imagen_url VARCHAR(500),
     fecha DATE, slug VARCHAR(200) UNIQUE, categoria VARCHAR(100), autor VARCHAR(150),
     publicada BOOLEAN DEFAULT TRUE, created_at)
news_paragraphs(id UUID PK, news_id UUID FK news ON DELETE CASCADE, orden INT, texto TEXT)
contact_messages(id UUID PK, nombre VARCHAR(100), apellido VARCHAR(100),
                 email VARCHAR(150), mensaje TEXT, leido BOOLEAN DEFAULT FALSE, created_at)
```

### Bases eliminadas

`inventory_db`, `review_db`, `notification_db`, `analytics_db`. Se borran sus scripts y se renumera `init-multi-db/` (01 auth, 02 products, 03 cart, 04 order, 05 payment, 06 shipping, 07 content).

## 9. Checkout: secuencia y compensación

`ms-order` es el **único orquestador**. `ms-payment` deja de llamar a `ms-order` (se elimina el `OrderClient` que marcaba PAID); el estado lo fija el orquestador según la respuesta.

```
Cliente → POST /api/v1/orders (JWT)
  1. ms-order → ms-product  POST /products/stock/reserve   [items]
       falla → 409, nada creado
  2. ms-order → ms-product  POST /products/batch           [ids]  (precios reales)
  3. ms-order: calcula total, crea orden PENDING + items (snapshot)
  4. ms-order → ms-payment  POST /payments {orderId, amount, method}
       falla → stock/release + orden CANCELLED + 402
  5. ms-order → ms-shipping POST /shipping {orderId, entrega}
       falla → payments/{id}/refund + stock/release + CANCELLED + 502
  6. ms-order → ms-product  POST /products/stock/confirm   [items]
  7. orden → CONFIRMED, 201 con OrderResponse

Cancelar (PENDING/CONFIRMED):
  - si el stock está reservado → stock/release
  - si ya se confirmó        → stock/restore (devuelve unidades)
  - si hay pago COMPLETED    → refund
  - shipment → CANCELLED cuando exista
```

El cliente nunca envía precios ni totales; `ms-order` los pide a `ms-product`. El `amount` del pago lo calcula `ms-order`.

## 10. Contrato REST

Todas las respuestas usan `ApiResponse<T>`. Errores vía `GlobalExceptionHandler`.

### Rutas del gateway (todas obligatorias)

| Prefijo | Servicio |
|---|---|
| `/api/v1/auth/**`, `/api/v1/users/**`, `/api/v1/roles/**`, `/api/v1/regions/**`, `/api/v1/comunas/**` | ms-auth |
| `/api/v1/products/**`, `/api/v1/categories/**`, `/api/v1/favorites/**` | ms-product |
| `/api/v1/cart/**` | ms-cart |
| `/api/v1/orders/**` | ms-order |
| `/api/v1/payments/**` | ms-payment |
| `/api/v1/shipping/**` | ms-shipping |
| `/api/v1/news/**`, `/api/v1/contact/**` | ms-content |

Los `ProductClient`, `OrderClient`, `PaymentClient` y `ShippingClient` de Feign se actualizan a las rutas `/api/v1/...` en el mismo commit que el gateway, o la integración interna se rompe en silencio.

### Público vs autenticado

| Público (sin token) | Autenticado |
|---|---|
| `POST /auth/register`, `POST /auth/login` | todo lo demás |
| `GET /regions`, `GET /comunas` | |
| `GET /products/**`, `GET /categories` | |
| `GET /news/**` | |
| `POST /contact` | |

Cada microservicio declara esto en su `SecurityConfig`. `/v3/api-docs/**`, `/swagger-ui/**` y `/actuator/health` también son públicos.

### Autorización entre servicios

No hay endpoints internos abiertos. Un `RequestInterceptor` de Feign en `common` copia el header `Authorization` del request entrante a la llamada saliente, así el servicio destino valida el mismo JWT y aplica los mismos roles. El checkout ocurre dentro de un request autenticado, por lo que la cadena funciona sin credenciales de servicio.

### Endpoints por servicio

**ms-auth**

| Método | Ruta | Rol |
|---|---|---|
| POST | `/api/v1/auth/register` | público (asigna CUSTOMER) |
| POST | `/api/v1/auth/login` | público |
| POST | `/api/v1/auth/admin/register` | ADMIN |
| GET | `/api/v1/auth/me` | autenticado — lee el perfil completo de la BD por `uid` |
| PUT | `/api/v1/auth/me` | autenticado |
| GET | `/api/v1/users?q=` | ADMIN |
| GET | `/api/v1/users/{id}` | ADMIN |
| PUT | `/api/v1/users/{id}` | ADMIN (roleId, activo) |
| DELETE | `/api/v1/users/{id}` | ADMIN (baja lógica) |
| GET | `/api/v1/regions` | público |
| GET | `/api/v1/comunas?regionId=` | público |
| GET | `/api/v1/roles` | ADMIN |

`AuthResponse` pasa a `{token, usuario, rol}` con el usuario completo (sin password). Un cambio de rol aplicado por un ADMIN exige re-login del afectado: el JWT conserva el rol anterior hasta expirar (24 h). El frontend fuerza el cierre de sesión del usuario editado; se documenta como limitación aceptada.

**ms-product** — `/api/v1/products`, `/api/v1/categories`, `/api/v1/favorites`

| Método | Ruta | Rol |
|---|---|---|
| GET | `/api/v1/products`, `/{id}`, `/search?name=`, `/category/{id}` | público |
| POST/PUT/DELETE | `/api/v1/products` | ADMIN, SELLER |
| GET | `/api/v1/categories` | público |
| POST/PUT/DELETE | `/api/v1/categories` | ADMIN |
| GET | `/api/v1/favorites` | autenticado (propias) |
| POST/DELETE | `/api/v1/favorites/{productId}` | autenticado (propias) |
| POST | `/api/v1/products/batch` | autenticado (uso interno del checkout) |
| POST | `/api/v1/products/stock/reserve`, `/confirm`, `/release`, `/restore` | autenticado (uso interno) |

`ProductRequest`/`ProductResponse` agregan `stockQuantity`, `reservedQuantity` y `lowStockThreshold`. El `sku` se expone como `codigo` en el mapeo del frontend.

**ms-cart** — `/api/v1/cart`

`GET /{uid}`, `POST /{uid}/items`, `PUT/DELETE /{uid}/items/{productId}`, `DELETE /{uid}`, `POST /{uid}/merge`. Siempre `requireSelfPrincipal`.

**ms-order**

| Método | Ruta | Rol |
|---|---|---|
| POST | `/api/v1/orders` | autenticado (checkout) |
| GET | `/api/v1/orders/{id}` | dueño o ADMIN |
| GET | `/api/v1/orders/user/{uid}` | propio o ADMIN |
| GET | `/api/v1/orders` | ADMIN, SELLER |
| PUT | `/api/v1/orders/{id}/cancel` | dueño o ADMIN |
| PUT | `/api/v1/orders/{id}/status?status=` | ADMIN, SELLER |
| GET | `/api/v1/orders/stats` | ADMIN, SELLER |

`/stats` cubre solo `order_db`: ventas, órdenes por estado, ticket promedio y top productos. El **stock crítico no está en `order_db`**: el frontend lo pide a `GET /api/v1/products?lowStock=true` y el dashboard une ambas respuestas. Así no hay Feign dentro de una consulta de métricas.

**ms-payment / ms-shipping**

Se conservan sus endpoints bajo `/api/v1`. `ShipmentRequest` y la entidad `Shipment` agregan `region` y `comuna`. `payments` y `shipments` aceptan `orderId` único.

**ms-content** — `/api/v1/news`, `/api/v1/contact`

`GET /news` (paginado `?page=&size=`), `GET /news/{slug}` públicos; `POST/PUT/DELETE /news` ADMIN; `POST /contact` público; `GET /contact` ADMIN.

## 11. Cambios en el frontend

### Nueva capa de API

```
src/api/client.ts        fetch + baseURL + Bearer + unwrap de ApiResponse + error normalizado
src/api/auth.ts          login, register, me, updateMe
src/api/users.ts         CRUD admin
src/api/catalog.ts       products, categories, regions, comunas
src/api/cart.ts          carrito servidor + merge
src/api/orders.ts        checkout, historial, admin, stats
src/api/content.ts       blog, contacto
src/api/favorites.ts
```

`baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:9000"`.

### Contextos

- `AuthContext`: login/registro contra la API, guarda `chic_token` + `chic_usuario` (sin password) y rehidrata con `GET /auth/me` al cargar. `esAdmin/esVendedor` salen del rol devuelto por el backend.
- `CartContext`: carrito de servidor cuando hay sesión; carrito local (`chic_carrito_pendiente`) cuando no la hay; al hacer login se fusiona y se limpia la clave local.

### Eliminaciones

- `src/data/seed.ts` deja de sembrar datos de negocio; los catálogos pasan a scripts SQL.
- Todas las escrituras directas a `chic_usuarios`, `chic_productos`, `chic_categorias`, `chic_ordenes`, `chic_contactos`, `chic_blog`, `chic_carrito`, `chic_favoritos`.
- `CHIC_KEYS` se reduce a `sesion`, `carrito_pendiente` y `version`.
- Componentes admin duplicados: se conserva `src/pages/admin/*` y se portan `AdminCategorias`, `AdminLayout` y `AdminOrdenes`, borrando el duplicado en `src/components/admin/`.

### Restricciones por rol (rúbrica 12%)

- `RutaProtegida` recibe `roles` y redirige a `/cuenta` si el rol no corresponde.
- SELLER: menú solo con Productos y Órdenes; sin dashboard, usuarios ni categorías.
- CUSTOMER: sin acceso a `/admin/**`.

## 12. Orden de trabajo

1. **Infraestructura**: borrar servicios y bases, renumerar `init-multi-db`, quitar Kafka, actualizar `pom.xml`, gateway y compose, agregar `springdoc` a los 8 servicios y crear el esqueleto `ms-content`. `ddl-auto: validate`.
2. **ms-auth**: esquema nuevo, entidades, usuarios/perfil/regiones/comunas/roles, JWT con `uid`, seeds BCrypt y geografía.
3. **ms-product**: stock y reservas atómicas, CRUD de categorías, favoritos, `/batch`.
4. **ms-cart**: seguridad por `uid` y merge.
5. **ms-order**: folio, snapshot, entrega, `/stats`, orquestación del checkout con compensación.
6. **ms-payment / ms-shipping**: `order_id` único, campos de región/comuna, quitar callback a órdenes.
7. **ms-content**: entidades, repositorios, controladores, seeds del blog.
8. **Frontend API + auth**: `client.ts`, módulos, `AuthContext`, rehidratación.
9. **Frontend catálogo/carrito/checkout**: productos, detalle, carrito, compra exitosa, mis compras.
10. **Frontend admin + roles**: dashboard con `/stats`, CRUDs, restricciones de menú y rutas.
11. **Cierre**: Swagger verificado, colección Postman, README de integración, pruebas y documentos de la entrega.

## 13. Decisiones tomadas por el agente (revisables)

- Nombres de tabla/columna en inglés; UI en español.
- `users.id` como PK y `run` como único; `uid` (id numérico como string) identifica al usuario en todas las bases.
- Sin `guest_id`: el checkout exige sesión; el carrito anónimo es local y se fusiona al entrar.
- `product_id` = UUID en todo el backend; `sku` denormalizado solo para mostrar.
- Stock dentro de `products`, con `reserved_quantity` y reserva atómica por `UPDATE` condicional.
- `sku` del backend = `codigo` del frontend.
- Sin Kafka: comunicación síncrona por Feign con propagación del JWT.
- Una sola base nueva (`content_db`) en vez de dos servicios de contenido.
- Se recrean las bases desde cero en desarrollo; los scripts son la única fuente de esquema.
- El stock crítico se consulta en `ms-product`, no dentro de `/orders/stats`.

## 14. Pendiente para quien implemente

- Generar los 4 hashes BCrypt de las claves demo y pegarlos en el script de semilla de usuarios.
- Extraer del `seed.ts` la lista completa de comunas y cargarla con ids estables.
- Verificar que el modelo de la Figura 1 del anexo no exija nombres distintos; si los exige, se renombran tablas en una migración aparte.
- Ajustar CORS del gateway al origen real de Vite (`http://localhost:5173`).
- Definir la paginación del blog en la UI (el endpoint ya la soporta).
