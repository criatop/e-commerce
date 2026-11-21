# Integración Frontend–Backend: Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conectar la tienda React con los microservicios Spring Boot, dejando 8 servicios alineados al modelo de datos del frontend y eliminando los 4 que no usa.

**Architecture:** `ms-order` orquesta el checkout de forma síncrona (Feign) sobre `ms-product`, `ms-payment` y `ms-shipping`; el stock vive en `products` con reserva atómica en SQL; la identidad es `users.id` (`uid`) propagado en el JWT; un nuevo `ms-content` sirve blog y contacto.

**Tech Stack:** Java 21, Spring Boot 3.5.13, Spring Cloud Gateway + Eureka, Spring Data JPA, PostgreSQL 17 (puerto 5433), springdoc-openapi, Feign, JUnit 5 + Mockito; React 19 + TypeScript + Vite + Vitest.

**Spec:** `docs/superpowers/specs/2026-11-18-integracion-frontend-backend-design.md`

## Global Constraints

- Todos los endpoints nuevos usan el prefijo `/api/v1/`; se eliminan las rutas sin versión.
- Toda respuesta HTTP pasa por `ApiResponse<T>` (`exitoso`, `datos`, `mensaje`, `timestamp`).
- `ddl-auto: validate` en los 8 servicios. El esquema lo definen solo los scripts de `init-multi-db/`.
- Sin Kafka. Sin `guest_id`. Sin precios ni totales enviados por el cliente.
- `user_id VARCHAR(64)` guarda el `uid` (`users.id` como string) en cart, order, payment, shipping y favorites.
- `product_id` es UUID en carrito, órdenes, favoritos y stock; `sku` se copia como dato de display.
- Nombres de tablas y columnas en inglés; textos de interfaz en español.
- PostgreSQL único en `localhost:5433`, usuario `postgres`, clave `123`.
- Los servicios no exponen endpoints internos abiertos: el JWT del llamador se propaga por Feign.
- Swagger (`/swagger-ui/**`, `/v3/api-docs/**`) y `/actuator/health` son públicos en cada servicio.

## Review Focus

- Checkout concurrente del último stock disponible: dos compradores simultáneos no deben dejar `reserved_quantity` por sobre `stock_quantity` ni vender dos veces la misma unidad.
- Pago aprobado y luego fallo al confirmar stock o crear el envío: la orden debe quedar cancelada con reembolso, no a medias.
- Producto eliminado o stock insuficiente entre que se arma el carrito y se paga: el checkout debe responder 409 con mensaje claro y no crear la orden.
- Token vencido o rol cambiado por el ADMIN: el frontend debe cerrar sesión y volver al login, no quedar en un estado con permisos viejos.
- Preflight CORS desde `http://localhost:5173` para `POST /api/v1/orders` con `Authorization`: el navegador no debe bloquear el checkout.

---

### Task 1: Cirugía de módulos e infraestructura

**Files:**
- Delete: `ms-inventory/`, `ms-review/`, `ms-notification/`, `ms-analytics/`
- Modify: `pom.xml` (lista de `<modules>`)
- Modify: `init-multi-db/01-create-databases.sql`
- Delete: `init-multi-db/04-create-inventory.sql`, `09-create-notification.sql`, `10-create-review.sql`, `11-create-analytics.sql`
- Rename: `05-create-cart.sql`→`03-create-cart.sql`, `06-create-order.sql`→`04-create-order.sql`, `07-create-payment.sql`→`05-create-payment.sql`, `08-create-shipping.sql`→`06-create-shipping.sql`, `02-create-auth.sql`→`01-create-auth.sql`, `03-create-products.sql`→`02-create-products.sql`
- Create: `init-multi-db/07-create-content.sql`, `ms-content/pom.xml`, `ms-content/src/main/java/cl/accesorioschic/content/ContentApplication.java`, `ms-content/src/main/resources/application.yml`
- Modify: `docker-compose.yml`, `create-databases.bat`, `run-all.bat`, `api-gateway/src/main/resources/application.yml`
- Modify: `pom.xml` (dependencyManagement: añadir `springdoc-openapi-starter-webmvc-ui` 2.8.6)
- Modify: los 8 `pom.xml` de servicio (dependencia springdoc)

**Interfaces:**
- Produces: módulos `common, eureka, api-gateway, ms-auth, ms-product, ms-cart, ms-order, ms-payment, ms-shipping, ms-content`; base `content_db`; rutas de gateway `/api/v1/{auth,users,roles,regions,comunas}`→`ms-auth`, `/api/v1/{products,categories,favorites}`→`ms-product`, `/api/v1/cart`→`ms-cart`, `/api/v1/orders`→`ms-order`, `/api/v1/payments`→`ms-payment`, `/api/v1/shipping`→`ms-shipping`, `/api/v1/{news,contact}`→`ms-content`.

- [ ] **Step 1: Eliminar los cuatro módulos y sus scripts**

```bash
git rm -r ms-inventory ms-review ms-notification ms-analytics
git rm init-multi-db/04-create-inventory.sql init-multi-db/09-create-notification.sql init-multi-db/10-create-review.sql init-multi-db/11-create-analytics.sql
```

- [ ] **Step 2: Quitar esos módulos de `pom.xml`, de `docker-compose.yml` y de los `.bat`**

