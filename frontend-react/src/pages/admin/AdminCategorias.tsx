import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { catalogApi, type CategoryPayload } from "../../api/catalog";
import { mapCategoria } from "../../api/mappers";
import DataTable, { type Columna } from "../../components/common/DataTable";
import { alertas } from "../../utils/alerta";
import { mensajeError } from "../../utils/error";
import type { Categoria } from "../../types";

const VACIO = { nombre: "", descripcion: "" };

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState(VACIO);
  const [editando, setEditando] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      const lista = await catalogApi.listCategories();
      setCategorias(lista.map(mapCategoria));
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

  function cancelar() {
    setEditando(null);
    setForm(VACIO);
  }

  async function guardarCategoria(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!form.nombre.trim()) {
      void alertas.aviso("Falta nombre", "Ingresa el nombre de la categoría.");
      return;
    }
    if (!form.descripcion.trim()) {
      void alertas.aviso("Falta descripción", "Ingresa una descripción.");
      return;
    }

    const cuerpo: CategoryPayload = {
      name: form.nombre.trim(),
      description: form.descripcion.trim(),
      activa: true,
    };
    setGuardando(true);
    try {
      if (editando !== null) {
        await catalogApi.updateCategory(editando, cuerpo);
        void alertas.exito("Categoría actualizada", "Los cambios fueron guardados.");
      } else {
        await catalogApi.createCategory(cuerpo);
        void alertas.exito("Categoría creada", "Se agregó al listado.");
      }
      cancelar();
      await recargar();
    } catch (e: unknown) {
      void alertas.error("No se pudo guardar", mensajeError(e));
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(c: Categoria) {
    const ok = await alertas.confirmar(
      "Eliminar categoría",
      `¿Eliminar "${c.nombre}"?`,
      "Sí, eliminar",
    );
    if (!ok) return;

    try {
      await catalogApi.deleteCategory(c.id);
      void alertas.exito("Eliminada", "Categoría eliminada.");
      await recargar();
    } catch (e: unknown) {
      void alertas.error("No se pudo eliminar", mensajeError(e));
    }
  }

  const columnas: Columna<Categoria>[] = [
    { clave: "id", titulo: "ID", render: (c) => c.id },
    { clave: "nombre", titulo: "Nombre", render: (c) => c.nombre, orden: (c) => c.nombre },
    { clave: "descripcion", titulo: "Descripción", render: (c) => c.descripcion ?? "" },
    {
      clave: "acciones",
      titulo: "Acciones",
      claseCelda: "text-end",
      render: (c) => (
        <>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary me-1"
            onClick={() => {
              setEditando(String(c.id));
              setForm({ nombre: c.nombre, descripcion: c.descripcion ?? "" });
            }}
          >
            <i className="bi bi-pencil" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => void eliminar(c)}
          >
            <i className="bi bi-trash" />
          </button>
        </>
      ),
    },
  ];

  return (
    <main className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fw-bold h2 titulo-admin">Categorías de Productos</h1>
          <p className="text-muted mb-0">
            Agregar, editar o eliminar categorías (ej. Tobilleras, Aros, Collares).
          </p>
        </div>
        <Link to="/admin" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1" /> Volver al Panel
        </Link>
      </div>

      {error && <div className="alert alert-danger">No se pudieron cargar las categorías: {error}</div>}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 caja-contacto p-3">
            <h5 className="fw-bold">{editando ? "Editar categoría" : "Nueva categoría"}</h5>
            <form onSubmit={(evento) => void guardarCategoria(evento)}>
              <div className="mb-2">
                <label className="form-label" htmlFor="nombreCategoria">
                  Nombre
                </label>
                <input
                  id="nombreCategoria"
                  className="form-control"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </div>
              <div className="mb-2">
                <label className="form-label" htmlFor="descripcionCategoria">
                  Descripción
                </label>
                <textarea
                  id="descripcionCategoria"
                  className="form-control"
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-admin" type="submit" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
                {editando && (
                  <button className="btn btn-outline-secondary" type="button" onClick={cancelar}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card border-0 caja-admin-tabla">
            <div className="card-body p-0">
              <DataTable
                filas={categorias}
                columnas={columnas}
                claveFila={(c) => c.id}
                coincide={(c, t) =>
                  c.nombre.toLowerCase().includes(t) || (c.descripcion ?? "").toLowerCase().includes(t)
                }
                placeholderBusqueda="Buscar categoría..."
                porPagina={5}
                textoVacio={cargando ? "Cargando categorías..." : "Sin categorías."}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
