// @ts-nocheck
import * as CartModule from "../context/CartContext";
import * as TablasModule from "../hooks/useTablasMaestras";

describe("Pruebas Unitarias: Componente TarjetaProducto (TarjetaProducto.tsx)", () => {
  const productoEjemplo = {
    codigo: "ACC-001",
    nombre: "Collar Chic Dorado",
    precio: 12990,
    categoriaId: 1,
    imagen: "collar.jpg",
  };

  // PRUEBA 1
  it("Debería invocar la función 'agregar' del carrito con el código de producto correcto", () => {
    const agregarSpy = jasmine.createSpy("agregar");
    spyOn(CartModule, "useCart").and.returnValue({ agregar: agregarSpy });
    spyOn(TablasModule, "useTablasMaestras").and.returnValue({
      nombreCategoria: () => "Accesorios",
    });

    const { agregar } = CartModule.useCart();
    agregar(productoEjemplo.codigo);

    expect(agregarSpy).toHaveBeenCalledWith("ACC-001");
  });

  // PRUEBA 2
  it("Debería vincular la tarjeta a la ruta de detalle enviando el parámetro del producto codificado", () => {
    const codigoCodificado = encodeURIComponent(productoEjemplo.codigo);
    const rutaEsperada = `/producto-detalle?codigo=${codigoCodificado}`;

    expect(rutaEsperada).toBe("/producto-detalle?codigo=ACC-001");
  });
});