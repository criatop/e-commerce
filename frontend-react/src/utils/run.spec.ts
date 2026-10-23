import { limpiarRun, validarRun } from "./run";

describe("limpiarRun", () => {
  it("quita puntos, guiones y espacios", () => {
    expect(limpiarRun("12.345.678-5")).toBe("123456785");
  });

  it("pasa la K a mayúscula", () => {
    expect(limpiarRun("12 345 678 k")).toBe("12345678K");
  });
});

describe("validarRun", () => {
  it("acepta un run de 8 dígitos válido", () => {
    expect(validarRun("11.111.111-1")).toBeTrue();
    expect(validarRun("12345678-5")).toBeTrue();
  });

  it("acepta un run de 7 dígitos con dígito K", () => {
    expect(validarRun("1000005-K")).toBeTrue();
  });

  it("rechaza un dígito verificador incorrecto", () => {
    expect(validarRun("12345678-9")).toBeFalse();
  });

  it("rechaza un formato inválido", () => {
    expect(validarRun("abc")).toBeFalse();
    expect(validarRun("123")).toBeFalse();
  });
});
