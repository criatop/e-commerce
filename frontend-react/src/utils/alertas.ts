import Swal from "sweetalert2";

const estilo = { confirmButtonColor: "#f0568f" };

export const alertas = {
  exito: (titulo: string, texto?: string) =>
    Swal.fire({ icon: "success", title: titulo, text: texto, ...estilo }),

  exitoHtml: (titulo: string, html: string) =>
    Swal.fire({ icon: "success", title: titulo, html, ...estilo }),

  error: (titulo: string, texto?: string) =>
    Swal.fire({ icon: "error", title: titulo, text: texto, ...estilo }),

  aviso: (titulo: string, texto?: string) =>
    Swal.fire({ icon: "warning", title: titulo, text: texto, ...estilo }),

  accesoRestringido: () =>
    Swal.fire({
      title: "Acceso restringido",
      text: "Debes iniciar sesión con una cuenta autorizada para ver esta página.",
      icon: "warning",
      confirmButtonText: "Ir a iniciar sesión",
    }),

  confirmar: async (titulo: string, texto: string, boton = "Sí, continuar") => {
    const r = await Swal.fire({
      title: titulo,
      text: texto,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f0568f",
      confirmButtonText: boton,
      cancelButtonText: "Cancelar",
    });
    return r.isConfirmed;
  },
};
