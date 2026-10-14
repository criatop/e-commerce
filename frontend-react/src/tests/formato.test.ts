import { formatearPrecio } from "../utils/formato";

describe("Pruebas Unitarias: Formateador de Precios (formato.ts)", () => {
  // PRUEBA 1
  it("Debería formatear correctamente un valor entero a formato de moneda chilena ($)", () => {
    const resultado = formatearPrecio(15000);

    // En formato es-CL, 15000 debe dar '$15.000'
    expect(resultado).toContain("$");
    expect(resultado).toContain("15");
  });

  // PRUEBA 2
  it("Debería retornar '$0' cuando el valor ingresado es 0", () => {
    const resultado = formatearPrecio(0);

    expect(resultado).toBe("$0");
  });
});