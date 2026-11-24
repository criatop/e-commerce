import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cartApi, type CartItemRequest } from "../api/cart";
import { ordersApi } from "../api/orders";
import type { CartItemApi } from "../api/types";
import { CHIC_KEYS } from "../storage/claves";
import { alertas } from "../utils/alerta";
import { formatearPrecio } from "../utils/formato";
import type { ItemCarrito, Producto } from "../types";
import { useAuth } from "./AuthContext";

export const METODOS_ENVIO = [
    { valor: "retiro", titulo: "Retiro en tienda", detalle: "Sin costo · Retiras en nuestra tienda", costo: 0 },
    { valor: "estandar", titulo: "Despacho a domicilio estándar", detalle: "3 a 5 días hábiles", costo: 2990 },
    { valor: "express", titulo: "Despacho express", detalle: "1 a 2 días hábiles", costo: 4990 },
];

// Los valores deben coincidir con el enum PaymentMethod de ms-payment.
export const METODOS_PAGO = [
    { valor: "CREDIT_CARD", titulo: "Tarjeta de crédito / débito", detalle: "Pago seguro a través de Webpay" },
    { valor: "TRANSFER", titulo: "Transferencia bancaria", detalle: "Te enviamos los datos por correo" },
    { valor: "PAYPAL", titulo: "PayPal", detalle: "Pago internacional con PayPal" },
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
    cargando: boolean;
    error: string | null;
    agregar: (producto: Producto, cantidad?: number) => Promise<void>;
    cambiarCantidad: (productId: string, delta: number) => Promise<void>;
    eliminar: (productId: string) => Promise<void>;
    vaciar: () => Promise<void>;
    costoEnvio: (metodo: string) => number;
    confirmarPedido: (entrega: DatosEntrega, metodoEnvio: string, metodoPago: string) => Promise<string | null>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function texto(valor: unknown): string | undefined {
    return typeof valor === "string" && valor !== "" ? valor : undefined;
}

function numero(valor: unknown): number | undefined {
    return typeof valor === "number" && Number.isFinite(valor) ? valor : undefined;
}

function leerCarritoLocal(): ItemCarrito[] {
    try {
        const contenido = localStorage.getItem(CHIC_KEYS.carritoPendiente);
        if (!contenido) return [];
        const parseado: unknown = JSON.parse(contenido);
        if (!Array.isArray(parseado)) return [];
        return parseado.flatMap((entrada): ItemCarrito[] => {
            if (typeof entrada !== "object" || entrada === null) return [];
            const fila = entrada as Record<string, unknown>;
            const productId = texto(fila.productId) ?? texto(fila.codigo);
            const cantidad = numero(fila.cantidad);
            if (!productId || !cantidad || cantidad < 1) return [];
            return [{
                productId,
                codigo: texto(fila.codigo) ?? productId,
                cantidad,
                nombre: texto(fila.nombre),
                precio: numero(fila.precio),
                stock: numero(fila.stock),
                imagen: texto(fila.imagen),
            }];
        });
    } catch {
        return [];
    }
}

function persistirCarritoLocal(items: ItemCarrito[]) {
    localStorage.setItem(CHIC_KEYS.carritoPendiente, JSON.stringify(items));
}

function deItemApi(item: CartItemApi): ItemCarrito {
    return {
        productId: item.productId,
        codigo: item.productId,
        cantidad: item.quantity,
        nombre: item.productName,
        precio: item.price,
    };
}

function mensajeError(error: unknown): string {
    return error instanceof Error ? error.message : "No se pudo completar la operación.";
}

function idDe(item: ItemCarrito): string {
    return item.productId ?? item.codigo;
}

export function CartProvider({ children }: { children: ReactNode }) {
    const { sesion } = useAuth();
    const uid = sesion?.id == null ? null : String(sesion.id);
    const [carrito, setCarrito] = useState<ItemCarrito[]>(leerCarritoLocal);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // El merge debe ejecutarse una sola vez por uid, pero el efecto puede correrse
    // dos veces en StrictMode: guardamos la promesa para no descartar la segunda carga.
    const mergeRef = useRef<{ uid: string; promesa: Promise<void> } | null>(null);

    useEffect(() => {
        if (!uid) {
            mergeRef.current = null;
            void Promise.resolve().then(() => {
                setError(null);
                setCarrito(leerCarritoLocal());
            });
            return;
        }

        if (!mergeRef.current || mergeRef.current.uid !== uid) {
            const pendientes = leerCarritoLocal();
            const promesa = pendientes.length > 0
                ? cartApi.merge(uid, pendientes.map((item): CartItemRequest => ({
                    productId: idDe(item),
                    quantity: item.cantidad,
                }))).then(() => undefined)
                : Promise.resolve();
            mergeRef.current = { uid, promesa };
        }
        const mergePromesa = mergeRef.current.promesa;

        let cancelado = false;
        void (async () => {
            setCargando(true);
            setError(null);
            try {
                await mergePromesa;
                const carritoApi = await cartApi.getCart(uid);
                if (!cancelado) {
                    setCarrito(carritoApi.items.map(deItemApi));
                    localStorage.removeItem(CHIC_KEYS.carritoPendiente);
                }
            } catch (e) {
                if (!cancelado) {
                    setError(mensajeError(e));
                    setCarrito(leerCarritoLocal());
                }
            } finally {
                if (!cancelado) setCargando(false);
            }
        })();

        return () => {
            cancelado = true;
        };
    }, [uid]);

    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const total = carrito.reduce((acc, item) => acc + (item.precio ?? 0) * item.cantidad, 0);

    async function agregar(producto: Producto, cantidad = 1) {
        const productId = producto.id ?? producto.codigo;
        if (!productId || cantidad < 1) return;

        const existente = carrito.find((item) => idDe(item) === productId);
        const nuevaCantidad = (existente?.cantidad ?? 0) + cantidad;
        if (producto.stock > 0 && nuevaCantidad > producto.stock) {
            void alertas.aviso("Sin stock", "No hay más unidades disponibles de este accesorio.");
            return;
        }

        try {
            if (uid) {
                const carritoApi = await cartApi.addItem(uid, productId, cantidad);
                setCarrito(carritoApi.items.map(deItemApi));
            } else {
                const nuevo: ItemCarrito[] = existente
                    ? carrito.map((item) => idDe(item) === productId ? { ...item, cantidad: nuevaCantidad } : item)
                    : [...carrito, {
                        productId,
                        codigo: producto.codigo,
                        cantidad,
                        nombre: producto.nombre,
                        precio: producto.precio,
                        stock: producto.stock,
                        imagen: producto.imagen,
                    }];
                persistirCarritoLocal(nuevo);
                setCarrito(nuevo);
            }
            void alertas.exito("¡Agregado!", `${producto.nombre} se añadió a tu carrito.`);
        } catch (e) {
            setError(mensajeError(e));
            void alertas.error("No se pudo agregar", mensajeError(e));
        }
    }

    async function cambiarCantidad(productId: string, delta: number) {
        const item = carrito.find((entrada) => idDe(entrada) === productId);
        if (!item) return;
        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad < 1) {
            await eliminar(productId);
            return;
        }
        try {
            if (uid) {
                const carritoApi = await cartApi.updateItem(uid, productId, nuevaCantidad);
                setCarrito(carritoApi.items.map(deItemApi));
            } else {
                const nuevo = carrito.map((entrada) =>
                    idDe(entrada) === productId ? { ...entrada, cantidad: nuevaCantidad } : entrada,
                );
                persistirCarritoLocal(nuevo);
                setCarrito(nuevo);
            }
        } catch (e) {
            setError(mensajeError(e));
            void alertas.error("No se pudo actualizar", mensajeError(e));
        }
    }

    async function eliminar(productId: string) {
        try {
            if (uid) {
                await cartApi.removeItem(uid, productId);
                const carritoApi = await cartApi.getCart(uid);
                setCarrito(carritoApi.items.map(deItemApi));
            } else {
                const nuevo = carrito.filter((item) => idDe(item) !== productId);
                persistirCarritoLocal(nuevo);
                setCarrito(nuevo);
            }
        } catch (e) {
            setError(mensajeError(e));
            void alertas.error("No se pudo eliminar", mensajeError(e));
        }
    }

    async function vaciar() {
        const ok = await alertas.confirmar("¿Vaciar carrito?", "Se eliminarán todos los accesorios de tu carrito.", "Sí, vaciar");
        if (!ok) return;
        try {
            if (uid) await cartApi.clear(uid);
            localStorage.removeItem(CHIC_KEYS.carritoPendiente);
            setCarrito([]);
        } catch (e) {
            setError(mensajeError(e));
            void alertas.error("No se pudo vaciar", mensajeError(e));
        }
    }

    function costoEnvio(metodo: string): number {
        return METODOS_ENVIO.find((m) => m.valor === metodo)?.costo ?? 0;
    }

    async function confirmarPedido(
        entrega: DatosEntrega,
        metodoEnvio: string,
        metodoPago: string,
    ): Promise<string | null> {
        if (!uid) {
            void alertas.aviso("Inicia sesión", "Necesitas iniciar sesión para finalizar la compra.");
            return null;
        }
        if (carrito.length === 0) return null;

        const esRetiro = metodoEnvio === "retiro";
        if (!entrega.nombre.trim()) { void alertas.aviso("Falta tu nombre", "Ingresa tu nombre completo para continuar."); return null; }
        if (!metodoEnvio) { void alertas.aviso("Elige envío", "Selecciona un método de envío."); return null; }
        if (!esRetiro && !entrega.direccion.trim()) { void alertas.aviso("Falta la dirección", "Ingresa la dirección de despacho."); return null; }
        if (!esRetiro && !entrega.region) { void alertas.aviso("Falta la región", "Selecciona tu región."); return null; }
        if (!esRetiro && !entrega.comuna) { void alertas.aviso("Falta la comuna", "Selecciona tu comuna."); return null; }
        if (!metodoPago) { void alertas.aviso("Elige pago", "Selecciona un método de pago."); return null; }

        try {
            const orden = await ordersApi.checkout({
                shippingAddress: esRetiro ? "Retiro en tienda" : entrega.direccion.trim(),
                shippingRegion: esRetiro ? "Región Metropolitana" : entrega.region,
                shippingComuna: esRetiro ? "Santiago" : entrega.comuna,
                shippingPhone: entrega.telefono.trim(),
                paymentMethod: metodoPago,
                items: carrito.map((item) => ({
                    productId: idDe(item),
                    quantity: item.cantidad,
                })),
            });
            // La orden ya está creada: si falla vaciar el carrito no invalidamos la compra.
            try {
                await cartApi.clear(uid);
            } catch {
                setError("La orden se creó, pero no se pudo vaciar el carrito. Inténtalo de nuevo desde el carrito.");
            }
            localStorage.removeItem(CHIC_KEYS.carritoPendiente);
            setCarrito([]);
            void alertas.exitoHtml(
                "¡Gracias por tu compra!",
                `Tu pedido <strong>${orden.folio}</strong> ha sido registrado por ${formatearPrecio(orden.totalAmount)}.<br>Te contactaremos pronto para coordinar la entrega.`,
            );
            return orden.folio;
        } catch (e) {
            setError(mensajeError(e));
            void alertas.error("No se pudo confirmar", mensajeError(e));
            return null;
        }
    }

    const valor: CartContextValue = {
        carrito, totalItems, total, cargando, error,
        agregar, cambiarCantidad, eliminar, vaciar, costoEnvio, confirmarPedido,
    };

    return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
    return ctx;
}
