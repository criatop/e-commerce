import { describe, it, expect } from "vitest";
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
    expect(validarRun("11.111.111-1")).toBe(true);
    expect(validarRun("12345678-5")).toBe(true);
  });

  it("acepta un run de 7 dígitos con dígito K", () => {
    expect(validarRun("1000005-K")).toBe(true);
  });

  it("rechaza un dígito verificador incorrecto", () => {
    expect(validarRun("12345678-9")).toBe(false);
  });

  it("rechaza un formato inválido", () => {
    expect(validarRun("abc")).toBe(false);
    expect(validarRun("123")).toBe(false);
  });
});