import { Link } from "react-router-dom";
import DataTable, { type Columna } from "../../components/common/DataTable";
import { useAuth } from "../../context/AuthContext";
import { useColeccion } from "../../storage/useColeccion";
import { CHIC_KEYS } from "../../storage/claves";
import { useTablasMaestras } from "../../hooks/useTablasMaestras";
import { alertas } from "../../utils/alertas";
import { formatearRun } from "../../utils/run";
import type { Usuario } from "../../types";

export default function AdminUsuarios() {
  const { datos: usuarios, guardar } = useColeccion<Usuario>(CHIC_KEYS.usuarios);
  const { sesion } = useAuth();
  const { roles, regiones, comunas } = useTablasMaestras();

  const nombreRol = (id: number) => roles.datos.find((r) => r.id === id)?.nombre ?? "";
  const nombreRegion = (id: number) => regiones.datos.find((r) => r.id === id)?.nombre ?? "";
  const nombreComuna = (id: number) => comunas.datos.find((c) => c.id === id)?.nombre ?? "";

  async function eliminar(run: string) {
    const usuario = usuarios.find((u) => u.run === run);

    if (run === sesion?.run) {
      void alertas.aviso(
        "No puedes eliminarte",
        "Tu propia cuenta no se puede eliminar desde el panel.",
      );
      return;
    }

    const ok = await alertas.confirmar(
      "Eliminar usuario",
      `¿Seguro que quieres eliminar a ${usuario?.nombre} ${usuario?.apellidos}?`,
      "Sí, eliminar",
    );
    if (!ok) return;

    guardar(usuarios.filter((u) => u.run !== run));
    void alertas.exito("Usuario eliminado", "La cuenta fue eliminada del sistema.");
  }

  const columnas: Columna<Usuario>[] = [
    {
      clave: "run",
      titulo: "RUN",
      claseCelda: "ps-3 fw-bold text-muted",
      orden: (u) => u.run,
      render: (u) => formatearRun(u.run),
    },
    {
      clave: "nombre",
      titulo: "Nombre Completo",
      claseCelda: "fw-bold",
      orden: (u) => `${u.nombre} ${u.apellidos}`,
      render: (u) => `${u.nombre} ${u.apellidos}`,
    },
    {
      clave: "correo",
      titulo: "Correo Electrónico",
      orden: (u) => u.correo,
      render: (u) => u.correo,
    },
    {
      clave: "region",
      titulo: "Región / Comuna",
      orden: (u) => nombreRegion(u.regionId),
      render: (u) => (
        <>
          {nombreRegion(u.regionId)} / {nombreComuna(u.comunaId)}
        </>
      ),
    },
    {
      clave: "rol",
      titulo: "Rol",
      orden: (u) => nombreRol(u.rolId),
      render: (u) => (
        <span
          className={
            "badge " +
            (u.rolId === 1 ? "bg-danger" : u.rolId === 2 ? "bg-warning text-dark" : "badge-categoria")
          }
        >
          {nombreRol(u.rolId)}
        </span>
      ),
    },
    {
      clave: "estado",
      titulo: "Estado",
      render: (u) => (
        <span className={"badge " + (u.estado === "Activo" ? "bg-success" : "bg-secondary")}>
          {u.estado}
        </span>
      ),
    },
    {
      clave: "acciones",
      titulo: "Acciones",
      claseCelda: "text-end pe-3",
      render: (u) => (
        <>
          <Link
            to={`/admin/usuarios/form?run=${encodeURIComponent(u.run)}`}
            className="btn btn-sm btn-outline-primary me-1"
            title="Editar"
          >
            <i className="bi bi-pencil" />
          </Link>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            title="Eliminar"
            onClick={() => void eliminar(u.run)}
          >
            <i className="bi bi-trash" />
          </button>
        </>
      ),
    },
  ];

  return (
    <main className="container my-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom gap-3">
        <div>
          <h1 className="fw-bold h2 titulo-admin">Gestión de Usuarios</h1>
          <p className="text-muted mb-0">
            Administra las cuentas de los clientes y administradores registrados.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin" className="btn btn-outline-secondary btn-sm align-self-center">
            <i className="bi bi-arrow-left me-1" /> Volver al Panel
          </Link>
          <Link to="/admin/usuarios/form" className="btn btn-admin btn-sm align-self-center">
            <i className="bi bi-person-plus me-1" /> Nuevo Usuario
          </Link>
        </div>
      </div>

      <div className="card border-0 caja-admin-tabla">
        <div className="card-body p-0">
          <DataTable
            filas={usuarios}
            columnas={columnas}
            claveFila={(u) => u.run}
            coincide={(u, texto) =>
              `${u.nombre} ${u.apellidos}`.toLowerCase().includes(texto) ||
              u.correo.toLowerCase().includes(texto) ||
              u.run.includes(texto)
            }
            placeholderBusqueda="Buscar por nombre, correo o RUN..."
            porPagina={5}
            textoVacio="No se encontraron usuarios."
          />
        </div>
      </div>
    </main>
  );
}
