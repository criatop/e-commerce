# Pruebas unitarias con Karma + Jasmine (frontend-react)

Este documento explica, paso a paso, cómo se montaron las pruebas unitarias
del proyecto React sobre la **capa de datos**, qué significa cada resultado y
cómo ejecutarlas.

---

## 1. ¿Qué es cada cosa?

- **Karma**: es el *test runner*. Levanta un navegador real (Chrome en modo
  headless), carga ahí los archivos de prueba y reporta cuántos pasaron/fallaron.
  Karma por sí solo **no** sabe leer TypeScript ni JSX, así que necesita un
  *preprocesador*: en este proyecto usamos `karma-webpack` + `babel-loader`.
- **Jasmine**: es el *framework de aserciones*. Aporta `describe`, `it`,
  `expect`, `beforeEach`, `spyOn`, etc. Es el lenguaje con el que escribimos
  los casos.
- **@testing-library/react**: nos presta `renderHook` y `act` para probar hooks
  y contextos de React (por ejemplo `useCart`, `useAuth`) dentro del navegador.

Flujo: `npm test` → Karma arranca Chrome headless → webpack empaqueta los
`.spec.ts/.tsx` (pasando TypeScript/JSX por Babel) → Jasmine ejecuta cada `it()`
→ Karma imprime el resumen.

---

## 2. Requisitos previos

- **Node.js** (probado con Node 24) y npm.
- **Google Chrome** instalado (Karma lo lanza en modo `ChromeHeadless`).
- En esta máquina (Windows con política de ejecución restrictiva) hay que
  invocar `npm.cmd` / `npx.cmd` en vez de `npm` / `npx`.

---

## 3. Paso a paso: cómo se montó todo

### Paso 1 — Instalar las dependencias de desarrollo

```powershell
npm.cmd i -D karma karma-jasmine jasmine-core @types/jasmine karma-chrome-launcher karma-webpack webpack babel-loader @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript @testing-library/react @testing-library/dom
```

Qué aporta cada grupo:

| Paquete | Rol |
| --- | --- |
| `karma`, `karma-chrome-launcher` | runner + lanzador de Chrome |
| `karma-jasmine`, `jasmine-core`, `@types/jasmine` | framework Jasmine |
| `karma-webpack`, `webpack`, `babel-loader` | empaquetar y transpilar TS/JSX |
| `@babel/core`, `@babel/preset-env`, `@babel/preset-react`, `@babel/preset-typescript` | reglas de transpilación de Babel |
| `@testing-library/react`, `@testing-library/dom` | `renderHook`/`act` para hooks y contextos |

> Se usó **karma-webpack** y no `karma-vite` porque `karma-vite` lleva años sin
> publicarse y no soporta Vite 8.

### Paso 2 — `babel.config.cjs`

Le dice a Babel cómo convertir el código:

```js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { chrome: '120' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
};
```

- `preset-env`: transpila el JS moderno para el Chrome objetivo.
- `preset-react` (runtime automático): entiende JSX sin importar React a mano.
- `preset-typescript`: quita los tipos de TypeScript (Babel no los valida; de
  eso se encarga `tsc` aparte).

### Paso 3 — `karma.conf.cjs`

Configuración del runner:

```js
module.exports = (config) => {
  config.set({
    frameworks: ['jasmine', 'webpack'],
    plugins: ['karma-jasmine', 'karma-webpack', 'karma-chrome-launcher'],
    files: ['src/test-setup.ts', 'src/**/*.spec.ts', 'src/**/*.spec.tsx'],
    preprocessors: {
      'src/test-setup.ts': ['webpack'],
      'src/**/*.spec.ts': ['webpack'],
      'src/**/*.spec.tsx': ['webpack'],
    },
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
      module: {
        rules: [
          { test: /\.(ts|tsx)$/, exclude: /node_modules/, use: { loader: 'babel-loader' } },
        ],
      },
      stats: 'errors-only',
    },
    webpackMiddleware: { noInfo: true },
    reporters: ['progress'],
    browsers: ['ChromeHeadless'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu'],
      },
    },
    singleRun: true,
    autoWatch: false,
    concurrency: 1,
  });
};
```

