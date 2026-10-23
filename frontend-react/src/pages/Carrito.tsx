import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    METODOS_ENVIO,
    METODOS_PAGO,
    useCart,
    type DatosEntrega,
} from "../context/CartContext";
import { useTablasMaestras } from "../hooks/useTablasMaestras";
import { CHIC_KEYS } from "../storage/claves";
import { useColeccion } from "../storage/useColeccion";
import { formatearPrecio } from "../utils/formato";
import type { Producto } from "../types";
export default function Carrito() {
    const { carrito, total, cambiarCantidad, eliminar, vaciar, costoEnvio, confirmarPedido } =
        useCart();
    const { sesion } = useAuth();
    const { regiones, comunasDe } = useTablasMaestras();
    const { datos: catalogo } = useColeccion<Producto>(CHIC_KEYS.productos);
    const [abierto, setAbierto] = useState(false);
    const [envio, setEnvio] = useState("retiro");
    const [pago, setPago] = useState("webpay");
    const [entrega, setEntrega] = useState<DatosEntrega>({
        nombre: sesion ? `${sesion.nombre} ${sesion.apellidos}`.trim() : "",
        direccion: "",
        region: "",
        comuna: "",
        telefono: "",
    });
    const esRetiro = envio === "retiro";
    const costo = costoEnvio(envio);
    if (carrito.length === 0) {
        return (
            <section className="container-section">
                <h1 className="section-title">Mi carrito</h1>
                <div className="empty-cart">
                    <p>Tu carrito está vacío.</p>
                    <Link to="/productos" className="btn-cta">

                        Ir a comprar
                    </Link>
                </div>
            </section>
        );
    }
    return (
        <section className="container-section">
            <h1 className="section-title">Mi carrito</h1>
            <div className="table-responsive">
                <table className="table align-middle text-center">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Precio</th>
                            <th>Cantidad</th>
                            <th>Subtotal</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {carrito.map((item) => {
                            const producto = catalogo.find((p) => p.codigo === item.codigo);
                            if (!producto) return null;
                            return (
                                <tr key={item.codigo}>
                                    <td className="text-start">{producto.nombre}</td>
                                    <td>{formatearPrecio(producto.precio)}</td>
                                    <td>
                                        <div className="d-inline-flex align-items-center gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => cambiarCantidad(item.codigo, -1)}
                                            >
                                                &minus;
                                            </button>
                                            <span>{item.cantidad}</span>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => cambiarCantidad(item.codigo, 1)}
                                            >

                                                +
                                            </button>
                                        </div>
                                    </td>
                                    <td>{formatearPrecio(producto.precio * item.cantidad)}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => eliminar(item.codigo)}
                                        >
                                            <i className="bi bi-trash" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="carrito-resumen">
                <p>
                    Total: <strong>{formatearPrecio(total)}</strong>
                </p>
                <div className="d-flex gap-2 justify-content-end">
                    <button type="button" className="btn btn-outline-danger" onClick={() => void vaciar()}>
                        Vaciar carrito
                    </button>
                    <button type="button" className="btn btn-accent" onClick={() => setAbierto(true)}>
                        Finalizar compra
                    </button>
                </div>
            </div>
            {abierto && (
                <div className="mt-4">
                    <h2 className="section-title">Finalizar compra</h2>
                    <div className="checkout-grid">
                        {!esRetiro && (
                            <div className="checkout-col">
                                <h3>Datos de entrega</h3>
                                <div className="mb-2 field">

                                    <label htmlFor="coNombre">Nombre completo</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="coNombre"
                                        placeholder="Tu nombre y apellido"
                                        value={entrega.nombre}
                                        onChange={(e) => setEntrega({ ...entrega, nombre: e.target.value })}
                                    />
                                </div>
                                <div className="mb-2 field">
                                    <label htmlFor="coDireccion">Dirección</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="coDireccion"
                                        placeholder="Calle, número, depto/casa"
                                        value={entrega.direccion}
                                        onChange={(e) => setEntrega({ ...entrega, direccion: e.target.value })}
                                    />
                                </div>
                                <div className="row">
                                    <div className="col-6 mb-2 field">
                                        <label htmlFor="coRegion">Región</label>
                                        <select
                                            className="form-select"
                                            id="coRegion"
                                            value={entrega.region}
                                            onChange={(e) =>
                                                setEntrega({ ...entrega, region: e.target.value, comuna: "" })
                                            }
                                        >
                                            <option value="">Selecciona</option>
                                            {regiones.datos.map((r) => (
                                                <option key={r.id} value={r.nombre}>
                                                    {r.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-6 mb-2 field">
                                        <label htmlFor="coComuna">Comuna</label>

                                        <select
                                            className="form-select"
                                            id="coComuna"
                                            disabled={!entrega.region}
                                            value={entrega.comuna}
                                            onChange={(e) => setEntrega({ ...entrega, comuna: e.target.value })}
                                        >
                                            <option value="">
                                                {entrega.region ? "Selecciona una comuna" : "Primero región"}
                                            </option>
                                            {regiones.datos
                                                .filter((r) => r.nombre === entrega.region)
                                                .flatMap((r) => comunasDe(r.id))
                                                .map((c) => (
                                                    <option key={c.id} value={c.nombre}>
                                                        {c.nombre}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="mb-2 field">
                                    <label htmlFor="coTelefono">Teléfono (opcional)</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        id="coTelefono"
                                        placeholder="+56 9 1234 5678"
                                        value={entrega.telefono}
                                        onChange={(e) => setEntrega({ ...entrega, telefono: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                        <div>
                            <div className="checkout-col mb-3">
                                <h3>Método de envío</h3>
                                <fieldset>
                                    <legend>Elige cómo recibir tu pedido</legend>
                                    {METODOS_ENVIO.map((m) => (
                                        <label
                                            key={m.valor}
                                            className={"opcion-envio" + (envio === m.valor ? " sel" : "")}

                                        >
                                            <input
                                                type="radio"
                                                name="envio"
                                                value={m.valor}
                                                checked={envio === m.valor}
                                                onChange={() => setEnvio(m.valor)}
                                            />
                                            <span className="flex-grow-1">
                                                <span className="op-titulo">{m.titulo}</span>
                                                <small>{m.detalle}</small>
                                            </span>
                                            <span className="op-costo">
                                                {m.costo === 0 ? "Gratis" : formatearPrecio(m.costo)}
                                            </span>
                                        </label>
                                    ))}
                                </fieldset>
                                {esRetiro && (
                                    <p className="nota-retiro mb-0">
                                        Retiro en tienda: Av. Principal 123, Santiago · Lunes a sábado 10:00 a
                                        19:00 hrs.
                                    </p>
                                )}
                            </div>
                            <div className="checkout-col">
                                <h3>Método de pago</h3>
                                <fieldset>
                                    <legend>Elige cómo pagar</legend>
                                    {METODOS_PAGO.map((m) => (
                                        <label
                                            key={m.valor}
                                            className={"opcion-pago" + (pago === m.valor ? " sel" : "")}
                                        >
                                            <input
                                                type="radio"
                                                name="pago"
                                                value={m.valor}
                                                checked={pago === m.valor}
                                                onChange={() => setPago(m.valor)}
                                            />
                                            <span>
                                                <span className="op-titulo">{m.titulo}</span>
                                                <small>{m.detalle}</small>

                                            </span>
                                        </label>
                                    ))}
                                </fieldset>
                            </div>
                        </div>
                    </div>
                    <div className="checkout-col mt-3">
                        <h3>Resumen de tu pedido</h3>
                        <div className="resumen-final">
                            <div>
                                <span>Subtotal</span>
                                <span>{formatearPrecio(total)}</span>
                            </div>
                            <div>
                                <span>Envío</span>
                                <span>{costo === 0 ? "Gratis" : formatearPrecio(costo)}</span>
                            </div>
                            <div className="grand">
                                <span>Total</span>
                                <span>{formatearPrecio(total + costo)}</span>
                            </div>
                        </div>
                        <div className="d-flex gap-2 justify-content-end mt-3">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setAbierto(false)}
                            >
                                Volver al carrito
                            </button>
                            <button
                                type="button"
                                className="btn btn-accent"
                                onClick={() => {
                                    const folio = confirmarPedido(entrega, envio, pago);
                                    if (folio) {
                                        setAbierto(false);
                                        window.location.href = `/compra-exitosa?folio=${encodeURIComponent(folio)}`;
                                    }
                                }}
                            >
                                Confirmar pedido
                            </button>
                        </div>
                    </div>
                </div>

            )}
        </section>
    );
}