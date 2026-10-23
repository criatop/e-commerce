import { useState } from "react";
import { Link } from "react-router-dom";
import DataTable, { type Columna } from "../../components/common/DataTable";
import { useColeccion } from "../../storage/useColeccion";
import { CHIC_KEYS } from "../../storage/claves";
import { formatearPrecio } from "../../utils/formato";
import type { Orden } from "../../types";

export default function AdminOrdenes() {
  const { datos: ordenes, guardar } = useColeccion<Orden>(CHIC_KEYS.ordenes);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  async function cambiarEstado(folio: string, estado: string) {
    guardar(ordenes.map((o) => (o.folio === folio ? { ...o, estado } : o)));
  }

  const filtradas = ordenes.filter((o) => {
    const fecha = new Date(o.fecha);
    if (desde) {
      const d = new Date(`${desde}T00:00:00`);
      if (fecha < d) return false;
    }
    if (hasta) {
      const h = new Date(`${hasta}T23:59:59`);
      if (fecha > h) return false;
    }
    return true;
  });

  const columnas: Columna<Orden>[] = [
    { clave: "folio", titulo: "Folio", render: (o) => <b>#{o.folio}</b> },
    { clave: "fecha", titulo: "Fecha", render: (o) => new Date(o.fecha).toLocaleString() },
    { clave: "cliente", titulo: "Cliente", render: (o) => o.usuario ? `${o.usuario.nombre} ${o.usuario.apellidos||""} (${o.usuario.correo})` : o.entrega.nombre },
    { clave: "items", titulo: "Items", render: (o) => o.items.length },
    { clave: "total", titulo: "Total", render: (o) => formatearPrecio(o.total) },
    { clave: "pago", titulo: "Pago", render: (o) => o.pago.metodo },
    { clave: "envio", titulo: "Envío", render: (o) => o.envio.metodo },
    { clave: "estado", titulo: "Estado", render: (o) => (
      <select className="form-select form-select-sm" value={o.estado} onChange={(e)=>cambiarEstado(o.folio,e.target.value)}>
        <option value="Pendiente">Pendiente</option>
        <option value="En preparación">En preparación</option>
        <option value="Enviado">Enviado</option>
        <option value="Entregado">Entregado</option>
        <option value="Cancelado">Cancelado</option>
      </select>
    )},
    { clave: "detalle", titulo: "Detalle", render: (o) => (
      <details>
        <summary className="btn btn-sm btn-outline-secondary">Ver</summary>
        <div className="mt-2 small">
          {o.items.map((it,i)=>(<div key={i}>{it.cantidad}x {it.nombre} ({formatearPrecio(it.precio)})</div>))}
          <div className="mt-1"><b>Entrega:</b> {o.entrega.direccion}, {o.entrega.comuna}/{o.entrega.region}</div>
        </div>
      </details>
    )}
  ];

  const totalVendido = filtradas.reduce((s,o)=>s+o.total,0);
  const entregados = filtradas.filter(o=>o.estado==="Entregado").length;

  return (
    <main className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fw-bold h2 titulo-admin">Órdenes / Boletas y Reportes</h1>
          <p className="text-muted mb-0">Visualiza ventas, cambia estado y revisa detalle.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}><i className="bi bi-file-earmark-pdf me-1"/> Descargar / Imprimir PDF</button>
          <Link to="/admin" className="btn btn-outline-secondary btn-sm"><i className="bi bi-arrow-left me-1"/> Volver al Panel</Link>
        </div>
      </div>
      <div className="row g-2 mb-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label small">Desde</label>
          <input type="date" className="form-control" value={desde} onChange={(e)=>setDesde(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label className="form-label small">Hasta</label>
          <input type="date" className="form-control" value={hasta} onChange={(e)=>setHasta(e.target.value)} />
        </div>
        <div className="col-md-3">
          <button className="btn btn-outline-secondary" onClick={()=>{setDesde(""); setHasta("");}}>Limpiar filtros</button>
        </div>
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-4"><div className="card border-0 caja-resumen p-3 text-center"><h6 className="text-muted">Órdenes (filtradas)</h6><p className="h3 mb-0">{filtradas.length}</p></div></div>
        <div className="col-md-4"><div className="card border-0 caja-resumen p-3 text-center"><h6 className="text-muted">Entregados</h6><p className="h3 mb-0 text-success">{entregados}</p></div></div>
        <div className="col-md-4"><div className="card border-0 caja-resumen p-3 text-center"><h6 className="text-muted">Total vendido (filtrado)</h6><p className="h3 mb-0">{formatearPrecio(totalVendido)}</p></div></div>
      </div>
      <div className="card border-0 caja-admin-tabla">
        <div className="card-body p-0">
          <DataTable filas={filtradas} columnas={columnas} claveFila={(o)=>o.folio} coincide={(o,t)=>o.folio.toLowerCase().includes(t)|| (o.usuario?.correo||"").toLowerCase().includes(t)|| o.entrega.nombre.toLowerCase().includes(t)} placeholderBusqueda="Buscar por folio/correo/cliente..." porPagina={10} textoVacio="Aún no hay órdenes." />
        </div>
      </div>
    </main>
  );
}
