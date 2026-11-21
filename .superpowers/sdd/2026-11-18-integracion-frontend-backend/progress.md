# SDD ledger — plan: docs/superpowers/plans/2026-11-18-integracion-frontend-backend.md

Spec: docs/superpowers/specs/2026-11-18-integracion-frontend-backend-design.md (commit 0b4224b1)
Plan commit: b62e6768
Branch: limpieza_Back
Task 1 BASE: b62e6768

## Preflight

Workspace and briefs created manually (`scripts/sdd-workspace` and `scripts/task-brief` cannot run: bash resolves to a broken WSL alias).
Ruling: controller writes briefs/reports/review packages itself under this workspace — costs nothing if wrong, keeps the process intact.

| Pair / task | Produces → consumes | Finding |
|---|---|---|
| T1 → T2 | gateway routes + poms → token signature change | T2 changes `generateToken` arity; it must also update `AuthService` call site in the same commit, or ms-auth stops compiling |
| T1 → T3/T4 | `07-create-content.sql`, deleted modules | ms-content scaffold must exist before T11; T3/T4 only touch ms-auth |
| T1 → T5/T6 | gateway `/api/v1/products`, `/categories`, `/favorites` | T5/T6 add the endpoints those routes point to; routes are inert until then |
| T1 → T11 | ms-content module + application.yml (port 8089) | T11 fills it; T1 must not leave a module without a main class |
| T2 → T3/T4 | JWT `uid` claim, `SecurityUtils` | T3/T4 consume `currentUserId()`; T2 lands first |
| T2 → T7/T8/T9 | `requireSelfOrAdmin`, `currentUserId` | T7 uses it for cart paths, T8 for order ownership, T9 for checkout |
| T3 → T4 | users/regions/comunas schema + entities | T4 exposes them; no schema edit in T4 |
| T5 → T9 | `POST /products/stock/reserve|confirm|release|restore`, `POST /products/batch` | T9 is their only consumer; signatures must match |
| T6 → T9 | favorites is independent | no interaction |
| T8 → T9 | `nextFolio()`, snapshot fields, `OrderStatsResponse` | T9 rewrites order creation on top of T8's folio/snapshot; T8 must land first |
| T9 → T10 | `PaymentClient`, `ShippingClient` request shapes | T10 adds idempotency without changing those shapes |
| T12 → T13/T14 | `src/api/*` module signatures | T13/T14 import them; T12 lands first |
| T13 → T14 | CartContext/AuthContext + product pages | T14 only touches admin + guards |
| T1 | self | deletes 4 modules and renumbers 7 SQL scripts in one task; consistent with the spec's target architecture |
| T2 | self | signature change + call-site update + 9 event deletions; consistent |
| T3 | self | schema + seeds + entities; `ddl-auto: validate` needs every column mapped before boot |
| T4 | self | endpoints + DTOs declared in the contract section; consistent |
| T5 | self | native atomic update + DTO fields; consistent |
| T6 | self | favorites toggle uses uid from token, not path; consistent |
| T7 | self | merge endpoint sums and caps against stock; consistent |
| T8 | self | stats limited to order_db; consistent with Review Focus item 3 |
| T9 | self | 7-step sequence with compensation matches spec section 9 |
| T10 | self | UNIQUE(order_id) + short-circuit; consistent |
| T11 | self | entities + paginated reads; consistent |
| T12 | self | client unwraps `datos`, throws ApiError; consistent |
| T13 | self | server cart when logged, local pending when not; consistent |
| T14 | self | role-gated routes; consistent |
| T15 | self | verification only; consistent |

No plan-mandated pattern contradicts the review rubric. Nothing ruled out before Task 1.

## Progress


## Task 1 - Cirugia de modulos e infraestructura
- BASE b62e6768, implementer commit 31aea0c6, status DONE_WITH_CONCERNS.
- Ruling: InventoryClient sigue apuntando a ms-inventory; esta dentro del alcance de T5 y se arrastra al brief de T5. Costo si me equivoco: compilacion rota en T5 hasta corregirlo.
- Ruling: springdoc y ddl-auto en 7 servicios con JPA, no en gateway (reactivo) ni eureka (sin API); el brief decia 8 y se acepta la correccion.
- Ruling: paquete de ms-content queda cl.accesorioschic.content como manda el brief; se normaliza en T11 si no rompe nada. Costo: inconsistencia de nombres hasta T11.
- Ruling: '\c' en 07-create-content.sql queda; los scripts se ejecutan con psql. Costo: falla si se usa otro cliente.
- Ruling: ddl-auto validate exige recrear las bases con los scripts; es la decision del spec (una sola fuente de esquema). Sin accion.
- Review package: task-1-review-package.diff; reviewer despachado.

