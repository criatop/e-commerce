import { CHIC_KEYS, CHIC_VERSION } from "../storage/claves";

describe("Pruebas Unitarias: Constantes de Almacenamiento (claves.ts)", () => {
  // PRUEBA 1
  it("Debería definir la versión de la base de datos local como '3'", () => {
    expect(CHIC_VERSION).toBe("3");
  });

  // PRUEBA 2
  it("Debería contener las claves con el prefijo corporativo 'chic_'", () => {
    expect(CHIC_KEYS.usuarios).toBe("chic_usuarios");
    expect(CHIC_KEYS.productos).toBe("chic_productos");
    expect(CHIC_KEYS.carrito).toBe("chic_carrito");
    expect(CHIC_KEYS.sesion).toBe("chic_sesion");
  });
});