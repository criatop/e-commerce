# Diseño: integración frontend ↔ backend y limpieza de microservicios

Fecha: 2026-11-18
Rama: `limpieza_Back`
Enfoque elegido: **Opción B — ajustado al frontend**

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

## 5. Restricciones

- Spring Boot + PostgreSQL (ya montado, puerto 5433, `postgres/123`).
- `ddl-auto: update` está activo; los cambios de esquema se reflejan al arrancar, pero los scripts de `init-multi-db/` deben quedar como fuente reproducible.
- JWT ya implementado en `common` (jjwt 0.12.6, HS384, claims `sub`, `nombre`, `rol`, 24 h).
- Envoltorio de respuesta existente: `ApiResponse<T> { exitoso, datos, mensaje, timestamp }`.
- Frontend React 19 + Vite 8. No tiene axios instalado; se usa `fetch` nativo.
- Roles con ids fijos 1/2/3 para no romper los seeds del frontend.

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
| `ms-order` | `order_db` | Órdenes, ítems, métricas del dashboard |
| `ms-payment` | `payment_db` | Registro de pagos simulados |
| `ms-shipping` | `shipping_db` | Envíos y tracking |
| `ms-content` (nuevo) | `content_db` | Blog (`news` + párrafos) y mensajes de contacto |

### Se eliminan

`ms-inventory`, `ms-review`, `ms-notification`, `ms-analytics` y sus bases (`inventory_db`, `review_db`, `notification_db`, `analytics_db`). También sus rutas en el gateway, sus eventos Kafka en `common` y sus dependencias del `pom.xml` raíz.

Justificación:
- **Inventario**: el frontend ve stock dentro del producto. Se mueve a `products.stock_quantity` y `products.low_stock_threshold`. Elimina un salto de red por cada listado y el problema de mantener dos fuentes.
- **Reseñas, notificaciones, analítica**: ninguna pantalla las consume. Las métricas del `AdminDashboard` se calculan con una consulta agregada en `ms-order`.

## 8. Modelo de datos objetivo

Se mantienen nombres de tabla/columna en inglés (consistencia con el 90% del backend ya escrito). Los campos nuevos se agregan con `ALTER TABLE` idempotente en los scripts.

### `auth_db`

