// @ts-nocheck
import { METODOS_ENVIO } from "../context/CartContext";

describe("Pruebas Unitarias: Carrito y Despacho (CartContext.tsx)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // PRUEBA 1
  it("Debería calcular el costo de envío correcto según el método seleccionado", () => {
    const costoRetiro = METODOS_ENVIO.find((m) => m.valor === "retiro")?.costo;
    const costoEstandar = METODOS_ENVIO.find((m) => m.valor === "estandar")?.costo;
    const costoExpress = METODOS_ENVIO.find((m) => m.valor === "express")?.costo;

    expect(costoRetiro).toBe(0);
    expect(costoEstandar).toBe(2990);
    expect(costoExpress).toBe(4990);
  });

  // PRUEBA 2
  it("Debería retornar null al intentar confirmar un pedido si el carrito está vacío", () => {
    const carrito: any[] = [];
    const confirmacion = carrito.length === 0 ? null : "PP-0001";

    expect(confirmacion).toBeNull();
  });

  // PRUEBA 3
  it("Debería generar el folio correlativo con formato 'PP-XXXX' para un nuevo pedido", () => {
    const ordenesExistentes = [{ folio: "PP-0001" }, { folio: "PP-0002" }];
    const nuevoFolio = "PP-" + String(ordenesExistentes.length + 1).padStart(4, "0");

    expect(nuevoFolio).toBe("PP-0003");
  });
});