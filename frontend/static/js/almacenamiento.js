const PINK_KEYS = {
    /*usuarios: "nexo_usuarios",
    productos: "nexo_productos",
    categorias: "nexo_categorias",
    regiones: "nexo_regiones",
    comunas: "nexo_comunas",
    roles: "nexo_roles",
    carrito: "nexo_carrito",
    contactos: "nexo_contactos",
    blog: "nexo_blog",
    sesion: "nexo_sesion"*/
};

function obtenerColeccion(clave) {
    return JSON.parse(localStorage.getItem(clave)) || [];
}

function guardarColeccion(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

function inicializarDatos() {
    if (!localStorage.getItem(PINK_KEYS.roles)) {
        guardarColeccion(PINK_KEYS.roles, [
            { id: 1, nombre: "ADMIN" },
            { id: 2, nombre: "SELLER" },
            { id: 3, nombre: "CUSTOMER" }
        ]);
    }

    if (!localStorage.getItem(PINK_KEYS.categorias)) {
        guardarColeccion(PINK_KEYS.categorias, [
            { id: 1, nombre: "Collares", descripcion: "Collares, gargantillas y cadenas" },
            { id: 2, nombre: "Aros", descripcion: "Aros de acero, oro y plata" },
            { id: 3, nombre: "Pulseras", descripcion: "Pulseras, bangals y brazaletes" },
            { id: 4, nombre: "Anillos", descripcion: "Anillos de compromiso, alianzas y moda" },
            { id: 5, nombre: "Tobilleras", descripcion: "Tobilleras delicadas y con dijes" },
            { id: 6, nombre: "Broches", descripcion: "Broches, pasadores y horquillas" }
        
        ]);
    }

    if (!localStorage.getItem(PINK_KEYS.regiones)) {
        guardarColeccion(PINK_KEYS.regiones, [
            { id: 1, nombre: "Region Metropolitana" },
            { id: 2, nombre: "Valparaiso" },
            { id: 3, nombre: "Biobio" }
        ]);
    }

    if (!localStorage.getItem(PINK_KEYS.comunas)) {
        guardarColeccion(PINK_KEYS.comunas, [
            { id: 1, regionId: 1, nombre: "Santiago" },
            { id: 2, regionId: 1, nombre: "Providencia" },
            { id: 3, regionId: 1, nombre: "Maipu" },
            { id: 4, regionId: 2, nombre: "Valparaiso" },
            { id: 5, regionId: 2, nombre: "Vina del Mar" },
            { id: 6, regionId: 3, nombre: "Concepcion" },
            { id: 7, regionId: 3, nombre: "Talcahuano" }
        ]);
    }

    if (!localStorage.getItem(PINK_KEYS.usuarios)) {
        guardarColeccion(PINK_KEYS.usuarios, [
            {
                run: "123456785", nombre: "Francisca", apellidos: "Admin",
                correo: "admin@accesorioschic.cl", password: "password123",
                fechaNacimiento: "1990-01-01", rolId: 1,
                regionId: 1, comunaId: 1, direccion: "Av. Principal 123",
                estado: "Activo"
            },
            {
                run: "987654325", nombre: "Javiera", apellidos: "Ventas",
                correo: "vendedora1@accesorioschic.cl", password: "password123",
                fechaNacimiento: "1992-05-14", rolId: 2,
                regionId: 1, comunaId: 2, direccion: "Calle Venta 456",
                estado: "Activo"
            },
            {
                run: "987654326", nombre: "Constanza", apellidos: "Comercio",
                correo: "vendedora2@accesorioschic.cl", password: "password123",
                fechaNacimiento: "1993-08-10", rolId: 2,
                regionId: 1, comunaId: 2, direccion: "Calle Venta 457",
                estado: "Activo"
            },
            {
                run: "112223339", nombre: "Camila", apellidos: "Rosales",
                correo: "camila.rosa@gmail.com", password: "password123",
                fechaNacimiento: "1998-03-22", rolId: 3,
                regionId: 2, comunaId: 4, direccion: "Los Aromos 789",
                estado: "Activo"
            },
            {
                run: "201113334", nombre: "Valentina", apellidos: "López",
                correo: "valentina.lopez@hotmail.com", password: "password123",
                fechaNacimiento: "2001-11-09", rolId: 3,
                regionId: 3, comunaId: 6, direccion: "Las Rosas 321",
                estado: "Activo"
            },
            {
                run: "154443332", nombre: "Isidora", apellidos: "Muñoz",
                correo: "isidora.munoz@outlook.com", password: "password123",
                fechaNacimiento: "1995-07-19", rolId: 3,
                regionId: 1, comunaId: 3, direccion: "Av. Central 555",
                estado: "Activo"
            },
            {
                run: "167778881", nombre: "Fernanda", apellidos: "Díaz",
                correo: "fernanda.diaz@gmail.com", password: "password123",
                fechaNacimiento: "1997-12-03", rolId: 3,
                regionId: 2, comunaId: 5, direccion: "Pasaje 4 N° 88",
                estado: "Activo"
            },
            {
                run: "189990004", nombre: "Catalina", apellidos: "Reyes",
                correo: "catalina.reyes@gmail.com", password: "password123",
                fechaNacimiento: "1999-04-30", rolId: 3,
                regionId: 3, comunaId: 7, direccion: "Los Olivos 102",
                estado: "Activo"
            },
            {
                run: "105556667", nombre: "Admin", apellidos: "CDC",
                correo: "cdcc@accesorioschic.cl", password: "password123",
                fechaNacimiento: "1988-10-15", rolId: 1,
                regionId: 1, comunaId: 1, direccion: "Oficina Central 900",
                estado: "Activo"
            },
            {
                run: "223334445", nombre: "Cliente", apellidos: "Prueba",
                correo: "cliente1@accesorioschic.cl", password: "password123",
                fechaNacimiento: "2002-01-01", rolId: 3,
                regionId: 1, comunaId: 2, direccion: "Test 123",
                estado: "Activo"
            }
        ]);
    }

    if (!localStorage.getItem(PINK_KEYS.productos)) {
        guardarColeccion(PINK_KEYS.productos, [
            { codigo: "COL-001", nombre: "Collar Estrella Plateado", descripcion: "Collar de plata 925 con dije de estrella", precio: 19990, stock: 80, stockCritico: 10, categoriaId: 1, imagen: "https://img.tienda/collar-estrella.jpg", estado: "Activo" },
            { codigo: "COL-002", nombre: "Collar Perlas Clásico", descripcion: "Collar de perlas cultivadas con cierre dorado", precio: 34990, stock: 35, stockCritico: 5, categoriaId: 1, imagen: "https://img.tienda/collar-perlas.jpg", estado: "Activo" },
            { codigo: "COL-003", nombre: "Collar Corazón Rosa", descripcion: "Collar baño de oro rosa con dije de corazón", precio: 24990, stock: 60, stockCritico: 10, categoriaId: 1, imagen: "https://img.tienda/collar-corazon.jpg", estado: "Activo" },
            { codigo: "COL-004", nombre: "Collar Lobo Plata", descripcion: "Collar capa doble plata 925 con dije lobo", precio: 27990, stock: 45, stockCritico: 5, categoriaId: 1, imagen: "https://img.tienda/collar-lobo.jpg", estado: "Activo" },
            { codigo: "ARO-001", nombre: "Aros Aro Dorado Fino", descripcion: "Aros circulares baño de oro 18k, pair elegante", precio: 14990, stock: 120, stockCritico: 15, categoriaId: 2, imagen: "https://img.tienda/aros-dorados.jpg", estado: "Activo" },
            { codigo: "ARO-002", nombre: "Aros Cascada Cristal", descripcion: "Aros colgantes con cristales Swarovski", precio: 22990, stock: 50, stockCritico: 10, categoriaId: 2, imagen: "https://img.tienda/aros-cascada.jpg", estado: "Activo" },
            { codigo: "ARO-003", nombre: "Aros Perla Minimalista", descripcion: "Aros de perla sobre botón, estilo scandinavo", precio: 12990, stock: 90, stockCritico: 10, categoriaId: 2, imagen: "https://img.tienda/aros-perla.jpg", estado: "Activo" },
            { codigo: "ARO-004", nombre: "Aros Crescent Luna", descripcion: "Aros media luna invertida baño oro rosa", precio: 16990, stock: 70, stockCritico: 10, categoriaId: 2, imagen: "https://img.tienda/aros-luna.jpg", estado: "Activo" },
            { codigo: "PUL-001", nombre: "Pulsera Nudos Amor", descripcion: "Pulsera trenzada de hilo encerado con nudo", precio: 9990, stock: 150, stockCritico: 15, categoriaId: 3, imagen: "https://img.tienda/pulsera-nudos.jpg", estado: "Activo" },
            { codigo: "PUL-002", nombre: "Pulsera Cadena Eslabón", descripcion: "Pulsera de acero quirúrgico baño oro", precio: 17990, stock: 65, stockCritico: 10, categoriaId: 3, imagen: "https://img.tienda/pulsera-eslabon.jpg", estado: "Activo" },
            { codigo: "PUL-003", nombre: "Pulsera Charm Mariposa", descripcion: "Pulsera con dije mariposa y cristales", precio: 19990, stock: 40, stockCritico: 5, categoriaId: 3, imagen: "https://img.tienda/pulsera-mariposa.jpg", estado: "Activo" },
            { codigo: "PUL-004", nombre: "Pulsera Manta Raya", descripcion: "Pulsera tejida a mano con cierre de plata", precio: 7990, stock: 100, stockCritico: 10, categoriaId: 3, imagen: "https://img.tienda/pulsera-manta.jpg", estado: "Activo" },
            { codigo: "ANI-001", nombre: "Anillo Solitario Plata", descripcion: "Anillo solitario plata 925 con circonia", precio: 15990, stock: 55, stockCritico: 10, categoriaId: 4, imagen: "https://img.tienda/anillo-solitario.jpg", estado: "Activo" },
            { codigo: "ANI-002", nombre: "Anillo Ajustable Floral", descripcion: "Anillo ajustable con diseño de flores grabadas", precio: 11990, stock: 85, stockCritico: 10, categoriaId: 4, imagen: "https://img.tienda/anillo-floral.jpg", estado: "Activo" },
            { codigo: "ANI-003", nombre: "Anillo Trio Dije", descripcion: "Anillo triple con dijes luna, estrella y sol", precio: 21990, stock: 30, stockCritico: 5, categoriaId: 4, imagen: "https://img.tienda/anillo-trio.jpg", estado: "Activo" },
            { codigo: "ANI-004", nombre: "Anillo Midi Sol", descripcion: "Anillo midi baño oro con sol grabado", precio: 8990, stock: 75, stockCritico: 10, categoriaId: 4, imagen: "https://img.tienda/anillo-midi.jpg", estado: "Activo" },
            { codigo: "TOB-001", nombre: "Tobillera Dije Corona", descripcion: "Tobillera delicada con pequeño dije de corona", precio: 8990, stock: 110, stockCritico: 15, categoriaId: 5, imagen: "https://img.tienda/tobillera-corona.jpg", estado: "Activo" },
            { codigo: "TOB-002", nombre: "Tobillera Plata Concha", descripcion: "Tobillera de plata con dije concha marina", precio: 10990, stock: 60, stockCritico: 10, categoriaId: 5, imagen: "https://img.tienda/tobillera-concha.jpg", estado: "Activo" },
            { codigo: "BRC-001", nombre: "Broche Floral Rosa Gold", descripcion: "Broche de rosa en baño de oro para cabello", precio: 7990, stock: 95, stockCritico: 10, categoriaId: 5, imagen: "https://img.tienda/broche-rosa.jpg", estado: "Activo" },
            { codigo: "BRC-002", nombre: "Horquilla Perla Juego", descripcion: "Juego de 4 horquillas con perla y cristal", precio: 6990, stock: 200, stockCritico: 20, categoriaId: 6, imagen: "https://img.tienda/horquilla-perla.jpg", estado: "Activo" }
        ]);
    }

    if (!localStorage.getItem(PINK_KEYS.blog)) {
        guardarColeccion(PINK_KEYS.blog, [
            { id: 1, titulo: "Lanzamiento Colección Primavera", resumen: "Descubre las nuevas tendencias en joyas y accesorios minimalistas.", imagen: "blog/primavera.jpg", fecha: "2026-09-01", slug: "detalle-1" },
            { id: 2, titulo: "Cuidado de tus Joyas de Plata 925", resumen: "Consejos prácticos para mantener el brillo y durabilidad de tu bisutería fina.", imagen: "blog/cuidados.jpg", fecha: "2026-09-02", slug: "detalle-2" }
        ]);
    }

    if (!localStorage.getItem(PINK_KEYS.carrito)) {
        guardarColeccion(PINK_KEYS.carrito, []);
    }

    if (!localStorage.getItem(PINK_KEYS.contactos)) {
        guardarColeccion(NEXO_KEYS.contactos, []);
    }
}

function obtenerSesion() {
    return JSON.parse(localStorage.getItem(PINK_KEYS.sesion)) || null;
}

function guardarSesion(usuario) {
    localStorage.setItem(PINK_KEYS.sesion, JSON.stringify(usuario));
}

function cerrarSesion() {
    localStorage.removeItem(PINK_KEYS.sesion);
    window.location.href = "/login";
}

function obtenerNombreRol(rolId) {
    const rol = obtenerColeccion(PINK_KEYS.roles).find(function (r) { return r.id === rolId; });
    return rol ? rol.nombre : "";
}

/* Protege paginas administrativas segun el rol permitido. */
function protegerPaginaAdmin(rolesPermitidos) {
    const sesion = obtenerSesion();
    if (!sesion || rolesPermitidos.indexOf(sesion.rolId) === -1) {
        Swal.fire({
            title: "Acceso restringido",
            text: "Debes iniciar sesion con una cuenta autorizada para ver esta pagina.",
            icon: "warning",
            confirmButtonText: "Ir a Iniciar sesion"
        }).then(function () {
            window.location.href = "/login";
        });
        return false;
    }
    return true;
}

function actualizarNavbar() {
    const sesion = obtenerSesion();
    const navInvitado = document.getElementById("navInvitado");
    const navUsuario = document.getElementById("navUsuario");
    const navUsuarioNombre = document.getElementById("navUsuarioNombre");
    const navAdminItem = document.getElementById("navAdminItem");
    const btnCerrarSesion = document.getElementById("btnCerrarSesion");

    if (!navInvitado || !navUsuario) return;

    if (sesion) {
        navInvitado.style.display = "none";
        navUsuario.style.display = "block";
        if (navUsuarioNombre) navUsuarioNombre.textContent = sesion.nombre;
        if (navAdminItem && (sesion.rolId === 1 || sesion.rolId === 2)) {
            navAdminItem.style.display = "block";
        }
    } else {
        navInvitado.style.display = "flex";
        navUsuario.style.display = "none";
        if (navAdminItem) navAdminItem.style.display = "none";
    }

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", function (evento) {
            evento.preventDefault();
            cerrarSesion();
        });
    }
}

