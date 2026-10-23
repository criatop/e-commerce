import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { CHIC_KEYS } from "../../storage/claves";
import { useColeccion } from "../../storage/useColeccion";
import type { Orden, Producto, Usuario } from "../../types";

export default function AdminDashboard() {
  const { sesion } = useAuth();
  const { datos: productos } = useColeccion<Producto>(CHIC_KEYS.productos);
  const { datos: usuarios } = useColeccion<Usuario>(CHIC_KEYS.usuarios);
  const { datos: ordenes } = useColeccion<Orden>(CHIC_KEYS.ordenes);

  const stockCritico = productos.filter((p) => p.stock <= p.stockCritico).length;

  return (
    <main className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fw-bold h2 titulo-admin">Panel de Administración</h1>
          <p className="text-muted mb-0">
            Bienvenido de vuelta, {sesion?.nombre ?? "Administrador"}.
          </p>
        </div>
        <Link to="/" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-box-arrow-right me-1" /> Volver a la Tienda
        </Link>
      </div>

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
                  Administra el catálogo: crea, edita, elimina productos y supervisa el stock
                  crítico.
                </p>
              </div>
              <div className="mt-3">
                <Link to="/admin/productos" className="btn btn-admin w-100">
                  Ver Productos
                </Link>
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
                <Link to="/admin/categorias" className="btn btn-admin w-100">
                  Ver Categorías
                </Link>
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
                  Administra las cuentas de clientes y administradores con validación de RUN y
                  regiones.
                </p>
              </div>
              <div className="mt-3">
                <Link to="/admin/usuarios" className="btn btn-admin w-100">
                  Ver Usuarios
                </Link>
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
                  Visualiza todo lo vendido, boletas, estado de pedidos e indicadores de ventas.
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
            <h6 className="text-muted mb-1">Total Productos</h6>
            <p className="h3 fw-bold mb-0 text-pink">{productos.length}</p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 caja-resumen text-center p-3">
            <h6 className="text-muted mb-1">Stock Crítico</h6>
            <p className={"h3 fw-bold mb-0 " + (stockCritico > 0 ? "text-danger" : "text-success")}>
              {stockCritico}
            </p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 caja-resumen text-center p-3">
            <h6 className="text-muted mb-1">Usuarios Registrados</h6>
            <p className="h3 fw-bold mb-0 text-pink">{usuarios.length}</p>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 caja-resumen text-center p-3">
            <h6 className="text-muted mb-1">Pedidos Realizados</h6>
            <p className="h3 fw-bold mb-0 text-success">{ordenes.length}</p>
          </div>
        </div>
      </div>
    </main>
  );
}