# -*- coding: utf-8 -*-
"""Genera los entregables del Control 3 (DSY1104) adaptados al e-commerce."""
import glob
import os
import shutil
import sys
import tempfile
import zipfile
from datetime import date

sys.stdout.reconfigure(encoding="utf-8")

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt, Inches, RGBColor
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side

ROOT = os.path.dirname(os.path.abspath(__file__))
PROYECTO = os.path.dirname(ROOT)
FECHA = date.today().strftime("%d/%m/%Y")
REPO = "https://github.com/criatop/e-commerce"
RAMA = "limpieza_Back"

AZUL = RGBColor(0x1F, 0x3B, 0x63)
GRIS = RGBColor(0x44, 0x44, 0x44)

# ----------------------------------------------------------------------------
# Datos base
# ----------------------------------------------------------------------------
CREDENCIALES = [
    ("admin@gmail.com", "admin123", "ADMIN", "Acceso total"),
    ("vendedor@gmail.com", "vend1234", "SELLER", "Productos y órdenes"),
    ("camila@gmail.com", "cliente1", "CUSTOMER", "Tienda"),
    ("diego@gmail.com", "diego123", "CUSTOMER", "Tienda"),
]

ENDPOINTS = [
    # (servicio, método, ruta, descripción, entrada, respuestas, visibilidad, auth, roles, observaciones)
    ("ms-auth", "POST", "/api/v1/auth/register", "Registrar cliente",
     "{run,email,password,nombre,apellidos?,fechaNacimiento?,regionId?,comunaId?,direccion?}",
     "201 Creado / 400 Validación", "PÚBLICA", "No", "Cualquiera", "Crea usuario con rol CUSTOMER."),
    ("ms-auth", "POST", "/api/v1/auth/login", "Iniciar sesión",
     "{email,password}", "200 OK / 401 No autorizado", "PÚBLICA", "No", "Cualquiera",
     "Devuelve token JWT, usuario y rol."),
    ("ms-auth", "POST", "/api/v1/auth/admin/register", "Crear usuario administrativo",
     "{run,email,password,nombre,rolId,...}", "201 Creado / 403 Prohibido", "PRIVADA", "Sí", "ADMIN",
     "Solo ADMIN; permite SELLER y ADMIN."),
    ("ms-auth", "GET", "/api/v1/auth/me", "Obtener perfil actual", "-",
     "200 OK / 401 No autorizado", "PRIVADA", "Sí", "ADMIN, SELLER, CUSTOMER",
     "Usado por el frontend para rehidratar la sesión."),
    ("ms-auth", "PUT", "/api/v1/auth/me", "Actualizar perfil",
     "{nombre?,apellidos?,fechaNacimiento?,regionId?,comunaId?,direccion?}",
     "200 OK / 401 No autorizado", "PRIVADA", "Sí", "ADMIN, SELLER, CUSTOMER", "Datos personales del usuario."),
    ("ms-auth", "GET", "/api/v1/regions", "Listar regiones", "-", "200 OK", "PÚBLICA", "No", "Todos",
     "Tabla maestra para formularios."),
    ("ms-auth", "GET", "/api/v1/comunas", "Listar comunas", "?regionId=",
     "200 OK", "PÚBLICA", "No", "Todos", "Se filtra por región cuando se envía regionId."),
    ("ms-auth", "GET", "/api/v1/roles", "Listar roles", "-", "200 OK", "PÚBLICA", "No", "Todos",
     "ADMIN=1, SELLER=2, CUSTOMER=3."),
    ("ms-auth", "GET", "/api/v1/users/", "Listar usuarios", "-",
     "200 OK / 401", "PRIVADA", "Sí", "ADMIN", "Panel de administración."),
    ("ms-auth", "GET", "/api/v1/users/{id}", "Detalle de usuario", "-",
     "200 OK / 404", "PRIVADA", "Sí", "ADMIN", "-"),
    ("ms-auth", "PUT", "/api/v1/users/{id}", "Actualizar usuario",
     "{nombre?,email?,activo?,rolId?}", "200 OK / 404", "PRIVADA", "Sí", "ADMIN",
     "Cambio de rol requiere nuevo login en el frontend."),
    ("ms-auth", "DELETE", "/api/v1/users/{id}", "Eliminar usuario", "-",
     "204 No Content / 404", "PRIVADA", "Sí", "ADMIN", "-"),
    ("ms-product", "POST", "/api/v1/products/", "Crear producto",
     "{sku,name,description,price,category,imageUrl,active,stockQuantity,lowStockThreshold}",
     "201 Creado / 400", "PRIVADA", "Sí", "ADMIN, SELLER", "category es UUID."),
    ("ms-product", "POST", "/api/v1/products/batch", "Consulta batch de precios/stock",
     "{skus:[...]}", "200 OK", "PÚBLICA", "No", "Todos",
     "Respuesta: {found, missing, inactive} dentro de datos."),
    ("ms-product", "POST", "/api/v1/products/stock/reserve", "Reservar stock",
     "{items:[{productId,quantity}]}", "200 OK / 409", "PRIVADA", "Sí", "INTERNAL",
     "Protegido por StockInternalKeyFilter."),
    ("ms-product", "POST", "/api/v1/products/stock/confirm", "Confirmar reserva",
     "{items:[{productId,quantity}]}", "200 OK / 409", "PRIVADA", "Sí", "INTERNAL", "Compensación del checkout."),
    ("ms-product", "POST", "/api/v1/products/stock/release", "Liberar reserva",
     "{items:[{productId,quantity}]}", "200 OK / 409", "PRIVADA", "Sí", "INTERNAL", "Compensación del checkout."),
    ("ms-product", "POST", "/api/v1/products/stock/restore", "Restaurar stock",
     "{items:[{productId,quantity}]}", "200 OK / 409", "PRIVADA", "Sí", "INTERNAL", "Compensación del checkout."),
    ("ms-product", "GET", "/api/v1/products/{id}", "Detalle de producto", "-",
     "200 OK / 404", "PÚBLICA", "No", "Todos", "id es UUID."),
    ("ms-product", "GET", "/api/v1/products/", "Listar productos",
     "?category=&search=&lowStock=&page=&size=", "200 OK", "PÚBLICA", "No", "Todos",
     "Devuelve Page<ProductResponse>."),
    ("ms-product", "GET", "/api/v1/products/category/{category}", "Productos por categoría", "-",
     "200 OK", "PÚBLICA", "No", "Todos", "category es UUID."),
    ("ms-product", "GET", "/api/v1/products/search", "Buscar productos", "?q=",
     "200 OK", "PÚBLICA", "No", "Todos", "-"),
    ("ms-product", "PUT", "/api/v1/products/{id}", "Actualizar producto", "ProductRequest parcial",
     "200 OK / 404", "PRIVADA", "Sí", "ADMIN, SELLER", "-"),
    ("ms-product", "DELETE", "/api/v1/products/{id}", "Eliminar producto", "-",
     "204 / 404", "PRIVADA", "Sí", "ADMIN", "-"),
    ("ms-product", "GET", "/api/v1/categories/", "Listar categorías", "-",
     "200 OK", "PÚBLICA", "No", "Todos", "-"),
    ("ms-product", "GET", "/api/v1/categories/{id}", "Detalle de categoría", "-",
     "200 OK / 404", "PÚBLICA", "No", "Todos", "-"),
    ("ms-product", "POST", "/api/v1/categories/", "Crear categoría",
     "{name,description?,activa?}", "201 / 400 / 403", "PRIVADA", "Sí", "ADMIN", "Escritura restringida a ADMIN."),
    ("ms-product", "PUT", "/api/v1/categories/{id}", "Actualizar categoría",
     "{name,description?,activa?}", "200 / 403", "PRIVADA", "Sí", "ADMIN", "-"),
    ("ms-product", "DELETE", "/api/v1/categories/{id}", "Eliminar categoría", "-",
     "204 / 403", "PRIVADA", "Sí", "ADMIN", "-"),
    ("ms-product", "GET", "/api/v1/favorites/", "Listar favoritos", "-",
     "200 OK", "PRIVADA", "Sí", "ADMIN, SELLER, CUSTOMER", "Devuelve UUIDs de productos."),
    ("ms-product", "POST", "/api/v1/favorites/{productId}", "Alternar favorito", "-",
     "200 OK", "PRIVADA", "Sí", "ADMIN, SELLER, CUSTOMER", "Toggle por usuario."),
    ("ms-product", "DELETE", "/api/v1/favorites/{productId}", "Quitar favorito", "-",
     "204", "PRIVADA", "Sí", "ADMIN, SELLER, CUSTOMER", "-"),
    ("ms-cart", "GET", "/api/v1/cart/{userId}", "Obtener carrito", "-",
     "200 OK", "PRIVADA", "Sí", "Propietario o ADMIN", "userId corresponde al uid del JWT."),
    ("ms-cart", "POST", "/api/v1/cart/{userId}/items", "Agregar item",
     "{productId,quantity}", "200 OK / 400", "PRIVADA", "Sí", "Propietario", "quantity entero > 0."),
    ("ms-cart", "POST", "/api/v1/cart/{userId}/merge", "Fusionar carrito local",
     "[{productId,quantity}]", "200 OK", "PRIVADA", "Sí", "Propietario",
     "El frontend envía cantidad→quantity al iniciar sesión."),
    ("ms-cart", "PUT", "/api/v1/cart/{userId}/items/{productId}", "Actualizar cantidad",
     "?quantity=", "200 OK / 400", "PRIVADA", "Sí", "Propietario", "quantity es @RequestParam, no body."),
    ("ms-cart", "DELETE", "/api/v1/cart/{userId}/items/{productId}", "Quitar item", "-",
     "204", "PRIVADA", "Sí", "Propietario", "-"),
    ("ms-cart", "DELETE", "/api/v1/cart/{userId}", "Vaciar carrito", "-",
     "204", "PRIVADA", "Sí", "Propietario", "Se usa tras el checkout."),
    ("ms-order", "POST", "/api/v1/orders/", "Crear orden", "OrderRequest",
     "201 / 400", "PRIVADA", "Sí", "ADMIN, SELLER, CUSTOMER", "Orden simple."),
    ("ms-order", "POST", "/api/v1/orders/checkout", "Checkout orquestado",
     "{shippingAddress,shippingRegion,shippingComuna,shippingPhone,paymentMethod,items:[{productId,quantity}]}",
     "201 / 400 / 409", "PRIVADA", "Sí", "CUSTOMER",
     "Sin precios enviados por el cliente. Folio CH-YYYYMMDD-NNNNNN."),
    ("ms-order", "GET", "/api/v1/orders/", "Listar órdenes", "-",
     "200 OK", "PRIVADA", "Sí", "ADMIN, SELLER", "-"),
    ("ms-order", "GET", "/api/v1/orders/stats", "Estadísticas de órdenes", "-",
     "200 OK", "PRIVADA", "Sí", "ADMIN, SELLER", "totalSales, totalOrders, averageTicket, ordersByStatus, topProducts."),
    ("ms-order", "GET", "/api/v1/orders/{id}", "Detalle de orden", "-",
     "200 OK / 404", "PRIVADA", "Sí", "Propietario, ADMIN, SELLER", "id es UUID."),
    ("ms-order", "GET", "/api/v1/orders/user/{userId}", "Órdenes por usuario", "-",
     "200 OK", "PRIVADA", "Sí", "Propietario o ADMIN", "-"),
    ("ms-order", "PUT", "/api/v1/orders/{id}/cancel", "Cancelar orden", "-",
     "200 OK / 409", "PRIVADA", "Sí", "Propietario o ADMIN", "Compensa pago y stock."),
    ("ms-order", "PUT", "/api/v1/orders/{id}/status", "Cambiar estado",
     "?status=PENDING|CONFIRMED|PAID|SHIPPED|DELIVERED|CANCELLED",
     "200 OK / 400", "PRIVADA", "Sí", "ADMIN, SELLER",
     "Transiciones válidas definidas en OrderService.validateStatusTransition()."),
    ("ms-payment", "POST", "/api/payments/", "Crear pago",
     "{orderId,userId,amount,method}", "201 / 409", "PRIVADA", "Sí", "INTERNAL, ADMIN",
     "UNIQUE(order_id) garantiza idempotencia."),
    ("ms-payment", "GET", "/api/payments/{id}", "Detalle de pago", "-",
     "200 OK / 404", "PRIVADA", "Sí", "ADMIN", "-"),
    ("ms-payment", "GET", "/api/payments/order/{orderId}", "Pago por orden", "-",
     "200 OK / 404", "PRIVADA", "Sí", "ADMIN, SELLER", "-"),
    ("ms-payment", "GET", "/api/payments/user/{userId}", "Pagos por usuario", "-",
     "200 OK", "PRIVADA", "Sí", "Propietario o ADMIN", "-"),
    ("ms-shipping", "POST", "/api/shipping/", "Crear envío",
     "{orderId,userId,address,city,postalCode,region,comuna}", "201 / 409", "PRIVADA", "Sí", "INTERNAL, ADMIN",
     "UNIQUE(order_id) garantiza idempotencia."),
    ("ms-shipping", "GET", "/api/shipping/{id}", "Detalle de envío", "-",
     "200 OK / 404", "PRIVADA", "Sí", "ADMIN, SELLER", "-"),
    ("ms-shipping", "GET", "/api/shipping/user/{userId}", "Envíos por usuario", "-",
     "200 OK", "PRIVADA", "Sí", "Propietario o ADMIN", "-"),
    ("ms-shipping", "GET", "/api/shipping/track/{trackingNumber}", "Seguir envío", "-",
     "200 OK / 404", "PÚBLICA", "No", "Todos", " trackingNumber devuelto al crear."),
    ("ms-shipping", "PUT", "/api/shipping/{id}/status", "Actualizar estado de envío",
     "?status=", "200 OK / 400", "PRIVADA", "Sí", "ADMIN, SELLER", "-"),
    ("ms-content", "POST", "/api/v1/contact/", "Enviar mensaje de contacto",
     "{nombre,apellido,email,mensaje}", "201 / 400", "PÚBLICA", "No", "Todos", "-"),
    ("ms-content", "GET", "/api/v1/contact/", "Listar mensajes", "-",
     "200 OK", "PRIVADA", "Sí", "ADMIN", "-"),
    ("ms-content", "GET", "/api/v1/news/", "Listar noticias", "?page=&size=",
     "200 OK", "PÚBLICA", "No", "Todos", "Devuelve Page<NewsResponse>."),
    ("ms-content", "GET", "/api/v1/news/{slug}", "Detalle de noticia", "-",
     "200 OK / 404", "PÚBLICA", "No", "Todos", "-"),
]

