import type { Categoria, Noticia, Orden, Producto } from "../types";
import type { CategoriaApi, NoticiaApi, OrdenApi, OrdenEstadoApi, ProductoApi } from "./types";

export function mapProducto(p: ProductoApi): Producto {
    return {
        id: p.id,
        codigo: p.sku,
        nombre: p.name,
        descripcion: p.description,
        precio: p.price,
        stock: p.available,
        stockCritico: p.lowStockThreshold,
        categoriaId: p.category,
        imagen: p.imageUrl,
        estado: p.active ? "Activo" : "Inactivo",
    };
}

export function mapCategoria(c: CategoriaApi): Categoria {
    return {
        id: c.id,
        nombre: c.name,
        descripcion: c.description,
        activa: c.activa,
    };
}

export function mapNoticia(n: NoticiaApi): Noticia {
    return {
        id: n.id,
        titulo: n.titulo,
        resumen: n.resumen,
        imagen: n.imagen,
        fecha: n.fecha,
        slug: n.slug,
        categoria: n.categoria,
        autor: n.autor,
        parrafos: Array.isArray(n.parrafos) ? n.parrafos : [],
    };
}

const ESTADOS_ORDEN: Record<OrdenEstadoApi, string> = {
    PENDIENTE: "Pendiente",
    CONFIRMADA: "Confirmada",
    PREPARANDO: "Preparando",
    ENVIADA: "Enviada",
    ENTREGADA: "Entregada",
    CANCELADA: "Cancelada",
};

export function mapOrden(o: OrdenApi): Orden {
    return {
        folio: o.folio,
        fecha: o.createdAt ?? "",
        items: o.items.map((item) => ({
            codigo: item.sku,
            nombre: item.productName,
            precio: item.unitPrice,
            cantidad: item.quantity,
            subtotal: item.lineTotal,
        })),
        subtotal: o.subtotalAmount,
        envio: {
            metodo: o.shippingAmount > 0 ? "Despacho" : "Retiro en tienda",
            costo: o.shippingAmount,
        },
        pago: { metodo: "-" },
        entrega: {
            nombre: o.recipientName ?? "",
            direccion: o.shippingAddress ?? "",
            region: o.shippingPostal ?? "",
            comuna: o.shippingCity ?? "",
            telefono: "",
        },
        total: o.totalAmount,
        estado: ESTADOS_ORDEN[o.status] ?? o.status,
        usuario: {
            run: "",
            correo: o.recipientEmail ?? "",
            nombre: o.recipientName ?? "",
        },
    };
}
