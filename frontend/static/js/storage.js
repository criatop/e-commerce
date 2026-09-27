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
    sesion: "chic_sesion",
    ordenes: "chic_ordenes"
};

const CHIC_VERSION = "2";

function obtenerColeccion(clave) {
    return JSON.parse(localStorage.getItem(clave)) || [];
}

function guardarColeccion(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

function inicializarDatos() {
    const semillaEstructura = localStorage.getItem("chic_version") !== CHIC_VERSION;

    if (!localStorage.getItem(CHIC_KEYS.roles) || semillaEstructura) {
        guardarColeccion(CHIC_KEYS.roles, [
            { id: 1, nombre: "Admin" },
            { id: 2, nombre: "Vendedor" },
            { id: 3, nombre: "Cliente" }
        ]);
    }

    if (!localStorage.getItem(CHIC_KEYS.categorias) || semillaEstructura) {
        guardarColeccion(CHIC_KEYS.categorias, [
            { id: 1, nombre: "Collares", descripcion: "Collares, gargantillas y cadenas" },
            { id: 2, nombre: "Pulseras", descripcion: "Pulseras y brazaletes" },
            { id: 3, nombre: "Aros", descripcion: "Aros y pendientes" },
            { id: 4, nombre: "Diademas", descripcion: "Diademas y cintillos para todo estilo" },
            { id: 5, nombre: "Accesorios", descripcion: "Llaveros, cintillos y más" }
        ]);
    }

    if (!localStorage.getItem(CHIC_KEYS.regiones) || semillaEstructura) {
        guardarColeccion(CHIC_KEYS.regiones, [
            { id: 1, nombre: "Región Metropolitana" },
            { id: 2, nombre: "Valparaíso" },
            { id: 3, nombre: "Biobío" },
            { id: 4, nombre: "Arica y Parinacota" },
            { id: 5, nombre: "Tarapacá" },
            { id: 6, nombre: "Antofagasta" },
            { id: 7, nombre: "Atacama" },
            { id: 8, nombre: "Coquimbo" },
            { id: 9, nombre: "Libertador General Bernardo O'Higgins" },
            { id: 10, nombre: "Maule" },
            { id: 11, nombre: "Ñuble" },
            { id: 12, nombre: "La Araucanía" },
            { id: 13, nombre: "Los Ríos" },
            { id: 14, nombre: "Los Lagos" },
            { id: 15, nombre: "Aysén del General Carlos Ibáñez del Campo" },
            { id: 16, nombre: "Magallanes y de la Antártica Chilena" }
        ]);
    }

    if (!localStorage.getItem(CHIC_KEYS.comunas) || semillaEstructura) {
        guardarColeccion(CHIC_KEYS.comunas, [
            { id: 1, regionId: 1, nombre: "Santiago" },
            { id: 2, regionId: 1, nombre: "Providencia" },
            { id: 3, regionId: 1, nombre: "Maipú" },
            { id: 4, regionId: 2, nombre: "Valparaíso" },
            { id: 5, regionId: 2, nombre: "Viña del Mar" },
            { id: 6, regionId: 3, nombre: "Concepción" },
            { id: 7, regionId: 3, nombre: "Talcahuano" },
            { id: 8, regionId: 1, nombre: "Las Condes" },
            { id: 9, regionId: 1, nombre: "Ñuñoa" },
            { id: 10, regionId: 1, nombre: "Puente Alto" },
            { id: 11, regionId: 1, nombre: "La Florida" },
            { id: 12, regionId: 2, nombre: "Quilpué" },
            { id: 13, regionId: 2, nombre: "Villa Alemana" },
            { id: 14, regionId: 2, nombre: "San Antonio" },
            { id: 15, regionId: 2, nombre: "Los Andes" },
            { id: 16, regionId: 3, nombre: "Hualpén" },
            { id: 17, regionId: 3, nombre: "San Pedro de la Paz" },
            { id: 18, regionId: 3, nombre: "Coronel" },
            { id: 19, regionId: 3, nombre: "Los Ángeles" },
            { id: 20, regionId: 4, nombre: "Arica" },
            { id: 21, regionId: 4, nombre: "Putre" },
            { id: 22, regionId: 4, nombre: "Camarones" },
            { id: 23, regionId: 5, nombre: "Iquique" },
            { id: 24, regionId: 5, nombre: "Alto Hospicio" },
            { id: 25, regionId: 5, nombre: "Pozo Almonte" },
            { id: 26, regionId: 6, nombre: "Antofagasta" },
            { id: 27, regionId: 6, nombre: "Calama" },
            { id: 28, regionId: 6, nombre: "Tocopilla" },
            { id: 29, regionId: 7, nombre: "Copiapó" },
            { id: 30, regionId: 7, nombre: "Vallenar" },
            { id: 31, regionId: 7, nombre: "Huasco" },
            { id: 32, regionId: 8, nombre: "La Serena" },
            { id: 33, regionId: 8, nombre: "Coquimbo" },
            { id: 34, regionId: 8, nombre: "Ovalle" },
            { id: 35, regionId: 8, nombre: "Illapel" },
            { id: 36, regionId: 9, nombre: "Rancagua" },
            { id: 37, regionId: 9, nombre: "San Fernando" },
            { id: 38, regionId: 9, nombre: "Santa Cruz" },
            { id: 39, regionId: 9, nombre: "Rengo" },
            { id: 40, regionId: 10, nombre: "Talca" },
            { id: 41, regionId: 10, nombre: "Curicó" },
            { id: 42, regionId: 10, nombre: "Linares" },
            { id: 43, regionId: 10, nombre: "Constitución" },
            { id: 44, regionId: 11, nombre: "Chillán" },
            { id: 45, regionId: 11, nombre: "San Carlos" },
            { id: 46, regionId: 11, nombre: "Quillón" },
            { id: 47, regionId: 12, nombre: "Temuco" },
            { id: 48, regionId: 12, nombre: "Villarrica" },
            { id: 49, regionId: 12, nombre: "Pucón" },
            { id: 50, regionId: 12, nombre: "Angol" },
            { id: 51, regionId: 13, nombre: "Valdivia" },
            { id: 52, regionId: 13, nombre: "La Unión" },
            { id: 53, regionId: 13, nombre: "Río Bueno" },
            { id: 54, regionId: 14, nombre: "Puerto Montt" },
            { id: 55, regionId: 14, nombre: "Osorno" },
            { id: 56, regionId: 14, nombre: "Castro" },
            { id: 57, regionId: 14, nombre: "Ancud" },
            { id: 58, regionId: 15, nombre: "Coyhaique" },
            { id: 59, regionId: 15, nombre: "Puerto Aysén" },
            { id: 60, regionId: 15, nombre: "Chile Chico" },
            { id: 61, regionId: 16, nombre: "Punta Arenas" },
            { id: 62, regionId: 16, nombre: "Puerto Natales" },
            { id: 63, regionId: 16, nombre: "Porvenir" }
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
        { codigo: "CH-001", nombre: "Aros Dorados", descripcion: "Aros dorados clásicos que aportan luz y brillo a cualquier look de día.", precio: 11500, stock: 15, stockCritico: 4, categoriaId: 3, imagen: "productos/aros1.jpg", estado: "Activo" },
        { codigo: "CH-002", nombre: "Cintillo Hojas Doradas", descripcion: "Cintillo dorado con delicadas hojas que realzan cualquier peinado.", precio: 8500, stock: 20, stockCritico: 5, categoriaId: 5, imagen: "productos/cintillo.jpg", estado: "Activo" },
        { codigo: "CH-003", nombre: "Collar Corazón Dorado", descripcion: "Collar con colgante en forma de corazón dorado, romántico y versátil.", precio: 15900, stock: 12, stockCritico: 3, categoriaId: 1, imagen: "productos/collar1.jpg", estado: "Activo" },
        { codigo: "CH-004", nombre: "Collar Perlado Corazón Rojo", descripcion: "Collar aperlado con colgante de corazón rojo para un toque lleno de pasión.", precio: 16900, stock: 10, stockCritico: 3, categoriaId: 1, imagen: "productos/collar2.jpg", estado: "Activo" },
        { codigo: "CH-005", nombre: "Collar Playero Estrellas de Mar", descripcion: "Collar estilo playero adornado con conchitas y estrellas de mar.", precio: 13900, stock: 14, stockCritico: 4, categoriaId: 1, imagen: "productos/collar3.jpg", estado: "Activo" },
        { codigo: "CH-006", nombre: "Collar Perlas y Medallas", descripcion: "Collar con perlas y medallas decorativas, elegante y con mucho estilo.", precio: 17900, stock: 8, stockCritico: 3, categoriaId: 1, imagen: "productos/collar4.jpg", estado: "Activo" },
        { codigo: "CH-007", nombre: "Diadema Multicolor", descripcion: "Diademas de distintos colores para darle vida y alegría a tu look.", precio: 6900, stock: 25, stockCritico: 6, categoriaId: 4, imagen: "productos/diadema 1.jpeg", estado: "Activo" },
        { codigo: "CH-008", nombre: "Diadema Tonos Pastel", descripcion: "Diademas en suaves tonos pastel, frescas y femeninas.", precio: 6900, stock: 22, stockCritico: 6, categoriaId: 4, imagen: "productos/diadema2.jpeg", estado: "Activo" },
        { codigo: "CH-009", nombre: "Diadema Diseño Especial", descripcion: "Diadema con patrón característico y diseño diferencial.", precio: 7500, stock: 16, stockCritico: 5, categoriaId: 4, imagen: "productos/diadema4.jpeg", estado: "Activo" },
        { codigo: "CH-010", nombre: "Diadema Colores Vivos", descripcion: "Diadema con nuevo patrón y colores llamativos que no pasan desapercibidos.", precio: 7500, stock: 20, stockCritico: 5, categoriaId: 4, imagen: "productos/diadema5.jpg", estado: "Activo" },
        { codigo: "CH-011", nombre: "Llavero Perro Salchicha", descripcion: "Llavero divertido con figura de perro salchicha para acompañarte a todas partes.", precio: 4900, stock: 30, stockCritico: 8, categoriaId: 5, imagen: "productos/llavero1.jpg", estado: "Activo" },
        { codigo: "CH-012", nombre: "Llavero Salchicha Ternura", descripcion: "Llavero de perro salchicha en versión tierna, ideal para regalar.", precio: 4900, stock: 28, stockCritico: 8, categoriaId: 5, imagen: "productos/llavero2.jpg", estado: "Activo" },
        { codigo: "CH-013", nombre: "Pulsera Dios con Perlas", descripcion: "Pulsera con palabra \"Dios\" combinada con delicadas perlas.", precio: 9900, stock: 16, stockCritico: 4, categoriaId: 2, imagen: "productos/pulsera.jpg", estado: "Activo" },
        { codigo: "CH-014", nombre: "Pulsera Figuras", descripcion: "Pulsera con figuras decorativas que le dan un toque único.", precio: 8900, stock: 18, stockCritico: 5, categoriaId: 2, imagen: "productos/pulsera2.jpg", estado: "Activo" },
        { codigo: "CH-015", nombre: "Pulsera Corazones", descripcion: "Pulsera adornada con corazones, romántica y delicada.", precio: 8900, stock: 20, stockCritico: 5, categoriaId: 2, imagen: "productos/pulsera3.jpg", estado: "Activo" },
        { codigo: "CH-016", nombre: "Pulsera Cuero y Figuras", descripcion: "Pulsera de cuero combinada con figuras, moderna y con carácter.", precio: 10900, stock: 12, stockCritico: 4, categoriaId: 2, imagen: "productos/pulsera4.jpg", estado: "Activo" },
        { codigo: "CH-017", nombre: "Pulsera Cuero Encanto", descripcion: "Pulsera de cuero con figuras y encanto casual.", precio: 10900, stock: 12, stockCritico: 4, categoriaId: 2, imagen: "productos/pulsera5.jpg", estado: "Activo" }
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

    if (semillaEstructura) {
        localStorage.setItem("chic_version", CHIC_VERSION);
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
            iconoCta.title = "Panel de administración";
        } else if (sesion) {
            iconoCta.href = "/cuenta";
            iconoCta.title = "Mi cuenta";
        } else {
            iconoCta.href = "/cuenta";
            iconoCta.title = "Iniciar sesión";
        }
        iconoCta.classList.toggle("activa", !!sesion);

        const inicialesEl = document.getElementById("userIniciales");
        if (inicialesEl) {
            if (sesion && sesion.nombre) {
                const iniciales = (sesion.nombre + " " + (sesion.apellidos || "")).trim()
                    .split(/\s+/).slice(0, 2)
                    .map(function (p) { return p.charAt(0).toUpperCase(); })
                    .join("");
                inicialesEl.textContent = iniciales;
                inicialesEl.style.display = "inline-flex";
            } else {
                inicialesEl.textContent = "";
                inicialesEl.style.display = "none";
            }
        }
    }
    const btnCerrar = document.getElementById("btnCerrarSesion");
    if (btnCerrar) {
        btnCerrar.style.display = sesion ? "flex" : "none";
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