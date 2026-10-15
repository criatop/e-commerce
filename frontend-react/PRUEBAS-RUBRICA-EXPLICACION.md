# Pruebas exigidas por la rúbrica: qué son y cómo están cubiertas

Proyecto: **Pink & Pink — frontend-react** (Vite + React 19 + TypeScript).
Runner: **Karma + Jasmine** con `ChromeHeadless`.

La rúbrica pide **cuatro tipos de prueba**:

1. Probar **funciones**
2. Probar **componentes**
3. Probar **navegación**
4. Probar la **API con axios** (simular la conexión a un servidor)

Todas están implementadas. Estado actual: **78 pruebas, 78 SUCCESS**.

| Tipo de prueba | Archivos | N.º pruebas | Estado |
|---|---|---:|---|
| Funciones / lógica | `src/utils/*.spec.ts`, `src/storage/*.spec.ts`, `src/hooks/*.spec.ts`, `src/data/seed.spec.ts`, `src/context/*.spec.tsx` | 48 | Listo |
| Componentes | `src/components/common/*.spec.tsx`, `src/components/layout/Navbar.spec.tsx` | 16 | Listo |
| Navegación | `src/navegacion.spec.tsx` | 7 | Listo |
| API con axios | `src/services/api.spec.ts` | 7 | Listo |
| **Total** | | **78** | **Listo** |

---

## 1. Probar funciones

**Qué es:** probar la lógica pura (utilidades, cálculos, validaciones) sin depender de la interfaz.

**Dónde está:**

- `src/utils/formato.spec.ts` — `formatearPrecio`
- `src/utils/imagenes.spec.ts` — `rutaImagen`
- `src/utils/run.spec.ts` — `limpiarRun`, `validarRun` (dígito verificador)
- `src/utils/alerta.spec.ts` — `alertas.*` con SweetAlert espiado
- `src/storage/useColeccion.spec.ts` — lectura/escritura en `localStorage`
- `src/hooks/useTablasMaestras.spec.ts` — `nombreCategoria`, `comunasDe`
- `src/data/seed.spec.ts` — `inicializarDatos`
- `src/context/AuthContext.spec.tsx` y `CartContext.spec.tsx` — lógica de sesión y carrito

**Ejemplo:**

```ts
import { formatearPrecio } from "./formato";

describe("formatearPrecio", () => {
  it("formatea miles con punto y prefijo $", () => {
    expect(formatearPrecio(19990)).toBe("$19.990");
  });
});
```

---

## 2. Probar componentes

**Qué es:** renderizar un componente de React y verificar lo que muestra y cómo reacciona a la interacción, usando **@testing-library/react** (`render`, `screen`, `fireEvent`).

**Dónde está:**

- `src/components/common/ImagenProducto.spec.tsx` — ruta de la imagen (`/img/...`), `alt`, `class`/`style` y placeholder al fallar la carga
- `src/components/common/TarjetaProducto.spec.tsx` — nombre, precio formateado, categoría, enlace al detalle y "añadir al carrito"
- `src/components/common/DataTable.spec.tsx` — filas, búsqueda, orden asc/desc y paginación
- `src/components/layout/Navbar.spec.tsx` — enlaces, buscador y cerrar sesión

**Ejemplo:**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import ImagenProducto from "./ImagenProducto";

