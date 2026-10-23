import { formatearPrecio } from "./formato";

describe("formatearPrecio", () => {
  it("formatea miles con punto y prefijo $", () => {
    expect(formatearPrecio(19990)).toBe("$19.990");
  });

  it("formatea cero", () => {
    expect(formatearPrecio(0)).toBe("$0");
  });

  it("formatea valores de cuatro dígitos", () => {
    expect(formatearPrecio(1234)).toBe("$1.234");
  });
});