Verificar que no quede ninguna referencia: `grep -rn "ms-inventory\|ms-review\|ms-notification\|ms-analytics" --include=*.xml --include=*.yml --include=*.bat .`

- [ ] **Step 3: Renumerar los scripts y reescribir `01-create-databases.sql`**

Debe crear `auth_db`, `products_db`, `cart_db`, `order_db`, `payment_db`, `shipping_db`, `content_db` con `CREATE DATABASE ... OWNER postgres;`. Eliminar los `DROP` de las bases que ya no existen.

- [ ] **Step 4: Crear `init-multi-db/07-create-content.sql`**

```sql
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY, titulo VARCHAR(200) NOT NULL, resumen TEXT,
  imagen_url VARCHAR(500), fecha DATE, slug VARCHAR(200) UNIQUE NOT NULL,
  categoria VARCHAR(100), autor VARCHAR(150), publicada BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE IF NOT EXISTS news_paragraphs (
  id UUID PRIMARY KEY, news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  orden INT NOT NULL, texto TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY, nombre VARCHAR(100) NOT NULL, apellido VARCHAR(100),
  email VARCHAR(150) NOT NULL, mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW());
```

- [ ] **Step 5: Eliminar Kafka del compose y de los `application.yml`**

Quitar el servicio `kafka`, `zookeeper` si existe, y todo bloque `spring.kafka.*`. En los 8 `application.yml` cambiar `jpa.hibernate.ddl-auto: update` por `validate`.

- [ ] **Step 6: Añadir springdoc a los 8 servicios**

En `dependencyManagement` del pom raíz fijar `org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.6`; en cada servicio agregar la dependencia. En su `SecurityConfig`, permitir `/v3/api-docs/**`, `/swagger-ui/**`, `/swagger-ui.html`.

- [ ] **Step 7: Crear el esqueleto de `ms-content`**

Mismo formato que `ms-auth` (web, data-jpa, validation, postgresql, common, eureka, actuator, lombok, springdoc) con `server.port: 8089` y `spring.datasource.url: jdbc:postgresql://localhost:5433/content_db`.

- [ ] **Step 8: Reescribir las rutas del gateway**

Siete rutas con `uri: lb://<servicio>` y `Path=/api/v1/<recurso>/**`, sin rutas viejas. Mantener el bloque CORS con `http://localhost:5173`.

- [ ] **Step 9: Verificar que compila todo**

