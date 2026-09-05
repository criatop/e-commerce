function rutaImagenProducto(producto) {
    if (!producto || !producto.imagen) return "/static/img/logo.svg";
    
    var imgPath = producto.imagen;
    if (!imgPath.startsWith("productos/")) {
        imgPath = "productos/" + imgPath;
    }
    
    return "/static/img/" + imgPath;
}

function obtenerNombreCategoria(categoriaId) {
    if (typeof obtenerColeccion !== "function" || !window.CHIC_KEYS) return "";
    const cat = obtenerColeccion(CHIC_KEYS.categorias).find(function (c) { return c.id === categoriaId; });
    return cat ? cat.nombre : "";
}

function crearTarjetaProducto(producto) {
    const enlace = "/producto-detalle?codigo=" + encodeURIComponent(producto.codigo);
    const rutaImg = rutaImagenProducto(producto);
    
    return '<div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">' +
        '<div class="card-nexo-hover h-100 d-flex flex-column bg-white rounded-4 overflow-hidden shadow-sm border-0">' +
            '<a href="' + enlace + '" class="d-block overflow-hidden bg-light p-2 position-relative d-flex align-items-center justify-content-center" style="height: 280px;">' +
                '<img src="' + rutaImg + '" ' +
                     'class="mw-100 mh-100" ' +
                     'style="object-fit: contain; width: auto; height: auto; max-height: 260px;" ' +
                     'alt="' + producto.nombre + '" ' +
                     'onerror="this.onerror=null;this.src=\'/static/img/logo.svg\';">' +
            '</a>' +
            '<div class="card-body d-flex flex-column p-3 bg-white">' +
                '<div>' +
                    '<span class="badge badge-categoria mb-2">' + obtenerNombreCategoria(producto.categoriaId) + '</span>' +
                    '<a href="' + enlace + '" class="text-decoration-none">' +
                        '<h5 class="card-title text-truncate fw-bold mb-1 text-dark">' + producto.nombre + '</h5>' +
                    '</a>' +
                    '<p class="card-text text-accent fw-bold fs-5 mb-3">' + formatearPrecio(producto.precio) + '</p>' +
                '</div>' +
                '<button class="btn btn-contacto mt-auto w-100 py-2 fw-semibold" onclick="agregarAlCarrito(\'' + producto.codigo + '\')">Añadir al carrito</button>' +
            '</div>' +
        '</div>' +
    '</div>';
}

function mostrarCatalogo(contenedorId, texto, categoriaId) {
    let productos = obtenerColeccion(CHIC_KEYS.productos);

    if (categoriaId) {
        productos = productos.filter(function (p) { return p.categoriaId === Number(categoriaId); });
    }

    if (texto && texto.trim()) {
        const t = texto.trim().toLowerCase();
        productos = productos.filter(function (p) { return p.nombre.toLowerCase().indexOf(t) !== -1; });
    }

    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    if (productos.length === 0) {
        contenedor.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted fs-5">No se encontraron accesorios en esta categoría.</p></div>';
        return;
    }

    let html = "";
    for (let i = 0; i < productos.length; i++) {
        html += crearTarjetaProducto(productos[i]);
    }
    contenedor.innerHTML = html;
}

function llenarSelectCategorias(selectId, conTodas) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = "";
    if (conTodas) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "Todas las categorías";
        select.appendChild(opt);
    }

    const categorias = obtenerColeccion(CHIC_KEYS.categorias);
    for (let i = 0; i < categorias.length; i++) {
        const opt = document.createElement("option");
        opt.value = categorias[i].id;
        opt.textContent = categorias[i].nombre;
        select.appendChild(opt);
    }
}

function mostrarDetalleProducto(codigo) {
    const producto = obtenerColeccion(CHIC_KEYS.productos).find(function (p) { return p.codigo === codigo; });
    const contenedor = document.getElementById("detalleProducto");
    if (!contenedor) return;

    if (!producto) {
        contenedor.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted fs-5">Producto no encontrado.</p></div>';
        return;
    }

    contenedor.innerHTML =
        '<div class="row g-5 align-items-center">' +
            '<div class="col-md-6 text-center">' +
                '<div class="p-3 bg-pink-panel rounded-4 shadow-sm d-flex align-items-center justify-content-center" style="min-height: 350px; max-height: 500px;">' +
                    '<img src="' + rutaImagenProducto(producto) + '" ' +
                         'class="img-fluid rounded-3" ' +
                         'style="max-height: 460px; width: auto; object-fit: contain;" ' +
                         'alt="' + producto.nombre + '" ' +
                         'onerror="this.onerror=null;this.src=\'/static/img/logo.svg\';">' +
                '</div>' +
            '</div>' +
            '<div class="col-md-6">' +
                '<span class="badge badge-categoria mb-2">' + obtenerNombreCategoria(producto.categoriaId) + '</span>' +
                '<h1 class="fw-bold my-2">' + producto.nombre + '</h1>' +
                '<p class="fs-3 text-accent fw-bold mb-3">' + formatearPrecio(producto.precio) + '</p>' +
                '<p class="text-muted mb-4">' + producto.descripcion + '</p>' +
                '<p class="small text-muted mb-4"><i class="bi bi-box-seam me-1"></i> Stock disponible: ' + producto.stock + ' unidades</p>' +
                '<button class="btn btn-contacto btn-lg px-4" onclick="agregarAlCarrito(\'' + producto.codigo + '\')">Añadir al carrito</button>' +
            '</div>' +
        '</div>';
}

function mostrarDestacados(contenedorId) {
    const productos = obtenerColeccion(CHIC_KEYS.productos).slice(0, 4);
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    let html = "";
    for (let i = 0; i < productos.length; i++) {
        html += crearTarjetaProducto(productos[i]);
    }
    contenedor.innerHTML = html;
}

// Inicialización automática al cargar el DOM si existe el catálogo
document.addEventListener("DOMContentLoaded", function () {
    const contenedor = document.getElementById("catalogoContenedor");
    if (!contenedor) return; // Si no estamos en la vista de catálogo, no hace nada

    const selectCat = document.getElementById("filtroCategoria");
    const inputBusq = document.getElementById("buscadorProductos");

    // 1. Obtener la categoría y el término de búsqueda desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const catUrl = urlParams.get("categoria") || "";
    const buscarUrl = urlParams.get("buscar") || "";

    // 2. Llenar el select con las categorías almacenadas
    llenarSelectCategorias("filtroCategoria", true);

    // 3. Sincronizar select e input con los valores de la URL
    if (selectCat && catUrl) selectCat.value = catUrl;
    if (inputBusq && buscarUrl) inputBusq.value = buscarUrl;

    // 4. Renderizar catálogo inicial
    mostrarCatalogo("catalogoContenedor", buscarUrl, catUrl);

    // 5. Escuchar eventos de cambio
    function actualizarFiltros() {
        const txt = inputBusq ? inputBusq.value : "";
        const cat = selectCat ? selectCat.value : "";
        mostrarCatalogo("catalogoContenedor", txt, cat);
    }

    if (selectCat) selectCat.addEventListener("change", actualizarFiltros);
    if (inputBusq) inputBusq.addEventListener("input", actualizarFiltros);
});
