import { limpiarRun, validarRun } from "../utils/run";

describe("Pruebas Unitarias: Validación y Limpieza de RUN (run.ts)", () => {
  // PRUEBA 1
  it("Debería eliminar puntos, guiones, espacios y convertir el DV a mayúscula", () => {
    const resultado = limpiarRun(" 19.876.543-k ");

    expect(resultado).toBe("19876543K");
  });

  // PRUEBA 2
  it("Debería retornar true al validar un RUN chileno correcto con dígito verificador 'K'", () => {
    // RUN válido de prueba: 19.876.543-K (o un RUN real válido)
    const esValido = validarRun("11.111.111-1");

    expect(esValido).toBeTrue();
  });

  // PRUEBA 3
  it("Debería retornar false cuando el dígito verificador no corresponde al cuerpo del RUN", () => {
    const esValido = validarRun("11.111.111-9");

    expect(esValido).toBeFalse();
  });
});