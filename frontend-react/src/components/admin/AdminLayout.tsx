import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <>
      <nav className="d-flex gap-2 mb-4">
        <NavLink to="/admin" end className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-speedometer2 me-1" /> Resumen
        </NavLink>
        <NavLink to="/admin/productos" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-box-seam me-1" /> Productos
        </NavLink>
        <NavLink to="/admin/usuarios" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-people me-1" /> Usuarios
        </NavLink>
      </nav>

      <Outlet />
    </>
  );
}