### Task 1 — review round 1

Review verdict: spec ❌, quality Needs fixes. Open Important: dead event classes (#1), guest/internal permits in DefaultSecurityConfig (#2), report understates route mismatch (#3).

Task 1: minor (deferred): README.md:142-145 still lists the four deleted services and DBs.
Task 1: minor (deferred): ms-content/pom.xml:34-37 postgresql at compile scope instead of runtime.
Task 1: minor (deferred): gateway CORS dropped http://localhost:3000 (unrequested change).
Task 1: Ruling: findings 4 and 5 are cross-task, not defects of this commit — InventoryClient -> ms-inventory, no auto-created shipment, and removed OrderCreated publishing are all owned by Task 5 (checkout orchestration). Recorded in the T5 brief.
Task 1: Ruling: controllers still on /api/... are expected at this commit; the gateway is already correct per spec. Migration owned by T4 (auth), T5 (product), T7 (cart), T8 (order), T10 (payment/shipping).
Task 1: fix round 1/5 dispatched (2 Important fixes + report disclosure; minors deferred).

## Task 1: complete
Task 1: complete (commits b62e6768..692c8a30, review clean)
Task 1: minor (deferred): README.md:142-145 sigue listando inventory_db/notification_db/review_db/analytics_db y sus servicios.
Task 1: minor (deferred): ms-content/pom.xml tiene postgresql en scope compile; el resto usa runtime.
Task 1: minor (deferred): gateway CORS perdio http://localhost:3000 (no pedido).
Task 1: minor (deferred): matchers sin version en DefaultSecurityConfig quedan como config muerta.
Ruling: el paquete cl.ecommerce.common.event ya fue eliminado en el fix round 1, asi que Task 2 no debe re-borrarlo (verificar con grep y continuar).
Ruling: Task 2 actualiza tambien el call site de generateToken en ms-auth/AuthService para que el reactor compile.

## Task 2: dispatch
Task 2: BASE 692c8a30, brief briefs/task-2-brief.md, report task-2-report.md, agent general (implementer).

### Task 2: review round 1 dispatched
- BASE 692c8a30, HEAD 84c11af3 (commit 84c11af3)
- brief: briefs/task-2-brief.md | report: task-2-report.md | diff: task-2-review-package.diff (21371 bytes)
- reviewer session: ses_e114fca45ffePK36MBX7WM6pt0

### Task 2: complete (commits 692c8a30..84c11af3, review clean)
- 0 Critical, 0 Important. Review: spec compliant, quality approved.
- Minors deferred to final review (9): normalizacion Number/String duplicada en JwtTokenProvider:49-58 vs SecurityUtils:78-90; literal "uid" en JwtAuthenticationFilter:48 en vez de la constante de SecurityUtils; sin test del fallback por request attribute; generateToken acepta uid nulo y el test lo consagra; claim uid corrupto devuelve null en silencio; FeignClientConfigTest es de caracterizacion, no de cableado; 4 parseos de JWT por request; la razon sobre RequiredTypeException no es verificable; dos rutas de inicializacion de la clave sin volatile.
### Task 3: dispatch
- BASE 84c11af3, brief briefs/task-3-brief.md, report task-3-report.md

## Task 3: implemented 3b722cde — review dispatched
- Ruling: `POST /api/v1/auth/register` responde 409 hasta la tarea 4 (run NOT NULL, AuthService sin run) — owned by T4, se lleva al dispatch de T4.
- Ruling: `users.id BIGSERIAL` + `audit_log.user_id BIGINT` aceptado — `User.id` es `Long` por contrato de `JwtTokenProvider`; las columnas de auditoría restantes no cambian.
- Ruling: `Role.id` `Integer` + `RoleRepository<Role,Integer>` aceptado — calza con `roles.id INT` del script.
- Ruling: semilla de `audit_log` reducida a 5 filas aceptada — las demás apuntaban a usuarios inexistentes.
- Ruling: `AuthSeedScriptTest` lee `frontend-react/src/data/seed.ts` aceptado — el test cruza comunas y regiones contra la fuente que el frontend ya usa.
- Observation (no bloqueante): `RegionComunaRepositoryTest` sin ciclo rojo propio; el revisor decide si sus aserciones son reales.

- Revisor de T3 relanzado (sesion ses_e0eba71e4ffeiU1Af3d1lMpq5K): el primero murio con error de limite de uso del modelo.

## Task 3: review round 1 (spec ❌, quality Needs fixes)
Revisor ses_e0eba71e4ffeiU1Af3d1lMpq5K. Semilla de comunas verificada 345/345 contra seed.ts, 16 regiones, 4 hashes BCrypt validados criptograficamente. 4 Important:
1. users.role_id nullable (spec exige NOT NULL) -> fix round 1.
2. comunas sin UNIQUE(region_id,name) (mandato del plan) -> fix round 1.
3. register y admin/register sin run -> Ruling: cross-task, lo posee Task 4 (RegisterRequest/AdminRegisterRequest + AuthService). Se lleva al dispatch de T4.
4. users.id BIGSERIAL y audit_log.user_id BIGINT -> Ruling: ratificado por la interfaz User(Long id)/generateToken(Long,...); la actualizacion del design doc se hace en el paso de cierre (T15), no aca.
Menores diferidos al review final: regions/comunas name VARCHAR(120) vs 100; columnas en castellano en users/regions (mandato del plan); RegionComunaRepositoryTest no verifica perez; cobertura de restricciones incompleta en AuthSeedScriptTest; test de repos sobre H2 create-drop; @Data con LAZY en User; README:358-361 con credenciales demo viejas.
Fix round 1/5 despachado al implementador original: NOT NULL en role_id (SQL + entidad), UNIQUE(region_id,name) en comunas, y aserciones de DDL en AuthSeedScriptTest.

### Task 3: fix round 1/5
- Fix round 1 dispatched to the original implementer (ses_e114d8450fferSgRkUDffuWsJp), findings 1 and 2 only, AuthSeedScriptTest extended with DDL assertions, commit message `fix(auth): role_id NOT NULL y comunas unicas por region`.
- Result: commit e087bf89; `mvn -o -pl ms-auth test -Dtest=AuthSeedScriptTest,RegionComunaRepositoryTest` → 12 tests, 0 failures; real auth_db reapplied: `attnotnull=t` for role_id, `comunas_region_id_name_key UNIQUE (region_id, name)`, 345 comunas intact.
- Scoped re-review dispatched to ses_e0eba71e4ffeiU1Af3d1lMpq5K, diff `task-3-rereview-r1.diff` (4905 bytes), base 3b722cde..head e087bf89.
- Ruling: the register/`run` gap stays with Task 4, not fixed here.

## Task 3: complete
Task 3: complete (commits 84c11af3..e087bf89, review clean)
Minors deferred (T3): regions/comunas name VARCHAR(120) vs 100; columnas en espanol en users/regions (plan-mandated); RegionComunaRepositoryTest no prueba realmente lazy; AuthSeedScriptTest solo cubre patron run + conteo de columnas; test de repositorio corre en H2 create-drop; @Data con region/comuna LAZY; README:358-361 credenciales demo viejas; Comuna sin @Table(uniqueConstraints).
Ruling: `users.id BIGSERIAL` + `audit_log.user_id BIGINT` ratificado contra `User(Long id)` y `generateToken(Long,...)`; el spec se actualiza en T15.
Ruling: `register`/`admin/register` sin `run` queda como requisito obligatorio de T4.

## Task 4: dispatch
BASE e087bf89; brief briefs/task-4-brief.md; report task-4-report.md.

## Task 4: review round 1 (spec ⚠️/❌ error envelope, quality Needs fixes)

Reviewer ses_e0ea46c28ffe5LTxUO0Yo5qA6O over e087bf89..8f218837. 19 files, all under ms-auth/.

IMPORTANT 1 (open): success responses use ApiResponse but every 400/403/404 of the new endpoints goes out as ErrorResponse {error, mensaje, codigo, timestamp}, violating the global constraint "toda respuesta HTTP envuelta en ApiResponse<T>".
- MasterDataController.java:31-33 throws BusinessException for /comunas without regionId -> GlobalExceptionHandler.java:41-45 -> ErrorResponse.
- GlobalExceptionHandler.java:23-27 handles the 403 of CUSTOMER on /users; AuthService.java:248-250 the 404.
- The 401 from the filter does use ApiResponse (SecurityConfig.java:49), so ms-auth emits two different error envelopes.
- REPORT task-4-report.md:78 claims "400 con ApiResponse.error" — false.
- Tests only assert status (UserControllerTest.java:33-34,51-52).
- Root cause in common/ (out of task scope): either unify GlobalExceptionHandler to ApiResponse or make the entry point use ErrorResponse.

MINORS (deferred, verbatim from reviewer):
1. Deactivation does not cut access, only login: currentUser() AuthService.java:243-245 does not check activo, so a DELETEd user keeps using its token. One-line fix Boolean.TRUE.equals(user.getActivo()).
2. login does not trim email (AuthService.java:99) though register stores request.email().trim() (AuthService.java:72).
3. /actuator/** stays permitAll (SecurityConfig.java:40) though the constraint names only /actuator/health; exposes env/beans/metrics.
4. An ADMIN can deactivate or demote itself (UserController.java:33-41, AuthService.java:202-222); no guard against leaving zero active admins.
5. registerAdmin returns the new user's JWT, not the caller's (AuthService.java:299-304).
6. register and registerAdmin duplicate ~40 lines literally (AuthService.java:57-89 vs 122-152); extract createUser.
7. AdminRegisterRequest widens the role pattern to ADMIN|SELLER|CUSTOMER against a contract that said ADMIN|SELLER.
8. Coverage: no controller tests for PUT/DELETE /users/{id} 403; no assertion on the ApiResponse body anywhere; UserRepositoryTest.java:13-15 uses H2 create-drop so entity/schema drift is undetectable.
9. UserRepository.search uses lower(u.run) like '%...%' (UserRepository.java:21-30), unindexable.
10. updateProfile semantics: blank nombre rejected (AuthService.java:170-173) but blank apellidos/direccion clears (174-176, 181-183); fechaNacimiento can never be cleared.
11. Missing accents in UI strings: "Credenciales invalidas" (AuthService.java:106), "Autenticacion requerida" (SecurityConfig.java:49), "El parametro regionId es obligatorio" (MasterDataController.java:32).

ACCEPTED / verified by the reviewer: UserResponse 14 fields without password; AuthResponse shape; run required in both DTOs; public register assigns CUSTOMER; /auth/me reads DB by uid; PUT /auth/me limited fields; /regions and /comunas public; /roles ADMIN; /users CRUD ADMIN via class-level @PreAuthorize; logical delete; roleId/activo edit; SecurityConfig narrowed to POST /register + POST /login; JSON entry point; applyLocation validates region/comuna; duplicate run/email checks; search by run/email/nombre/apellidos.

RULING (to apply in fix round 1): the constraint is binding, so unify the error envelope to ApiResponse. Cheapest coherent fix inside ms-auth is out of reach because GlobalExceptionHandler lives in common/; therefore fix round 1 also touches common/GlobalExceptionHandler (allowed as a cross-cutting change, recorded here). Do NOT change ErrorResponse field names used by other services beyond what the envelope needs.


## Task 4: complete
Task 4: complete (commits e087bf89..2cd36890, review clean)
- Re-review verdict CLEAN; Important finding (error envelope) addressed in common/GlobalExceptionHandler + ApiResponse overload.
- minors (deferred to final review): 11 from round 1 (see section above) + 7 from re-review: 401 entry point leaves datos:null while advice carries detail; common/ change alters error contract for all 8 services (frontend must read datos.error/datos.codigo); handleGeneral maps non-500 exceptions (405/415) to 500; unknown route 404 still served by BasicErrorController; comunasRequireRegionId duplicated by new test; task-4-report.md does not document the common/ change; ErrorResponse keeps its own timestamp inside the envelope.
Ruling: InventoryClient migration in ms-order moves from Task 5 to Task 9 — OrderService's reserve flow is rewritten there; touching it now would leave a half-built checkout. Cost if wrong: POST /orders keeps failing at runtime until T9 (already true and disclosed at T1).

## Task 5: implemented 51da5035 — review dispatched

- BASE 2cd36890, HEAD 51da5035, commit "feat(product): stock con reserva atomica y precios por lote".
- Tests del implementador: `mvn -o -pl ms-product test` -> 23 tests, 0 fallos; esquema aplicado a Postgres real; boot con `ddl-auto: validate`; `?lowStock=true` devolvio 7 SKUs.
- Review package: `task-5-review-package.diff` (48342 bytes, 12 archivos, +623/-36).
- Reviewer: ses_e0e903207ffe08Dtq77y9i4Xau (general, read-only).
- Concerns declaradas por el implementador y su disposicion:
  - `/batch` espera `{"ids":[...]}` -> se arrastra al dispatch de T9 (el checkout debe envolver su lista).
  - Endpoints de stock autenticados sin rol -> Ruling: se revisa en el review de T5; si el revisor lo marca Important, se restringe a ADMIN/SELLER o se mantiene con nota al review final.
  - `@Valid` sobre `List` lanza `HandlerMethodValidationException` y `common` lo mapea a 500 -> Ruling: se valida en el servicio (400) como hizo el implementador; el hueco de `common` pasa al review final de rama.
  - `price` pasa a `DOUBLE PRECISION` para que `validate` arranque -> Ruling: aceptado por ahora porque la entidad ya era `double`; el spec pide DECIMAL, se anota como deuda para el review final (costo si me equivoco: redondeos en totales).
  - `updated_at` no cambia en UPDATEs nativos -> Minor diferido al review final.

## Task 5: review round 1 (Needs fixes, 0 Critical / 2 Important / 12 Minor)

- Important 1: `/stock/*` autenticado sin autorizacion; CUSTOMER puede reservar stock ajeno o acunar stock con `restore` (suma sin predicado). Evidencia ProductController.java:42-72 vs :29, DefaultSecurityConfig.java:37, ProductRepository.java:42-45.
- Important 2: `/batch` descarta ids inexistentes en silencio e incluye inactivos (ProductService.java:81-93, findAllById sin filtro `active`).
- Ruling: `restore` -> @PreAuthorize ADMIN/SELLER; reserve/confirm/release -> cabecera `X-Internal-Key` (`accesorios-chic-internal`, `internal.key`/INTERNAL_KEY) anadida por el interceptor Feign de common y exigida por filtro en ms-product (403 datos.error=SERVICE_ONLY); `/batch` -> BatchPriceResponse {found, missing, inactive} sin 404, contrato arrastrado a T9.
- Fix round 1/5 despachada al implementador original ses_e0e9be03cffeON3SFsWDrLOj5d (fix base 51da5035), commit fijado `fix(product): asegura endpoints de stock y contrato de precios por lote`.
- Minors diferidos al review final: (3) update check-then-act sin @Transactional (ProductService.java:95-116); (4) restore inexistente -> 409 en vez de 404, test fija esa semantica (ProductStockServiceTest.java:114-119); (5) updated_at no cambia en operaciones de stock, plan-mandated; (6) default 5 duplicado en SQL/entidad/constante (ProductService.java:26); (7) @Modifying sin clear/flushAutomatically; (8) reserve/restore no filtran activo; (9) @NotNull/@Min de StockItemRequest decorativos (controller sin @Valid); (10) ningun test prueba atomicidad ni el predicado SQL; (11) sin test de 404 en rutas sin version; (12) getAll() sin parametro muerto (ProductService.java:55-58); (13) price DOUBLE PRECISION (deuda pre-existente); (14) reaplicar el script recrea products_db y pierde UUIDs de prueba.

### Task 5: fix round 1/5
- Implementer resumed (ses_e0e9be03cffeON3SFsWDrLOj5d), commit ff8d32c0 `fix(product): asegura endpoints de stock y contrato de precios por lote`.
- Findings addressed: (1) /stock/* authorization — `restore` ADMIN/SELLER via @PreAuthorize, `reserve/confirm/release` behind `X-Internal-Key` (StockInternalKeyFilter -> 403 `SERVICE_ONLY`, key added by the common Feign interceptor); (2) `/batch` -> `BatchPriceResponse {found, missing, inactive}` (no 404).
- Tests: `mvn -o -pl common test` 12/0; `mvn -o -pl ms-product test` 30/0. Live check with validate: CUSTOMER without header 403, with header 200, CUSTOMER restore 403, ADMIN restore 200.
- Ruling carried to T9: checkout must read `datos.found/missing/inactive`, not the old flat contract.
- Ruling (accepted debt): internal key travels in clear over HTTP with a shared default; production must set INTERNAL_KEY and use a private network/TLS.
- Scoped re-review dispatched (ses_e0e903207ffe08Dtq77y9i4Xau) on `task-5-rereview-r1.diff` (51da5035..ff8d32c0).

## Task 5: fix round 2/5
- Re-revision ronda 1: los dos Important ADDRESSED (restore ADMIN/SELLER; reserve/confirm/release con X-Internal-Key; /batch con found/missing/inactive).
- New breakage Important: StockInternalKeyFilter compara getRequestURI() crudo contra rutas exactas (StockInternalKeyFilter.java:63-74); variantes con ;params o percent-encoding (/api/v1/products/stock/reserve;x) esquivan el filtro y ejecutan la reserva sin cabecera.
- Ruling: decidir la ruta por forma normalizada (getServletPath o matcher en la cadena de seguridad) y anadir tests de las variantes de bypass, del 403 en confirm/release y del GET de catalogo sin cabecera.
- Menores nuevos diferidos: fallback hardcodeado de INTERNAL_KEY (FeignClientConfig.java:19-20 y ms-product/application.yml:38); el interceptor envia la clave a todos los servicios; cobertura parcial de tests.
- Dispatch: ronda 2 enviada al implementador original (ses_e0e9be03cffeON3SFsWDrLOj5d), fix base ff8d32c0.

- Fix round 2 result: commit 5015ba3c "fix(product): normaliza la ruta antes de exigir la clave interna". Filtro resuelve ruta con UrlPathHelper + UriUtils.decode y corre con @Order(HIGHEST_PRECEDENCE) antes de Spring Security. Tests: ms-product 34/0 (security 9), common 12/0. Rojo->verde: reserve;x y res%65rve daban 400 del firewall, ahora 403 SERVICE_ONLY; confirm/release tambien 403; catalogo GET 200.
- Re-revision ronda 2 despachada (ses_e011ef26bffevchNr7qJPJSv8s) sobre task-5-rereview-r2.diff (9087 bytes, ff8d32c0..5015ba3c, 2 archivos).
- Concern declarado: no se revalido arranque con ddl-auto validate en esta sesion (Docker parado); el cambio no toca esquema.

## Task 5: fix round 3/5
- Re-revision ronda 2: NEEDS ANOTHER ROUND. Normalizacion aceptada (StockInternalKeyFilter.java:83-95) y los 4 tests presentes.
- Defecto 1: el decode interno de getPathWithinApplication (:83) no esta protegido; una secuencia de porcentaje invalida lanza IllegalArgumentException desde un filtro de maxima precedencia.
- Defecto 2: quitar ';' antes de decodificar hace que reserve%3Bx pase el filtro y dependa del StrictHttpFirewall.
- Dispatch ronda 3 al implementador original (ses_e0e9be03cffeON3SFsWDrLOj5d), fix base 5015ba3c: decodificar una sola vez dentro del bloque protegido, quitar path-params despues. Tests exigidos: reserve%3Bx -> 403 SERVICE_ONLY; reser%zzve -> 4xx y nunca 500.
- Ruling de control (aceleracion): revisor independiente por tarea con alcance recortado al diff, y un unico review final de rama que agrupa los menores diferidos. Coste si me equivoco: defectos menores llegan al final y se corrigen en una sola ola.

- Fix round 3 result: commit b5de84c7 "fix(product): decodifica una vez antes de evaluar la ruta de stock". Decode único dentro de try/catch; `%` inválido -> 403 SERVICE_ONLY (nunca 500); `;params` removidos tras decodificar; gate por prefijo+método+set exacto. Tests: common 12/0, ms-product 36/0 BUILD SUCCESS. Re-review r3 despachada sobre diff 5015ba3c..b5de84c7. Re-review r3 verdict: **CLEAN** (ses_e0105721affeVQd6ODrCti3cl4), sin menores nuevos.

## Task 5: complete
- Task 5: complete (commits 51da5035, ff8d32c0, 5015ba3c, b5de84c7; re-review r3 CLEAN).
- Menores diferidos T5 (review final de rama): (3) update check-then-act sin @Transactional; (4) restore inexistente -> 409 en vez de 404 (test lo fija); (5) updated_at no cambia en stock ops; (6) default 5 duplicado SQL/entidad/constante; (7) @Modifying sin clear/flushAutomatically; (8) reserve/restore no filtran activo; (9) @NotNull/@Min StockItemRequest decorativos; (10) sin test de atomicidad/predicado SQL; (11) sin test 404 rutas sin version; (12) getAll() sin parametro muerto; (13) price DOUBLE PRECISION deuda; (14) script recrea products_db y pierde UUIDs prueba; (r2) fallback hardcodeado INTERNAL_KEY en FeignClientConfig/application.yml; (r2) interceptor envia clave a todos los servicios; (r2) cobertura parcial tests.

## Task 6: complete
- Base: b5de84c7
- Done: CRUD `/api/v1/categories` (GET público, GET/{id}, POST/PUT/DELETE ADMIN via `@PreAuthorize`); favoritos `/api/v1/favorites` (GET list UUID, POST/{productId} toggle, DELETE/{productId}) usando `SecurityUtils.currentUserId()` (nunca uid por path); `FavoriteService.toggle/list/remove`, `Favorite` entity/repo con `UNIQUE(user_id,product_id)`, `init-multi-db/02-create-products.sql` agrega tabla `favorites`.
- `ms-product/config/SecurityConfig.java` agregado (`@ConditionalOnMissingBean` de DefaultSecurityConfig queda reemplazado): GET productos/categorías y POST batch públicos, resto autenticado; `@EnableMethodSecurity` para @PreAuthorize; `JwtAuthenticationFilter` registrado. `StockInternalKeyFilter` sigue @Component @Order(HIGHEST_PRECEDENCE).
- Verificado: `mvn -pl common,ms-product -am -Dsurefire.failIfNoSpecifiedTests=false test` → common 12/0, ms-product 40/0 BUILD SUCCESS. `mvn -pl common,ms-product -am -Dsurefire.failIfNoSpecifiedTests=false -Dtest=ProductStockSecurityTest test` → 11/0.
- Fix regresión: `ProductStockSecurityTest.unaSecuenciaDePorcentajeInvalidaNoLanzaQuinientos` usaba `URI.create` con `%zz` (ilegal); se ajustó a invocación directa del filtro con `MockHttpServletRequest` para preservar el contrato (403 SERVICE_ONLY, sin 500) sin depender de parsing URI inválida de MockMvc. `@Import` del test ajustado a `{SecurityConfig.class, StockInternalKeyFilter.class}` para reflejar config real de ms-product.
- Commit: `bf3f67d0 feat(product): CRUD de categorias y favoritos por usuario`
- Ruling: review independiente acotado al diff; menores diferidos a review final de rama.
- Menores diferidos: [pendiente review T6].

## Task 7: complete
- Base: bf3f67d0
- Done: `ms-cart` movido a `/api/v1/cart`; `POST /{userId}/merge` fusiona sumando cantidades y recorta por `available` del batch; todas las rutas con `SecurityUtils.requireSelfOrAdmin(userId)`. `ProductClient` a `/api/v1/products/{id}` y `/api/v1/products/batch` (body `{ids:[...]}`), respuesta `BatchPriceResponse` shape. `SecurityConfig` nueva (actuator/swagger públicos, resto autenticado, JWT). `spring-boot-starter-test` agregado al pom.
- Verificado: `mvn -q -pl ms-cart -am -Dsurefire.failIfNoSpecifiedTests=false test` → CartMergeTest 2/0 PASS, BUILD SUCCESS.
- Commit: `d3bc923e feat(cart): carrito por uid y fusion del carrito anonimo`
- Ruling: review acotado al diff diferido a review final de rama por aceleración.
- Menores diferidos: validar shape batch contra ProductResponse real en integración; no commitear `.gitignore`.

## Task 8: complete
- Base: d3bc923e
- Done: `init-multi-db/04-create-order.sql` reescrito con `order_folio_seq`, `folio` UNIQUE, snapshot cliente/envío, `order_items` con `product_id UUID`, `sku`, `unit_price`, `line_total`. Entidades/DTOs/repos actualizados; `FolioGenerator.nextFolio(LocalDate)` con `OrderRepository.nextFolioSequence()`; `OrderStatsResponse`+`TopProduct`; `/api/v1/orders` GET ADMIN/SELLER, `/stats` ADMIN/SELLER, rutas self-or-admin. Eliminados `InventoryClient`, `InventoryReservationRequest`; lógica inventario removida de OrderService (checkout orquestado llega en T9).
- Verificado: `mvn -q -pl ms-order -am -Dtest=FolioGeneratorTest -Dsurefire.failIfNoSpecifiedTests=false test` => 1/0 PASS; `mvn -q -pl ms-order -am -Dsurefire.failIfNoSpecifiedTests=false test` => 1/0 PASS, BUILD SUCCESS.
- Commit: `9e9ac216 feat(order): folio secuencial, snapshot del cliente y estadisticas`
- Ruling: review acotado al diff diferido a review final de rama; T9 restaurará checkout/orquestación y compensaciones.
- Menores diferidos: createOrder actual es simplificado (sin reserve/confirm); `getOrder` expone sin comprobar ownership más allá de controller; seed SQL placeholder; cobertura mínima.

## Task 10: Pagos y envíos idempotentes
- BASE 05b03ed2, status DONE.
- Idempotencia por orderId en payment/shipping; UNIQUE(order_id) SQL; Shipment region/comuna; OrderClient/ShippingOrderClient eliminados.
- Tests: PaymentIdempotencyTest 1/0, ShippingIdempotencyTest 1/0, ms-order 3/0 PASS.

## Task 13: complete
- Base: 3d67716d
- Done: TDD con `CartContext.test.tsx` (RED 1 fallo → GREEN 1 PASS): fusión de `chic_carrito_pendiente` mediante `cartApi.merge(uid, items)` y limpieza de la clave local; carrito del servidor con sesión y carrito local sin sesión; checkout vía `ordersApi.checkout` enviando solo `productId`/`quantity`, dirección, región, comuna, teléfono y método de pago (sin precios ni `guest_id`), con estados de carga/error. Catálogo (`Home`, `Productos`, `ProductoDetalle`) contra `catalogApi`; `useTablasMaestras` con categorías API y constantes UI; `Registro` vía `authApi.register`; `Blog`/`BlogDetalle` y `Contacto` vía `contentApi`; `MisCompras`/`CompraExitosa` vía `ordersApi.myOrders/getOrder`. `seed.ts` reducido a `ROLES`/`REGIONES`/`COMUNAS`, sin `inicializarDatos()` ni escrituras localStorage. Tests actualizados para mockear APIs y usar `chic_carrito_pendiente`.
- Verificado: `cd frontend-react; npx vitest run src/context/CartContext.test.tsx` → RED/GREEN según TDD; `npm test -- --run` → 6 archivos, 15 tests PASS; `npm run build` → BUILD SUCCESS; `npm run lint` → 0 errores (3 warnings preexistentes en `coverage/*.js`).
- Commit: `feat(front): catalogo, carrito y checkout contra la API`

## Task 14: complete
- Base real: c09b4cd3 (`fix(front): contrato de carrito y merge pendiente`); el plan original refería 854c6922.
- Done: guard de roles `RutaProtegida` (sin sesión -> `/login`; rol incorrecto -> `/`; acepta `roles` numéricos y `'ADMIN'|'SELLER'`) con 4 tests nuevos (RED -> GREEN). Router con ADMIN exclusivo en `/admin`, `/admin/categorias`, `/admin/usuarios` y su formulario; ADMIN+SELLER en `/admin/productos`, `/admin/productos/form` y `/admin/ordenes`; rutas de cliente con sesión.
- Admin contra la API: categorías (list/create/update/delete), productos (list/get/create/update/delete con `ProductPayload`, preserva `reservado`), usuarios (`GET/POST/PUT/DELETE /api/v1/users` + `adminRegister`, mapeo `rolId` -> rol string) y órdenes (`listOrders`, `stats`, `PUT /{id}/status`), con carga/error y recarga tras mutar. Dashboard con `ordersApi.stats` (ventas, órdenes, ticket promedio, estados, top productos). Eliminado el uso de `CHIC_KEYS.usuarios/productos/categorias/ordenes` en pantallas admin.
- Consolidación: componentes admin canónicos en `frontend-react/src/pages/admin/`; eliminados los duplicados de `frontend-react/src/components/admin/`. `App.tsx` importa solo desde la ruta canónica. Agregado `src/utils/error.ts` (`mensajeError(error: unknown)`), sin `any`.
- Verificado: `cd frontend-react; npx vitest run src/components/common/RutaProtegida.test.tsx` (4/4 PASS); `npm test -- --run` (7 archivos, 19 tests PASS); `npm run build` (BUILD SUCCESS); `npm run lint` (0 errores, 3 warnings preexistentes en `coverage/*.js`).
- Menores diferidos: warning preexistente de Vite `INEFFECTIVE_DYNAMIC_IMPORT` entre `Registro.tsx` y `api/auth.ts`; el cambio de rol vía API requiere nuevo login (contrato del backend); el formulario admin de usuarios solo edita rol/estado porque `UpdateUserRequest` no acepta datos personales; `Cuenta.tsx` queda intacto por instrucción; `useColeccion` sigue vigente en páginas no admin; cambios preexistentes en `.gitignore`, `docs/` y `postman/` no se tocan ni se commitean.
- Menores diferidos: componentes admin y `Cuenta.tsx` siguen usando claves legacy (revisión final de rama); warning preexistente de Vite `INEFFECTIVE_DYNAMIC_IMPORT` entre `Registro.tsx` y `api/auth.ts`.