```
roles(id SERIAL PK, name VARCHAR(50) UNIQUE)          -- ADMIN, SELLER, CUSTOMER
regions(id SERIAL PK, name VARCHAR(100) UNIQUE, orden INT)          -- NUEVA
comunas(id SERIAL PK, name VARCHAR(100), region_id INT FK regions, UNIQUE(region_id,name))  -- NUEVA
users(
  id SERIAL PK,
  run VARCHAR(12) UNIQUE NOT NULL,        -- NUEVO, clave natural del frontend
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

Decisión: se conserva `users.id` numérico como FK y `run` como único. El frontend deja de usar `run` como clave interna y pasa a usar `id`; `run` queda como dato visible y de login alternativo.

### `products_db`

```
categories(id UUID PK, name VARCHAR(100) UNIQUE, description TEXT, activa BOOLEAN)
products(
  id UUID PK, sku VARCHAR(50) UNIQUE,       -- sku = codigo del frontend (CH-001)
  name VARCHAR(200), description TEXT,
  price DECIMAL(12,2) CHECK (price >= 0),
  category_id UUID FK categories,
  imagen_url VARCHAR(500),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),      -- NUEVO
  low_stock_threshold INT NOT NULL DEFAULT 5,                             -- NUEVO (stockCritico)
  activo BOOLEAN DEFAULT TRUE, created_at, updated_at
)
product_images(...)   -- se mantiene
favorites(id UUID PK, user_id VARCHAR(100), product_id UUID FK products, created_at, UNIQUE(user_id,product_id))  -- NUEVA
```

`user_id` en favoritos y carrito es el **email** del usuario (string), coherente con el resto del backend (`user_id VARCHAR(100)` en cart/order/payment/shipping).

### `cart_db`

Sin cambios estructurales: `carts` + `cart_items`. El frontend deja de guardar `{codigo,cantidad}` local y consume el carrito de servidor. Para invitados se usa un `guest_id` UUID generado en el navegador como `user_id`.

### `order_db`

```
orders(
  id UUID PK,
  folio VARCHAR(30) UNIQUE NOT NULL,        -- NUEVO, formato CH-YYYYMMDD-0001
  user_id VARCHAR(100),
  customer_run VARCHAR(12),                 -- NUEVO snapshot
  customer_name VARCHAR(200),               -- NUEVO snapshot
  customer_email VARCHAR(150),              -- NUEVO snapshot
  status VARCHAR(20) CHECK (...),
  total_amount DECIMAL(12,2),
  shipping_address TEXT,
  shipping_region VARCHAR(100),             -- NUEVO
  shipping_comuna VARCHAR(100),             -- NUEVO
  shipping_phone VARCHAR(30),               -- NUEVO
  created_at, updated_at
)
order_items(...)  -- se mantiene (product_id, product_name, price, quantity)
```

`payments` y `shipments` siguen en sus bases; la orden guarda solo el resumen de envío.

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

`inventory_db`, `review_db`, `notification_db`, `analytics_db`. Los scripts `05-create-inventory.sql`, `09-create-review.sql`, `10-create-notification.sql`, `11-create-analytics.sql` se borran y se renumera `init-multi-db/`.

## 9. Contrato REST

Todas las respuestas usan `ApiResponse<T>`. Errores: `ApiResponse.error(mensaje)` con el código HTTP correspondiente vía `GlobalExceptionHandler`.

### ms-auth — `/api/v1/auth`, `/api/v1/users`, `/api/v1/regions`, `/api/v1/comunas`, `/api/v1/roles`

| Método | Ruta | Rol | Nota |
|---|---|---|---|
| POST | `/api/v1/auth/register` | público | body extendido (run, apellidos, fechaNacimiento, regionId, comunaId, direccion); asigna CUSTOMER |
| POST | `/api/v1/auth/login` | público | devuelve `token`, `usuario` completo, `rol` |
| POST | `/api/v1/auth/admin/register` | ADMIN | crea ADMIN/SELLER |
| GET | `/api/v1/auth/me` | autenticado | perfil desde el token |
| PUT | `/api/v1/auth/me` | autenticado | actualiza perfil y dirección |
| GET | `/api/v1/users` | ADMIN | listado con filtro `?q=` |
| GET | `/api/v1/users/{id}` | ADMIN | |
| PUT | `/api/v1/users/{id}` | ADMIN | incluye `roleId` y `activo` |
| DELETE | `/api/v1/users/{id}` | ADMIN | baja lógica (`activo=false`) |
| GET | `/api/v1/regions` | público | |
| GET | `/api/v1/comunas?regionId=` | público | |
| GET | `/api/v1/roles` | ADMIN | |

`AuthResponse` cambia de `{token,email,nombre,rol}` a `{token, usuario:{...}, rol}`. El JWT agrega el claim `uid`.

### ms-product — `/api/v1/products`, `/api/v1/categories`, `/api/v1/favorites`

| Método | Ruta | Rol |
|---|---|---|
| GET | `/api/v1/products` | público |
| GET | `/api/v1/products/{id}` | público |
| GET | `/api/v1/products/search?name=` | público |
| GET | `/api/v1/products/category/{categoryId}` | público |
| POST/PUT/DELETE | `/api/v1/products` | ADMIN, SELLER |
| GET | `/api/v1/categories` | público |
| POST/PUT/DELETE | `/api/v1/categories` | ADMIN |
| GET | `/api/v1/favorites` | autenticado (propias) |
| POST/DELETE | `/api/v1/favorites/{productId}` | autenticado (propias) |

`ProductRequest`/`ProductResponse` agregan `stockQuantity` y `lowStockThreshold`. El `sku` se expone como `codigo` en el mapeo del frontend.

### ms-cart — `/api/v1/cart`

Se mantienen las operaciones actuales (`GET /{userId}`, `POST /{userId}/items`, `PUT`, `DELETE`), con `SecurityUtils.requireSelfPrincipal` para que nadie lea el carrito ajeno.

### ms-order — `/api/v1/orders`

| Método | Ruta | Rol | Nota |
|---|---|---|---|
| POST | `/api/v1/orders` | público/invitado | body: userId, items, envío completo, pago; orquesta pago y envío |
| GET | `/api/v1/orders/{id}` | autenticado | |
| GET | `/api/v1/orders/user/{userId}` | autenticado (propio) | |
| GET | `/api/v1/orders` | ADMIN, SELLER | listado para gestión |
| PUT | `/api/v1/orders/{id}/cancel` | propio o ADMIN | |
| PUT | `/api/v1/orders/{id}/status` | ADMIN, SELLER | |
| GET | `/api/v1/orders/stats` | ADMIN, SELLER | reemplaza `ms-analytics`: ventas, órdenes, ticket promedio, top productos, stock crítico |

`CreateOrderRequest` pasa a incluir folio generado en servidor (no lo envía el cliente), datos de entrega y método de pago. `OrderResponse` agrega folio, datos de entrega y nombre del cliente.

### ms-payment y ms-shipping

Se conservan sus endpoints (`/api/v1/payments`, `/api/v1/shipping`) invocados internamente por `ms-order` vía Feign. `ShipmentRequest` agrega `comuna` y `region`.

### ms-content — `/api/v1/news`, `/api/v1/contact`

| Método | Ruta | Rol |
|---|---|---|
| GET | `/api/v1/news` | público |
| GET | `/api/v1/news/{slug}` | público |
| POST/PUT/DELETE | `/api/v1/news` | ADMIN |
| POST | `/api/v1/contact` | público |
| GET | `/api/v1/contact` | ADMIN |

## 10. Cambios en el frontend

### Nueva capa de API

```
src/api/client.ts        fetch + baseURL + Bearer + ApiResponse unwrap + error normalizado
src/api/auth.ts          login, register, me, updateMe
src/api/users.ts         CRUD admin
src/api/catalog.ts       products, categories, regions, comunas
src/api/cart.ts          carrito servidor
src/api/orders.ts        checkout, historial, admin, stats
src/api/content.ts       blog, contacto
src/api/favorites.ts
```

`baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:9000"`.

