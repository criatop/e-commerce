import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../../api/client";
import { catalogApi } from "../../api/catalog";
import { mapProducto, mapUsuarioAdmin } from "../../api/mappers";
import { ordersApi } from "../../api/orders";
import type { OrderStatsApi, UsuarioApi } from "../../api/types";
import { useAuth } from "../../context/AuthContext";
import { formatearPrecio } from "../../utils/formato";
import { mensajeError } from "../../utils/error";
import type { OrdenEstadoApi } from "../../api/types";

const ETIQUETAS: Record<OrdenEstadoApi, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  PAID: "Pagada",
  SHIPPED: "Enviada",
  DELIVERED: "Entregada",
  CANCELLED: "Cancelada",
};

export default function AdminDashboard() {
  const { sesion } = useAuth();
  const [stats, setStats] = useState<OrderStatsApi | null>(null);
  const [totalProductos, setTotalProductos] = useState(0);
  const [productosCriticos, setProductosCriticos] = useState(0);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    void Promise.all([
      ordersApi.stats(),
      catalogApi.listProducts(),
      catalogApi.listProducts({ lowStock: true }),
      apiGet<UsuarioApi[]>("/api/v1/users"),
    ])
      .then(([resumen, productos, criticos, usuarios]) => {
        if (!activo) return;
        setStats(resumen);
        setTotalProductos(productos.map(mapProducto).length);
        setProductosCriticos(criticos.map(mapProducto).length);
        setTotalUsuarios(usuarios.map(mapUsuarioAdmin).length);
      })
      .catch((e: unknown) => {
        if (activo) setError(mensajeError(e));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  return (
    <main className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fw-bold h2 titulo-admin">Panel de Administración</h1>
          <p className="text-muted mb-0">Bienvenido de vuelta, {sesion?.nombre ?? "Administrador"}.</p>
        </div>
        <Link to="/" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-box-arrow-right me-1" /> Volver a la Tienda
        </Link>
      </div>

      {error && <div className="alert alert-danger">No se pudo cargar el resumen: {error}</div>}

      <div className="row g-4 mb-5">
        <div className="col-12 col-md-4">
          <div className="card h-100 border-0 card-admin p-3">
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-box-seam display-5 icon-admin me-3" />
                  <h3 className="h4 card-title fw-bold mb-0">Gestión de Productos</h3>
                </div>
                <p className="card-text text-muted">
                  Administra el catálogo: crea, edita, elimina productos y supervisa el stock crítico.
                </p>
              </div>
              <div className="mt-3">
                <Link to="/admin/productos" className="btn btn-admin w-100">Ver Productos</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100 border-0 card-admin p-3">
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-tags display-5 icon-admin me-3" />
                  <h3 className="h4 card-title fw-bold mb-0">Categorías</h3>
                </div>
                <p className="card-text text-muted">
                  Agrega, edita o elimina categorías (Aros, Collares, Tobilleras, etc.).
                </p>
              </div>
              <div className="mt-3">
                <Link to="/admin/categorias" className="btn btn-admin w-100">Ver Categorías</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100 border-0 card-admin p-3">
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-people display-5 icon-admin me-3" />
                  <h3 className="h4 card-title fw-bold mb-0">Gestión de Usuarios</h3>
                </div>
                <p className="card-text text-muted">
                  Administra las cuentas de clientes, vendedores y administradores.
                </p>
              </div>
              <div className="mt-3">
                <Link to="/admin/usuarios" className="btn btn-admin w-100">Ver Usuarios</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card h-100 border-0 card-admin p-3">
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-receipt display-5 icon-admin me-3" />
                  <h3 className="h4 card-title fw-bold mb-0">Órdenes / Boletas / Reportes</h3>
                </div>
                <p className="card-text text-muted">
                  Visualiza todo lo vendido, el estado de los pedidos y los indicadores de ventas.
                </p>
              </div>
              <div className="mt-3">
                <Link to="/admin/ordenes" className="btn btn-admin w-100">
                  Ver Órdenes y Reportes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h4 className="fw-bold mb-3 subtitulo-admin">Resumen del Sistema</h4>
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 caja-resumen text-center p-3">
            <h6 className="text-muted mb-1">Ventas totales</h6>
            <p className="h3 fw-bold mb-0 text-success">
              {cargando ? "..." : formatearPrecio(stats?.totalSales ?? 0)}
            </p>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 caja-resumen text-center p-3">
            <h6 className="text-muted mb-1">Pedidos realizados</h6>
            <p className="h3 fw-bold mb-0 text-pink">{cargando ? "..." : stats?.totalOrders ?? 0}</p>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 caja-resumen text-center p-3">
            <h6 className="text-muted mb-1">Ticket promedio</h6>
            <p className="h3 fw-bold mb-0 text-pink">
              {cargando ? "..." : formatearPrecio(stats?.averageTicket ?? 0)}
            </p>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 caja-resumen text-center p-3">
            <h6 className="text-muted mb-1">Stock crítico</h6>
            <p className={"h3 fw-bold mb-0 " + (productosCriticos > 0 ? "text-danger" : "text-success")}>
              {cargando ? "..." : productosCriticos}
            </p>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 caja-resumen text-center p-3">
            <h6 className="text-muted mb-1">Total productos</h6>
            <p className="h3 fw-bold mb-0 text-pink">{cargando ? "..." : totalProductos}</p>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 caja-resumen text-center p-3">
            <h6 className="text-muted mb-1">Usuarios registrados</h6>
            <p className="h3 fw-bold mb-0 text-pink">{cargando ? "..." : totalUsuarios}</p>
          </div>
        </div>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-md-6">
          <div className="card border-0 caja-resumen p-3">
            <h6 className="fw-bold">Órdenes por estado</h6>
            {stats && Object.keys(stats.ordersByStatus).length > 0 ? (
              <ul className="mb-0 small">
                {Object.entries(stats.ordersByStatus).map(([estado, cantidad]) => (
                  <li key={estado}>{ETIQUETAS[estado as OrdenEstadoApi] ?? estado}: {cantidad}</li>
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
    </main>
  );
}
