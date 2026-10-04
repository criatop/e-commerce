import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useColeccion } from "../storage/useColeccion";
import { CHIC_KEYS } from "../storage/claves";
import { useTablasMaestras } from "../hooks/useTablasMaestras";
import { alertas } from "../utils/alertas";
import { limpiarRun, validarRun } from "../utils/run";
import type { Usuario } from "../types";
import "../estilosAuth.css";

type Campo =
  | "run" | "nombre" | "apellidos" | "correo" | "password"
  | "fechaNacimiento" | "region" | "comuna" | "direccion";

const MENSAJES: Record<Campo, string> = {
  run: "Ingresa un RUN válido.",
  fechaNacimiento: "Ingresa una fecha válida.",
  nombre: "Ingresa tu nombre.",
  apellidos: "Ingresa tus apellidos.",
  correo: "Ingresa un correo válido.",
  password: "La contraseña debe tener al menos 6 caracteres.",
  region: "Selecciona una región.",
  comuna: "Selecciona una comuna.",
  direccion: "Ingresa tu dirección.",
};

const FORMULARIO_VACIO = {
  run: "",
  nombre: "",
  apellidos: "",
  correo: "",
  password: "",
  fechaNacimiento: "",
  region: "",
  comuna: "",
  direccion: "",
};