Run: `mvn -q -DskipTests package`
Expected: BUILD SUCCESS y ningún `grep -ri kafka --include=*.java --include=*.yml .` con resultados.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "refactor: reduce a 8 microservicios, elimina Kafka y añade ms-content"
```

---

### Task 2: Identidad `uid` en `common`

**Files:**
- Modify: `common/src/main/java/.../security/JwtTokenProvider.java`
- Modify: `common/src/main/java/.../security/SecurityUtils.java`
- Modify: `common/src/main/java/.../security/FeignClientConfig.java`
- Modify: `common/src/main/java/.../security/JwtAuthenticationFilter.java`
- Delete: `common/src/main/java/.../event/*.java` (9 clases)

**Interfaces:**
- Produces: `String generateToken(Long userId, String email, String nombre, String rol)`; `Long getUserIdFromToken(String token)`; `Long SecurityUtils.currentUserId()`; `void SecurityUtils.requireSelfOrAdmin(String resourceUserId)`; `boolean SecurityUtils.isAdmin()`; interceptor Feign que copia `Authorization`.
- Consumes: `JwtProperties` existente.

- [ ] **Step 1: Escribir el test del token**

`common/src/test/java/.../security/JwtTokenProviderTest.java`

```java
@Test void generaYLeeElUid() {
  var provider = new JwtTokenProvider(propsConSecretoDe64BytesY24h());
  String token = provider.generateToken(7L, "a@b.cl", "Ana", "CUSTOMER");
  assertEquals(7L, provider.getUserIdFromToken(token));
  assertEquals("a@b.cl", provider.getEmailFromToken(token));
  assertTrue(provider.validateToken(token));
}
@Test void rechazaTokenAlterado() {
  assertFalse(provider.validateToken(token + "x"));
}
```

- [ ] **Step 2: Ejecutar el test y ver que falla**

Run: `mvn -q -pl common test -Dtest=JwtTokenProviderTest`
Expected: FAIL — no existe `getUserIdFromToken` ni la firma de 4 parámetros.

- [ ] **Step 3: Implementar los cambios en `common`**

`generateToken` agrega `.claim("uid", userId)` y recibe el id primero. `getUserIdFromToken` lee `claims.get("uid", Long.class)`. `JwtAuthenticationFilter` deja el `uid` en el `Authentication` como principal numérico auxiliar o en un request attribute `uid`. `SecurityUtils` compara contra ese `uid` y deja pasar a `ADMIN`. `FeignClientConfig` agrega:

```java
@Bean RequestInterceptor jwtPropagation() {
  return template -> {
    var attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
    if (attrs != null) {
      String auth = attrs.getRequest().getHeader(HttpHeaders.AUTHORIZATION);
      if (auth != null) template.header(HttpHeaders.AUTHORIZATION, auth);
    }
  };
}
```

- [ ] **Step 4: Ejecutar los tests**

Run: `mvn -q -pl common test`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add common
git commit -m "feat(common): uid en el JWT, autorizacion por uid y propagacion Feign"
```

---

### Task 3: Esquema y semillas de `ms-auth`

**Files:**
- Rewrite: `init-multi-db/01-create-auth.sql`
- Modify: `ms-auth/src/main/java/.../model/User.java`
- Create: `ms-auth/src/main/java/.../model/Region.java`, `.../model/Comuna.java`
- Create: `ms-auth/src/main/java/.../repository/RegionRepository.java`, `.../repository/ComunaRepository.java`
- Modify: `ms-auth/src/main/java/.../service/AuthService.java` (login usa `generateToken(id, email, nombre, rol)`)

**Interfaces:**
- Produces: entidades `User(Long id, String run, String email, String password, String nombre, String apellidos, LocalDate fechaNacimiento, Role role, Region region, Comuna comuna, String direccion, Boolean activo)`, `Region(Integer id, String name, Integer orden)`, `Comuna(Integer id, String name, Region region)`; repos `RegionRepository.findAllByOrderByOrdenAsc()`, `ComunaRepository.findByRegionIdOrderByNameAsc(Integer regionId)`.

- [ ] **Step 1: Reescribir el script**

Crear `roles` con ids explícitos 1/2/3, `regions(id, name, orden)` y `comunas(id, name, region_id)`; `users` con las columnas del spec; `audit_log` intacto. Insertar 16 regiones con ids 1-16 y las comunas extraídas de `frontend-react/src/data/seed.ts` con ids explícitos.

- [ ] **Step 2: Ajustar la entidad y crear las nuevas**

`User` con `@ManyToOne` a `Region` y `Comuna` (fetch LAZY, `@JoinColumn(name="region_id")`), `run` único. `Region`/`Comuna` con ids asignados manualmente (`@Id` sin `@GeneratedValue`). `Role` mantiene `@GeneratedValue` desactivado si los ids son explícitos: usar `@Id` simple.

- [ ] **Step 3: Hashes BCrypt de los 4 usuarios demo**

Generar con `mvn -q -pl ms-auth exec:java` o un `main` temporal usando el `BCryptPasswordEncoder`, y guardarlos en el script para `admin@gmail.com/admin123`, `vendedor@gmail.com/vend1234`, `camila@gmail.com/cliente1`, `diego@gmail.com/diego123`.

- [ ] **Step 4: Recrear la base y arrancar**

Run: `docker compose up -d postgres && psql -h localhost -p 5433 -U postgres -f init-multi-db/01-create-databases.sql` y luego el script de auth.
Expected: tablas creadas, `SELECT count(*) FROM regions` = 16.

- [ ] **Step 5: Verificar el arranque con `validate`**

Run: `mvn -q -pl ms-auth spring-boot:run` (con eureka arriba)
Expected: arranca sin `SchemaManagementException`.

- [ ] **Step 6: Commit**

```bash
git add init-multi-db ms-auth
git commit -m "feat(auth): regiones, comunas y perfil completo de usuario"
```

---

### Task 4: Endpoints de `ms-auth`

**Files:**
- Create: `ms-auth/src/main/java/.../controller/UserController.java`, `.../controller/MasterDataController.java`
- Create: `ms-auth/src/main/java/.../dto/UserResponse.java`, `UpdateUserRequest.java`, `UpdateProfileRequest.java`
- Modify: `.../dto/AuthResponse.java`, `.../dto/RegisterRequest.java`, `.../controller/AuthController.java`, `.../service/AuthService.java`, `.../config/SecurityConfig.java`

**Interfaces:**
- Consumes: `JwtTokenProvider.generateToken(Long, String, String, String)`, `SecurityUtils.currentUserId()/isAdmin()`.
- Produces: `AuthResponse(String token, UserResponse usuario, String rol)`; `UserResponse(Long id, String run, String nombre, String apellidos, String email, LocalDate fechaNacimiento, Integer roleId, String roleName, Integer regionId, String regionName, Integer comunaId, String comunaName, String direccion, Boolean activo)`; endpoints `GET/PUT /api/v1/auth/me`, `GET /api/v1/users?q=`, `GET|PUT|DELETE /api/v1/users/{id}`, `GET /api/v1/regions`, `GET /api/v1/comunas?regionId=`, `GET /api/v1/roles`.

- [ ] **Step 1: Escribir el test de autorización del controlador**

`UserControllerTest` con `@WebMvcTest` y `@WithMockUser`: `GET /api/v1/users` con rol CUSTOMER → 403; con ADMIN → 200. `GET /api/v1/regions` sin autenticación → 200.

- [ ] **Step 2: Correr el test y verlo fallar**

Run: `mvn -q -pl ms-auth test -Dtest=UserControllerTest`
Expected: FAIL — 404 en los endpoints.

- [ ] **Step 3: Implementar DTOs, servicio y controladores**

`AuthService.me()` busca por email del `Authentication` y devuelve `UserResponse`. `updateProfile` solo permite nombre, apellidos, fechaNacimiento, regionId, comunaId, direccion. `deleteUser` marca `activo=false`. Los endpoints de usuarios y roles usan `@PreAuthorize("hasRole('ADMIN')")`. `SecurityConfig` deja públicos `POST /api/v1/auth/register|login`, `GET /api/v1/regions`, `GET /api/v1/comunas` y los de Swagger.

- [ ] **Step 4: Correr los tests**

Run: `mvn -q -pl ms-auth test`
Expected: PASS.

- [ ] **Step 5: Prueba manual del flujo**

```bash
curl -s -X POST localhost:9000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@gmail.com","password":"admin123"}'
curl -s localhost:9000/api/v1/auth/me -H "Authorization: Bearer $TOKEN"
```
Expected: el login devuelve `datos.token` y `datos.usuario.run`; `/me` devuelve el perfil completo.

- [ ] **Step 6: Commit**

```bash
git add ms-auth
git commit -m "feat(auth): perfil, CRUD de usuarios y catalogos de geografia"
```

---

### Task 5: Stock y catálogo en `ms-product`

**Files:**
- Rewrite: `init-multi-db/02-create-products.sql`
- Modify: `ms-product/src/main/java/.../model/Product.java`, `.../dto/ProductRequest.java`, `.../dto/ProductResponse.java`
- Create: `.../dto/StockItemRequest.java`, `.../dto/StockOperationResponse.java`, `.../dto/ProductBatchRequest.java`
- Modify: `.../repository/ProductRepository.java`, `.../service/ProductService.java`, `.../controller/ProductController.java`
- Test: `ms-product/src/test/java/.../service/ProductStockServiceTest.java`

**Interfaces:**
- Produces: `void reserveStock(List<StockItemRequest>)`; `void confirmStock(List<StockItemRequest>)`; `void releaseStock(List<StockItemRequest>)`; `void restoreStock(List<StockItemRequest>)`; `List<ProductResponse> batch(List<UUID> ids)`; `StockItemRequest(UUID productId, int quantity)`; endpoints `POST /api/v1/products/stock/{reserve|confirm|release|restore}`, `POST /api/v1/products/batch`, `GET /api/v1/products?lowStock=true`.

- [ ] **Step 1: Escribir el test de reserva**

```java
@Test void reservaFallaSinDisponible() {
  when(repo.reserve(id, 5)).thenReturn(0);
  assertThrows(InsufficientStockException.class, () -> service.reserveStock(List.of(new StockItemRequest(id, 5))));
}
@Test void reservaExitosaAcumula() {
  when(repo.reserve(id, 3)).thenReturn(1);
  service.reserveStock(List.of(new StockItemRequest(id, 3)));
  verify(repo).reserve(id, 3);
}
```

- [ ] **Step 2: Correr y ver fallar**

Run: `mvn -q -pl ms-product test -Dtest=ProductStockServiceTest`
Expected: FAIL — no existe `reserveStock`.

- [ ] **Step 3: Implementar el esquema y la reserva atómica**

Columnas nuevas en `products`. En el repositorio:

```java
@Modifying @Query(value = "UPDATE products SET reserved_quantity = reserved_quantity + :q " +
  "WHERE id = :id AND stock_quantity - reserved_quantity >= :q", nativeQuery = true)
int reserve(@Param("id") UUID id, @Param("q") int quantity);
```

`confirm`: `UPDATE products SET stock_quantity = stock_quantity - :q, reserved_quantity = reserved_quantity - :q WHERE id=:id AND reserved_quantity >= :q`. `release`: resta `reserved_quantity`. `restore`: suma `stock_quantity`. Cada uno con `@Transactional` y `InsufficientStockException` si devuelve 0.

- [ ] **Step 4: Exponer stock en los DTOs y el filtro `lowStock`**

`ProductResponse` agrega `stockQuantity`, `reservedQuantity`, `lowStockThreshold`, `available` (`stockQuantity - reservedQuantity`).

- [ ] **Step 5: Correr los tests**

Run: `mvn -q -pl ms-product test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add init-multi-db/02-create-products.sql ms-product
git commit -m "feat(product): stock con reserva atomica y precios por lote"
```

---

### Task 6: Categorías y favoritos en `ms-product`

**Files:**
- Create: `ms-product/src/main/java/.../controller/CategoryController.java`, `.../dto/CategoryRequest.java`, `.../dto/CategoryResponse.java`, `.../model/Favorite.java`, `.../repository/FavoriteRepository.java`, `.../controller/FavoriteController.java`, `.../service/FavoriteService.java`
- Modify: `init-multi-db/02-create-products.sql` (tabla `favorites`), `.../config/SecurityConfig.java` (crear si no existe)

**Interfaces:**
- Produces: `CategoryResponse(UUID id, String name, String description, boolean activa)`; `CRUD /api/v1/categories`; `GET /api/v1/favorites` → `List<UUID>`; `POST|DELETE /api/v1/favorites/{productId}`; `FavoriteService.toggle(String uid, UUID productId)`.

- [ ] **Step 1: Escribir el test de favoritos**

`FavoriteServiceTest`: alternar dos veces deja la tabla vacía; `list` devuelve solo los del `uid` recibido.

- [ ] **Step 2: Correr y ver fallar**

Run: `mvn -q -pl ms-product test -Dtest=FavoriteServiceTest`
Expected: FAIL — clase inexistente.

- [ ] **Step 3: Implementar**

`favorites` con `UNIQUE(user_id, product_id)`. `FavoriteController` toma el `uid` de `SecurityUtils.currentUserId()`, nunca del path. `CategoryController` con `@PreAuthorize("hasRole('ADMIN')")` en escrituras y lectura pública.

- [ ] **Step 4: Correr los tests y probar por HTTP**

Run: `mvn -q -pl ms-product test`
Expected: PASS. Luego `curl localhost:9000/api/v1/categories` → 200 sin token.

- [ ] **Step 5: Commit**

```bash
git add ms-product
git commit -m "feat(product): CRUD de categorias y favoritos por usuario"
```

---

### Task 7: Carrito por `uid` y fusión al iniciar sesión

**Files:**
- Modify: `ms-cart/src/main/java/.../controller/CartController.java`, `.../service/CartService.java`, `.../client/ProductClient.java`, `.../config/SecurityConfig.java`
- Test: `ms-cart/src/test/java/.../service/CartMergeTest.java`

**Interfaces:**
- Consumes: `SecurityUtils.requireSelfOrAdmin(String uid)`.
- Produces: `CartResponse merge(String uid, List<CartItemRequest>)` en `POST /api/v1/cart/{uid}/merge`; todas las rutas de carrito exigen que el `uid` del path sea el del token (o ADMIN).

- [ ] **Step 1: Escribir el test de fusión**

```java
@Test void fusionaSumandoCantidades() { /* 2 + 3 = 5 en un solo item */ }
@Test void respetaElStockDisponible() { /* 2 + 99 -> 7 si hay 7 disponibles */ }
```

- [ ] **Step 2: Correr y ver fallar**

Run: `mvn -q -pl ms-cart test -Dtest=CartMergeTest`
Expected: FAIL — no existe `merge`.

- [ ] **Step 3: Implementar**

`ProductClient` pasa a `/api/v1/products/{id}` y `/api/v1/products/batch`. `merge` recorre los items locales, busca el carrito por `uid`, suma cantidades y recorta contra el disponible del producto. `SecurityConfig` deja solo Swagger y actuator públicos.

- [ ] **Step 4: Correr los tests**

Run: `mvn -q -pl ms-cart test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add ms-cart
git commit -m "feat(cart): carrito por uid y fusion del carrito anonimo"
```

---

### Task 8: Órdenes con folio, snapshot y estadísticas

**Files:**
- Rewrite: `init-multi-db/04-create-order.sql`
- Modify: `ms-order/src/main/java/.../model/Order.java`, `.../model/OrderItem.java`, `.../repository/OrderRepository.java`
- Create: `.../dto/OrderStatsResponse.java`, `.../dto/CheckoutRequest.java`
- Modify: `.../service/OrderService.java`, `.../controller/OrderController.java`
- Delete: `ms-order/src/main/java/.../config/KafkaTopicConfig.java`, `.../client/InventoryClient.java`, `.../dto/InventoryReservationRequest.java`
- Test: `ms-order/src/test/java/.../service/FolioGeneratorTest.java`

**Interfaces:**
- Produces: `String OrderService.nextFolio()` → `CH-YYYYMMDD-NNNNNN`; `OrderStatsResponse(double totalSales, long totalOrders, double averageTicket, Map<String,Long> ordersByStatus, List<TopProduct> topProducts)` con `record TopProduct(UUID productId, String productName, long quantity, double amount)`; endpoints `GET /api/v1/orders` (ADMIN/SELLER) y `GET /api/v1/orders/stats`.

- [ ] **Step 1: Escribir el test del folio**

```java
@Test void folioTieneElFormatoEsperado() {
  when(repo.nextFolioSequence()).thenReturn(42L);
  assertEquals("CH-20261118-000042", service.nextFolio(LocalDate.of(2026, 11, 18)));
}
```

- [ ] **Step 2: Correr y ver fallar**

Run: `mvn -q -pl ms-order test -Dtest=FolioGeneratorTest`
Expected: FAIL.

- [ ] **Step 3: Implementar esquema y entidades**

Agregar `order_folio_seq` (`CREATE SEQUENCE order_folio_seq START 1`), columnas de snapshot y envío, `order_items.sku`. `OrderRepository.nextFolioSequence()` con `@Query(value="SELECT nextval('order_folio_seq')", nativeQuery=true)`.

- [ ] **Step 4: Implementar `/stats` y los listados**

`/stats` se calcula solo con `order_db`: suma de `total_amount` de órdenes no canceladas, conteo por estado, ticket promedio y top 5 por cantidad desde `order_items`. No llama a otros servicios.

- [ ] **Step 5: Correr los tests**

Run: `mvn -q -pl ms-order test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add init-multi-db/04-create-order.sql ms-order
git commit -m "feat(order): folio secuencial, snapshot del cliente y estadisticas"
```

---

### Task 9: Orquestación del checkout

**Files:**
- Create: `ms-order/src/main/java/.../client/PaymentClient.java`, `.../client/ShippingClient.java`, `.../dto/PaymentRequest.java`, `.../dto/ShipmentRequest.java`
- Modify: `.../client/ProductClient.java`, `.../service/OrderService.java`, `.../controller/OrderController.java`, `.../model/OrderStatus.java`
- Test: `ms-order/src/test/java/.../service/CheckoutOrchestrationTest.java`

**Interfaces:**
- Consumes: `ProductClient.reserveStock(List<StockItemRequest>)`, `ProductClient.confirmStock(...)`, `ProductClient.releaseStock(...)`, `ProductClient.batch(List<UUID>)`, `PaymentClient.create(PaymentRequest)`, `ShippingClient.create(ShipmentRequest)`.
- Produces: `OrderResponse checkout(CheckoutRequest, Long uid, String email, String nombreCompleto)`; `CheckoutRequest(String shippingAddress, String shippingRegion, String shippingComuna, String shippingPhone, String paymentMethod, List<ItemRequest> items)`, `ItemRequest(UUID productId, int quantity)`.

- [ ] **Step 1: Escribir el test de compensación**

```java
@Test void siElPagoFallaLiberaElStockYcancela() {
  when(productClient.batch(any())).thenReturn(precios);
  when(paymentClient.create(any())).thenThrow(new PaymentFailedException("rechazado"));
  assertThrows(PaymentFailedException.class, () -> service.checkout(req, 7L, "a@b.cl", "Ana"));
  verify(productClient).releaseStock(argThat(i -> i.size() == 1));
  assertTrue(orderCapturada.get().getStatus() == OrderStatus.CANCELLED);
}
@Test void elTotalSeCalculaEnElServidor() { /* cliente manda quantity, no price */ }
```

- [ ] **Step 2: Correr y ver fallar**

Run: `mvn -q -pl ms-order test -Dtest=CheckoutOrchestrationTest`
Expected: FAIL.

- [ ] **Step 3: Implementar la secuencia con compensación**

1. reservar stock (409 si falla, sin crear orden); 2. pedir precios reales por lote; 3. crear orden `PENDING` con folio y snapshot; 4. cobrar el total calculado; 5. crear envío; 6. confirmar stock; 7. `CONFIRMED`. Fallo en 4 → liberar + `CANCELLED` + 402. Fallo en 5 → reembolsar + liberar + `CANCELLED` + 502. Fallo en 6 → reembolsar + cancelar.

- [ ] **Step 4: Implementar `cancel`**

Libera si estaba reservado, restaura si estaba confirmado, reembolsa si el pago está `COMPLETED` y marca el envío `CANCELLED`.

- [ ] **Step 5: Correr los tests**

Run: `mvn -q -pl ms-order test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add ms-order
git commit -m "feat(order): checkout orquestado con compensacion"
```

---

### Task 10: Pagos y envíos idempotentes

**Files:**
- Modify: `init-multi-db/05-create-payment.sql`, `init-multi-db/06-create-shipping.sql`
- Modify: `ms-payment/src/main/java/.../service/PaymentService.java`, `.../model/Payment.java`, `.../controller/PaymentController.java`
- Delete: `ms-payment/src/main/java/.../client/OrderClient.java`, `.../config/KafkaTopicConfig.java`, `ms-shipping/src/main/java/.../kafka/PaymentCompletedConsumer.java`, `.../client/ShippingOrderClient.java`
- Modify: `ms-shipping/src/main/java/.../model/Shipment.java`, `.../dto/ShipmentRequest.java`, `.../dto/ShipmentResponse.java`
- Test: `ms-payment/src/test/java/.../service/PaymentIdempotencyTest.java`

**Interfaces:**
- Produces: `PaymentResponse create(PaymentRequest)` idempotente por `orderId`; `Shipment` con `region` y `comuna`; `UNIQUE(order_id)` en `payments` y `shipments`.

- [ ] **Step 1: Escribir el test de idempotencia**

```java
@Test void dosPagosDelMismoPedidoDevuelvenElMismo() {
  when(repo.findByOrderId(orderId)).thenReturn(Optional.of(existente));
  var r = service.create(req);
  assertEquals(existente.getId(), r.id());
  verify(repo, never()).save(any());
}
```

- [ ] **Step 2: Correr y ver fallar**

Run: `mvn -q -pl ms-payment test -Dtest=PaymentIdempotencyTest`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`PaymentService.create` busca por `orderId` antes de insertar. Se elimina la llamada que ponía la orden en `PAID`. `ms-shipping` agrega `region`/`comuna` a entidad, DTO y tabla; su creación también es idempotente por `orderId`.

- [ ] **Step 4: Correr los tests**

Run: `mvn -q -pl ms-payment test && mvn -q -pl ms-shipping test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add ms-payment ms-shipping init-multi-db
git commit -m "feat(payment,shipping): idempotencia por orden y envio con region/comuna"
```

---

### Task 11: `ms-content` (blog y contacto)

**Files:**
- Create: `ms-content/src/main/java/.../model/{News,NewsParagraph,ContactMessage}.java`
- Create: `ms-content/src/main/java/.../repository/{NewsRepository,ContactMessageRepository}.java`
- Create: `ms-content/src/main/java/.../dto/{NewsResponse,ContactRequest}.java`
- Create: `ms-content/src/main/java/.../service/{NewsService,ContactService}.java`
- Create: `ms-content/src/main/java/.../controller/{NewsController,ContactController}.java`
- Create: `ms-content/src/main/java/.../config/SecurityConfig.java`
- Test: `ms-content/src/test/java/.../service/NewsServiceTest.java`

**Interfaces:**
- Produces: `GET /api/v1/news?page=&size=` → `Page<NewsResponse>`; `GET /api/v1/news/{slug}`; `POST /api/v1/contact`; `GET /api/v1/contact` (ADMIN); `NewsResponse(UUID id, String titulo, String resumen, String imagen, LocalDate fecha, String slug, String categoria, String autor, List<String> parrafos)`.

- [ ] **Step 1: Escribir el test del mapeo**

`NewsServiceTest`: una `News` con 3 párrafos desordenados devuelve `parrafos` en orden por `orden`.

- [ ] **Step 2: Correr y ver fallar**

Run: `mvn -q -pl ms-content test -Dtest=NewsServiceTest`
Expected: FAIL.

- [ ] **Step 3: Implementar modelo, servicio y controladores**

Listado paginado ordenado por `fecha DESC`, solo `publicada = true`. Escrituras con `@PreAuthorize("hasRole('ADMIN')")`. Validación de `ContactRequest` con `@Email` y `mensaje` no vacío.

- [ ] **Step 4: Correr los tests**

Run: `mvn -q -pl ms-content test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add ms-content
git commit -m "feat(content): blog y mensajes de contacto"
```

---

### Task 12: Cliente HTTP y autenticación del frontend

**Files:**
- Create: `frontend-react/src/api/client.ts`, `.../api/auth.ts`, `.../api/catalog.ts`, `.../api/cart.ts`, `.../api/orders.ts`, `.../api/content.ts`, `.../api/favorites.ts`
- Create: `frontend-react/.env.example`
- Modify: `frontend-react/src/storage/claves.ts`, `frontend-react/src/context/AuthContext.tsx`, `frontend-react/src/types/index.ts`
- Test: `frontend-react/src/api/client.test.ts`

**Interfaces:**
- Produces: `apiGet<T>(path)`, `apiPost<T>(path, body)`, `apiPut<T>(path, body)`, `apiDelete<T>(path)` que leen `chic_token` y devuelven `ApiResponse.datos`; `getToken()/setToken()/clearToken()`; `login(email, password)` → `{token, usuario, rol}`; `me()`, `register()`, `updateProfile()`.
- Consumes: gateway en `import.meta.env.VITE_API_URL ?? "http://localhost:9000"`.

- [ ] **Step 1: Escribir el test del cliente**

```ts
it("agrega el Bearer y desenvuelve datos", async () => {
  localStorage.setItem("chic_token", "abc");
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ exitoso: true, datos: { id: 1 } }) });
  await expect(apiGet("/api/v1/auth/me")).resolves.toEqual({ id: 1 });
  expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/v1/auth/me"), expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer abc" }) }));
});
it("lanza ApiError con el mensaje del backend", async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 401, json: async () => ({ exitoso: false, mensaje: "Credenciales invalidas" }) });
  await expect(apiGet("/x")).rejects.toThrow("Credenciales invalidas");
});
```

- [ ] **Step 2: Correr y ver fallar**

Run: `cd frontend-react && npx vitest run src/api/client.test.ts`
Expected: FAIL — módulo inexistente.

- [ ] **Step 3: Implementar `client.ts` y los módulos**

`client.ts` centraliza baseURL, token, parseo de `ApiResponse` y `ApiError(status, mensaje)`. En 401 limpia `chic_token` y `chic_usuario`. `auth.ts` expone las llamadas de sesión y usuarios.

- [ ] **Step 4: Reescribir `AuthContext`**

Login contra `POST /api/v1/auth/login`, guarda `chic_token` y `chic_usuario`, rehidrata con `GET /api/v1/auth/me` al montar, `esAdmin`/`esVendedor` desde `rol`. `CHIC_KEYS` queda con `sesion`, `carritoPendiente`, `version`.

- [ ] **Step 5: Correr tests y build**

Run: `cd frontend-react && npx vitest run && npm run build`
Expected: PASS y build sin errores de tipos.

- [ ] **Step 6: Commit**

```bash
git add frontend-react
git commit -m "feat(front): cliente API y autenticacion contra el backend"
```

---

### Task 13: Catálogo, carrito y checkout en el frontend

**Files:**
- Modify: `frontend-react/src/context/CartContext.tsx`, `.../hooks/useTablasMaestras.ts`, `.../data/seed.ts`
- Modify: `frontend-react/src/pages/{Home,Productos,ProductoDetalle,Carrito,CompraExitosa,MisCompras,Registro,Contacto,Blog,BlogDetalle}.tsx`
- Test: `frontend-react/src/context/CartContext.test.tsx`

**Interfaces:**
- Consumes: `catalog.ts` (`listProducts({category, search, lowStock})`, `listCategories()`, `getProduct(id)`), `cart.ts` (`getCart(uid)`, `addItem(uid, productId, quantity)`, `merge(uid, items)`), `orders.ts` (`checkout(payload)`, `myOrders(uid)`), `content.ts`.
- Produces: `Producto` con `id: string` (UUID), `codigo: string` (sku), `stock`, `stockCritico`; carrito local en `chic_carrito_pendiente` cuando no hay sesión.

- [ ] **Step 1: Escribir el test de fusión del carrito**

```tsx
it("fusiona el carrito local al iniciar sesion", async () => {
  localStorage.setItem("chic_carrito_pendiente", JSON.stringify([{ productId: "p1", cantidad: 2 }]));
  renderConSesion();
  await waitFor(() => expect(mockMerge).toHaveBeenCalledWith("7", [{ productId: "p1", cantidad: 2 }]));
  expect(localStorage.getItem("chic_carrito_pendiente")).toBeNull();
});
```

- [ ] **Step 2: Correr y ver fallar**

Run: `cd frontend-react && npx vitest run src/context/CartContext.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Reescribir `CartContext`**

