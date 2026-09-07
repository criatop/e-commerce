function validarCampoContacto(campo, condicion, mensaje) {
  const valido = condicion(campo.value.trim());
  campo.classList.toggle("is-invalid", !valido);
  const feedback = document.getElementById("error" + campo.id.replace("Contacto", ""));
  if (feedback) {
    feedback.textContent = valido ? "" : mensaje;
  }
  return valido;
}

const formContacto = document.getElementById("formContacto");
if (formContacto) {
  const camposContacto = formContacto.querySelectorAll("input, textarea");
  camposContacto.forEach(function (campo) {
    campo.addEventListener("input", function () {
      if (campo.classList.contains("is-invalid")) {
        campo.classList.remove("is-invalid");
      }
    });
  });

  formContacto.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombreContacto");
    const apellido = document.getElementById("apellidoContacto");
    const email = document.getElementById("emailContacto");
    const mensaje = document.getElementById("mensajeContacto");

    const okNombre = validarCampoContacto(nombre, function (v) { return v !== ""; }, "Ingresa tu nombre.");
    const okApellido = validarCampoContacto(apellido, function (v) { return v !== ""; }, "Ingresa tu apellido.");
    const okEmail = validarCampoContacto(email, function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, "Ingresa un correo válido.");
    const okMensaje = validarCampoContacto(mensaje, function (v) { return v.length >= 10; }, "Escribe un mensaje de al menos 10 caracteres.");

    if (!okNombre || !okApellido || !okEmail || !okMensaje) {
      return;
    }

    const contactos = obtenerColeccion(CHIC_KEYS.contactos);
    contactos.push({
      id: Date.now(),
      nombre: nombre.value.trim(),
      apellido: apellido.value.trim(),
      correo: email.value.trim(),
      mensaje: mensaje.value.trim(),
      fecha: new Date().toISOString()
    });
    guardarColeccion(CHIC_KEYS.contactos, contactos);

    Swal.fire({
      icon: "success",
      title: "Mensaje enviado",
      text: "¡Gracias por escribirnos! Te responderemos pronto.",
      confirmButtonColor: "#f0568f"
    }).then(function () {
      formContacto.reset();
      document.querySelectorAll(".is-invalid").forEach(function (el) {
        el.classList.remove("is-invalid");
      });
    });
  });
}