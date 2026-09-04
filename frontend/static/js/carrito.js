function agregarAlCarrito(codigo) {
    const productos = obtenerColeccion(CHIC_KEYS.productos);
    const producto = productos.find(function (p) { return p.codigo === codigo; });
    if (!producto) return;

    let carrito = obtenerColeccion(CHIC_KEYS.carrito);
    const existente = carrito.find(function (item) { return item.codigo === codigo; });

    if (existente) {
        if (existente.cantidad < producto.stock) {
            existente.cantidad++;
        } else {
            Swal.fire("Sin stock", "No hay más unidades disponibles de este accesorio.", "warning");
            return;
        }
    } else {
        carrito.push({ codigo: codigo, cantidad: 1 });
    }

    guardarColeccion(CHIC_KEYS.carrito, carrito);
    actualizarBadgeCarrito();

    Swal.fire({
        title: "¡Agregado!",
        text: producto.nombre + " se añadió a tu carrito.",
        icon: "success",
        confirmButtonColor: "#f0568f"
    });
}

function cambiarCantidadCarrito(codigo, delta) {
    const productos = obtenerColeccion(CHIC_KEYS.productos);
    const producto = productos.find(function (p) { return p.codigo === codigo; });
    let carrito = obtenerColeccion(CHIC_KEYS.carrito);
    const item = carrito.find(function (i) { return i.codigo === codigo; });
    if (!item) return;

    item.cantidad += delta;
    if (item.cantidad < 1) {
        eliminarDelCarrito(codigo);
        return;
    }
    if (producto && item.cantidad > producto.stock) {
        item.cantidad = producto.stock;
    }

    guardarColeccion(CHIC_KEYS.carrito, carrito);
    renderizarCarrito();
    actualizarBadgeCarrito();
}

function eliminarDelCarrito(codigo) {
    let carrito = obtenerColeccion(CHIC_KEYS.carrito);
    carrito = carrito.filter(function (i) { return i.codigo !== codigo; });
    guardarColeccion(CHIC_KEYS.carrito, carrito);
    renderizarCarrito();
    actualizarBadgeCarrito();
}

function vaciarCarrito() {
    Swal.fire({
        title: "¿Vaciar carrito?",
        text: "Se eliminarán todos los accesorios de tu carrito.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#f0568f",
        confirmButtonText: "Sí, vaciar",
        cancelButtonText: "Cancelar"
    }).then(function (resultado) {
        if (resultado.isConfirmed) {
            guardarColeccion(CHIC_KEYS.carrito, []);
            renderizarCarrito();
            actualizarBadgeCarrito();
        }
    });
}

function finalizarCompra() {
    Swal.fire({
        title: "¡Gracias por tu compra!",
        text: "Tu pedido ha sido registrado (simulación). " + formatearPrecio(calcularTotal()),
        icon: "success",
        confirmButtonColor: "#f0568f"
    });
    guardarColeccion(CHIC_KEYS.carrito, []);
    renderizarCarrito();
    actualizarBadgeCarrito();
}

function calcularTotal() {
    const carrito = obtenerColeccion(CHIC_KEYS.carrito);
    const productos = obtenerColeccion(CHIC_KEYS.productos);
    let total = 0;
    for (let i = 0; i < carrito.length; i++) {
        const producto = productos.find(function (p) { return p.codigo === carrito[i].codigo; });
        if (producto) {
            total += producto.precio * carrito[i].cantidad;
        }
    }
    return total;
}

function renderizarCarrito() {
    const carrito = obtenerColeccion(CHIC_KEYS.carrito);
    const productos = obtenerColeccion(CHIC_KEYS.productos);

    const vacio = document.getElementById("carritoVacio");
    const lleno = document.getElementById("carritoLleno");

    if (!vacio || !lleno) return;

    if (carrito.length === 0) {
        vacio.style.display = "block";
        lleno.style.display = "none";
        return;
    }

    vacio.style.display = "none";
    lleno.style.display = "block";

    const tabla = document.getElementById("carritoTabla");
    let filas = "";
    for (let i = 0; i < carrito.length; i++) {
        const producto = productos.find(function (p) { return p.codigo === carrito[i].codigo; });
        if (!producto) continue;
        const subtotal = producto.precio * carrito[i].cantidad;
        filas += '<tr>' +
            '<td class="text-start">' + producto.nombre + '</td>' +
            '<td>' + formatearPrecio(producto.precio) + '</td>' +
            '<td>' +
            '<div class="d-inline-flex align-items-center gap-2">' +
            '<button class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidadCarrito(\'' + producto.codigo + '\', -1)">−</button>' +
            '<span>' + carrito[i].cantidad + '</span>' +
            '<button class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidadCarrito(\'' + producto.codigo + '\', 1)">+</button>' +
            '</div>' +
            '</td>' +
            '<td>' + formatearPrecio(subtotal) + '</td>' +
            '<td><button class="btn btn-sm btn-outline-danger" onclick="eliminarDelCarrito(\'' + producto.codigo + '\')"><i class="bi bi-trash"></i></button></td>' +
            '</tr>';
    }
    tabla.innerHTML = filas;

    const total = document.getElementById("carritoTotal");
    if (total) total.textContent = formatearPrecio(calcularTotal());
}