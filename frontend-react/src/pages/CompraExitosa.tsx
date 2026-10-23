import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CHIC_KEYS } from "../storage/claves";
import { formatearPrecio } from "../utils/formato";
import type { Orden } from "../types";

export default function CompraExitosa() {
  const [params] = useSearchParams();
  const folio = params.get("folio") || "";

  const orden = useMemo(() => {
    try {
      const ordenes = JSON.parse(localStorage.getItem(CHIC_KEYS.ordenes) ?? "[]") as Orden[];
      return ordenes.find((o) => o.folio === folio) || null;
    } catch {
      return null;
    }
  }, [folio]);

  if (!orden || !orden.items) {
    return (
      <section className="container-section">
        <div className="container text-center">
          <h1 className="section-title">Compra realizada</h1>
          <p className="text-muted">No se encontró la boleta {folio ? `#${folio}` : ""}.</p>
          <div className="d-flex gap-2 justify-content-center">
            <Link to="/productos" className="btn btn-accent">Ir a productos</Link>
            <Link to="/" className="btn btn-outline-secondary">Volver al inicio</Link>
          </div>
        </div>
      </section>
    );
  }

  const folioOrden = orden.folio || folio || "";
  const itemsOrden = Array.isArray(orden.items) ? orden.items : [];
  const entrega = orden.entrega || ({} as any);
  const envio = orden.envio || { metodo: "-", costo: 0 };
  const pago = orden.pago || { metodo: "-" };
  const subtotal = typeof orden.subtotal === "number" ? orden.subtotal : itemsOrden.reduce((a,b:any)=>a+(b.subtotal||0),0);
  const total = typeof orden.total === "number" ? orden.total : subtotal + (envio.costo||0);

  return (
    <section className="container-section">
      <div className="container">
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 p-3 mb-2">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3rem" }}></i>
          </div>
          <h1 className="section-title">¡Pago aceptado!</h1>
          <p className="text-muted mb-0">Gracias por tu compra. Tu pedido fue registrado correctamente.</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="card-nexo-hover p-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 pb-2 border-bottom">
                <div>
                  <h2 className="h4 fw-bold mb-1">BOLETA / COMPROBANTE DE VENTA</h2>
                  <div className="text-muted">Folio: <b>#{folioOrden}</b></div>
                  <div className="text-muted">Fecha: {orden.fecha ? new Date(orden.fecha).toLocaleString() : new Date().toLocaleString()}</div>
                </div>
                <div className="mt-2 mt-md-0">
                  <span className="badge bg-success px-3 py-2">PAGO ACEPTADO</span>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <h6 className="fw-bold">Datos del cliente</h6>
                  <div className="small">{entrega.nombre || orden.usuario?.nombre || "-"}</div>
                  {orden.usuario?.correo && <div className="small text-muted">{orden.usuario.correo}</div>}
                  {entrega.telefono && <div className="small text-muted">Tel: {entrega.telefono}</div>}
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold">Datos de entrega</h6>
                  <div className="small">{entrega.direccion || "-"}</div>
                  <div className="small text-muted">{entrega.comuna || ""}{entrega.comuna && entrega.region ? ", " : ""}{entrega.region || ""}</div>
                  <div className="small mt-1"><b>Envío:</b> {envio.metodo || "-"}</div>
                  <div className="small"><b>Pago:</b> {pago.metodo || "-"}</div>
                </div>
              </div>

              <div className="table-responsive mb-3">
                <table className="table table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Producto</th>
                      <th className="text-center">Cant.</th>
                      <th className="text-end">Precio</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsOrden.map((item:any, i:number) => (
                      <tr key={i}>
                        <td>
                          <div className="fw-semibold">{item.nombre}</div>
                          <div className="text-muted small">Cod: {item.codigo}</div>
                        </td>
                        <td className="text-center">{item.cantidad}</td>
                        <td className="text-end">{formatearPrecio(item.precio || 0)}</td>
                        <td className="text-end">{formatearPrecio(item.subtotal || (item.precio||0)*(item.cantidad||0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="ms-auto" style={{ maxWidth: "320px" }}>
                <div className="d-flex justify-content-between"><span>Subtotal</span><span>{formatearPrecio(subtotal)}</span></div>
                <div className="d-flex justify-content-between"><span>Envío</span><span>{envio.costo === 0 ? "Gratis" : formatearPrecio(envio.costo || 0)}</span></div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5"><span>TOTAL PAGADO</span><span>{formatearPrecio(total)}</span></div>
              </div>

              <div className="alert alert-success text-center mt-4 mb-0">
                <i className="bi bi-shield-check me-2"></i>
                <b>PAGO ACEPTADO</b> · Transacción registrada · Gracias por comprar en Pink &amp; Pink
              </div>
            </div>

            <div className="d-flex flex-column flex-md-row gap-2 justify-content-center mt-3">
              <button className="btn btn-outline-secondary" onClick={() => window.print()}><i className="bi bi-printer me-1"></i> Imprimir boleta</button>
              <Link to="/productos" className="btn btn-accent"><i className="bi bi-bag me-1"></i> Seguir comprando</Link>
              <Link to="/mis-compras" className="btn btn-outline-primary"><i className="bi bi-receipt me-1"></i> Ver mis compras</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