export default function Registro() {
  const navegar = useNavigate();
  const { login } = useAuth();
  const { datos: usuarios, guardar } = useColeccion<Usuario>(CHIC_KEYS.usuarios);
  const { regiones, comunasDe } = useTablasMaestras();

  const [form, setForm] = useState(FORMULARIO_VACIO);
  const [errores, setErrores] = useState<Partial<Record<Campo, boolean>>>({});

  function escribir(campo: Campo, valor: string) {
    setForm((previo) => ({ ...previo, [campo]: valor }));
    if (errores[campo]) setErrores((previos) => ({ ...previos, [campo]: false }));
  }

  function validar(): boolean {
    const nuevos: Partial<Record<Campo, boolean>> = {};

    if (!validarRun(form.run)) nuevos.run = true;
    if (form.nombre.trim() === "") nuevos.nombre = true;
    if (form.apellidos.trim() === "") nuevos.apellidos = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) nuevos.correo = true;
    if (form.password.length < 6) nuevos.password = true;
    if (!form.fechaNacimiento || new Date(form.fechaNacimiento) >= new Date())
      nuevos.fechaNacimiento = true;
    if (!form.region) nuevos.region = true;
    if (!form.comuna) nuevos.comuna = true;
    if (form.direccion.trim() === "") nuevos.direccion = true;

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!validar()) {
      void alertas.aviso("Revisa el formulario", "Hay campos incompletos o con datos inválidos.");
      return;
    }

    const run = limpiarRun(form.run);
    const correo = form.correo.trim();

    const yaExiste = usuarios.some(
      (u) => u.correo.toLowerCase() === correo.toLowerCase() || u.run === run,
    );

    if (yaExiste) {
      void alertas.error("Cuenta ya existente", "Ya existe una cuenta registrada con ese correo o RUN.");
      return;
    }

    const nuevo: Usuario = {
      run,
      nombre: form.nombre.trim(),
      apellidos: form.apellidos.trim(),
      correo,
      password: form.password,
      fechaNacimiento: form.fechaNacimiento,
      rolId: 3,
      regionId: Number(form.region),
      comunaId: Number(form.comuna),
      direccion: form.direccion.trim(),
      estado: "Activo",
    };

    guardar([...usuarios, nuevo]);

    void alertas.exito("¡Cuenta creada!", `Bienvenida/o, ${nuevo.nombre}. Tu cuenta ha sido registrada con éxito.`)
      .then(() => {
        login(correo, nuevo.password);
        navegar("/cuenta");
      });
  }

  return (
    <div className="page page-registro">
      <aside className="brand-panel">
        <div className="brand-mark">
          <p className="name">PINK&amp;PINK</p>
          <span className="by">BY JHAIMAR ALTUVE</span>
        </div>

        <div className="brand-copy">
          <h1>
            Únete a
            <br />
            la familia
          </h1>
          <span className="script">te va a encantar ♡</span>
          <p>
            Crea tu cuenta para guardar tu lista de deseos, seguir tus pedidos y ser la
            primera en conocer las nuevas colecciones.
          </p>
        </div>

        <div className="brand-footer">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 2.5 5 6 5c2 0 3.5 1 4 2.5C10.5 6 12 5 14 5c3.5 0 5.5 3.5 3.5 7.5C15 16.65 12 21 12 21z" />
            </svg>
            Hechos con amor
          </span>
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h13l3 5-9.5 11L1 9z" />
              <path d="M1 9h19M9.5 20 8 4M14.5 20 16 4" />
            </svg>
            Calidad garantizada
          </span>
        </div>
      </aside>

      <div className="form-panel">
        <p className="eyebrow">Mi cuenta</p>
        <h2>Crear una cuenta</h2>
        <p className="sub">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>

        <form id="registroForm" noValidate onSubmit={enviar}>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="run">RUN</label>
              <input
                type="text"
                className={"form-control" + (errores.run ? " is-invalid" : "")}
                id="run"
                placeholder="12.345.678-9"
                required
                value={form.run}
                onChange={(e) => escribir("run", e.target.value)}
              />
              <div className="invalid-feedback">{errores.run ? MENSAJES.run : ""}</div>
            </div>

            <div className="field">
              <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
              <input
                type="date"
                className={"form-control" + (errores.fechaNacimiento ? " is-invalid" : "")}
                id="fechaNacimiento"
                required
                value={form.fechaNacimiento}
                onChange={(e) => escribir("fechaNacimiento", e.target.value)}
              />
              <div className="invalid-feedback">
                {errores.fechaNacimiento ? MENSAJES.fechaNacimiento : ""}
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label htmlFor="nombre">Nombre</label>
              <input
                type="text"
                className={"form-control" + (errores.nombre ? " is-invalid" : "")}
                id="nombre"
                placeholder="Tu nombre"
                required
                value={form.nombre}
                onChange={(e) => escribir("nombre", e.target.value)}
              />
              <div className="invalid-feedback">{errores.nombre ? MENSAJES.nombre : ""}</div>
            </div>

            <div className="field">
              <label htmlFor="apellidos">Apellidos</label>
              <input
                type="text"
                className={"form-control" + (errores.apellidos ? " is-invalid" : "")}
                id="apellidos"
                placeholder="Tus apellidos"
                required
                value={form.apellidos}
                onChange={(e) => escribir("apellidos", e.target.value)}
              />
              <div className="invalid-feedback">{errores.apellidos ? MENSAJES.apellidos : ""}</div>
            </div>
          </div>

          <div className="field">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              type="email"
              className={"form-control" + (errores.correo ? " is-invalid" : "")}
              id="correo"
              placeholder="tucorreo@ejemplo.com"
              required
              value={form.correo}
              onChange={(e) => escribir("correo", e.target.value)}
            />
            <div className="invalid-feedback">{errores.correo ? MENSAJES.correo : ""}</div>
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              className={"form-control" + (errores.password ? " is-invalid" : "")}
              id="password"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => escribir("password", e.target.value)}
            />
            <div className="invalid-feedback">{errores.password ? MENSAJES.password : ""}</div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label htmlFor="region">Región</label>
              <select
                className={"form-select" + (errores.region ? " is-invalid" : "")}
                id="region"
                required
                value={form.region}
                onChange={(e) => escribir("region", e.target.value)}
              >
                <option value="">Selecciona una región</option>
                {regiones.datos.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
              <div className="invalid-feedback">{errores.region ? MENSAJES.region : ""}</div>
            </div>

            <div className="field">
              <label htmlFor="comuna">Comuna</label>
              <select
                className={"form-select" + (errores.comuna ? " is-invalid" : "")}
                id="comuna"
                required
                disabled={!form.region}
                value={form.comuna}
                onChange={(e) => escribir("comuna", e.target.value)}
              >
                <option value="">
                  {form.region ? "Selecciona una comuna" : "Selecciona primero una región"}
                </option>
                {regiones.datos
                  .filter((r) => String(r.id) === form.region)
                  .flatMap((r) => comunasDe(r.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
              </select>
              <div className="invalid-feedback">{errores.comuna ? MENSAJES.comuna : ""}</div>
            </div>
          </div>

          <div className="field">
            <label htmlFor="direccion">Dirección</label>
            <input
              type="text"
              className={"form-control" + (errores.direccion ? " is-invalid" : "")}
              id="direccion"
              placeholder="Calle, número, depto/casa"
              required
              value={form.direccion}
              onChange={(e) => escribir("direccion", e.target.value)}
            />
            <div className="invalid-feedback">{errores.direccion ? MENSAJES.direccion : ""}</div>
          </div>

          <button type="submit" className="btn-primary-pink">
            Registrar
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 20s-7-4.35-9.5-8.5C.5 7.5 2.5 4 6 4c2 0 3.5 1 4 2.5C10.5 5 12 4 14 4c3.5 0 5.5 3.5 3.5 7.5C15 15.65 12 20 12 20z" />
            </svg>
          </button>
        </form>

        <p className="signup-note">
          Al registrarte, aceptas nuestros <a href="#">Términos</a> y{" "}
          <a href="#">Política de privacidad</a>.
        </p>
      </div>
    </div>
  );
}
