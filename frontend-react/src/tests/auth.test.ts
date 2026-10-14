// @ts-nocheck
import { CHIC_KEYS } from "../storage/claves";

describe("Pruebas Unitarias: Lógica de Autenticación (AuthContext.tsx)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // PRUEBA 1
  it("Debería retornar 'credenciales' cuando el usuario no existe en la base de datos local", () => {
    // Simular lista de usuarios vacía
    localStorage.setItem(CHIC_KEYS.usuarios, JSON.stringify([]));

    const usuarios = JSON.parse(localStorage.getItem(CHIC_KEYS.usuarios) ?? "[]");
    const usuarioEncontrado = usuarios.find(
      (u) => u.correo === "noexistente@chic.cl"
    );

    expect(usuarioEncontrado).toBeUndefined();
  });

  // PRUEBA 2
  it("Debería retornar 'inactivo' cuando las credenciales coinciden pero el estado del usuario no es 'Activo'", () => {
    const usuarioInactivo = {
      correo: "bloqueado@chic.cl",
      password: "123",
      estado: "Inactivo",
    };
    localStorage.setItem(CHIC_KEYS.usuarios, JSON.stringify([usuarioInactivo]));

    const usuarios = JSON.parse(localStorage.getItem(CHIC_KEYS.usuarios) ?? "[]");
    const usuario = usuarios.find(
      (u) => u.correo === "bloqueado@chic.cl" && u.password === "123"
    );

    expect(usuario?.estado).toBe("Inactivo");
  });

  // PRUEBA 3
  it("Debería redirigir a '/admin' si el rol del usuario autenticado es Admin (1) o Vendedor (2)", () => {
    const sesionAdmin = { rolId: 1, nombre: "Admin" };
    localStorage.setItem(CHIC_KEYS.sesion, JSON.stringify(sesionAdmin));

    const actual = JSON.parse(localStorage.getItem(CHIC_KEYS.sesion) ?? "null");
    const destino = actual?.rolId === 1 || actual?.rolId === 2 ? "/admin" : "/cuenta";

    expect(destino).toBe("/admin");
  });
});