Con sesión usa el carrito del servidor; sin sesión usa `chic_carrito_pendiente`; al autenticarse llama a `merge` y limpia la clave local. El checkout envía solo `productId`, `cantidad`, dirección, región, comuna, teléfono y método de pago.

- [ ] **Step 4: Migrar las páginas al API**

`Home`, `Productos` y `ProductoDetalle` leen de `catalog.ts` con estados de carga y error. `Registro` envía el formulario completo a `register()`. `Blog`/`BlogDetalle` usan `content.ts`. `Contacto` hace `POST /contact`. `MisCompras` y `CompraExitosa` leen `myOrders(uid)`.

- [ ] **Step 5: Borrar el sembrado de negocio**

`seed.ts` conserva solo tipos o constantes de UI; se eliminan `sembrarDatos()` y todas las escrituras a `chic_usuarios/productos/categorias/regiones/comunas/roles/ordenes/blog/contactos/favoritos`.

- [ ] **Step 6: Correr tests y build**

Run: `cd frontend-react && npx vitest run && npm run build`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend-react
git commit -m "feat(front): catalogo, carrito y checkout contra la API"
```

---

### Task 14: Administración y restricciones por rol

**Files:**
- Delete: `frontend-react/src/components/admin/` (duplicados)
- Modify: `frontend-react/src/pages/admin/{AdminCategorias,AdminLayout,AdminOrdenes,AdminDashboard,AdminProductos,AdminProductoForm,AdminUsuarios,AdminUsuarioForm}.tsx`
- Create: `frontend-react/src/components/RutaProtegida.tsx`
- Modify: `frontend-react/src/App.tsx`
- Test: `frontend-react/src/components/RutaProtegida.test.tsx`

**Interfaces:**
- Produces: `<RutaProtegida roles={["ADMIN","SELLER"]}>` que redirige a `/login` sin sesión y a `/cuenta` si el rol no está permitido; menú del vendedor limitado a Productos y Órdenes.

- [ ] **Step 1: Escribir el test de restricción**

```tsx
it("un cliente no entra a /admin", () => { renderConRol("CUSTOMER", "/admin"); expect(screen.getByText(/mi cuenta/i)).toBeInTheDocument(); });
it("un vendedor no ve usuarios ni categorias", () => { renderConRol("SELLER", "/admin/productos"); expect(screen.queryByText(/usuarios/i)).toBeNull(); });
```

- [ ] **Step 2: Correr y ver fallar**

Run: `cd frontend-react && npx vitest run src/components/RutaProtegida.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implementar la guarda y consolidar el admin**

