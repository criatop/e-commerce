import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiDelete, apiGet } from "../../api/client";
import { mapUsuarioAdmin } from "../../api/mappers";
import type { UsuarioApi } from "../../api/types";
import DataTable, { type Columna } from "../../components/common/DataTable";
import { useAuth } from "../../context/AuthContext";
import { useTablasMaestras } from "../../hooks/useTablasMaestras";
import { alertas } from "../../utils/alerta";
import { formatearRun } from "../../utils/run";
import { mensajeError } from "../../utils/error";
import type { Usuario } from "../../types";

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const { sesion } = useAuth();
  const { roles, regiones, comunas } = useTablasMaestras();

  const cargar = useCallback(async () => {
    try {
      const lista = await apiGet<UsuarioApi[]>("/api/v1/users");
      setUsuarios(lista.map(mapUsuarioAdmin));
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

  const nombreRol = (id: number) => roles.datos.find((r) => r.id === id)?.nombre ?? "";
  const nombreRegion = (id: number) => regiones.datos.find((r) => r.id === id)?.nombre ?? "";
  const nombreComuna = (id: number) => comunas.datos.find((c) => c.id === id)?.nombre ?? "";

  async function eliminar(usuario: Usuario) {
    const esPropio =
      (sesion?.id !== undefined && String(usuario.id) === String(sesion.id)) ||
      (sesion?.run !== undefined && usuario.run === sesion.run);
    if (esPropio) {
      void alertas.aviso(
        "No puedes eliminarte",
        "Tu propia cuenta no se puede eliminar desde el panel.",
      );
      return;
    }
    if (usuario.id === undefined) {
      void alertas.aviso("No se puede eliminar", "El usuario no tiene un identificador de API.");
      return;
    }

    const ok = await alertas.confirmar(
      "Eliminar usuario",
      `¿Seguro que quieres eliminar a ${usuario.nombre} ${usuario.apellidos}?`,
      "Sí, eliminar",
    );
    if (!ok) return;

    try {
      await apiDelete(`/api/v1/users/${usuario.id}`);
      void alertas.exito("Usuario eliminado", "La cuenta fue eliminada del sistema.");
      await recargar();
    } catch (e: unknown) {
      void alertas.error("No se pudo eliminar", mensajeError(e));
    }
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
      orden: (u) => nombreRegion(u.regionId ?? 0),
      render: (u) => (
        <>
          {nombreRegion(u.regionId ?? 0)} / {nombreComuna(u.comunaId ?? 0)}
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
            to={`/admin/usuarios/form?id=${encodeURIComponent(String(u.id ?? ""))}`}
            className="btn btn-sm btn-outline-primary me-1"
            title="Editar"
          >
            <i className="bi bi-pencil" />
          </Link>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            title="Eliminar"
            onClick={() => void eliminar(u)}
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

      {error && <div className="alert alert-danger">No se pudieron cargar los usuarios: {error}</div>}

      <div className="card border-0 caja-admin-tabla">
        <div className="card-body p-0">
          <DataTable
            filas={usuarios}
            columnas={columnas}
            claveFila={(u) => String(u.id ?? u.run)}
            coincide={(u, texto) =>
              `${u.nombre} ${u.apellidos}`.toLowerCase().includes(texto) ||
              u.correo.toLowerCase().includes(texto) ||
              u.run.includes(texto)
            }
            placeholderBusqueda="Buscar por nombre, correo o RUN..."
            porPagina={5}
            textoVacio={cargando ? "Cargando usuarios..." : "No se encontraron usuarios."}
          />
        </div>
      </div>
    </main>
  );
}
