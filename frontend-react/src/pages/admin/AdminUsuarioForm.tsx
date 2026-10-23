import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useColeccion } from "../../storage/useColeccion";
import { CHIC_KEYS } from "../../storage/claves";
import { useTablasMaestras } from "../../hooks/useTablasMaestras";
import { alertas } from "../../utils/alerta";
import { limpiarRun, validarRun } from "../../utils/run";
import type { Usuario } from "../../types";

const VACIO = {
  run: "",
  nombre: "",
  apellidos: "",
  correo: "",
  password: "",
  fechaNacimiento: "",
  rolId: "",
  regionId: "",
  comunaId: "",
  direccion: "",
  estado: "Activo" as const,
};

export default function AdminUsuarioForm() {
  const [parametros] = useSearchParams();
  const navegar = useNavigate();
  const runEditar = parametros.get("run");

  const { datos: usuarios, guardar } = useColeccion<Usuario>(CHIC_KEYS.usuarios);
  const { roles, regiones, comunasDe } = useTablasMaestras();

  const existente = usuarios.find((u) => u.run === runEditar);

  const [form, setForm] = useState(() =>
    existente
      ? {
          run: existente.run,
          nombre: existente.nombre,
          apellidos: existente.apellidos,
          correo: existente.correo,
          password: "",
          fechaNacimiento: existente.fechaNacimiento,
          rolId: String(existente.rolId),
          regionId: String(existente.regionId),
          comunaId: String(existente.comunaId),
          direccion: existente.direccion,
          estado: existente.estado,
        }
      : VACIO,
  );

  const [errores, setErrores] = useState<Partial<Record<keyof typeof VACIO, boolean>>>({});

  function escribir(campo: keyof typeof VACIO, valor: string) {
    setForm((previo) => ({ ...previo, [campo]: valor }));
    if (errores[campo]) setErrores((previos) => ({ ...previos, [campo]: false }));
  }

  function validar(requierePassword: boolean): boolean {
    const nuevos: Partial<Record<keyof typeof VACIO, boolean>> = {};

    if (!validarRun(form.run)) nuevos.run = true;
    if (!form.nombre.trim()) nuevos.nombre = true;
    if (!form.apellidos.trim()) nuevos.apellidos = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) nuevos.correo = true;
    if (requierePassword && form.password.length < 6) nuevos.password = true;
    if (!form.fechaNacimiento || new Date(form.fechaNacimiento) >= new Date())
      nuevos.fechaNacimiento = true;
    if (!form.rolId) nuevos.rolId = true;
    if (!form.regionId) nuevos.regionId = true;
    if (!form.comunaId) nuevos.comunaId = true;
    if (!form.direccion.trim()) nuevos.direccion = true;

    const run = limpiarRun(form.run);
    const correo = form.correo.trim();
    const repetido = usuarios.some(
      (u) =>
        u.run !== runEditar &&
        (u.run === run || u.correo.toLowerCase() === correo.toLowerCase()),
    );
    if (repetido) nuevos.run = true;

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!validar(!existente)) {
      void alertas.aviso("Revisa el formulario", "Hay campos incompletos o con datos inválidos.");
      return;
    }

    const run = limpiarRun(form.run);

    const registro: Usuario = {
      run,
      nombre: form.nombre.trim(),
      apellidos: form.apellidos.trim(),
      correo: form.correo.trim(),
      password: form.password || (existente?.password ?? ""),
      fechaNacimiento: form.fechaNacimiento,
      rolId: Number(form.rolId),
      regionId: Number(form.regionId),
      comunaId: Number(form.comunaId),
      direccion: form.direccion.trim(),
      estado: form.estado,
    };

    if (existente) {
      guardar(usuarios.map((u) => (u.run === runEditar ? registro : u)));
      void alertas.exito("Usuario actualizado", `${registro.nombre} fue guardado.`);
    } else {
      guardar([...usuarios, registro]);
      void alertas.exito("Usuario creado", `${registro.nombre} fue registrado.`);
    }

    navegar("/admin/usuarios");
  }

  return (
    <main className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fw-bold h2 titulo-admin">
            {existente ? "Editar Usuario" : "Formulario de Usuario"}
          </h1>
          <p className="text-muted mb-0">
            Registra o modifica la información de una cuenta del sistema.
          </p>
        </div>
        <Link to="/admin/usuarios" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1" /> Volver a Usuarios
        </Link>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card border-0 p-4 caja-contacto">
            <form id="formUsuarioAdmin" noValidate onSubmit={enviar}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label htmlFor="runUsuario" className="form-label fw-bold">
                    RUN
                  </label>
                  <input
                    type="text"
                    className={"form-control" + (errores.run ? " is-invalid" : "")}
                    id="runUsuario"
                    placeholder="12.345.678-9"
                    value={form.run}
                    onChange={(e) => escribir("run", e.target.value)}
                  />
                  <div className="invalid-feedback">
                    {errores.run ? "Ingresa un RUN válido y único." : ""}
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="rolUsuario" className="form-label fw-bold">
                    Rol de Usuario
                  </label>
                  <select
                    className={"form-select" + (errores.rolId ? " is-invalid" : "")}
                    id="rolUsuario"
                    value={form.rolId}
                    onChange={(e) => escribir("rolId", e.target.value)}
                  >
                    <option value="">Selecciona un rol</option>
                    {roles.datos.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="invalid-feedback">Selecciona un rol.</div>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="nombreUsuarioAdmin" className="form-label fw-bold">
                    Nombre(s)
                  </label>
                  <input
                    type="text"
                    className={"form-control" + (errores.nombre ? " is-invalid" : "")}
                    id="nombreUsuarioAdmin"
                    placeholder="Nombre(s)"
                    value={form.nombre}
                    onChange={(e) => escribir("nombre", e.target.value)}
                  />
                  <div className="invalid-feedback">Ingresa tu nombre.</div>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="apellidoUsuarioAdmin" className="form-label fw-bold">
                    Apellido(s)
                  </label>
                  <input
                    type="text"
                    className={"form-control" + (errores.apellidos ? " is-invalid" : "")}
                    id="apellidoUsuarioAdmin"
                    placeholder="Apellido(s)"
                    value={form.apellidos}
                    onChange={(e) => escribir("apellidos", e.target.value)}
                  />
                  <div className="invalid-feedback">Ingresa tus apellidos.</div>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="emailUsuarioAdmin" className="form-label fw-bold">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    className={"form-control" + (errores.correo ? " is-invalid" : "")}
                    id="emailUsuarioAdmin"
                    placeholder="ejemplo@duoc.cl"
                    value={form.correo}
                    onChange={(e) => escribir("correo", e.target.value)}
                  />
                  <div className="invalid-feedback">Ingresa un correo válido.</div>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="passUsuarioAdmin" className="form-label fw-bold">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className={"form-control" + (errores.password ? " is-invalid" : "")}
                    id="passUsuarioAdmin"
                    placeholder={existente ? "Dejar vacío para mantener" : "Mínimo 6 caracteres"}
                    value={form.password}
                    onChange={(e) => escribir("password", e.target.value)}
                  />
                  <div className="invalid-feedback">
                    La contraseña debe tener al menos 6 caracteres.
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="fechaUsuarioAdmin" className="form-label fw-bold">
                    Fecha de nacimiento
                  </label>
                  <input
                    type="date"
                    className={"form-control" + (errores.fechaNacimiento ? " is-invalid" : "")}
                    id="fechaUsuarioAdmin"
                    value={form.fechaNacimiento}
                    onChange={(e) => escribir("fechaNacimiento", e.target.value)}
                  />
                  <div className="invalid-feedback">Ingresa una fecha válida.</div>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="direccionUsuarioAdmin" className="form-label fw-bold">
                    Dirección
                  </label>
                  <input
                    type="text"
                    className={"form-control" + (errores.direccion ? " is-invalid" : "")}
                    id="direccionUsuarioAdmin"
                    placeholder="Calle, número, depto/casa"
                    value={form.direccion}
                    onChange={(e) => escribir("direccion", e.target.value)}
                  />
                  <div className="invalid-feedback">Ingresa la dirección.</div>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="regionUsuario" className="form-label fw-bold">
                    Región
                  </label>
                  <select
                    className={"form-select" + (errores.regionId ? " is-invalid" : "")}
                    id="regionUsuario"
                    value={form.regionId}
                    onChange={(e) => escribir("regionId", e.target.value)}
                  >
                    <option value="">Selecciona una región</option>
                    {regiones.datos.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="invalid-feedback">Selecciona una región.</div>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="comunaUsuario" className="form-label fw-bold">
                    Comuna
                  </label>
                  <select
                    className={"form-select" + (errores.comunaId ? " is-invalid" : "")}
                    id="comunaUsuario"
                    disabled={!form.regionId}
                    value={form.comunaId}
                    onChange={(e) => escribir("comunaId", e.target.value)}
                  >
                    <option value="">
                      {form.regionId ? "Selecciona una comuna" : "Selecciona primero una región"}
                    </option>
                    {regiones.datos
                      .filter((r) => String(r.id) === form.regionId)
                      .flatMap((r) => comunasDe(r.id))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                  </select>
                  <div className="invalid-feedback">Selecciona una comuna.</div>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="estadoUsuario" className="form-label fw-bold">
                    Estado de la cuenta
                  </label>
                  <select
                    className="form-select"
                    id="estadoUsuario"
                    value={form.estado}
                    onChange={(e) => escribir("estado", e.target.value)}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                  <div className="form-text">
                    Un usuario "Inactivo" conserva sus datos, pero no puede iniciar sesión
                    (recibe el aviso "Cuenta inactiva").
                  </div>
                </div>

                <div className="col-12 d-flex justify-content-end gap-2 mt-4">
                  <Link to="/admin/usuarios" className="btn btn-outline-secondary">
                    Cancelar
                  </Link>
                  <button type="submit" className="btn btn-contacto">
                    Guardar Usuario
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