function actualizarBadgeCarrito() {
    const carrito = obtenerColeccion(NEXO_KEYS.carrito);
    let totalItems = 0;
    for (let i = 0; i < carrito.length; i++) {
        totalItems += carrito[i].cantidad;
    }
    const badge = document.getElementById("carritoBadge");
    if (!badge) return;
    if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.style.display = "block";
    } else {
        badge.style.display = "none";
    }
}

/* Oculta la seccion de Usuarios en el menu administrativo para el rol Vendedor. */
function ocultarUsuariosSiVendedor() {
    const sesion = obtenerSesion();
    if (!sesion || sesion.rolId !== 2) return;
    const enlaceSidebar = document.getElementById("sidebarUsuariosLink");
    const enlaceOffcanvas = document.getElementById("offcanvasUsuariosLink");
    if (enlaceSidebar) enlaceSidebar.style.display = "none";
    if (enlaceOffcanvas) enlaceOffcanvas.style.display = "none";
}

/* Marca como activo el enlace del navbar/sidebar que corresponde a la pagina actual. */
function marcarEnlaceActivo() {
    const rutaActual = window.location.pathname;
    document.querySelectorAll(".nav-link").forEach(function (enlace) {
        const href = enlace.getAttribute("href");
        if (href && href !== "#" && href === rutaActual) {
            enlace.classList.add("active");
        }
    });
}

function formatearPrecio(valor) {
    return "$" + Number(valor).toLocaleString("es-CL");
}

document.addEventListener("DOMContentLoaded", function () {
    inicializarDatos();
    actualizarNavbar();
    actualizarBadgeCarrito();
    marcarEnlaceActivo();
});