`RutaProtegida` envuelve las rutas de `App.tsx` con la lista de roles por ruta (`/admin` y `/admin/usuarios` ADMIN; `/admin/productos` y `/admin/ordenes` ADMIN+SELLER). Se conserva `src/pages/admin/` y se portan `AdminCategorias`, `AdminLayout` y `AdminOrdenes` antes de borrar `src/components/admin/`.

- [ ] **Step 4: Conectar el admin a la API**

Productos y categorías con `catalog.ts`; usuarios con `auth.ts`; órdenes con `orders.ts` (`listOrders`, `updateStatus`, `stats`). El dashboard combina `/orders/stats` con `/products?lowStock=true`.

- [ ] **Step 5: Correr tests y build**

Run: `cd frontend-react && npx vitest run && npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend-react
git commit -m "feat(front): admin contra la API y restricciones por rol"
```

---

### Task 15: Cierre e integración verificada

**Files:**
- Create: `AccesoriosChic.postman_collection.json` (reescrito)
- Modify: `README.md`
- Create: `docs/integracion-apis.md`

**Interfaces:**
- Consumes: todos los endpoints anteriores.
- Produces: colección Postman con login automático que guarda el token, y documento de integración con el flujo de datos y su justificación.

- [ ] **Step 1: Levantar el stack completo**

Run: `docker compose up -d && mvn -q -DskipTests package && mvn -q -pl eureka spring-boot:run` y luego los 8 servicios.
Expected: `http://localhost:8761` lista los 8 servicios registrados.

- [ ] **Step 2: Probar el recorrido completo por HTTP**

Registro → login → listar productos → agregar al carrito → merge → checkout → consultar orden → cancelar. Cada paso debe devolver `exitoso: true` y el `folio` debe ser único.

- [ ] **Step 3: Verificar Swagger de los 8 servicios**

Run: `for p in 8081 8082 8083 8084 8085 8086 8089; do curl -s -o /dev/null -w "$p %{http_code}\n" localhost:$p/v3/api-docs; done`
Expected: `200` en todos los puertos de los servicios de dominio.

- [ ] **Step 4: Documentar**

`docs/integracion-apis.md` con el diagrama de secuencia del checkout, la tabla endpoint→servicio→rol y la justificación de REST síncrono frente a mensajería.

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "docs: coleccion Postman, guia de integracion y verificacion final"
```