describe("ImagenProducto", () => {
  it("antepone /img/ cuando la imagen es relativa", () => {
    render(<ImagenProducto imagen="collar.png" alt="Collar" />);
    expect(screen.getByAltText("Collar").getAttribute("src")).toBe("/img/collar.png");
  });

  it("añade el producto al carrito al hacer clic", () => {
    // TarjetaProducto: se envuelve en <MemoryRouter><CartProvider>…</CartProvider></MemoryRouter>
    fireEvent.click(screen.getByRole("button", { name: /añadir al carrito/i }));
    // se comprueba que el carrito quedó en localStorage
  });
});
```

> Los componentes que usan `Link`, `useNavigate`, `useCart` o `useAuth` se envuelven en `MemoryRouter`, `CartProvider` y `AuthProvider`.

---

## 3. Probar navegación

**Qué es:** verificar que cada **ruta** muestra la página correcta, que un `Link` navega al hacer clic y que las **rutas protegidas** redirigen cuando no hay sesión.

**Dónde está:** `src/navegacion.spec.tsx`.

Para poder probar las rutas, `src/App.tsx` exporta `AppRoutes` (el árbol de `<Routes>`) además del `App` por defecto que añade los providers y el `BrowserRouter`. En las pruebas se monta `AppRoutes` dentro de un `MemoryRouter`.

**Ejemplo:**

```tsx
<AuthProvider>
  <CartProvider>
    <MemoryRouter initialEntries={["/cuenta"]}>
      <AppRoutes />
    </MemoryRouter>
  </CartProvider>
</AuthProvider>
```

Casos cubiertos:

- `/` muestra el inicio, `/nosotros` la página Nosotros, `/login` el login.
- Al hacer clic en un enlace del menú se cambia de página.
- `/cuenta` sin sesión **redirige a `/login`** y dispara `alertas.accesoRestringido`.
- `/cuenta` con sesión de cliente y `/admin` con rol administrador **sí** cargan.

---

## 4. Probar la API con axios (simular la conexión)

**Qué es:** simular una llamada a un servidor usando **axios**, sin depender de una red real. Se crea una instancia de axios y se interceptan las peticiones con **axios-mock-adapter** para devolver respuestas falsas (éxito, error, latencia).

**Dónde está:**

- `src/services/api.ts` — instancia de axios (`baseURL`, `timeout`) y funciones `obtenerProductos`, `obtenerProducto`, `crearProducto`, `mensajeDeError`.
- `src/services/api.spec.ts` — pruebas que simulan la API.

**Ejemplo:**

```ts
import MockAdapter from "axios-mock-adapter";
import api, { obtenerProductos } from "./api";

describe("servicio api", () => {
  let mock: MockAdapter;
  beforeEach(() => { mock = new MockAdapter(api); });
  afterEach(() => { mock.restore(); });

  it("obtenerProductos hace GET /productos y devuelve la lista", async () => {
    mock.onGet("/productos").reply(200, [
      { codigo: "P1", nombre: "Collar", precio: 9990, stock: 5, categoriaId: 1 },
    ]);
    const productos = await obtenerProductos();
    expect(productos.length).toBe(1);
  });

  it("propaga el error cuando el servidor responde 500", async () => {
    mock.onGet("/productos").reply(500);
    await expectAsync(obtenerProductos()).toBeRejected();
  });
});
```

Casos cubiertos: `baseURL` configurada, `GET /productos`, `GET /productos/:codigo`, `POST /productos`, error 500, latencia de red simulada y traducción de errores (`mensajeDeError`).

Dependencias usadas:

- `axios` (runtime)
- `axios-mock-adapter` (desarrollo, para simular el servidor)

---

## Cómo ejecutar las pruebas

Desde la carpeta `frontend-react` (en Windows usar `npm.cmd`):

```powershell
npm.cmd install        # una sola vez
npm.cmd test           # ejecuta Karma + Jasmine en ChromeHeadless
npm.cmd run lint       # revisa el estilo
npm.cmd run build      # compila TypeScript + Vite
```

Resultado esperado de `npm.cmd test`:

```
TOTAL: 78 SUCCESS
```

---

## Archivos creados para cumplir la rúbrica

```
frontend-react/
  src/services/api.ts                # servicio con axios
  src/services/api.spec.ts           # pruebas API (axios + mock)
  src/navegacion.spec.tsx            # pruebas de navegación
  src/components/common/ImagenProducto.spec.tsx
  src/components/common/TarjetaProducto.spec.tsx
  src/components/common/DataTable.spec.tsx
  src/components/layout/Navbar.spec.tsx
```

Cambios de apoyo:

- `src/App.tsx`: se exporta `AppRoutes` para poder montar las rutas en las pruebas.
- `package.json`: se agregó `axios` y `axios-mock-adapter`.