Puntos clave:

- `files`: qué archivos carga Karma (los `.spec.*` y un setup previo).
- `preprocessors`: a esos archivos se les aplica `webpack` (transpila TS/JSX).
- `browsers: ['ChromeHeadless']`: corre sin abrir ventana.
- `singleRun: true`: ejecuta una vez y termina (ideal para CI o consola).
- Es `.cjs` porque el `package.json` del proyecto tiene `"type": "module"`.

### Paso 4 — `src/test-setup.ts`

Archivo que se carga antes que las pruebas. Activa el entorno de `act()` de React:

```ts
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;
```

### Paso 5 — Script en `package.json`

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "karma start karma.conf.cjs --single-run"
}
```

### Paso 6 — Excluir los specs del build de la app

En `tsconfig.app.json` se agregó `exclude`, para que `tsc -b` (el build de
producción) no intente validar los `describe/it/expect` de Jasmine:

```json
"include": ["src"],
"exclude": ["src/**/*.spec.ts", "src/**/*.spec.tsx"]
```

### Paso 7 — Globals de Jasmine en ESLint

En `eslint.config.js` se agregó un bloque para que ESLint conozca `describe`,
`it`, `expect`, `spyOn`, etc. solo en los archivos de prueba:

```js
{
  files: ['**/*.spec.{ts,tsx}'],
  languageOptions: { globals: { ...globals.jasmine } },
  rules: { '@typescript-eslint/no-explicit-any': 'off' },
}
```

> Durante este trabajo también se corrigieron dos bugs previos:
> - `eslint.config.js` tenía un `import` de React pegado al inicio y los globs
>   estaban rotos (`'/*.{ts,tsx}'` en vez de `'**/*.{ts,tsx}'`), por lo que
>   ESLint **no revisaba ningún archivo**.
> - `src/hooks/useTablasMaestras.ts` tenía una línea basura al final
>   (`/Actua como .../`), que quedaba como una expresión muerta.

### Paso 8 — Escribir los specs

Se crearon **9 archivos `.spec`** colocados junto a cada módulo (48 casos en
total). Ver la sección 5.

---

## 4. Cómo ejecutar

### 4.1 Correr la aplicación React (modo desarrollo)

```powershell
# desde D:\Proyectos\e-commerce\frontend-react
npm.cmd run dev
```

Abre en el navegador la URL que imprime Vite (por defecto
`http://localhost:5173`). Para detener, `Ctrl + C`.

Otros comandos útiles de la app:

```powershell
npm.cmd run build     # build de producción (tsc -b && vite build) -> genera dist/
npm.cmd run preview   # sirve localmente lo ya construido en dist/
npm.cmd run lint      # revisa el código con ESLint
```

### 4.2 Correr las pruebas unitarias

```powershell
# desde D:\Proyectos\e-commerce\frontend-react

# una sola corrida (la que se usa normalmente)
npm.cmd test

# equivalente explícito
npx.cmd karma start karma.conf.cjs --single-run
```

Modo "watch" (reejecuta al guardar cambios; quita el `singleRun`):

```powershell
npx.cmd karma start karma.conf.cjs
```

---

## 5. Qué se está probando (48 casos)

Todos sobre la **capa de datos** (sin depender de la API: `localStorage` es la
fuente de verdad).

