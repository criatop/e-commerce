import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { CHIC_KEYS } from "../storage/claves";
import { alertas } from "../utils/alerta";
import { formatearPrecio } from "../utils/formato";
import type { ItemCarrito, ItemOrden, Orden, Producto } from "../types";

export const METODOS_ENVIO = [
  { valor: "retiro", titulo: "Retiro en tienda", detalle: "Sin costo · Retiras en nuestra tienda", costo: 0 },
  { valor: "estandar", titulo: "Despacho a domicilio estándar", detalle: "3 a 5 días hábiles", costo: 2990 },
  { valor: "express", titulo: "Despacho express", detalle: "1 a 2 días hábiles", costo: 4990 },
];

export const METODOS_PAGO = [
  { valor: "webpay", titulo: "Tarjeta de crédito / débito", detalle: "Pago seguro a través de Webpay" },
  { valor: "transferencia", titulo: "Transferencia bancaria", detalle: "Te enviamos los datos por correo" },
  { valor: "contraentrega", titulo: "Pago contra entrega", detalle: "Paga al recibir tu pedido" },
  { valor: "paypal", titulo: "PayPal", detalle: "Pago internacional con PayPal" },
];

export interface DatosEntrega {
  nombre: string;
  direccion: string;
  region: string;
  comuna: string;
  telefono: string;
}

interface CartContextValue {
  carrito: ItemCarrito[];
  totalItems: number;
  total: number;
  agregar: (codigo: string, cantidad?: number) => void;
  cambiarCantidad: (codigo: string, delta: number) => void;
  eliminar: (codigo: string) => void;
  vaciar: () => void;
  costoEnvio: (metodo: string) => number;
  confirmarPedido: (entrega: DatosEntrega, metodoEnvio: string, metodoPago: string) => string | null;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function leerProductos(): Producto[] {
  return JSON.parse(localStorage.getItem(CHIC_KEYS.productos) ?? "[]") as Producto[];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [carrito, setCarrito] = useState<ItemCarrito[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(CHIC_KEYS.carrito) ?? "[]") as ItemCarrito[];
    } catch {
      return [];
    }
  });

  function persistir(nuevo: ItemCarrito[]) {
    localStorage.setItem(CHIC_KEYS.carrito, JSON.stringify(nuevo));
    setCarrito(nuevo);
  }

  const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0);

  const total = carrito.reduce((acc, item) => {
    const producto = leerProductos().find((p) => p.codigo === item.codigo);
    return producto ? acc + producto.precio * item.cantidad : acc;
  }, 0);

  function agregar(codigo: string, cantidad = 1) {
    const producto = leerProductos().find((p) => p.codigo === codigo);
    if (!producto) return;

    const existente = carrito.find((i) => i.codigo === codigo);
    if (existente) {
      if (existente.cantidad + cantidad > producto.stock) {
        void alertas.aviso("Sin stock", "No hay más unidades disponibles de este accesorio.");
        return;
      }
      persistir(
        carrito.map((i) =>
          i.codigo === codigo ? { ...i, cantidad: i.cantidad + cantidad } : i,
        ),
      );
    } else {
      persistir([...carrito, { codigo, cantidad }]);
    }

    void alertas.exito("¡Agregado!", `${producto.nombre} se añadió a tu carrito.`);
  }

  function cambiarCantidad(codigo: string, delta: number) {
    const producto = leerProductos().find((p) => p.codigo === codigo);
    const item = carrito.find((i) => i.codigo === codigo);
    if (!item) return;

    const nuevaCantidad = item.cantidad + delta;
    if (nuevaCantidad < 1) {
      eliminar(codigo);
      return;
    }
    const tope = producto ? Math.min(nuevaCantidad, producto.stock) : nuevaCantidad;
    persistir(carrito.map((i) => (i.codigo === codigo ? { ...i, cantidad: tope } : i)));
  }

  function eliminar(codigo: string) {
    persistir(carrito.filter((i) => i.codigo !== codigo));
  }

  async function vaciar() {
    const ok = await alertas.confirmar("¿Vaciar carrito?", "Se eliminarán todos los accesorios de tu carrito.", "Sí, vaciar");
    if (ok) persistir([]);
  }

  function costoEnvio(metodo: string): number {
    return METODOS_ENVIO.find((m) => m.valor === metodo)?.costo ?? 0;
  }

  function confirmarPedido(entrega: DatosEntrega, metodoEnvio: string, metodoPago: string): string | null {
    if (carrito.length === 0) return null;

    const esRetiro = metodoEnvio === "retiro";

    if (!entrega.nombre.trim()) { void alertas.aviso("Falta tu nombre", "Ingresa tu nombre completo para continuar."); return null; }
    if (!metodoEnvio) { void alertas.aviso("Elige envío", "Selecciona un método de envío."); return null; }
    if (!esRetiro && !entrega.direccion.trim()) { void alertas.aviso("Falta la dirección", "Ingresa la dirección de despacho."); return null; }
    if (!esRetiro && !entrega.region) { void alertas.aviso("Falta la región", "Selecciona tu región."); return null; }
    if (!esRetiro && !entrega.comuna) { void alertas.aviso("Falta la comuna", "Selecciona tu comuna."); return null; }
    if (!metodoPago) { void alertas.aviso("Elige pago", "Selecciona un método de pago."); return null; }

    const productos = leerProductos();
    const items: ItemOrden[] = [];
    for (const item of carrito) {
      const producto = productos.find((p) => p.codigo === item.codigo);
      if (!producto) continue;
      items.push({
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: item.cantidad,
        subtotal: producto.precio * item.cantidad,
      });
    }

    const envioCosto = costoEnvio(metodoEnvio);
    const ordenes = JSON.parse(localStorage.getItem(CHIC_KEYS.ordenes) ?? "[]") as Orden[];
    const folio = "PP-" + String(ordenes.length + 1).padStart(4, "0");

    const pedido: Orden = {
      folio,
      fecha: new Date().toISOString(),
      items,
      subtotal: total,
      envio: { metodo: metodoEnvio, costo: envioCosto },
      pago: { metodo: metodoPago },
      entrega: {
        nombre: entrega.nombre.trim(),
        direccion: esRetiro ? "Retiro en tienda" : entrega.direccion.trim(),
        region: esRetiro ? "Región Metropolitana" : entrega.region,
        comuna: esRetiro ? "Santiago" : entrega.comuna,
        telefono: entrega.telefono.trim(),
      },
      total: total + envioCosto,
      estado: "Pendiente",
    };

    ordenes.push(pedido);
    localStorage.setItem(CHIC_KEYS.ordenes, JSON.stringify(ordenes));
    persistir([]);

    void alertas.exitoHtml(
      "¡Gracias por tu compra!",
      `Tu pedido <strong>${folio}</strong> ha sido registrado por ${formatearPrecio(pedido.total)} (envío: ${
        envioCosto === 0 ? "Gratis" : formatearPrecio(envioCosto)
      }).<br>Te contactaremos pronto para coordinar la entrega.`,
    );

    return folio;
  }

  const valor: CartContextValue = {
    carrito, totalItems, total, agregar, cambiarCantidad, eliminar, vaciar, costoEnvio, confirmarPedido,
  };

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}