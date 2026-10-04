import { createContext, useContext, useState, type ReactNode } from "react";
import { CHIC_KEYS } from "../storage/claves";
import type { Rol, Sesion, Usuario } from "../types";

export type MotivoFallo = "credenciales" | "inactivo";

export interface AuthContextValue {
  sesion: Sesion | null;
  iniciales: string;
  nombreRol: string;
  esAdmin: boolean;
  esVendedor: boolean;
  esPersonal: boolean;
  login: (correo: string, password: string) => MotivoFallo | null;
  logout: () => void;
  destinoTrasLogin: () => string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function leerSesion(): Sesion | null {
  try {
    return JSON.parse(localStorage.getItem(CHIC_KEYS.sesion) ?? "null") as Sesion | null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(leerSesion);

  function login(correo: string, password: string): MotivoFallo | null {
    const usuarios = JSON.parse(localStorage.getItem(CHIC_KEYS.usuarios) ?? "[]") as Usuario[];
    const usuario = usuarios.find(
      (u) => u.correo.toLowerCase() === correo.trim().toLowerCase() && u.password === password,
    );
    if (!usuario) return "credenciales";
    if (usuario.estado !== "Activo") return "inactivo";

    const nueva: Sesion = {
      run: usuario.run,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      fechaNacimiento: usuario.fechaNacimiento,
      rolId: usuario.rolId,
      regionId: usuario.regionId,
      comunaId: usuario.comunaId,
      direccion: usuario.direccion,
      estado: usuario.estado,
    };
    localStorage.setItem(CHIC_KEYS.sesion, JSON.stringify(nueva));
    setSesion(nueva);
    return null;
  }

  function logout() {
    localStorage.removeItem(CHIC_KEYS.sesion);
    setSesion(null);
  }

  /* Se lee la sesión recién guardada en localStorage, no el estado de React:
     durante el mismo clic en que login() guarda la sesión, `sesion` todavía
     vale null en esta misma función. */
  function destinoTrasLogin(): string {
    const actual = leerSesion();
    if (!actual) return "/cuenta";
    return actual.rolId === 1 || actual.rolId === 2 ? "/admin" : "/cuenta";
  }

  const iniciales = (sesion?.nombre ?? "")
    .concat(" ", sesion?.apellidos ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

  const roles = JSON.parse(localStorage.getItem(CHIC_KEYS.roles) ?? "[]") as Rol[];
  const nombreRol = roles.find((r) => r.id === sesion?.rolId)?.nombre ?? "";

  const valor: AuthContextValue = {
    sesion,
    iniciales,
    nombreRol,
    esAdmin: sesion?.rolId === 1,
    esVendedor: sesion?.rolId === 2,
    esPersonal: sesion?.rolId === 1 || sesion?.rolId === 2,
    login,
    logout,
    destinoTrasLogin,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
