import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ordersApi } from "../api/orders";
import { mapOrden } from "../api/mappers";
import { formatearPrecio } from "../utils/formato";
import type { Orden } from "../types";

export default function MisCompras() {
  const { sesion } = useAuth();
  const uid = sesion?.id == null ? null : String(sesion.id);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seleccionado, setSeleccionado] = useState<Orden | null>(null);

  useEffect(() => {
    if (!uid) return;
    let activo = true;
    void Promise.resolve().then(() => { if (activo) setCargando(true); });
    void ordersApi.myOrders(uid)
      .then((datos) => {
        if (!activo) return;
        setOrdenes(datos.map(mapOrden));
        setError(null);
        setCargando(false);
      })
      .catch(() => {
        if (!activo) return;
        setOrdenes([]);
        setError("No se pudo cargar tu historial de compras.");
        setCargando(false);
      });
    return () => { activo = false; };
  }, [uid]);

  if (!sesion) {
    return (
      <section className="container-section">
        <div className="container text-center">
          <h1 className="section-title">Mis compras</h1>
          <p className="text-muted">Inicia sesión para ver tu historial de boletas.</p>
          <Link to="/login" className="btn btn-accent">Iniciar sesión</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container-section">
      <div className="container">
        <div className="text-center mb-4">
          <h1 className="section-title">Mis compras / Boletas</h1>
          <p className="text-muted">Historial de compras asociado a tu cuenta</p>
        </div>

        {cargando && <p className="text-center text-muted">Cargando compras...</p>}
        {error && <p className="text-center text-danger small">{error}</p>}

        {!cargando && ordenes.length === 0 ? (
          <div className="text-center p-5 bg-pink-panel rounded-4">
            <h5 className="fw-bold">Aún no tienes compras</h5>
            <Link to="/productos" className="btn btn-accent mt-2">Ir a comprar</Link>
          </div>
        ) : (
          <div className="row g-3">
            <div className="col-lg-6">
              {ordenes.map((o) => (
                <button key={o.folio} className="card-nexo-hover p-3 w-100 text-start mb-2 border-0" onClick={() => setSeleccionado(o)}>
                  <div className="d-flex justify-content-between">
                    <div>
                      <b>Boleta #{o.folio}</b>
                      <div className="text-muted small">{new Date(o.fecha).toLocaleString()}</div>
                    </div>
                    <div className="text-end">
                      <div>{formatearPrecio(o.total)}</div>
                      <span className="badge bg-secondary">{o.estado}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="col-lg-6">
              {seleccionado ? (
                <div className="card-nexo-hover p-4">
                  <h5 className="fw-bold">Boleta #{seleccionado.folio}</h5>
                  <div className="small text-muted mb-2">{new Date(seleccionado.fecha).toLocaleString()}</div>
                  <table className="table table-sm">
                    <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
                    <tbody>
                      {seleccionado.items.map((it,i)=>(<tr key={i}><td>{it.nombre}</td><td>{it.cantidad}</td><td>{formatearPrecio(it.precio)}</td><td>{formatearPrecio(it.subtotal)}</td></tr>))}
                    </tbody>
                  </table>
                  <div className="d-flex justify-content-between"><span>Subtotal</span><span>{formatearPrecio(seleccionado.subtotal)}</span></div>
                  <div className="d-flex justify-content-between"><span>Envío ({seleccionado.envio.metodo})</span><span>{formatearPrecio(seleccionado.envio.costo)}</span></div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold"><span>Total</span><span>{formatearPrecio(seleccionado.total)}</span></div>
                  <div className="mt-2 small"><b>Pago:</b> {seleccionado.pago.metodo}</div>
                  <div className="small"><b>Entrega:</b> {seleccionado.entrega.direccion}, {seleccionado.entrega.comuna} {seleccionado.entrega.region}</div>
                </div>
              ) : (
                <div className="text-muted text-center p-4">Selecciona una boleta para ver el detalle</div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