### Contextos

- `AuthContext`: login/registro contra la API, guarda `chic_token` + `chic_usuario` (sin password) y rehidrata con `GET /me` al cargar. Elimina la comparación de contraseñas local.
- `CartContext`: carrito de servidor; `guest_id` en localStorage para invitados; se sincroniza al iniciar sesión.

### Eliminaciones

- `src/data/seed.ts` y `sembrarDatos()` dejan de sembrar datos de negocio. Los catálogos iniciales pasan a scripts SQL (`init-multi-db`).
- Todas las escrituras directas a `chic_usuarios`, `chic_productos`, `chic_categorias`, `chic_ordenes`, `chic_contactos`, `chic_blog`, `chic_carrito`, `chic_favoritos`.
- `CHIC_KEYS` se reduce a `sesion`, `guest_id` y `version` (o desaparece).
- Componentes admin duplicados: se conserva `src/pages/admin/*` y se portan `AdminCategorias`, `AdminLayout` y `AdminOrdenes` desde `src/components/admin/`, borrando el duplicado.

### Restricciones por rol (rúbrica 12%)

- `RutaProtegida` recibe `roles` y redirige a `/cuenta` si el rol no corresponde.
- SELLER: menú solo con Productos y Órdenes; sin dashboard, usuarios ni categorías.
- CUSTOMER: sin acceso a `/admin/**`.

## 11. Orden de trabajo

1. **Infraestructura**: borrar servicios y bases, renumerar `init-multi-db`, actualizar `pom.xml`, gateway y compose. Crear esqueleto `ms-content`.
2. **ms-auth**: esquema nuevo, entidades, endpoints de usuarios/perfil/regiones/comunas/roles, JWT con `uid`, seeds BCrypt.
3. **ms-product**: stock en producto, CRUD de categorías, favoritos, DTOs.
4. **ms-cart**: adaptar seguridad y respuesta al frontend.
5. **ms-order**: folio, datos de entrega, snapshot de cliente, `/stats`, orquestación con pago y envío.
6. **ms-payment / ms-shipping**: campos nuevos y mapeos.
7. **ms-content**: entidades, repositorios, controladores, seeds del blog.
8. **Frontend API + auth**: `client.ts`, módulos, `AuthContext`, rehidratación.
9. **Frontend catálogo/carrito/checkout**: productos, detalle, carrito, compra exitosa, mis compras.
10. **Frontend admin + roles**: dashboard con `/stats`, CRUDs, restricciones de menú y rutas.
11. **Cierre**: Swagger, colección Postman, README de integración, pruebas y documentos de la entrega.

## 12. Decisiones tomadas por el agente (revisables)

- Nombres de tabla/columna en inglés; UI en español.
- `users.id` como PK y `run` como único, en vez de `run` como PK.
- Stock dentro de `products` (no servicio aparte).
- `sku` del backend = `codigo` del frontend.
- `user_id` = email en carrito, órdenes, favoritos.
- Invitados: `guest_id` UUID persistido en el navegador.
- Una sola base nueva (`content_db`) en vez de dos servicios de contenido.
- Se recrean las bases desde cero en desarrollo (los datos actuales son de muestra).

## 13. Pendiente para quien implemente

- Definir si `ms-content` usará Kafka para publicar noticias o solo REST (por ahora solo REST).
- Decidir si el blog tendrá paginación (recomendado: `?page=&size=`).
- Ajustar CORS del gateway al origen real de Vite (`http://localhost:5173`).
- Verificar que el modelo de la Figura 1 del anexo no exija nombres distintos; si los exige, se renombran tablas en una migración aparte.