| Spec | Casos | Qué verifica |
| --- | --- | --- |
| `src/utils/formato.spec.ts` | 3 | `formatearPrecio` (miles con punto, cero, 4 dígitos) |
| `src/utils/imagenes.spec.ts` | 2 | `rutaImagen` (rutas relativas vs absolutas) |
| `src/utils/run.spec.ts` | 6 | `limpiarRun` y `validarRun` (dígito verificador, formato) |
| `src/utils/alerta.spec.ts` | 5 | `alertas.*` llama a `Swal.fire`; `confirmar` devuelve el resultado |
| `src/storage/useColeccion.spec.ts` | 4 | carga desde `localStorage`, JSON corrupto, `guardar` |
| `src/hooks/useTablasMaestras.spec.ts` | 2 | `nombreCategoria`, `comunasDe` |
| `src/context/AuthContext.spec.tsx` | 8 | login (ok/credenciales/inactivo), logout, iniciales, roles, destino, sesión sin `password` |
| `src/context/CartContext.spec.tsx` | 15 | agregar/stock, cambiarCantidad, eliminar, costoEnvio, vaciar, confirmarPedido (folio `PP-0001`) |
| `src/data/seed.spec.ts` | 3 | `inicializarDatos`: 16 regiones / 345 comunas / 17 productos / 4 usuarios / versión `"3"`; no pisa datos de usuario; re-siembra de maestras |

Cómo leer un spec (ejemplo con `useColeccion`):

```ts
describe("useColeccion", () => {                       // grupo de pruebas
  beforeEach(() => localStorage.clear());              // limpieza previa a cada it()

  it("carga el arreglo guardado en localStorage", () => {  // un caso
    localStorage.setItem("clave", JSON.stringify([{ id: 1 }, { id: 2 }]));
    const { result } = renderHook(() => useColeccion<Item>("clave"));
    expect(result.current.datos).toEqual([{ id: 1 }, { id: 2 }]);  // aserción
  });
});
```

---

## 6. Qué significan los resultados

Al ejecutar `npm.cmd test` verás algo así:

```text
Chrome Headless 155.0.0.0 (Windows 10): Executed 48 of 48 SUCCESS (0.082 secs / 0.063 secs)
TOTAL: 48 SUCCESS
```

- **`Executed N of M SUCCESS`**: de `M` casos totales se ejecutaron `N` y
  pasaron. Mientras avanza, verás `Executed 1 of 48 ...`, `2 of 48 ...`, etc.
- **`TOTAL: 48 SUCCESS`**: todas las pruebas pasaron. Este es el resultado bueno.
- El primer número entre paréntesis es el tiempo total y el segundo el tiempo
  "de reloj acumulado"; son informativos.
- Código de salida **0** = todo bien (útil para CI/scripts).

Si algo falla, verás algo como:

```text
CartContext
  X confirmarPedido crea la orden con folio PP-0001
      Expected 'PP-0002' to be 'PP-0001'.
TOTAL: 47 SUCCESS, 1 FAILED
```

- El encabezado (`CartContext`) es el `describe`, el texto con **X** es el `it`
  que falló, y `Expected ... to be ...` es el detalle de la aserción: qué
  esperaba `expect` y qué se obtuvo realmente.
- Con fallos, el comando termina con código de salida distinto de 0.

Otras líneas que pueden aparecer:

- `Webpack bundling...`: webpack está empaquetando los specs (normal al inicio).
- `Chrome ... Connected on socket ...`: Chrome headless se conectó correctamente.
- `Executed 0 of 48 (skipped ...)`: si algún caso estuviera con `xit`/`xdescribe`
  o con un `fit`/`fdescribe` (se salta el resto). Es señal de revisar el spec.

---

## 7. Solución de problemas

- **`Missing script: "test"`**: falta el script en `package.json` (Paso 5), o
  estás en la carpeta equivocada (debe ser `frontend-react`).
- **No encuentra Chrome**: instala Google Chrome o cambia `browsers` por
  `ChromeHeadlessNoSandbox` (ya definido) en `karma.conf.cjs`.
- **`npm` no se reconoce / error de política de ejecución (Windows)**: usa
  `npm.cmd` y `npx.cmd`.
- **Los specs aparecen en el build de producción**: revisa el `exclude` del
  `tsconfig.app.json` (Paso 6).
- **ESLint se queja de `describe`/`expect`**: revisa el bloque `globals.jasmine`
  en `eslint.config.js` (Paso 7).
