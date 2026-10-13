import { useState, type FormEvent } from "react";
import { CHIC_KEYS } from "../storage/claves";
import { useColeccion } from "../storage/useColeccion";
import { alertas } from "../utils/alerta";
import type { Mensaje } from "../types";
const REGLAS = {
nombre: { vacio: "Ingresa tu nombre." },
apellido: { vacio: "Ingresa tu apellido." },
email: { formato: "Ingresa un correo válido." },
mensaje: { corto: "Escribe un mensaje de al menos 10 caracteres." },
};
export default function Contacto() {
const { datos: mensajes, guardar } = useColeccion<Mensaje>(CHIC_KEYS.contactos);
const [form, setForm] = useState({
nombre: "",
apellido: "",
email: "",
mensaje: "",
});
const [errores, setErrores] = useState<Partial<Record<keyof typeof form, string>>>({});
function escribir(campo: keyof typeof form, valor: string) {
setForm((previo) => ({ ...previo, [campo]: valor }));
if (errores[campo]) {
setErrores((previos) => ({ ...previos, [campo]: undefined }));
}
}
function validar(): boolean {
const nuevos: Partial<Record<keyof typeof form, string>> = {};
if (form.nombre.trim() === "") nuevos.nombre = REGLAS.nombre.vacio;
if (form.apellido.trim() === "") nuevos.apellido = REGLAS.apellido.vacio;
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
nuevos.email = REGLAS.email.formato;
if (form.mensaje.trim().length < 10) nuevos.mensaje = REGLAS.mensaje.corto;

setErrores(nuevos);
return Object.keys(nuevos).length === 0;
}
function enviar(evento: FormEvent<HTMLFormElement>) {
evento.preventDefault();
if (!validar()) return;
guardar([...mensajes, { ...form, mensaje: form.mensaje.trim() }]);
void alertas.exito("Mensaje enviado", "¡Gracias por escribirnos! Te responderemos pronto.");
setForm({ nombre: "", apellido: "", email: "", mensaje: "" });
setErrores({});
}
return (
<main className="container my-5">
<div className="text-center mb-5">
<h1 className="fw-bold display-5 titulo-contacto">Contacto</h1>
<p className="lead text-muted">
¿Tienes alguna duda o consulta? Escríbenos y te responderemos a la brevedad.
</p>
</div>
<div className="row g-4 justify-content-center">
<div className="col-12 col-md-8 col-lg-6">
<div className="card border-0 p-4 caja-contacto">
<form noValidate onSubmit={enviar}>
<div className="mb-3">
<label htmlFor="nombreContacto" className="form-label fw-bold">
Nombre(s)
</label>
<input
type="text"
className={"form-control" + (errores.nombre ? " is-invalid" : "")}
id="nombreContacto"
value={form.nombre}
onChange={(e) => escribir("nombre", e.target.value)}
placeholder="Ingresa tu nombre"
/>
<div className="invalid-feedback">{errores.nombre ?? ""}</div>
</div>
<div className="mb-3">

<label htmlFor="apellidoContacto" className="form-label fw-bold">
Apellido(s)
</label>
<input
type="text"
className={"form-control" + (errores.apellido ? " is-invalid" : "")}
id="apellidoContacto"
value={form.apellido}
onChange={(e) => escribir("apellido", e.target.value)}
placeholder="Ingresa tu apellido"
/>
<div className="invalid-feedback">{errores.apellido ?? ""}</div>
</div>
<div className="mb-3">
<label htmlFor="emailContacto" className="form-label fw-bold">
Correo Electrónico
</label>
<input
type="email"
className={"form-control" + (errores.email ? " is-invalid" : "")}
id="emailContacto"
value={form.email}
onChange={(e) => escribir("email", e.target.value)}
placeholder="Email"
/>
<div className="invalid-feedback">{errores.email ?? ""}</div>
</div>
<div className="mb-3">
<label htmlFor="mensajeContacto" className="form-label fw-bold">
Mensaje
</label>
<textarea
className={"form-control" + (errores.mensaje ? " is-invalid" : "")}
id="mensajeContacto"
rows={4}
value={form.mensaje}
onChange={(e) => escribir("mensaje", e.target.value)}
placeholder="Escribe tu mensaje aquí..."
/>
<div className="invalid-feedback">{errores.mensaje ?? ""}</div>
</div>
<div className="d-grid gap-2">

<button type="submit" className="btn btn-contacto">
Enviar Mensaje
</button>
</div>
</form>
</div>
</div>
<div className="col-12 col-md-4 col-lg-4">
<div className="card border-0 p-4 caja-contacto h-100 d-flex flex-column justify-content-center">
<h4 className="fw-bold mb-3 subtitulo-contacto">Información</h4>
<div className="mb-3">
<p className="fw-bold mb-1">Dirección:</p>
<p className="text-muted mb-0">Av. Siempre Viva 123, Santiago</p>
</div>
<div className="mb-3">
<p className="fw-bold mb-1">Horario de Atención:</p>
<p className="text-muted mb-0">Lunes a Viernes: 09:00 - 18:00 hrs</p>
</div>
<div className="mb-0">
<p className="fw-bold mb-1">Soporte:</p>
<p className="text-muted mb-0">contacto@pinkandpink.cl</p>
</div>
</div>
</div>
</div>
</main>
);
}