# ----------------------------------------------------------------------------
# Helpers DOCX
# ----------------------------------------------------------------------------
def nuevo_doc(titulo, subtitulo=None):
    doc = Document()
    sec = doc.sections[0]
    sec.top_margin = Inches(0.8)
    sec.bottom_margin = Inches(0.8)
    sec.left_margin = Inches(0.9)
    sec.right_margin = Inches(0.9)
    style = doc.styles["Normal"]
    style.font.name = "Arial"
    style.font.size = Pt(10.5)
    style.font.color.rgb = GRIS
    for name, size in (("Title", 24), ("Heading 1", 16), ("Heading 2", 13), ("Heading 3", 11.5)):
        s = doc.styles[name]
        s.font.name = "Arial"
        s.font.size = Pt(size)
        s.font.color.rgb = AZUL
        s.font.bold = True
    p = doc.add_paragraph(titulo, style="Title")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if subtitulo:
        q = doc.add_paragraph(subtitulo)
        q.alignment = WD_ALIGN_PARAGRAPH.CENTER
        q.runs[0].italic = True
    return doc


def h(doc, texto, nivel=1):
    return doc.add_heading(texto, level=nivel)


def p(doc, texto, bold=False, italic=False):
    par = doc.add_paragraph()
    run = par.add_run(texto)
    run.bold = bold
    run.italic = italic
    return par


