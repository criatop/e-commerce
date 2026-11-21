import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "../../api/orders";
import type { OrdenApi, OrdenEstadoApi, OrderStatsApi } from "../../api/types";
import DataTable, { type Columna } from "../../components/common/DataTable";
import { alertas } from "../../utils/alerta";
import { formatearPrecio } from "../../utils/formato";
import { mensajeError } from "../../utils/error";
import { ETIQUETAS, TRANSICIONES } from "./estadosOrden";

export default function AdminOrdenes() {
  const [ordenes, setOrdenes] = useState<OrdenApi[]>([]);
  const [stats, setStats] = useState<OrderStatsApi | null>(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [actualizando, setActualizando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const [lista, resumen] = await Promise.all([ordersApi.listOrders(), ordersApi.stats()]);
      setOrdenes(lista);
      setStats(resumen);
    } catch (e: unknown) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }, []);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError("");
    await cargar();
  }, [cargar]);

  useEffect(() => {
    void (async () => {
      await cargar();
    })();
  }, [cargar]);

  async function cambiarEstado(orden: OrdenApi, estado: OrdenEstadoApi) {
    setActualizando(orden.id);
    try {
      await ordersApi.updateStatus(orden.id, estado);
      void alertas.exito("Estado actualizado", `La orden ${orden.folio} quedó ${ETIQUETAS[estado]}.`);
      await recargar();
    } catch (e: unknown) {
      void alertas.error("No se pudo actualizar", mensajeError(e));
    } finally {
      setActualizando(null);
    }
  }

  const filtradas = ordenes.filter((o) => {
    const fecha = o.createdAt ? new Date(o.createdAt) : null;
    if (desde && (!fecha || fecha < new Date(`${desde}T00:00:00`))) return false;
    if (hasta && (!fecha || fecha > new Date(`${hasta}T23:59:59`))) return false;
    return true;
  });

  const columnas: Columna<OrdenApi>[] = [
    { clave: "folio", titulo: "Folio", render: (o) => <b>#{o.folio}</b>, orden: (o) => o.folio },
    {
      clave: "fecha",
      titulo: "Fecha",
      render: (o) => (o.createdAt ? new Date(o.createdAt).toLocaleString("es-CL") : "-"),
      orden: (o) => o.createdAt ?? "",
    },
    { clave: "cliente", titulo: "Cliente", render: (o) => o.recipientName || o.recipientEmail },
    { clave: "items", titulo: "Ítems", render: (o) => o.items.length, orden: (o) => o.items.length },
    { clave: "total", titulo: "Total", render: (o) => formatearPrecio(o.totalAmount), orden: (o) => o.totalAmount },
    {
      clave: "estado",
      titulo: "Estado",
      render: (o) => (
        <select
          className="form-select form-select-sm"
          value={o.status}
          disabled={actualizando === o.id || TRANSICIONES[o.status].length === 0}
          onChange={(e) => void cambiarEstado(o, e.target.value as OrdenEstadoApi)}
        >
          <option value={o.status}>{ETIQUETAS[o.status] ?? o.status} (actual)</option>
          {TRANSICIONES[o.status].map((estado) => (
            <option key={estado} value={estado}>
              {ETIQUETAS[estado]}
            </option>
          ))}
        </select>
      ),
    },
    {
      clave: "detalle",
      titulo: "Detalle",
      render: (o) => (
        <details>
          <summary className="btn btn-sm btn-outline-secondary">Ver</summary>
          <div className="mt-2 small">
            {o.items.map((item) => (
              <div key={item.id}>
                {item.quantity}x {item.productName} ({formatearPrecio(item.unitPrice)})
              </div>
            ))}
            <div className="mt-1">
              <b>Entrega:</b> {o.shippingAddress}, {o.shippingCity}/{o.shippingPostal}
            </div>
          </div>
        </details>
      ),
    },
  ];

  return (
    <main className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fw-bold h2 titulo-admin">Órdenes / Boletas y Reportes</h1>
          <p className="text-muted mb-0">Visualiza ventas, cambia estado y revisa el detalle.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}>
            <i className="bi bi-file-earmark-pdf me-1" /> Descargar / Imprimir PDF
          </button>
          <Link to="/admin" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1" /> Volver al Panel
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">No se pudieron cargar las órdenes: {error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 caja-resumen p-3 text-center">
            <h6 className="text-muted">Ventas totales</h6>
            <p className="h3 mb-0 text-success">{formatearPrecio(stats?.totalSales ?? 0)}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 caja-resumen p-3 text-center">
            <h6 className="text-muted">Órdenes</h6>
            <p className="h3 mb-0">{stats?.totalOrders ?? 0}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 caja-resumen p-3 text-center">
            <h6 className="text-muted">Ticket promedio</h6>
            <p className="h3 mb-0">{formatearPrecio(stats?.averageTicket ?? 0)}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 caja-resumen p-3 text-center">
            <h6 className="text-muted">Órdenes (filtradas)</h6>
            <p className="h3 mb-0">{filtradas.length}</p>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card border-0 caja-resumen p-3">
            <h6 className="fw-bold">Órdenes por estado</h6>
            {stats && Object.keys(stats.ordersByStatus).length > 0 ? (
              <ul className="mb-0 small">
                {Object.entries(stats.ordersByStatus).map(([estado, cantidad]) => (
                  <li key={estado}>
                    {ETIQUETAS[estado as OrdenEstadoApi] ?? estado}: {cantidad}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted small mb-0">Sin información de estados.</p>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 caja-resumen p-3">
            <h6 className="fw-bold">Productos más vendidos</h6>
            {stats && stats.topProducts.length > 0 ? (
              <ul className="mb-0 small">
                {stats.topProducts.map((producto) => (
                  <li key={producto.productId}>
                    {producto.productName}: {producto.quantity} un. ({formatearPrecio(producto.amount)})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted small mb-0">Sin información de ventas.</p>
            )}
          </div>
        </div>
      </div>

      <div className="row g-2 mb-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label small" htmlFor="filtroDesde">
            Desde
          </label>
          <input
            id="filtroDesde"
            type="date"
            className="form-control"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label small" htmlFor="filtroHasta">
            Hasta
          </label>
          <input
            id="filtroHasta"
            type="date"
            className="form-control"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <button className="btn btn-outline-secondary" onClick={() => { setDesde(""); setHasta(""); }}>
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="card border-0 caja-admin-tabla">
        <div className="card-body p-0">
          <DataTable
            filas={filtradas}
            columnas={columnas}
            claveFila={(o) => o.id}
            coincide={(o, t) =>
              o.folio.toLowerCase().includes(t) ||
              o.recipientEmail.toLowerCase().includes(t) ||
              o.recipientName.toLowerCase().includes(t)
            }
            placeholderBusqueda="Buscar por folio/correo/cliente..."
            porPagina={10}
            textoVacio={cargando ? "Cargando órdenes..." : "Aún no hay órdenes."}
          />
        </div>
      </div>
    </main>
  );
}
