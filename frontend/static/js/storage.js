const CHIC_KEYS = {
    usuarios: "chic_usuarios",
    productos: "chic_productos",
    categorias: "chic_categorias",
    regiones: "chic_regiones",
    comunas: "chic_comunas",
    roles: "chic_roles",
    carrito: "chic_carrito",
    contactos: "chic_contactos",
    blog: "chic_blog",
    sesion: "chic_sesion"
};

function obtenerColeccion(clave) {
    return JSON.parse(localStorage.getItem(clave)) || [];
}

function guardarColeccion(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

function inicializarDatos() {
    if (!localStorage.getItem(CHIC_KEYS.roles)) {
        guardarColeccion(CHIC_KEYS.roles, [
            { id: 1, nombre: "Admin" },
            { id: 2, nombre: "Vendedor" },
            { id: 3, nombre: "Cliente" }
        ]);
    }

    if (!localStorage.getItem(CHIC_KEYS.categorias)) {
        guardarColeccion(CHIC_KEYS.categorias, [
            { id: 1, nombre: "Collares", descripcion: "Collares, gargantillas y cadenas" },
            { id: 2, nombre: "Pulseras", descripcion: "Pulseras y brazaletes" },
            { id: 3, nombre: "Aros", descripcion: "Aros y pendientes" },
            { id: 4, nombre: "Anillos", descripcion: "Anillos de moda" },
            { id: 5, nombre: "Accesorios", descripcion: "Tobilleras, broches y más" }
        ]);
    }

    if (!localStorage.getItem(CHIC_KEYS.regiones)) {
        guardarColeccion(CHIC_KEYS.regiones, [
            { id: 1, nombre: "Región Metropolitana" },
            { id: 2, nombre: "Valparaíso" },
            { id: 3, nombre: "Biobío" }
        ]);
    }

    if (!localStorage.getItem(CHIC_KEYS.comunas)) {
        guardarColeccion(CHIC_KEYS.comunas, [
            { id: 1, regionId: 1, nombre: "Santiago" },
            { id: 2, regionId: 1, nombre: "Providencia" },
            { id: 3, regionId: 1, nombre: "Maipú" },
            { id: 4, regionId: 2, nombre: "Valparaíso" },
            { id: 5, regionId: 2, nombre: "Viña del Mar" },
            { id: 6, regionId: 3, nombre: "Concepción" },
            { id: 7, regionId: 3, nombre: "Talcahuano" }
        ]);
    }

    if (!localStorage.getItem(CHIC_KEYS.usuarios)) {
        guardarColeccion(CHIC_KEYS.usuarios, [
            { run: "111111111", nombre: "Admin", apellidos: "Pink", correo: "admin@gmail.com", password: "admin123", fechaNacimiento: "1990-01-01", rolId: 1, regionId: 1, comunaId: 1, direccion: "Av. Principal 123", estado: "Activo" },
            { run: "222222222", nombre: "Vendedor", apellidos: "Pink", correo: "vendedor@gmail.com", password: "vend1234", fechaNacimiento: "1992-05-14", rolId: 2, regionId: 1, comunaId: 2, direccion: "Calle Venta 456", estado: "Activo" },
            { run: "333333333", nombre: "Camila", apellidos: "Rosales", correo: "camila@gmail.com", password: "cliente1", fechaNacimiento: "1998-03-22", rolId: 3, regionId: 2, comunaId: 4, direccion: "Los Aromos 789", estado: "Activo" },
            { run: "444444444", nombre: "Diego", apellidos: "Pérez", correo: "diego@gmail.com", password: "diego123", fechaNacimiento: "1996-07-10", rolId: 3, regionId: 1, comunaId: 3, direccion: "Av. Central 555", estado: "Activo" }
        ]);
    }

    if (!localStorage.getItem(CHIC_KEYS.productos)) {
        guardarColeccion(CHIC_KEYS.productos, [
            { codigo: "CH-001", nombre: "Collar Perla Rosa", descripcion: "Collar delicado con perlas rosa agua, perfecto para realzar cualquier look de día.", precio: 14990, stock: 18, stockCritico: 4, categoriaId: 1, imagen: "productos/collar-perla.svg", estado: "Activo" },
            { codigo: "CH-002", nombre: "Pulsera Cadena Fina", descripcion: "Pulsera dorada de cadena fina con cierre seguro. Ideal para combinar en capas.", precio: 8990, stock: 22, stockCritico: 5, categoriaId: 2, imagen: "productos/pulsera-cadena.svg", estado: "Activo" },
            { codigo: "CH-003", nombre: "Aros Aro Luna", descripcion: "Aros circulares con detalle de luna que aportan un toque bohemio y femenino.", precio: 11990, stock: 12, stockCritico: 3, categoriaId: 3, imagen: "productos/aros-luna.svg", estado: "Activo" },
            { codigo: "CH-004", nombre: "Anillo Corazón", descripcion: "Anillo ajustable con figura de corazón esmaltado en rosa, suave y romántico.", precio: 6990, stock: 25, stockCritico: 6, categoriaId: 4, imagen: "productos/anillo-corazon.svg", estado: "Activo" },
            { codigo: "CH-005", nombre: "Collar Letra Inicial", descripcion: "Collar personalizable con tu inicial en dorado. Un regalo íntimo y personal.", precio: 12990, stock: 10, stockCritico: 3, categoriaId: 1, imagen: "productos/collar-letra.svg", estado: "Activo" },
            { codigo: "CH-006", nombre: "Pulsera Encanto Rosa", descripcion: "Pulsera con charm de flor rosa y cristal, delicada y llena de encanto.", precio: 9990, stock: 16, stockCritico: 4, categoriaId: 2, imagen: "productos/pulsera-encanto.svg", estado: "Activo" },
            { codigo: "CH-007", nombre: "Aros Perla Cristal", descripcion: "Aros colgantes con perlas y cristales que brillan con elegancia.", precio: 15990, stock: 8, stockCritico: 3, categoriaId: 3, imagen: "productos/aros-perla.svg", estado: "Activo" },
            { codigo: "CH-008", nombre: "Set Pashmina Aro", descripcion: "Accesorios para el cabello: pashminas y aros metálicos en tonos nude.", precio: 4990, stock: 30, stockCritico: 8, categoriaId: 5, imagen: "productos/pashmina-aro.svg", estado: "Activo" }
        ]);
    }

    if (!localStorage.getItem(CHIC_KEYS.blog)) {
        guardarColeccion(CHIC_KEYS.blog, [
            { id: 1, titulo: "Pink & Pink abre sus puertas", resumen: "Nace una nueva tienda de accesorios pensada para mujeres que aman brillar.", imagen: "blog/apertura.svg", fecha: "2026-08-01", slug: "detalle-1" },
            { id: 2, titulo: "Las tendencias del año en accesorios", resumen: "Repasamos los estilos que marcarán tendencia en los próximos meses.", imagen: "blog/tendencias.svg", fecha: "2026-08-10", slug: "detalle-2" }
        ]);
    }

    if (!localStorage.getItem(CHIC_KEYS.carrito)) {
        guardarColeccion(CHIC_KEYS.carrito, []);
    }

    if (!localStorage.getItem(CHIC_KEYS.contactos)) {
        guardarColeccion(CHIC_KEYS.contactos, []);
    }
}

/* ---------- Sesión ---------- */
function obtenerSesion() {
    return JSON.parse(localStorage.getItem(CHIC_KEYS.sesion)) || null;
}

function guardarSesion(usuario) {
    localStorage.setItem(CHIC_KEYS.sesion, JSON.stringify(usuario));
}

function cerrarSesion() {
    localStorage.removeItem(CHIC_KEYS.sesion);
    window.location.href = "/login";
}

function obtenerNombreRol(rolId) {
    const rol = obtenerColeccion(CHIC_KEYS.roles).find(function (r) { return r.id === rolId; });
    return rol ? rol.nombre : "";
}

/* Protege páginas admin según rol. */
function protegerPaginaAdmin(rolesPermitidos) {
    const sesion = obtenerSesion();
    if (!sesion || rolesPermitidos.indexOf(sesion.rolId) === -1) {
        Swal.fire({
            title: "Acceso restringido",
            text: "Debes iniciar sesión con una cuenta autorizada para ver esta página.",
            icon: "warning",
            confirmButtonText: "Ir a iniciar sesión"
        }).then(function () {
            window.location.href = "/login";
        });
        return false;
    }
    return true;
}

/* ---------- Navbar / badge / herramientas ---------- */
function actualizarNavbar() {
    const sesion = obtenerSesion();
    const iconoCta = document.getElementById("iconoCta");
    if (iconoCta) {
        if (sesion && (sesion.rolId === 1 || sesion.rolId === 2)) {
            iconoCta.href = "/admin";
        } else {
            iconoCta.href = "/cuenta";
        }
    }
}

function actualizarBadgeCarrito() {
    const carrito = obtenerColeccion(CHIC_KEYS.carrito);
    let totalItems = 0;
    for (let i = 0; i < carrito.length; i++) {
        totalItems += carrito[i].cantidad;
    }
    const badge = document.getElementById("carritoBadge");
    if (!badge) return;
    if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.style.display = "flex";
    } else {
        badge.style.display = "none";
    }
}

function formatearPrecio(valor) {
    return "$" + Number(valor).toLocaleString("es-CL");
}

/* Buscador global (navbar) -> lleva a productos?q=... */
function conectarBuscadorGlobal() {
    const buscador = document.getElementById("buscadorGlobal");
    if (!buscador) return;
    buscador.addEventListener("keydown", function (evento) {
        if (evento.key === "Enter") {
            const texto = buscador.value.trim();
            if (texto) {
                window.location.href = "/productos?q=" + encodeURIComponent(texto);
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    inicializarDatos();
    actualizarNavbar();
    actualizarBadgeCarrito();
    conectarBuscadorGlobal();
});