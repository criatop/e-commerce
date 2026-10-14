import { rutaImagen } from "../utils/imagenes";

describe("Pruebas Unitarias: Gestor de Rutas de Imágenes (imagenes.ts)", () => {
  // PRUEBA 1
  it("Debería agregar el prefijo '/img/' si el nombre de la imagen no comienza con '/'", () => {
    const resultado = rutaImagen("producto1.jpg");

    expect(resultado).toBe("/img/producto1.jpg");
  });

  // PRUEBA 2
  it("Debería mantener la ruta intacta si el string ya comienza con '/'", () => {
    const resultado = rutaImagen("/uploads/banner.png");

    expect(resultado).toBe("/uploads/banner.png");
  });
});