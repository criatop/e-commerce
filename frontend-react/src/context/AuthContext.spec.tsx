import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import { CHIC_KEYS } from "../storage/claves";

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

function usuario(overrides: Record<string, unknown> = {}) {
  return {
    run: "11111111-1",
    nombre: "Ana",
    apellidos: "Pérez",
    correo: "ana@test.cl",
    password: "secreta",
    fechaNacimiento: "1990-01-01",
    rolId: 3,
    regionId: 1,
    comunaId: 1,
    direccion: "Calle 1",
    estado: "Activo",
    ...overrides,
  };
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(CHIC_KEYS.usuarios, JSON.stringify([usuario()]));
    localStorage.setItem(
      CHIC_KEYS.roles,
      JSON.stringify([
        { id: 1, nombre: "Admin" },
        { id: 2, nombre: "Vendedor" },
        { id: 3, nombre: "Cliente" },
      ]),
    );
  });

  it("login correcto crea la sesión sin password", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    let motivo: string | null = null;
    act(() => {
      motivo = result.current.login("ana@test.cl", "secreta");
    });
    expect(motivo).toBeNull();
    expect(result.current.sesion?.correo).toBe("ana@test.cl");
    expect((result.current.sesion as Record<string, unknown>).password).toBeUndefined();
    expect(localStorage.getItem(CHIC_KEYS.sesion)).toContain("ana@test.cl");
  });

  it("login ignora mayúsculas y espacios del correo", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      result.current.login("  ANA@TEST.CL ", "secreta");
    });
    expect(result.current.sesion).not.toBeNull();
  });

  it("login con password incorrecta devuelve credenciales", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    let motivo: string | null = null;
    act(() => {
      motivo = result.current.login("ana@test.cl", "mala");
    });
    expect(motivo).toBe("credenciales");
    expect(result.current.sesion).toBeNull();
  });

  it("login de usuario inactivo devuelve inactivo", () => {
    localStorage.setItem(
      CHIC_KEYS.usuarios,
      JSON.stringify([usuario({ estado: "Inactivo" })]),
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    let motivo: string | null = null;
    act(() => {
      motivo = result.current.login("ana@test.cl", "secreta");
    });
    expect(motivo).toBe("inactivo");
  });

  it("logout limpia la sesión", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      result.current.login("ana@test.cl", "secreta");
    });
    act(() => {
      result.current.logout();
    });
    expect(result.current.sesion).toBeNull();
    expect(localStorage.getItem(CHIC_KEYS.sesion)).toBeNull();
  });

  it("calcula iniciales, rol y banderas para admin", () => {
    localStorage.setItem(
      CHIC_KEYS.usuarios,
      JSON.stringify([usuario({ rolId: 1, nombre: "ana", apellidos: "pérez" })]),
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      result.current.login("ana@test.cl", "secreta");
    });
    expect(result.current.iniciales).toBe("AP");
    expect(result.current.nombreRol).toBe("Admin");
    expect(result.current.esAdmin).toBeTrue();
    expect(result.current.esPersonal).toBeTrue();
    expect(result.current.esVendedor).toBeFalse();
  });

  it("destinoTrasLogin manda a /admin el personal y a /cuenta el cliente", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.destinoTrasLogin()).toBe("/cuenta");
    act(() => {
      result.current.login("ana@test.cl", "secreta");
    });
    expect(result.current.destinoTrasLogin()).toBe("/cuenta");
    act(() => {
      result.current.logout();
    });
    localStorage.setItem(
      CHIC_KEYS.usuarios,
      JSON.stringify([usuario({ rolId: 2 })]),
    );
    act(() => {
      result.current.login("ana@test.cl", "secreta");
    });
    expect(result.current.destinoTrasLogin()).toBe("/admin");
  });

  it("useAuth lanza si se usa fuera del provider", () => {
    expect(() => renderHook(() => useAuth())).toThrowError();
  });
});
