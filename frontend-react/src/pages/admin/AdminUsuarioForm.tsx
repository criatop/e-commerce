import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { adminRegister } from "../../api/auth";
import { apiGet, apiPut } from "../../api/client";
import { mapUsuarioAdmin } from "../../api/mappers";
import type { UsuarioApi } from "../../api/types";
import { useTablasMaestras } from "../../hooks/useTablasMaestras";
import { alertas } from "../../utils/alerta";
import { mensajeError } from "../../utils/error";
import { limpiarRun, validarRun } from "../../utils/run";
import type { Usuario } from "../../types";

interface Formulario {
  run: string;
  nombre: string;
  apellidos: string;
  correo: string;
  password: string;
  fechaNacimiento: string;
  rolId: string;
  regionId: string;
  comunaId: string;
  direccion: string;
  estado: "Activo" | "Inactivo";
}

const VACIO: Formulario = {
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
  estado: "Activo",
};

/** roleName esperado por /api/v1/auth/admin/register. */
const ROL_POR_ID: Record<number, string> = { 1: "ADMIN", 2: "SELLER", 3: "CUSTOMER" };

function desdeUsuario(usuario: Usuario): Formulario {
  return {
    run: usuario.run,
    nombre: usuario.nombre,
    apellidos: usuario.apellidos,
    correo: usuario.correo,
    password: "",
    fechaNacimiento: usuario.fechaNacimiento ?? "",
    rolId: String(usuario.rolId),
    regionId:
      usuario.regionId === null || usuario.regionId === undefined ? "" : String(usuario.regionId),
    comunaId:
      usuario.comunaId === null || usuario.comunaId === undefined ? "" : String(usuario.comunaId),
    direccion: usuario.direccion ?? "",
    estado: usuario.activo === false ? "Inactivo" : "Activo",
  };
}

export default function AdminUsuarioForm() {
  const [parametros] = useSearchParams();
  const navegar = useNavigate();
  const idEditar = parametros.get("id");
  const runEditar = parametros.get("run");

  const { roles, regiones, comunasDe } = useTablasMaestras();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [existente, setExistente] = useState<Usuario | null>(null);
  const [form, setForm] = useState<Formulario>(VACIO);
  const [errores, setErrores] = useState<Partial<Record<keyof Formulario, boolean>>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    void (async () => {
      setCargando(true);
      setError("");
      try {
        const lista = (await apiGet<UsuarioApi[]>("/api/v1/users")).map(mapUsuarioAdmin);
        if (!activo) return;
        setUsuarios(lista);

        if (idEditar) {
          const usuario = mapUsuarioAdmin(await apiGet<UsuarioApi>(`/api/v1/users/${idEditar}`));
          if (activo) {
            setExistente(usuario);
            setForm(desdeUsuario(usuario));
          }
        } else if (runEditar) {
          const usuario = lista.find((u) => u.run === runEditar) ?? null;
          if (activo) {
            setExistente(usuario);
            setForm(usuario ? desdeUsuario(usuario) : VACIO);
          }
        } else if (activo) {
          setExistente(null);
          setForm(VACIO);
        }
      } catch (e: unknown) {
        if (activo) setError(mensajeError(e));
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [idEditar, runEditar]);

  function escribir(campo: keyof Formulario, valor: string) {
    setForm((previo) => ({ ...previo, [campo]: valor }));
    if (errores[campo]) setErrores((previos) => ({ ...previos, [campo]: false }));
  }

  function validar(requierePassword: boolean): boolean {
    const nuevos: Partial<Record<keyof Formulario, boolean>> = {};

    if (requierePassword) {
      if (!validarRun(form.run)) nuevos.run = true;
      if (!form.nombre.trim()) nuevos.nombre = true;
      if (!form.apellidos.trim()) nuevos.apellidos = true;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) nuevos.correo = true;
      if (form.password.length < 6) nuevos.password = true;
      if (!form.fechaNacimiento || new Date(form.fechaNacimiento) >= new Date())
        nuevos.fechaNacimiento = true;
      if (!form.regionId) nuevos.regionId = true;
      if (!form.comunaId) nuevos.comunaId = true;
      if (!form.direccion.trim()) nuevos.direccion = true;

      const run = limpiarRun(form.run);
      const correo = form.correo.trim();
      const repetido = usuarios.some(
        (u) => u.run === run || u.correo.toLowerCase() === correo.toLowerCase(),
      );
      if (repetido) nuevos.run = true;
    }

    if (!form.rolId) nuevos.rolId = true;

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!validar(!existente)) {
      void alertas.aviso("Revisa el formulario", "Hay campos incompletos o con datos inválidos.");
      return;
    }

    setGuardando(true);
    setError("");
    try {
      if (existente?.id !== undefined) {
        // La API solo permite cambiar rol y estado de un usuario existente.
        await apiPut(`/api/v1/users/${existente.id}`, {
          roleId: Number(form.rolId),
          activo: form.estado === "Activo",
        });
        void alertas.exito("Usuario actualizado", `${existente.nombre} fue guardado.`);
      } else {
        await adminRegister({
          run: limpiarRun(form.run),
          email: form.correo.trim(),
          password: form.password,
          nombre: form.nombre.trim(),
          apellidos: form.apellidos.trim(),
          fechaNacimiento: form.fechaNacimiento,
          rol: ROL_POR_ID[Number(form.rolId)] ?? "CUSTOMER",
          regionId: Number(form.regionId),
          comunaId: Number(form.comunaId),
          direccion: form.direccion.trim(),
        });
        void alertas.exito("Usuario creado", `${form.nombre.trim()} fue registrado.`);
      }
      navegar("/admin/usuarios");
    } catch (e: unknown) {
      const mensaje = mensajeError(e);
      setError(mensaje);
      void alertas.error("No se pudo guardar", mensaje);
    } finally {
      setGuardando(false);
    }
  }

  const soloEdicion = existente !== null;

  return (
    <main className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fw-bold h2 titulo-admin">
            {soloEdicion ? "Editar Usuario" : "Formulario de Usuario"}
          </h1>
          <p className="text-muted mb-0">
            {soloEdicion
              ? "La API permite cambiar el rol y el estado de la cuenta. Los datos personales no se editan aquí."
              : "Registra una nueva cuenta del sistema."}
          </p>
        </div>
        <Link to="/admin/usuarios" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1" /> Volver a Usuarios
        </Link>
      </div>

      {error && <div className="alert alert-danger">No se pudo completar la operación: {error}</div>}

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card border-0 p-4 caja-contacto">
            <form id="formUsuarioAdmin" noValidate onSubmit={(evento) => void enviar(evento)}>
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
                    disabled={soloEdicion}
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
                    disabled={soloEdicion}
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
                    disabled={soloEdicion}
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
                    disabled={soloEdicion}
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
                    placeholder={soloEdicion ? "No se cambia desde el panel" : "Mínimo 6 caracteres"}
                    value={form.password}
                    disabled={soloEdicion}
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
                    disabled={soloEdicion}
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
                    disabled={soloEdicion}
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
                    disabled={soloEdicion}
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
                    disabled={soloEdicion || !form.regionId}
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
                  <button type="submit" className="btn btn-contacto" disabled={cargando || guardando}>
                    {guardando ? "Guardando..." : "Guardar Usuario"}
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
