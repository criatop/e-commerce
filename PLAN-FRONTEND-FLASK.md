# Plan Paso a Paso — Frontend E-commerce (Accesorios Chic) con Flask

Documento guía con el paso a paso para construir la maquetación y lógica del frontend de la tienda
utilizando Flask. En esta etapa **NO se conecta a base de datos**: los datos (productos, regiones/
comunas, usuarios) se manejan con arreglos/diccionarios en Python y JavaScript, el carrito se
persiste en `localStorage` y las validaciones se hacen en JavaScript (con refuerzo en el servidor).

---

## 1. Objetivo

Construir el frontend de la tienda con:

- Página Principal (Home)
- Productos y Detalle de Producto
- Blogs y Detalle Blogs
- Nosotros
- Formularios (Iniciar Sesión, Registro y Contacto)
- Vista del Administrador (privada)
- Carrito de compra con `localStorage`
- Reglas de negocio y validaciones en JavaScript

Todo servido por Flask (Python) con templates Jinja2, CSS externo responsive y JavaScript externo.

---

## 2. Estructura de carpetas

Carpeta nueva dentro del repositorio (por ejemplo `frontend-flask/`):

```
frontend-flask/
│
├── app.py                    # Aplicacion Flask: rutas + render de templates
├── requirements.txt          # flask
│
├── templates/                # Vistas HTML (Jinja2)
│   ├── base.html             # Layout base (menu + footer)
│   ├── index.html            # Home
│   ├── productos.html        # Lista de productos (dinamico)
│   ├── producto.html         # Detalle de producto
│   ├── blogs.html            # Blog (2 noticias/casos curiosos)
│   ├── blog.html             # Detalle de blog
│   ├── nosotros.html         # Nosotros + equipo
│   ├── login.html            # Iniciar sesion
│   ├── registro.html         # Registro de usuario
│   ├── contacto.html         # Contacto
│   ├── carrito.html          # Carrito de compra
│   │
│   └── admin/
│       ├── base_admin.html   # Layout admin (menu lateral)
│       ├── index.html        # Home admin (bienvenida)
│       ├── productos.html    # Tabla + formulario productos
│       └── usuarios.html     # Tabla + formulario usuarios
│
└── static/
    ├── css/
    │   └── estilos.css       # CSS externo responsive
    └── js/
        └── app.js            # JS: render, carrito, validaciones
```

> Nota: como no hay base de datos, se omiten `config.py`, `modelos.py` y `base_datos.py`.
> Los datos viven en arreglos dentro de `app.py` (lado servidor) y `app.js` (lado cliente).

---

## 3. Orden de ejecución recomendado

1. Preparar el entorno (crear carpeta, `requirements.txt`, instalar Flask).
2. Crear el layout base y el CSS responsive.
3. Maquetar las vistas públicas (Home, Productos/Detalle, Blogs, Nosotros).
4. Crear los formularios (Login, Registro, Contacto).
5. Implementar el carrito con `localStorage`.
6. Implementar las validaciones con JavaScript (reglas de la tabla).
7. Crear la vista del administrador (menú lateral + mantenedores).
8. Implementar la lógica de Flask (rutas, arreglos de datos, validación servidor).
9. Pruebas finales y QA.

---

## 4. Paso 1 — Preparar el entorno

1. Crear la carpeta `frontend-flask/` dentro del repositorio.
2. Crear `requirements.txt` con:
   ```
   flask
   ```
3. Instalar la dependencia:
   ```
   pip install flask
   ```
4. Crear un `app.py` mínimo que renderice `base.html` y verificar que corre:
   ```
   python app.py
   ```
   (por defecto en `http://localhost:5000`)

**Criterio de fin:** el servidor Flask arranca y muestra la página base.

---

## 5. Paso 2 — Layout base y CSS responsive

### `templates/base.html`
- Cabecera con **logo** y **menú** (Home, Productos, Blogs, Nosotros, Contacto, Login/Registro).
- Icono de **carrito** con contador (badge) que se actualiza desde `localStorage`.
- **Footer** con información de la empresa.
- Bloque `{% block content %}` para que las demás vistas hereden el layout.

### `static/css/estilos.css`
- Variables CSS (colores, tipografía) en `:root`.
- Grid/flexbox para la grilla de productos.
- **Media queries** para adaptarse a móvil, tablet y escritorio (menú hamburguesa en móvil).
- Estilos para formularios, tablas, botones y tarjetas.

**Criterio de fin:** en las 3 resoluciones la página se ve responsiva y el menú se colapsa en móvil.

---

## 6. Paso 3 — Vistas públicas

### Home (`index.html`)
- Banner informativo.
- Lista de **productos destacados**.
- Enlaces a Productos, Blogs, Nosotros.

### Productos (`productos.html`) y Detalle (`producto.html`)
- Listar productos **dinámicamente** usando un **arreglo de objetos** (en `app.js`).
- Botón "Ver detalle" que lleva a `producto.html?id=...`.
- Botón "Añadir al carrito" que guarda en `localStorage`.

### Blogs (`blogs.html`) y Detalle (`blog.html`)
- Vista general con **2 noticias/casos curiosos**.
- Enlaces a sus respectivos detalles.

### Nosotros (`nosotros.html`)
- Información de la empresa.
- Tarjetas del **equipo de desarrollo**.

**Criterio de fin:** todas las rutas públicas renderizan y navegan entre sí.

---

## 7. Paso 4 — Formularios (maquetación)

