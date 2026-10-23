import { rutaImagen } from "./imagenes";

describe("rutaImagen", () => {
  it("antepone /img/ a las rutas relativas", () => {
    expect(rutaImagen("collar.png")).toBe("/img/collar.png");
  });

  it("deja intactas las rutas absolutas", () => {
    expect(rutaImagen("/img/collar.png")).toBe("/img/collar.png");
  });
});
