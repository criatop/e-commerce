# Accesorios Chic - E-Commerce Microservices

Arquitectura de microservicios para tienda de accesorios femeninos (collares, aros, pulseras, anillos, tobilleras, broches).

## Stack Tecnologico

| Tecnologia | Version | Uso |
|---|---|---|
| Java | 21 | Runtime |
| Spring Boot | 3.5.13 | Framework principal |
| Spring Cloud | 2025.0.0 | Microservicios |
| Spring Cloud Gateway | - | API Gateway |
| Spring Cloud Netflix Eureka | - | Service Discovery |
| OpenFeign | - | Comunicacion sincrona |
| Apache Kafka (Confluent) | 7.5.0 | Comunicacion asincrona |
| PostgreSQL | 15 | Base de datos |
| Spring Security + JWT (jjwt 0.12.6) | - | Autenticacion |
| Lombok + MapStruct | - | Boilerplate |
| Docker Compose | - | Orquestacion |

---

## Estructura del Proyecto

```
e-commerce/
├── pom.xml                    # Parent POM (cl.ecommerce:ecommerce-parent)
├── docker-compose.yml         # 15 contenedores
│
├── common/                    # Modulo compartido (DTOs, eventos, seguridad)
│   └── src/main/java/cl/ecommerce/common/
│       ├── dto/ApiResponse.java
│       ├── event/             # Eventos Kafka (OrderCreated, PaymentCompleted, etc.)
│       ├── exception/         # BusinessException, NotFoundException, etc.
│       ├── security/          # JwtTokenProvider, DefaultSecurityConfig
│       └── config/
│
├── eureka/                    # Service Discovery
├── api-gateway/               # Gateway (puerto 9000)
│
├── ms-auth/                   # Autenticacion y registro
├── ms-product/                # Catalogo de productos y categorias
├── ms-cart/                   # Carrito de compras
├── ms-order/                  # Gestion de ordenes
├── ms-payment/                # Procesamiento de pagos
├── ms-shipping/               # Envios y tracking
├── ms-inventory/              # Control de stock
├── ms-notification/           # Notificaciones (email simulado)
├── ms-review/                 # Resenas de productos
├── ms-analytics/              # Analiticas y metricas
│
└── init-multi-db/             # Scripts SQL de inicializacion
    ├── 01-create-auth.sql
    ├── 02-create-cart.sql
    ├── 03-create-products.sql
    ├── 04-create-inventory.sql
    ├── 05-create-order.sql
    ├── 06-create-order.sql
    ├── 07-create-payment.sql
    ├── 08-create-shipping.sql
    ├── 09-create-notification.sql
    ├── 10-create-review.sql
    └── 11-create-analytics.sql
```

Cada microservicio tiene su propia base de datos PostgreSQL (10 databases), su propio `pom.xml`, y se compila como JAR independiente.

---

## Puertos Externos

| Servicio | Puerto | URL |
|---|---|---|
| **API Gateway** | 9000 | `http://localhost:9000` |
| Eureka Dashboard | 8761 | `http://localhost:8761` |
| PostgreSQL | 5433 | `localhost:5433` ( usuario: `postgres`, password: `123` ) |
| Kafka | 9092 | `localhost:9092` |

**Todos los endpoints se acceden a traves del Gateway en puerto 9000.**

---

## Como Lanzar

### 1. Pre-requisitos
- Docker y Docker Compose instalados
- Java 21 (solo para compilar cambios)
- Maven (o usar el wrapper `./mvnw`)

### 2. Levantar todo
```bash
# En la raiz del proyecto
docker compose up -d
```

Los servicios tardan aproximadamente **2-3 minutos** en estar listos (Eureka necesita ~60s, luego los microservicios ~90s cada uno).

### 3. Verificar estado
```bash
# Ver todos los contenedores
docker ps

# Verificar que todos estan registrados en Eureka
curl http://localhost:8761/eureka/apps | head -20

# Test rapido
curl http://localhost:9000/api/products
```

### 4. Si haces cambios en el codigo
```bash
# Compilar
./mvnw clean package -DskipTests

# Reconstruir los servicios modificados
docker compose build <nombre-servicio>

# Reiniciar
docker compose up -d <nombre-servicio>
```

### 5. Reset completo (borrar datos)
```bash
docker compose down --volumes
docker compose up -d
```

---

## Base de Datos

Un solo PostgreSQL con **10 databases** separadas:

| Database | Servicio |
|---|---|
| `auth_db` | ms-auth |
| `products_db` | ms-product |
| `cart_db` | ms-cart |
| `order_db` | ms-order |
| `payment_db` | ms-payment |
| `shipping_db` | ms-shipping |
| `inventory_db` | ms-inventory |
| `notification_db` | ms-notification |
| `review_db` | ms-review |
| `analytics_db` | ms-analytics |

Las tablas se crean automaticamente via los scripts en `init-multi-db/` al iniciar el contenedor PostgreSQL.

---

## API Gateway - Endpoints

Todos los endpoints se acceden via `http://localhost:9000`:

| Servicio | Prefijo | Ejemplo |
|---|---|---|
| Auth | `/api/v1/auth/` | `POST /api/v1/auth/register` |
| Product | `/api/products/` | `GET /api/products` |
| Cart | `/api/cart/` | `GET /api/cart/{userId}` |
| Order | `/api/orders/` | `POST /api/orders` |
| Payment | `/api/payments/` | `POST /api/payments` |
| Shipping | `/api/shipping/` | `POST /api/shipping` |
| Inventory | `/api/inventory/` | `GET /api/inventory/{productId}` |
| Notification | `/api/notifications/` | `GET /api/notifications` |
| Review | `/api/reviews/` | `POST /api/reviews` |
| Analytics | `/api/analytics/` | `GET /api/analytics/sales` |

