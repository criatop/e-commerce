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

/* ---------- Checkout ---------- */

var regionesCheckoutCargadas = false;

function abrirCheckout() {
    const carrito = obtenerColeccion(CHIC_KEYS.carrito);
    if (carrito.length === 0) return;

    cargarRegionesCheckout();
    cargarDatosSesionCheckout();
    alternarDatosEntrega();
    actualizarResumenCheckout();

    const panel = document.getElementById("checkoutPanel");
    panel.style.display = "block";
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function volverAlCarrito() {
    const panel = document.getElementById("checkoutPanel");
    panel.style.display = "none";
    const resumen = document.getElementById("carritoResumen");
    if (resumen) resumen.scrollIntoView({ behavior: "smooth", block: "start" });
}

function cargarRegionesCheckout() {
    if (regionesCheckoutCargadas) return;
    const regionSelect = document.getElementById("coRegion");
    const comunaSelect = document.getElementById("coComuna");

    obtenerColeccion(CHIC_KEYS.regiones).forEach(function (region) {
        const opt = document.createElement("option");
        opt.value = region.nombre;
        opt.textContent = region.nombre;
        regionSelect.appendChild(opt);
    });

    regionSelect.addEventListener("change", function () {
        llenarComunasCheckout(regionSelect.value, comunaSelect);
    });
    document.querySelectorAll('input[name="envio"]').forEach(function (input) {
        input.addEventListener("change", function () {
            marcarSeleccion(".opcion-envio");
            alternarDatosEntrega();
            actualizarResumenCheckout();
        });
    });
    document.querySelectorAll('input[name="pago"]').forEach(function (input) {
        input.addEventListener("change", function () {
            marcarSeleccion(".opcion-pago");
        });
    });
    regionesCheckoutCargadas = true;
}

function llenarComunasCheckout(regionNombre, comunaSelect) {
    const comunas = obtenerColeccion(CHIC_KEYS.comunas);
    const region = obtenerColeccion(CHIC_KEYS.regiones).find(function (r) { return r.nombre === regionNombre; });

    comunaSelect.innerHTML = "";
    if (!region) {
        comunaSelect.disabled = true;
        return;
    }
    comunaSelect.disabled = false;
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Selecciona una comuna";
    placeholder.selected = true;
    placeholder.disabled = true;
    comunaSelect.appendChild(placeholder);

    comunas.forEach(function (comuna) {
        if (comuna.regionId === region.id) {
            const opt = document.createElement("option");
            opt.value = comuna.nombre;
            opt.textContent = comuna.nombre;
            comunaSelect.appendChild(opt);
        }
    });

    if (comunaSelect.options.length === 1) {
        comunaSelect.disabled = true;
    }
}

function cargarDatosSesionCheckout() {
    const sesion = obtenerSesion();
    if (sesion) {
        const nombreInput = document.getElementById("coNombre");
        if (sesion.nombre && !nombreInput.value) {
            nombreInput.value = (sesion.nombre + " " + (sesion.apellidos || "")).trim();
        }
        if (sesion.regionId && sesion.comunaId) {
            const region = obtenerColeccion(CHIC_KEYS.regiones).find(function (r) { return r.id === sesion.regionId; });
            const comuna = obtenerColeccion(CHIC_KEYS.comunas).find(function (c) { return c.id === sesion.comunaId; });
            const regionSelect = document.getElementById("coRegion");
            const comunaSelect = document.getElementById("coComuna");
            if (region && regionSelect) {
                regionSelect.value = region.nombre;
                llenarComunasCheckout(region.nombre, comunaSelect);
                if (comuna && comunaSelect) comunaSelect.value = comuna.nombre;
            }
        }
    }
}

function marcarSeleccion(grupo) {
    document.querySelectorAll(grupo).forEach(function (opcion) {
        const input = opcion.querySelector("input");
        opcion.classList.toggle("sel", !!input && input.checked);
    });
}

function alternarDatosEntrega() {
    const envioSel = document.querySelector('input[name="envio"]:checked');
    const esRetiro = envioSel && envioSel.value === "retiro";
    const col = document.getElementById("colEntrega");
    const nota = document.getElementById("notaRetiro");
    if (esRetiro) {
        if (col) col.style.display = "none";
        if (nota) nota.style.display = "block";
        if (document.getElementById("coComuna")) document.getElementById("coComuna").disabled = true;
    } else {
        if (col) col.style.display = "block";
        if (nota) nota.style.display = "none";
    }
}

function obtenerCostoEnvio() {
    const envioSel = document.querySelector('input[name="envio"]:checked');
    if (!envioSel) return 0;
    const label = envioSel.closest(".opcion-envio");
    return label ? Number(label.getAttribute("data-costo")) || 0 : 0;
}

function actualizarResumenCheckout() {
    const subtotal = calcularTotal();
    const costoEnvio = obtenerCostoEnvio();

    const elSubtotal = document.getElementById("coSubtotal");
    const elEnvio = document.getElementById("coEnvio");
    const elTotal = document.getElementById("coTotal");
    if (elSubtotal) elSubtotal.textContent = formatearPrecio(subtotal);
    if (elEnvio) elEnvio.textContent = costoEnvio === 0 ? "Gratis" : formatearPrecio(costoEnvio);
    if (elTotal) elTotal.textContent = formatearPrecio(subtotal + costoEnvio);
}

function confirmarPedido() {
    const carrito = obtenerColeccion(CHIC_KEYS.carrito);
    if (carrito.length === 0) return;

    const envioSel = document.querySelector('input[name="envio"]:checked');
    const pagoSel = document.querySelector('input[name="pago"]:checked');
    const esRetiro = envioSel && envioSel.value === "retiro";

    const nombre = (document.getElementById("coNombre").value || "").trim();
    const direccion = (document.getElementById("coDireccion").value || "").trim();
    const region = document.getElementById("coRegion").value;
    const comuna = document.getElementById("coComuna").value;
    const telefono = (document.getElementById("coTelefono").value || "").trim();

    if (!nombre) {
        Swal.fire("Falta tu nombre", "Ingresa tu nombre completo para continuar.", "warning");
        return;
    }
    if (!envioSel) {
        Swal.fire("Elige envío", "Selecciona un método de envío.", "warning");
        return;
    }
    if (!esRetiro) {
        if (!direccion) {
            Swal.fire("Falta la dirección", "Ingresa la dirección de despacho.", "warning");
            return;
        }
        if (!region) {
            Swal.fire("Falta la región", "Selecciona tu región.", "warning");
            return;
        }
        if (!comuna) {
            Swal.fire("Falta la comuna", "Selecciona tu comuna.", "warning");
            return;
        }
    }
    if (!pagoSel) {
        Swal.fire("Elige pago", "Selecciona un método de pago.", "warning");
        return;
    }

    const productos = obtenerColeccion(CHIC_KEYS.productos);
    const items = [];
    for (let i = 0; i < carrito.length; i++) {
        const producto = productos.find(function (p) { return p.codigo === carrito[i].codigo; });
        if (!producto) continue;
        items.push({
            codigo: producto.codigo,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: carrito[i].cantidad,
            subtotal: producto.precio * carrito[i].cantidad
        });
    }

    const costoEnvio = obtenerCostoEnvio();
    const subtotal = calcularTotal();
    const total = subtotal + costoEnvio;

    const ordenes = obtenerColeccion(CHIC_KEYS.ordenes);
    const folio = "PP-" + String(ordenes.length + 1).padStart(4, "0");

    const pedido = {
        folio: folio,
        fecha: new Date().toISOString(),
        items: items,
        subtotal: subtotal,
        envio: {
            metodo: envioSel.value,
            costo: costoEnvio
        },
        pago: {
            metodo: pagoSel.value
        },
        entrega: {
            nombre: nombre,
            direccion: esRetiro ? "Retiro en tienda" : direccion,
            region: esRetiro ? "Región Metropolitana" : region,
            comuna: esRetiro ? "Santiago" : comuna,
            telefono: telefono
        },
        total: total,
        estado: "Pendiente"
    };

    ordenes.push(pedido);
    guardarColeccion(CHIC_KEYS.ordenes, ordenes);

    Swal.fire({
        icon: "success",
        title: "¡Gracias por tu compra!",
        html: "Tu pedido <strong>" + folio + "</strong> ha sido registrado por " +
            formatearPrecio(total) + " (envío: " +
            (costoEnvio === 0 ? "Gratis" : formatearPrecio(costoEnvio)) + ").<br>Te contactaremos pronto para coordinar la entrega.",
        confirmButtonColor: "#f0568f"
    });

    guardarColeccion(CHIC_KEYS.carrito, []);
    const panel = document.getElementById("checkoutPanel");
    if (panel) panel.style.display = "none";
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