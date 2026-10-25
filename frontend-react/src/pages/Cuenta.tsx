import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTablasMaestras } from "../hooks/useTablasMaestras";
import { alertas } from "../utils/alerta";

export default function Cuenta() {
  const { sesion, iniciales, esPersonal, logout, actualizarSesion } = useAuth();
  const { roles, regiones, comunas } = useTablasMaestras();

  const [editando, setEditando] = useState(false);

  // Form state para la edición
  const [form, setForm] = useState(() => ({
    nombre: sesion?.nombre || "",
    apellidos: sesion?.apellidos || "",
    correo: sesion?.correo || "",
    run: sesion?.run || "",
    fechaNacimiento: sesion?.fechaNacimiento || "",
    direccion: sesion?.direccion || "",
    regionId: String(sesion?.regionId || ""),
    comunaId: String(sesion?.comunaId || ""),
  }));

  if (!sesion) {
    return (
      <section className="container-section">
        <div className="container">
          <div className="text-center mb-4">
            <h1 className="section-title">Mi cuenta</h1>
          </div>

          <div className="text-center p-5 bg-pink-panel rounded-4">
            <h3 className="fw-bold text-accent mb-3">Aún no has iniciado sesión</h3>
            <p className="text-muted mb-4">
              Inicia sesión para ver tu información personal.
            </p>
            <Link to="/login" className="btn btn-accent px-4 py-2 fw-semibold">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const rol = roles.datos.find((r) => r.id === sesion.rolId);
  const region = regiones.datos.find((r) => r.id === (editando ? Number(form.regionId) : sesion.regionId));
  const comuna = comunas.datos.find((c) => c.id === (editando ? Number(form.comunaId) : sesion.comunaId));

  // Comunas filtradas por la región seleccionada
  const comunasFiltradas = comunas.datos.filter(
    (c) => c.regionId === Number(form.regionId)
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function guardarCambios(e: React.FormEvent) {
    e.preventDefault();

    if (!sesion) return;

    const datosActualizados = {
      ...sesion,
      nombre: form.nombre.trim(),
      apellidos: form.apellidos.trim(),
      correo: form.correo.trim(),
      run: form.run.trim(),
      fechaNacimiento: form.fechaNacimiento,
      direccion: form.direccion.trim(),
      regionId: Number(form.regionId),
      comunaId: Number(form.comunaId),
    };

    actualizarSesion(datosActualizados);
    void alertas.exito("Perfil actualizado", "Tus datos se guardaron correctamente.");
    setEditando(false);
  }

  function cancelar() {
    if (!sesion) return;

    setForm({
      nombre: sesion.nombre,
      apellidos: sesion.apellidos,
      correo: sesion.correo,
      run: sesion.run,
      fechaNacimiento: sesion.fechaNacimiento,
      direccion: sesion.direccion,
      regionId: String(sesion.regionId),
      comunaId: String(sesion.comunaId),
    });
    setEditando(false);
  }

  return (
    <section className="container-section">
      <div className="container">
        <div className="text-center mb-4">
          <h1 className="section-title">Mi cuenta</h1>
          <Link to="/productos" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1" /> Seguir comprando
          </Link>
        </div>

        <div className="row justify-content-center g-4">
          <div className="col-lg-8">
            <div className="card-nexo-hover p-4">
              <form onSubmit={guardarCambios}>
                <div className="row g-4 align-items-center">
                  {/* Columna izquierda con Avatar y botones principales */}
                  <div className="col-md-4 text-center">
                    <div className="avatar-iniciales">{iniciales}</div>

                    {editando ? (
                      <div className="mt-3">
                        <input
                          type="text"
                          className="form-control form-control-sm text-center mb-1"
                          name="nombre"
                          placeholder="Nombre"
                          value={form.nombre}
                          onChange={handleChange}
                          required
                        />
                        <input
                          type="text"
                          className="form-control form-control-sm text-center"
                          name="apellidos"
                          placeholder="Apellidos"
                          value={form.apellidos}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    ) : (
                      <h2 className="h5 mt-3 mb-1">
                        {sesion.nombre} {sesion.apellidos}
                      </h2>
                    )}

                    <span
                      className={
                        "badge rounded-pill " +
                        (esPersonal ? "text-bg-danger" : "text-bg-secondary")
                      }
                    >
                      {rol?.nombre ?? "Usuario"}
                    </span>

                    {!editando ? (
                      <>
                        <div className="mt-3">
                          <button
                            type="button"
                            className="btn btn-outline-primary w-100"
                            onClick={() => setEditando(true)}
                          >
                            <i className="bi bi-pencil me-1" /> Editar perfil
                          </button>
                        </div>

                        {!esPersonal && (
                          <div className="mt-2">
                            <Link to="/mis-compras" className="btn btn-accent w-100">
                              <i className="bi bi-receipt me-1" /> Mis compras / Boletas
                            </Link>
                          </div>
                        )}

                        {esPersonal && (
                          <div className="mt-2">
                            <Link to="/admin" className="btn btn-accent w-100">
                              <i className="bi bi-speedometer2 me-1" /> Ir al panel admin
                            </Link>
                          </div>
                        )}

                        <div className="mt-2">
                          <button
                            type="button"
                            className="btn btn-outline-danger w-100"
                            onClick={logout}
                          >
                            <i className="bi bi-box-arrow-right me-1" /> Cerrar sesión
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-3 d-grid gap-2">
                        <button type="submit" className="btn btn-success">
                          <i className="bi bi-check-lg me-1" /> Guardar
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={cancelar}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Columna derecha con lista/formulario de datos */}
                  <div className="col-md-8">
                    <div className="ps-md-3">
                      {/* Correo */}
                      <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                        <span className="text-muted small">Correo</span>
                        {editando ? (
                          <input
                            type="email"
                            className="form-control form-control-sm w-60 text-end"
                            name="correo"
                            value={form.correo}
                            onChange={handleChange}
                            required
                          />
                        ) : (
                          <span className="fw-semibold text-end">{sesion.correo}</span>
                        )}
                      </div>

                      {/* RUN */}
                      <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                        <span className="text-muted small">RUN</span>
                        {editando ? (
                          <input
                            type="text"
                            className="form-control form-control-sm w-60 text-end"
                            name="run"
                            value={form.run}
                            onChange={handleChange}
                            required
                          />
                        ) : (
                          <span className="fw-semibold text-end">{sesion.run}</span>
                        )}
                      </div>

                      {/* Fecha de nacimiento */}
                      <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                        <span className="text-muted small">Fecha de nacimiento</span>
                        {editando ? (
                          <input
                            type="date"
                            className="form-control form-control-sm w-60 text-end"
                            name="fechaNacimiento"
                            value={form.fechaNacimiento}
                            onChange={handleChange}
                          />
                        ) : (
                          <span className="fw-semibold text-end">{sesion.fechaNacimiento}</span>
                        )}
                      </div>

                      {/* Dirección */}
                      <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                        <span className="text-muted small">Dirección</span>
                        {editando ? (
                          <input
                            type="text"
                            className="form-control form-control-sm w-60 text-end"
                            name="direccion"
                            value={form.direccion}
                            onChange={handleChange}
                          />
                        ) : (
                          <span className="fw-semibold text-end">{sesion.direccion || "-"}</span>
                        )}
                      </div>

                      {/* Región */}
                      <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                        <span className="text-muted small">Región</span>
                        {editando ? (
                          <select
                            className="form-select form-select-sm w-60 text-end"
                            name="regionId"
                            value={form.regionId}
                            onChange={handleChange}
                          >
                            <option value="">Selecciona región</option>
                            {regiones.datos.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.nombre}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="fw-semibold text-end">{region?.nombre || "-"}</span>
                        )}
                      </div>

                      {/* Comuna */}
                      <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                        <span className="text-muted small">Comuna</span>
                        {editando ? (
                          <select
                            className="form-select form-select-sm w-60 text-end"
                            name="comunaId"
                            value={form.comunaId}
                            onChange={handleChange}
                          >
                            <option value="">Selecciona comuna</option>
                            {comunasFiltradas.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.nombre}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="fw-semibold text-end">{comuna?.nombre || "-"}</span>
                        )}
                      </div>

                      {/* Estado */}
                      <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                        <span className="text-muted small">Estado</span>
                        <span className="fw-semibold text-end">{sesion.estado}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}