---

## Comunicacion Sincrona (Feign Clients)

Los servicios se comunican de forma directa via HTTP usando Spring Cloud OpenFeign con load balancing via Eureka.

```
ms-cart ──Feign──> ms-product       (validar existencia de producto)
ms-order ──Feign──> ms-product      (obtener detalles y SKU del producto)
ms-order ──Feign──> ms-inventory    (reservar / liberar / consumir stock)
ms-payment ──Feign──> ms-order      (actualizar estado de orden a PAID)
```

| Cliente | Servicio Origen | Servicio Destino | Operacion |
|---|---|---|---|
| `ProductClient` | ms-cart | ms-product | `GET /api/products/{id}` |
| `ProductClient` | ms-order | ms-product | `GET /api/products/{id}` |
| `InventoryClient` | ms-order | ms-inventory | `POST /api/inventory/reserve` |
| `InventoryClient` | ms-order | ms-inventory | `POST /api/inventory/consume/{orderId}` |
| `InventoryClient` | ms-order | ms-inventory | `POST /api/inventory/release/{orderId}` |
| `OrderClient` | ms-payment | ms-order | `PUT /api/orders/{id}/status?status=PAID` |

---

## Comunicacion Asincrona (Kafka)

### Topics

| Topic | Particiones | Producer | Consumers |
|---|---|---|---|
| `order.created` | 3 | ms-order | ms-inventory, ms-analytics |
| `order.cancelled` | 3 | ms-order | ms-inventory, ms-notification |
| `payment.completed` | 3 | ms-payment | ms-analytics, ms-notification, ms-shipping |
| `payment.failed` | 3 | ms-payment | (pendiente) |
| `stock.low` | 3 | ms-inventory | ms-notification |
| `review.created` | 3 | ms-review | (pendiente) |
| `analytics.events` | 3 | ms-analytics | (pendiente) |

### Consumer Groups

| Grupo | Topics escuchados | Servicio |
|---|---|---|
| `inventory-group` | `order.created`, `order.cancelled` | ms-inventory |
| `analytics-group` | `payment.completed`, `order.created` | ms-analytics |
| `notification-group` | `payment.completed`, `order.cancelled`, `stock.low` | ms-notification |
| `shipping-group` | `payment.completed` | ms-shipping |

### Flujo de Eventos

```
                                        ┌──> ms-inventory (consume stock)
                                        │
Order Creada ──order.created────────────┤
(ms-order)                              │
                                        └──> ms-analytics (registra venta)

                                        ┌──> ms-inventory (libera stock)
                                        │
Order Cancelada ──order.cancelled───────┤
(ms-order)                              │
                                        └──> ms-notification (email cancelacion)

                                         ┌──> ms-analytics (registra pago)
                                         │
Pago Completado ──payment.completed──────┤──> ms-notification (email confirmacion)
(ms-payment)                             │
                                         └──> ms-shipping (crea envio)

Stock Bajo ──stock.low─────────────────> ms-notification (alerta admin)
(ms-inventory)
```

---

## Flujo Completo de Compra

```
1. POST /api/v1/auth/register     → Crear cuenta (retorna JWT)
2. POST /api/v1/auth/login        → Login (retorna JWT)
3. GET  /api/products              → Ver catalogo
4. POST /api/cart/{userId}/items   → Agregar al carrito
5. POST /api/orders                → Crear orden (PENDING)
   ├── Feign → ms-product (validar productos, obtener SKU)
   ├── Feign → ms-inventory (reservar stock)
   └── Kafka → order.created (analytics + inventory)
6. POST /api/payments              → Procesar pago
   ├── Feign → ms-order (actualizar a PAID)
   ├── Kafka → payment.completed
   │   ├── ms-notification (email confirmacion)
   │   ├── ms-shipping (crear envio)
   │   └── ms-analytics (registrar venta)
7. PUT  /api/orders/{id}/status?status=SHIPPED  → Marcar enviado
8. PUT  /api/orders/{id}/status?status=DELIVERED → Marcar entregado
9. POST /api/reviews               → Dejar resena
```

---

## Modelos de Datos Principales

### Producto
- `id` (UUID), `sku` (ej: COL-001), `name`, `description`, `price`, `category` (UUID FK), `imageUrl`, `active`

### Orden
- `id` (UUID), `userId`, `status` (PENDING → CONFIRMED/PAID → SHIPPED → DELIVERED), `items[]`, `totalAmount`, `shippingAddress`

### Inventario
- `id` (UUID), `productId` (SKU como string), `productName`, `quantity`, `reservedQuantity`, `lowStockThreshold`, `warehouseLocation`

---

## Credenciales de Prueba

| Campo | Valor |
|---|---|
| PostgreSQL user | `postgres` |
| PostgreSQL password | `123` |
| PostgreSQL puerto | `5433` |

### Usuarios de seed data (SQL)
- `camila.rosa@gmail.com` / `123456` (CUSTOMER)
- `admin@chic.cl` / `admin123` (ADMIN)

---

## Tecnologias de Infraestructura

- **Service Discovery**: Netflix Eureka (auto-registro, health checks)
- **API Gateway**: Spring Cloud Gateway (routing, CORS)
- **Carga**: Spring Cloud LoadBalancer (round-robin entre instancias)
- **Mensajeria**: Apache Kafka con Confluent 7.5.0 (3 particiones por topic)
- **Serializacion**: `StringSerializer` / `JsonSerializer` (Spring Kafka)
- **JWT**: jjwt 0.12.6 con algoritmo HS384, expiration 24h
- **DB Schema**: `ddl-auto: update` en todos los servicios + scripts SQL de seed