def bullets(doc, items):
    for it in items:
        doc.add_paragraph(it, style="List Bullet")


def numerados(doc, items):
    for it in items:
        doc.add_paragraph(it, style="List Number")


def tabla(doc, headers, rows, widths=None):
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = "Light Grid Accent 1"
    for i, head in enumerate(headers):
        cell = t.rows[0].cells[i]
        cell.text = str(head)
        for par in cell.paragraphs:
            for run in par.runs:
                run.bold = True
                run.font.size = Pt(9)
    for row in rows:
        cells = t.add_row().cells
        for i, val in enumerate(row):
            cells[i].text = str(val)
            for par in cells[i].paragraphs:
                for run in par.runs:
                    run.font.size = Pt(8.5)
    if widths:
        for r in t.rows:
            for i, w in enumerate(widths):
                r.cells[i].width = Inches(w)
    return t


def pie(doc):
    doc.add_paragraph()
    q = doc.add_paragraph(f"Documento generado para la Evaluación Parcial N°3 - {FECHA}")
    q.alignment = WD_ALIGN_PARAGRAPH.CENTER
    q.runs[0].font.size = Pt(8)
    q.runs[0].italic = True


# ----------------------------------------------------------------------------
# 01 README
# ----------------------------------------------------------------------------
def gen_readme():
    lineas = [
        "DSY1104 - Desarrollo Fullstack II",
        "Evaluación Parcial N°3 - Control 3",
        "=" * 60,
        "",
        "INTEGRANTES (completar con nombres reales antes de subir)",
        "- [NOMBRE COMPLETO 1] - [RUT] - [GitHub usuario]",
        "- [NOMBRE COMPLETO 2] - [RUT] - [GitHub usuario]",
        "- [NOMBRE COMPLETO 3] - [RUT] - [GitHub usuario] (opcional, equipo máx. 3)",
        "",
        "REPOSITORIOS",
        f"- Backend: {REPO} (rama {RAMA})",
        f"- Frontend: {REPO}/tree/{RAMA}/frontend-react (rama {RAMA})",
        "",
        "CONTENIDO DEL ZIP Control3-FullStack2-INTEGRANTES.zip",
        "01-README.txt                          Este archivo",
        "02-Documento-ERS.docx                  Especificación de requisitos de software",
        "03-Documento-de-Cobertura-de-Testing.docx  Cobertura y resultados de pruebas",
        "04-Documentación-de-APIs.xlsx         Matriz de endpoints REST",
        "05-Documentación-de-APIs-e-Integración.docx  Documentación API + integración front/back",
        "06-Manual-de-Usuario.docx              Manual con espacios para capturas",
        "07-Proyecto-frontend-comprimido.zip   Código del frontend (sin node_modules)",
        "08-Proyecto-backend-comprimido.zip    Código del backend (sin target/.git)",
        "09-Video-de-presentación/             Guion y checklist; grabar MP4 con las voces del equipo",
        "",
        "CONFIGURACIÓN LOCAL",
        "- PostgreSQL: localhost:5433, usuario postgres, clave 123",
        "- Backend: 8 servicios + ms-content, gateway en http://localhost:9000",
        "- Eureka: http://localhost:8761",
        "- Frontend: npm install && npm run dev (VITE_API_URL=http://localhost:9000)",
        "- Swagger: http://localhost:9000/swagger-ui.html",
        "- Health: http://localhost:9000/actuator/health",
        "",
        "CREDENCIALES DE PRUEBA (semilla)",
    ]
    for email, clave, rol, _ in CREDENCIALES:
        lineas.append(f"- {email} / {clave}  ({rol})")
    lineas += [
        "",
        "COMO EJECUTAR PRUEBAS",
        "- Backend: mvn -o -pl common,ms-auth,ms-product,ms-cart,ms-order,ms-payment,ms-shipping,ms-content -am test",
        "- Frontend: cd frontend-react && npm test -- --run && npm run build && npm run lint",
        "",
        "NOTA: reemplazar los marcadores [NOMBRE COMPLETO]/[RUT], capturar pantallazos reales",
        "y grabar el video antes de subir a AVA y Google Drive.",
    ]
    with open(os.path.join(ROOT, "01-README.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(lineas) + "\n")


# ----------------------------------------------------------------------------
# 02 ERS
# ----------------------------------------------------------------------------
def gen_ers():
    d = nuevo_doc("Documento de Especificación de Requisitos de Software", "Accesorios Chic - DSY1104 Control 3")
    h(d, "1. Introducción")
    p(d, "El sistema Accesorios Chic es una tienda electrónica fullstack compuesta por un frontend React y un backend Spring Boot orientado a microservicios. El documento describe los requisitos funcionales y no funcionales que sustentan la entrega del Control 3.")
    h(d, "2. Alcance")
    bullets(d, [
        "Registro, autenticación JWT y perfiles con roles ADMIN, SELLER y CUSTOMER.",
        "Catálogo de productos y categorías, favoritos y carrito persistente.",
        "Checkout orquestado con reserva de stock, pago y envío, con compensaciones.",
        "Panel administrativo de productos, categorías, usuarios y órdenes.",
        "Contenido público: noticias (blog) y formulario de contacto.",
    ])
    h(d, "3. Actores")
    tabla(d, ["Actor", "Descripción", "Permisos principales"], [
        ["Cliente (CUSTOMER)", "Usuario final de la tienda", "Registrarse, comprar, favoritos, carrito, mis compras"],
        ["Vendedor (SELLER)", "Operador de catálogo y órdenes", "Ver productos/órdenes y gestionar productos"],
        ["Administrador (ADMIN)", "Dueño del sistema", "Acceso total, usuarios, categorías, estados de orden"],
    ], [1.6, 2.6, 3.8])
    h(d, "4. Requisitos funcionales")
    rf = [
        ["RF-01", "Registro e inicio de sesión", "El sistema debe registrar clientes y emitir un JWT con el rol del usuario."],
        ["RF-02", "Sesión persistente", "El frontend debe conservar token y sesión ante recargas y rehidratar con GET /auth/me."],
        ["RF-03", "Catálogo", "Listar, filtrar y ver detalle de productos y categorías."],
        ["RF-04", "Carrito", "Agregar, actualizar, eliminar y fusionar el carrito local al iniciar sesión."],
        ["RF-05", "Checkout", "Confirmar compra enviando solo identificadores y cantidades; el backend calcula precios."],
        ["RF-06", "Orden foliada", "Generar folio CH-YYYYMMDD-NNNNNN y permitir seguimiento por usuario."],
        ["RF-07", "Restricción por rol", "Ocultar y bloquear rutas administrativas según rol."],
        ["RF-08", "Favoritos", "Alternar y listar productos favoritos del usuario autenticado."],
        ["RF-09", "Contenido", "Publicar noticias y recibir mensajes de contacto."],
        ["RF-10", "Estadísticas", "Mostrar total de ventas, órdenes, ticket promedio y productos más vendidos."],
    ]
    tabla(d, ["ID", "Requisito", "Descripción"], rf, [0.8, 2.2, 5.0])
    h(d, "5. Requisitos no funcionales")
    bullets(d, [
        "RNF-01 Seguridad: contraseñas hasheadas, JWT propagado por Feign, Swagger y health públicos.",
        "RNF-02 Integridad: esquema validado con ddl-auto=validate; init-multi-db/ es la única fuente.",
        "RNF-03 Idempotencia: pagos y envíos con UNIQUE(order_id).",
        "RNF-04 Rendimiento: consultas paginadas y stock con reservas atómicas.",
        "RNF-05 Usabilidad: interfaz en español, mensajes de error claros y estados de carga.",
        "RNF-06 Pruebas: cobertura unitaria en backend y frontend con ejecución separada.",
    ])
    h(d, "6. Modelo de datos resumido")
    p(d, "Ocho bases de datos PostgreSQL: auth, products, cart, order, payment, shipping, content_db (gateway y eureka sin base). La identidad se unifica en uid; los productos usan UUID con sku denormalizado. Los estados de orden son PENDING, CONFIRMED, PAID, SHIPPED, DELIVERED y CANCELLED.")
    h(d, "7. Reglas de negocio")
    numerados(d, [
        "El cliente nunca envía precios: el backend los obtiene de ms-product.",
        "No existe checkout de invitado (sin guest_id).",
        "El carrito anónimo se guarda en chic_carrito_pendiente y se fusiona al autenticarse.",
        "El checkout reserva stock, crea pago y envío; si falla, compensa liberando stock y anulando el pago.",
        "Las transiciones de estado se validan en OrderService; DELIVERED y CANCELLED son terminales.",
    ])
    h(d, "8. Interfaces y restricciones")
    p(d, "ADMIN accede a /admin y /admin/usuarios; ADMIN y SELLER acceden a /admin/productos y /admin/ordenes; CUSTOMER solo a la tienda. Las rutas protegidas se implementan con RutaProtegida.tsx y guards en App.tsx. Según la consigna 101, el rol SELLER solo visualiza lista y detalle de productos y órdenes: el menú de usuarios, categorías y dashboard se oculta en AdminLayout.tsx para ese rol.")
    pie(d)
    d.save(os.path.join(ROOT, "02-Documento-ERS.docx"))


# ----------------------------------------------------------------------------
# 03 Cobertura de testing
# ----------------------------------------------------------------------------
def gen_testing():
    d = nuevo_doc("Documento de Cobertura de Testing", "Accesorios Chic - DSY1104 Control 3")
    h(d, "1. Objetivo")
    p(d, "Documentar la estrategia, ejecución y resultados de las pruebas del backend y del frontend, ejecutadas de forma separada para aislar fallos y cumplir la rúbrica IE3.1.1 e IE3.2.4.")
    h(d, "2. Entorno")
    bullets(d, [
        "Backend: Java 17, Spring Boot, Maven, JUnit 5, PostgreSQL localhost:5433.",
        "Frontend: React + TypeScript, Vite, Vitest, React Testing Library.",
        "Comando backend: mvn -o -pl common,ms-auth,ms-product,ms-cart,ms-order,ms-payment,ms-shipping,ms-content -am -Dsurefire.failIfNoSpecifiedTests=false test",
        "Comando frontend: npm test -- --run ; npm run build ; npm run lint",
    ])
    h(d, "3. Cobertura por módulo backend")
    tabla(d, ["Módulo", "Tema probado", "Resultado"], [
        ["common", "ApiResponse, SecurityUtils, utilidades", "12 pruebas, 0 fallos"],
        ["ms-auth", "Registro, login JWT, roles, perfil", "Suite verde"],
        ["ms-product", "Stock, reservas, categorías, favoritos, lote", "36+ pruebas, 0 fallos"],
        ["ms-cart", "Items, merge, totales, propiedad del carrito", "Suite verde"],
        ["ms-order", "Folio, snapshot, checkout, compensaciones", "3 pruebas de orquestación, 0 fallos"],
        ["ms-payment", "Idempotencia por order_id", "1 prueba, 0 fallos"],
        ["ms-shipping", "Idempotencia y tracking", "1 prueba, 0 fallos"],
        ["ms-content", "Noticias y contacto", "1 prueba, 0 fallos"],
    ], [1.5, 4.5, 2.0])
    p(d, "Ejecución final separada del backend: BUILD SUCCESS para 9 módulos (Parent, Common, MS Auth, ms-product, Cart, Order, Payment, ms-shipping, MS Content), 0 fallos y 0 errores.")
    h(d, "4. Cobertura frontend")
    tabla(d, ["Archivo de prueba", "Escenarios", "Resultado"], [
        ["client.test.ts", "Bearer, desenvoltura de ApiResponse, ApiError", "2/2"],
        ["TarjetaProducto.spec/test", "Render, formato, interacción", "5/5"],
        ["Carrito.test", "Cálculo y render del carrito", "4/4"],
        ["Productos.test", "Listado y filtros", "4/4"],
        ["CartContext.test.tsx", "Merge uid, quantity correcto, limpieza local", "1/1"],
        ["RutaProtegida.test.tsx", "Guards por ADMIN/SELLER/CUSTOMER", "4/4"],
        ["AdminOrdenes.test.tsx", "Contrato del enum y transiciones", "3/3"],
    ], [2.7, 3.6, 1.0])
    p(d, "Ejecución final separada del frontend: 8 archivos de prueba, 22 pruebas aprobadas; npm run build exitoso (74 módulos) y npm run lint sin errores (3 advertencias preexistentes en coverage/*.js).")
    h(d, "5. Casos límite relevantes")
    bullets(d, [
        "Stock insuficiente durante reserve → HTTP 409 y liberación de reservas previas.",
        "Pago o envío duplicado → UNIQUE(order_id) evita doble cobro/envío.",
        "Carrito local con clave chic_carrito_pendiente se conserva si falla el merge.",
        "Cambio de estado inválido → HTTP 400 por validateStatusTransition().",
        "Sesión expirada → 401 limpia token y redirige al login.",
    ])
    h(d, "6. Trazabilidad con la rúbrica")
    tabla(d, ["Criterio", "Evidencia"], [
        ["IE3.1.1 Backend con BD y lógica", "9 módulos Maven, init-multi-db/, servicios y pruebas verdes"],
        ["IE3.2.1 API REST y Swagger", "59 endpoints documentados, /swagger-ui.html público"],
        ["IE3.2.2 Integración REST", "cliente fetch en src/api, DTOs y mappers con contrato alineado"],
        ["IE3.3.1 JWT y roles", "AuthContext + Spring Security + rol en BD"],
        ["IE3.3.2 Sesiones persistentes", "localStorage y rehidratación con GET /auth/me"],
        ["IE3.3.3 Restricciones por rol", "RutaProtegida y guards en App.tsx con pruebas"],
    ], [2.6, 5.4])
    pie(d)
    d.save(os.path.join(ROOT, "03-Documento-de-Cobertura-de-Testing.docx"))


# ----------------------------------------------------------------------------
# 04 XLSX
# ----------------------------------------------------------------------------
def gen_xlsx():
    wb = Workbook()
    ws = wb.active
    ws.title = "Documentacion de API"
    ws.merge_cells("D2:L2")
    ws["D2"] = "Documentación de API - ACCESORIOS CHIC"
    ws["D2"].font = Font(name="Arial", size=16, bold=True)
    ws["D2"].alignment = Alignment(horizontal="left", vertical="center")
    ws.merge_cells("D5:E5")
    ws["D5"] = "Versión 1.0"
    ws.merge_cells("D6:E6")
    ws["D6"] = f"Fecha: {FECHA}"
    ws["D8"] = "URL"
    ws["E8"] = "http://localhost:9000"
    ws["D9"] = "URL SWAGGER"
    ws["E9"] = "http://localhost:9000/swagger-ui.html"
    headers = ["Metodo HTTP", "Ruta del Endpoint", "Descripción", "Datos de entrada", "Respuestas",
               "API PÚBLICA/PRIVADA", "Requiere Autenticación", "Roles permitidos", "Observaciones"]
    for i, head in enumerate(headers):
        c = ws.cell(row=12, column=4 + i, value=head)
        c.font = Font(name="Arial", bold=True)
        c.fill = PatternFill("solid", fgColor="D9E2F3")
        c.alignment = Alignment(wrap_text=True, vertical="center")
    thin = Side(style="thin", color="BFBFBF")
    border = Border(left=thin, right=thin, top=thin, bottom=thin)
    for r, ep in enumerate(ENDPOINTS, start=13):
        vals = [ep[1], ep[2], ep[3], ep[4], ep[5], ep[6], ep[7], ep[8], ep[9]]
        for i, v in enumerate(vals):
            c = ws.cell(row=r, column=4 + i, value=v)
            c.font = Font(name="Arial", size=9)
            c.alignment = Alignment(wrap_text=True, vertical="top")
            c.border = border
    anchos = {"A": 10.7, "D": 13.1, "E": 26.3, "F": 27.7, "G": 18.5, "H": 30.1,
              "I": 16.9, "J": 10.7, "K": 18.0, "L": 30.1, "M": 10.7}
    for col, ancho in anchos.items():
        ws.column_dimensions[col].width = ancho
    for fila in range(13, 13 + len(ENDPOINTS)):
        ws.row_dimensions[fila].height = 48
    ws.freeze_panes = "D13"
    out = os.path.join(ROOT, "04-Documentación-de-APIs.xlsx")
    wb.save(out)
    # Validación de lectura
    chk = load_workbook(out)
    assert chk.active.max_row == 12 + len(ENDPOINTS)
    assert chk.active["D12"].value == "Metodo HTTP"


# ----------------------------------------------------------------------------
# 05 Documentación APIs e Integración
# ----------------------------------------------------------------------------
def gen_integracion():
    d = nuevo_doc("Documentación APIs e Integración", "Accesorios Chic")
    p(d, "Título / Versión del Documento: 1.0")
    p(d, f"Fecha de Creación: {FECHA}")
    h(d, "Descripción General")
    p(d, "Accesorios Chic es una tienda de accesorios construida con React (frontend) y Spring Boot (backend). La comunicación entre ambos lados es REST sobre JSON, con autenticación JWT y roles. El backend calcula todos los precios y valida stock; el frontend solo envía identificadores y cantidades.")
    h(d, "Información General")
    bullets(d, [
        "URL de la API: http://localhost:9000",
        "URL Swagger: http://localhost:9000/swagger-ui.html",
        "URL Health: http://localhost:9000/actuator/health",
        "Eureka: http://localhost:8761",
        "Base de datos: PostgreSQL localhost:5433 (postgres/123)",
        "Versionado: /api/v1 en los servicios de dominio; pagos y envíos usan /api.",
    ])
    p(d, "Respuesta estándar: ApiResponse<T> = { exitoso, datos, mensaje, timestamp }. Los errores HTTP 401 limpian el token en el frontend.")
    h(d, "Arquitectura de servicios")
    tabla(d, ["Servicio", "Responsabilidad", "Base de datos"], [
        ["api-gateway", "Enrutamiento, filtro JWT y CORS", "No"],
        ["eureka", "Descubrimiento de servicios", "No"],
        ["ms-auth", "Usuarios, roles, JWT y tablas maestras", "auth"],
        ["ms-product", "Productos, categorías, stock y favoritos", "products"],
        ["ms-cart", "Carrito y fusión del carrito local", "cart"],
        ["ms-order", "Órdenes, folios y orquestación del checkout", "order"],
        ["ms-payment", "Pagos idempotentes", "payment"],
        ["ms-shipping", "Envíos y tracking", "shipping"],
        ["ms-content", "Noticias y contacto", "content_db"],
    ], [1.6, 4.2, 1.6])
    h(d, "Documentación de Endpoints")
    servicios = []
    for ep in ENDPOINTS:
        if ep[0] not in servicios:
            servicios.append(ep[0])
    for svc in servicios:
        h(d, svc, 2)
        for ep in [e for e in ENDPOINTS if e[0] == svc]:
            par = d.add_paragraph(style="List Paragraph")
            r = par.add_run(f"{ep[1]} {ep[2]}")
            r.bold = True
            bullets(d, [
                f"Descripción: {ep[3]}",
                f"Método: {ep[1]}",
                f"Datos de entrada: {ep[4]}",
                f"Respuestas: {ep[5]}",
                f"API: {ep[6]} | Requiere autenticación: {ep[7]}",
                f"Roles permitidos: {ep[8]}",
                f"Observaciones: {ep[9]}",
            ])
    h(d, "Flujo de datos de la integración")
    numerados(d, [
        "El usuario inicia sesión: POST /api/v1/auth/login devuelve JWT; AuthContext guarda token y sesión en localStorage.",
        "En cada petición, src/api/client.ts añade Authorization: Bearer <token> y desenvuelve ApiResponse<T>.",
        "El catálogo consume GET /api/v1/products y /categories; los mappers convierten category→categoriaId e imageUrl→imagen.",
        "El carrito anónimo vive en chic_carrito_pendiente; al autenticarse, CartContext llama POST /cart/{uid}/merge con {productId, quantity}.",
        "El checkout envía solo productId/quantity y datos de entrega a POST /orders/checkout; ms-order reserva stock, crea pago y envío, y confirma la reserva.",
        "RutaProtegida y los guards de App.tsx muestran /admin solo a ADMIN y /admin/productos|ordenes a ADMIN y SELLER.",
    ])
    h(d, "Diagrama de secuencia del checkout")
    p(d, "Cliente → api-gateway → ms-order → ms-product (batch + reserve) → ms-payment → ms-shipping → ms-product (confirm). Si falla pago o envío: ms-order libera la reserva y anula el pago; si falla confirm, restaura stock.")
    h(d, "Integración con el Frontend")
    bullets(d, [
        "Cliente HTTP: frontend-react/src/api/client.ts (fetch, ApiError, Bearer, ApiResponse).",
        "Autenticación: frontend-react/src/context/AuthContext.tsx (login, logout, rehidratación, roles).",
        "Dominio: src/api/{auth,catalog,cart,favorites,orders,content}.ts y src/api/mappers.ts.",
        "Carrito: src/context/CartContext.tsx con merge por uid y limpieza solo en ruta exitosa.",
        "Administración: src/pages/admin/*.tsx contra categorías, productos, usuarios y órdenes.",
        "Estados de orden: valores del enum del backend PENDING/CONFIRMED/PAID/SHIPPED/DELIVERED/CANCELLED con etiquetas en español.",
    ])
    h(d, "Verificación de Entrega")
    p(d, "Se recomienda accompanying el documento con capturas de pantalla reales del flujo completo: login, catálogo, carrito, checkout, mis compras, panel ADMIN y panel SELLER. Incluir una descripción debajo de cada imagen explicando qué muestra.")
    for nombre in ["Captura 1 - Login y sesión persistente", "Captura 2 - Catálogo y detalle de producto",
                   "Captura 3 - Carrito y fusión tras login", "Captura 4 - Checkout y orden con folio",
                   "Captura 5 - Panel ADMIN de productos y categorías", "Captura 6 - Panel de órdenes y transiciones de estado"]:
        q = d.add_paragraph(f"[{nombre}: insertar captura aquí]")
        q.runs[0].italic = True
    pie(d)
    d.save(os.path.join(ROOT, "05-Documentación-de-APIs-e-Integración.docx"))


# ----------------------------------------------------------------------------
# 06 Manual de usuario
# ----------------------------------------------------------------------------
def gen_manual():
    d = nuevo_doc("Manual de Usuario", "Accesorios Chic - DSY1104 Control 3")
    h(d, "1. Acceso al sistema")
    p(d, "Abrir la URL del frontend (por defecto http://localhost:5173) con VITE_API_URL apuntando al gateway http://localhost:9000. La API debe estar levantada junto con PostgreSQL y Eureka.")
    bullets(d, ["[Captura: pantalla de inicio / login] - Muestra el formulario de acceso y el enlace de registro."])
    h(d, "2. Registro e inicio de sesión")
    numerados(d, [
        "En Registro, completar RUT, nombre, apellidos, correo, contraseña y dirección.",
        "En Login, ingresar correo y contraseña; el sistema guarda el JWT y la sesión.",
        "Al recargar la página, la sesión se recupera automáticamente con GET /auth/me.",
    ])
    bullets(d, ["[Captura: registro] - Formulario validado.", "[Captura: login] - Mensaje de error ante credenciales inválidas."])
    h(d, "3. Flujo del cliente (CUSTOMER)")
    h(d, "3.1 Catálogo y productos", 2)
    p(d, "Desde Inicio o Productos se pueden ver los productos, filtrar por categoría o buscar por nombre. Al abrir un producto se muestra detalle, precio, stock disponible y botón para agregar al carrito.")
    bullets(d, ["[Captura: catálogo con filtros]", "[Captura: detalle de producto]"])
    h(d, "3.2 Carrito y favoritos", 2)
    p(d, "El carrito permite cambiar cantidades, eliminar items y ver el total calculado por el backend. Si el usuario navega sin sesión, los productos se guardan localmente y se fusionan automáticamente al iniciar sesión. Los favoritos se alternan desde la tarjeta de producto.")
    bullets(d, ["[Captura: carrito con items]", "[Captura: mensaje de fusión del carrito]"])
    h(d, "3.3 Checkout y mis compras", 2)
    numerados(d, [
        "En Carrito, presionar Confirmar pedido.",
        "Ingresar dirección, región, comuna, teléfono y método de pago (no se envían precios).",
        "El sistema crea la orden con folio CH-YYYYMMDD-NNNNNN y vacía el carrito.",
        "En Mis compras se consulta el estado de las órdenes y el detalle por folio/id.",
    ])
    bullets(d, ["[Captura: formulario de checkout]", "[Captura: compra exitosa con folio]", "[Captura: mis compras]"])
    h(d, "4. Flujo del vendedor (SELLER)")
    p(d, "El acceso a /admin/productos y /admin/ordenes está disponible para ADMIN y SELLER. El vendedor visualiza el listado y detalle de productos y órdenes; no tiene acceso a usuarios, categorías ni al dashboard, y esos enlaces no aparecen en su menú.")
    bullets(d, ["[Captura: panel vendedor - productos]", "[Captura: panel vendedor - órdenes]"])
    h(d, "5. Flujo del administrador (ADMIN)")
    p(d, "Además de las opciones del vendedor, ADMIN accede a /admin (dashboard) y /admin/usuarios. Puede crear y editar categorías, productos, usuarios, cambiar estados de orden y revisar estadísticas. Los estados válidos son PENDING, CONFIRMED, PAID, SHIPPED, DELIVERED y CANCELLED; los terminales no permiten cambios.")
    bullets(d, ["[Captura: dashboard]", "[Captura: administración de categorías]", "[Captura: administración de usuarios]", "[Captura: cambio de estado de orden]"])
    h(d, "6. Blog y contacto")
    p(d, "Las noticias son públicas y se visualizan en Blog; el detalle se abre por slug. El formulario de Contacto envía nombre, apellido, correo y mensaje al backend.")
    bullets(d, ["[Captura: blog]", "[Captura: detalle de noticia]", "[Captura: contacto]"])
    h(d, "7. Cierre de sesión")
    p(d, "El botón Cerrar sesión elimina el token y la sesión almacenados y redirige al inicio. Las rutas protegidas vuelven a exigir autenticación.")
    pie(d)
    d.save(os.path.join(ROOT, "06-Manual-de-Usuario.docx"))


# ----------------------------------------------------------------------------
# 09 Guion de video
# ----------------------------------------------------------------------------
def gen_video():
    carpeta = os.path.join(ROOT, "09-Video-de-presentación-del-proyecto")
    os.makedirs(carpeta, exist_ok=True)
    with open(os.path.join(carpeta, "guion-y-checklist.txt"), "w", encoding="utf-8") as f:
        f.write("GUION DE VIDEO DE PRESENTACIÓN (15 min + 5 min de preguntas)\n")
        f.write("=" * 70 + "\n\n")
        f.write("Requisito 100: todos los integrantes hablan, se muestra cada pantalla y se explica código fuente.\n")
        f.write("ffmpeg no está disponible en este entorno, por lo que el MP4 debe grabarse con OBS,\n")
        f.write("Zoom o la herramienta del equipo y luego colocarse en esta carpeta como:\n")
        f.write("09-Video-de-presentación-del-proyecto.mp4\n\n")
        f.write("MINUTO 0-2  Introducción: integrantes, asignatura y problema resuelto.\n")
        f.write("MINUTO 2-5  Arquitectura: 8 servicios, Eureka, gateway, PostgreSQL y JWT.\n")
        f.write("MINUTO 5-8  Demo cliente: login, catálogo, carrito, checkout y folio.\n")
        f.write("MINUTO 8-11 Demo roles: guard ADMIN/SELLER/CUSTOMER y panel de órdenes.\n")
        f.write("MINUTO 11-13 Código: client.ts, AuthContext.tsx, CartContext.tsx, OrderService.java.\n")
        f.write("MINUTO 13-15 Pruebas: backend 9 módulos y frontend 22 tests; cierre.\n\n")
        f.write("CHECKLIST\n")
        f.write("- [ ] Todos los integrantes hablan al menos 2 minutos.\n")
        f.write("- [ ] Se muestran las 6 pantallas del manual de usuario.\n")
        f.write("- [ ] Se explica el código fuente compartiendo pantalla del IDE.\n")
        f.write("- [ ] Se menciona el contrato REST y la justificación del flujo de datos.\n")
        f.write("- [ ] Se muestra la ejecución de pruebas separadas.\n")
        f.write("- [ ] MP4 nombrado exactamente 09-Video-de-presentación-del-proyecto.mp4\n")


# ----------------------------------------------------------------------------
# 07 / 08 ZIPs y ZIP final
# ----------------------------------------------------------------------------
def hacer_zip(ruta_salida, raiz, incluir, excluir):
    with zipfile.ZipFile(ruta_salida, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for base, dirs, files in os.walk(raiz):
            dirs[:] = [d for d in dirs if d not in excluir]
            for name in files:
                if name in excluir:
                    continue
                ruta = os.path.join(base, name)
                rel = os.path.relpath(ruta, raiz)
                if not incluir(rel):
                    continue
                z.write(ruta, rel)


def gen_zips():
    excluir = {".git", "node_modules", "target", "dist", "coverage", ".superpowers", "control3"}
    hacer_zip(
        os.path.join(ROOT, "07-Proyecto-frontend-comprimido.zip"),
        os.path.join(PROYECTO, "frontend-react"),
        lambda rel: True,
        excluir,
    )
    def incluir_backend(rel):
        return not rel.startswith("frontend-react" + os.sep) and not rel.startswith("control3" + os.sep)
    hacer_zip(
        os.path.join(ROOT, "08-Proyecto-backend-comprimido.zip"),
        PROYECTO,
        incluir_backend,
        excluir,
    )
    # ZIP final de entrega
    final = os.path.join(ROOT, "Control3-FullStack2-INTEGRANTES.zip")
    with zipfile.ZipFile(final, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for name in sorted(os.listdir(ROOT)):
            ruta = os.path.join(ROOT, name)
            if os.path.isdir(ruta):
                for base, dirs, files in os.walk(ruta):
                    for f in files:
                        rp = os.path.join(base, f)
                        z.write(rp, os.path.relpath(rp, ROOT))
            elif name != os.path.basename(final):
                z.write(ruta, name)


def patch_docx_zoom():
    """El template por defecto de python-docx emite w:zoom sin w:percent."""
    for f in glob.glob(os.path.join(ROOT, "*.docx")):
        fd, tmp = tempfile.mkstemp(suffix=".docx", dir=os.environ.get("TEMP", ROOT))
        os.close(fd)
        with zipfile.ZipFile(f, "r") as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                data = zin.read(item.filename)
                if item.filename == "word/settings.xml":
                    s = data.decode("utf-8")
                    idx = s.find("<w:zoom")
                    if idx != -1:
                        end = s.find(">", idx)
                        tag = s[idx:end]
                        if "w:percent" not in tag:
                            tag = tag.replace("<w:zoom", '<w:zoom w:percent="100"', 1)
                            s = s[:idx] + tag + s[end:]
                    data = s.encode("utf-8")
                zout.writestr(item, data)
        shutil.move(tmp, f)


if __name__ == "__main__":
    os.makedirs(ROOT, exist_ok=True)
    gen_readme()
    gen_ers()
    gen_testing()
    gen_xlsx()
    gen_integracion()
    gen_manual()
    gen_video()
    patch_docx_zoom()
    gen_zips()
    print("Entregables generados en", ROOT)
