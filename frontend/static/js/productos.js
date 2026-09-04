function rutaImagenProducto(producto) {
    if (!producto.imagen) return "/static/img/logo.svg";
    return "/static/img/" + producto.imagen;
}

function obtenerNombreCategoria(categoriaId) {
    const cat = obtenerColeccion(CHIC_KEYS.categorias).find(function (c) { return c.id === categoriaId; });
    return cat ? cat.nombre : "";
}

function crearTarjetaProducto(producto) {
    const enlace = "/producto-detalle?codigo=" + encodeURIComponent(producto.codigo);
    return '<div class="col">' +
        '<div class="card-nexo-hover h-100">' +
        '<a href="' + enlace + '">' +
        '<img src="' + rutaImagenProducto(producto) + '" class="card-img-top" alt="' + producto.nombre + '">' +
        '</a>' +
        '<div class="card-body">' +
        '<span class="badge text-bg-secondary mb-2">' + obtenerNombreCategoria(producto.categoriaId) + '</span>' +
        '<a href="' + enlace + '"><h5 class="card-title">' + producto.nombre + '</h5></a>' +
        '<p class="card-text">' + formatearPrecio(producto.precio) + '</p>' +
        '<button class="btn btn-accent w-100" onclick="agregarAlCarrito(\'' + producto.codigo + '\')">Añadir al carrito</button>' +
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
        contenedor.innerHTML = '<p class="text-muted">No se encontraron accesorios.</p>';
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
        contenedor.innerHTML = '<p class="text-muted">Producto no encontrado.</p>';
        return;
    }

    contenedor.innerHTML =
        '<div class="row g-5">' +
        '<div class="col-md-6">' +
        '<img src="' + rutaImagenProducto(producto) + '" class="img-fluid rounded bg-pink-panel p-2" alt="' + producto.nombre + '">' +
        '</div>' +
        '<div class="col-md-6">' +
        '<span class="badge text-bg-secondary">' + obtenerNombreCategoria(producto.categoriaId) + '</span>' +
        '<h1 class="mt-3">' + producto.nombre + '</h1>' +
        '<p class="fs-4 text-accent">' + formatearPrecio(producto.precio) + '</p>' +
        '<p>' + producto.descripcion + '</p>' +
        '<p class="text-muted">Stock disponible: ' + producto.stock + ' unidades</p>' +
        '<button class="btn btn-accent btn-lg" onclick="agregarAlCarrito(\'' + producto.codigo + '\')">Añadir al carrito</button>' +
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