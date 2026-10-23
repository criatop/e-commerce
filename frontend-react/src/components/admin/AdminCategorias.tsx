import { useState } from "react";
import { Link } from "react-router-dom";
import DataTable, { type Columna } from "../../components/common/DataTable";
import { useColeccion } from "../../storage/useColeccion";
import { CHIC_KEYS } from "../../storage/claves";
import { alertas } from "../../utils/alerta";
import type { Categoria } from "../../types";

const VACIO = { id: "", nombre: "", descripcion: "" };

export default function AdminCategorias() {
  const { datos: categorias, guardar } = useColeccion<Categoria>(CHIC_KEYS.categorias);
  const [form, setForm] = useState(VACIO);
  const [editando, setEditando] = useState<number | null>(null);

  function iniciarEdicion(c: Categoria) {
    setEditando(c.id);
    setForm({ id: String(c.id), nombre: c.nombre, descripcion: c.descripcion });
  }

  function cancelar() {
    setEditando(null);
    setForm(VACIO);
  }

  function guardarCategoria(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) { void alertas.aviso("Falta nombre", "Ingresa el nombre de la categoría."); return; }
    if (!form.descripcion.trim()) { void alertas.aviso("Falta descripción", "Ingresa una descripción."); return; }
    if (editando !== null) {
      const id = editando;
      guardar(categorias.map((c) => (c.id === id ? { id, nombre: form.nombre.trim(), descripcion: form.descripcion.trim() } : c)));
      void alertas.exito("Categoría actualizada", "Los cambios fueron guardados.");
    } else {
      const nuevoId = categorias.length ? Math.max(...categorias.map((c) => c.id)) + 1 : 1;
      guardar([...categorias, { id: nuevoId, nombre: form.nombre.trim(), descripcion: form.descripcion.trim() }]);
      void alertas.exito("Categoría creada", "Se agregó al listado.");
    }
    cancelar();
  }

  async function eliminar(id: number) {
    const c = categorias.find((x) => x.id === id);
    const ok = await alertas.confirmar("Eliminar categoría", `¿Eliminar "${c?.nombre}"?`, "Sí, eliminar");
    if (!ok) return;
    guardar(categorias.filter((x) => x.id !== id));
    void alertas.exito("Eliminada", "Categoría eliminada.");
  }

  const columnas: Columna<Categoria>[] = [
    { clave: "id", titulo: "ID", render: (c) => c.id },
    { clave: "nombre", titulo: "Nombre", render: (c) => c.nombre, orden: (c) => c.nombre },
    { clave: "descripcion", titulo: "Descripción", render: (c) => c.descripcion },
    {
      clave: "acciones", titulo: "Acciones", claseCelda: "text-end",
      render: (c) => (
        <>
          <button className="btn btn-sm btn-outline-primary me-1" onClick={() => iniciarEdicion(c)}><i className="bi bi-pencil"/></button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => void eliminar(c.id)}><i className="bi bi-trash"/></button>
        </>
      )
    }
  ];

  return (
    <main className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fw-bold h2 titulo-admin">Categorías de Productos</h1>
          <p className="text-muted mb-0">Agregar, editar o eliminar categorías (ej. Tobilleras, Aros, Collares).</p>
        </div>
        <Link to="/admin" className="btn btn-outline-secondary btn-sm"><i className="bi bi-arrow-left me-1"/> Volver al Panel</Link>
      </div>
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 caja-contacto p-3">
            <h5 className="fw-bold">{editando ? "Editar categoría" : "Nueva categoría"}</h5>
            <form onSubmit={guardarCategoria}>
              <div className="mb-2">
                <label className="form-label">Nombre</label>
                <input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="form-label">Descripción</label>
                <textarea className="form-control" rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-admin" type="submit">Guardar</button>
                {editando && <button className="btn btn-outline-secondary" type="button" onClick={cancelar}>Cancelar</button>}
              </div>
            </form>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card border-0 caja-admin-tabla">
            <div className="card-body p-0">
              <DataTable filas={categorias} columnas={columnas} claveFila={(c) => c.id} coincide={(c,t)=>c.nombre.toLowerCase().includes(t)||c.descripcion.toLowerCase().includes(t)} placeholderBusqueda="Buscar categoría..." porPagina={5} textoVacio="Sin categorías." />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
