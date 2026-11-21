import type { Categoria, Noticia, Orden, Producto, Usuario } from "../types";
import type {
  CategoriaApi,
  NoticiaApi,
  OrdenApi,
  OrdenEstadoApi,
  ProductoApi,
  UsuarioApi,
} from "./types";

export function mapProducto(p: ProductoApi): Producto {
    return {
        id: p.id,
        codigo: p.sku,
        nombre: p.name,
        descripcion: p.description,
        precio: p.price,
        stock: p.available,
        stockCritico: p.lowStockThreshold,
        reservado: p.reservedQuantity,
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

/** UserResponse de ms-auth al tipo de usuario usado por el panel. */
export function mapUsuarioAdmin(u: UsuarioApi): Usuario {
  return {
    id: u.id,
    run: u.run,
    nombre: u.nombre,
    apellidos: u.apellidos ?? "",
    correo: u.email,
    fechaNacimiento: u.fechaNacimiento ?? undefined,
    rolId: u.roleId,
    rol: u.roleName ?? undefined,
    regionId: u.regionId ?? null,
    comunaId: u.comunaId ?? null,
    direccion: u.direccion ?? "",
    estado: u.activo === false ? "Inactivo" : "Activo",
    activo: u.activo ?? true,
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

export const ESTADOS_ORDEN: Record<OrdenEstadoApi, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmada",
    PAID: "Pagada",
    SHIPPED: "Enviada",
    DELIVERED: "Entregada",
    CANCELLED: "Cancelada",
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