- `login.html`: campos Correo y Contraseña.
- `registro.html`: RUN, Nombre, Apellido, Correo, Región, Comuna, Dirección, Tipo de Usuario.
- `contacto.html`: Nombre, Correo, Comentario.

Los formularios se maquetan aquí; la validación se agrega en el Paso 6.

**Criterio de fin:** los 3 formularios se ven correctamente maquetados.

---

## 8. Paso 5 — Carrito con `localStorage`

En `app.js`:
- Clave de almacenamiento: `carrito`.
- Función `agregarAlCarrito(producto)`: añade o incrementa cantidad.
- Función `quitarDelCarrito(id)`, `actualizarCantidad(id, q)`.
- Función `renderizarCarrito()`: muestra items y **total**.
- Función `actualizarBadge()`: actualiza el contador del menú.

En `templates/carrito.html`: estructura para listar items, total y botones.

**Criterio de fin:** al recargar la página el carrito se mantiene (persistencia) y el badge es correcto.

---

## 9. Paso 6 — Validaciones con JavaScript

Implementar en `app.js` las reglas exactas:

| Vista | Campo | Validaciones |
|---|---|---|
| Inicio de Sesión | Correo | Requerido, Máx. 100 caracteres, dominios `@duoc.cl`, `@profesor.duoc.cl` o `@gmail.com` |
| Inicio de Sesión | Contraseña | Requerida, entre 4 y 10 caracteres |
| Contacto | Nombre | Requerido, Máx. 100 caracteres |
| Contacto | Correo | Máx. 100 caracteres, dominios permitidos |
| Contacto | Comentario | Requerido, Máx. 500 caracteres |
| Registro | RUN | Formato y dígito verificador, 7 a 9 caracteres, sin puntos ni guiones |
| Registro | Nombre y Apellido | Requeridos (Nombre Máx. 50, Apellido Máx. 100) |
| Registro | Correo | Requerido, dominios permitidos |
| Registro | Región y Comuna | Cargar desde un arreglo JS; actualizar comunas según región seleccionada |
| Registro | Dirección | Requerido, Máx. 300 caracteres |
| Registro | Tipo de Usuario | Select: Administrador, Vendedor, Cliente |
| Nuevo/Editar Producto | Código | Requerido, Mín. 3 caracteres |
| Nuevo/Editar Producto | Nombre | Requerido, Máx. 100 caracteres |
| Nuevo/Editar Producto | Precio | Requerido, valor >= 0 (puede ser decimal) |
| Nuevo/Editar Producto | Stock / Stock Crítico | Requeridos, enteros >= 0 (alerta en stock crítico) |
| Nuevo/Editar Producto | Categorías | Requerido (Select) |

Requisitos de implementación:
- Mostrar mensaje de error por cada campo.
- Impedir el envío si hay errores.
- El arreglo de **Regiones y Comunas** de Chile se define en JS y repuebla el `<select>` de comunas al cambiar de región.

**Criterio de fin:** cada formulario valida según la tabla y muestra/oculta errores correctamente.

---

## 10. Paso 7 — Vista del Administrador (privada)

- `templates/admin/base_admin.html`: menú **lateral/vertical**.
- Home Admin (`admin/index.html`): vista de bienvenida.
- Mantenedor Productos (`admin/productos.html`): tabla para listar + formulario para crear/editar (Código, Nombre, Precio, Stock, Stock Crítico, Categorías), con **alerta en stock crítico**.
- Mantenedor Usuarios (`admin/usuarios.html`): tabla para listar + formulario para crear/editar usuario.

**Nota:** como no hay BD aún, los CRUD se manejan con arreglos en memoria dentro de `app.py`.

**Criterio de fin:** el admin navega por sus mantenedores y crea/edita productos y usuarios en sesión.

---

## 11. Paso 8 — Lógica de Flask (`app.py`)

- Rutas públicas: `/`, `/productos`, `/producto/<id>`, `/blogs`, `/blog/<id>`, `/nosotros`, `/login`, `/registro`, `/contacto`, `/carrito`.
- Rutas admin: `/admin`, `/admin/productos`, `/admin/productos/nuevo`, `/admin/productos/editar/<id>`, `/admin/usuarios`, `/admin/usuarios/nuevo`, `/admin/usuarios/editar/<id>`.
- Arreglo global de **productos** (objetos con id, código, nombre, precio, stock, stockCrítico, categoría).
- Arreglo global de **usuarios** para validar login (email/contraseña/tipo de rol).
- **Validación en servidor** replicando las reglas del Paso 6 (seguridad).
- **Sesión** con Flask `session` para login/logout y proteger rutas de admin por rol (Administrador).

**Criterio de fin:** el login valida contra el arreglo de usuarios, el admin queda protegido y el flujo completo funciona.

---

## 12. Paso 9 — Pruebas finales (QA)

- Probar cada formulario con casos válidos e inválidos.
- Probar el carrito (añadir, quitar, persistencia tras recargar).
- Probar login/registro/logout y acceso a admin.
- Probar los mantenedores (crear/editar/listar).
- Verificar responsive en móvil, tablet y escritorio.

---

## 13. Criterios de aceptación finales

- Maquetación completa de las 5 vistas públicas + admin (menú lateral).
- CSS externo responsive en todas las resoluciones.
- Productos renderizados dinámicamente con un arreglo de objetos (JS).
- Carrito persistente en `localStorage`.
- Blogs con 2 noticias y sus detalles.
- Formularios maquetados y validados (reglas de la tabla).
- Vista de administrador con mantenedores de productos y usuarios.
- Sin conexión a base de datos (datos en arreglos/memoria).
