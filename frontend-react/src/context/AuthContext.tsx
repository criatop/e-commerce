import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { CHIC_KEYS } from "../storage/claves";
import type { Sesion } from "../types";
import * as authApi from "../api/auth";
import { getToken } from "../api/client";

export type MotivoFallo = "credenciales" | "inactivo";

interface AuthContextValue {
  sesion: Sesion | null;
  iniciales: string;
  nombreRol: string;
  esAdmin: boolean;
  esVendedor: boolean;
  esPersonal: boolean;
  login: (correo: string, password: string) => Promise<MotivoFallo | null>;
  logout: () => void;
  actualizarSesion: (nuevosDatos: Partial<Sesion>) => Promise<void>;
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

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    void authApi
      .me()
      .then((u) => setSesion(u as Sesion))
      .catch(() => {
        authApi.logout();
        setSesion(null);
      });
  }, []);

  async function login(correo: string, password: string): Promise<MotivoFallo | null> {
    try {
      const res = await authApi.login({ email: correo.trim(), password });
      setSesion(res.usuario as Sesion);
      return null;
    } catch (e: unknown) {
      const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
      if (msg.includes("inactiv") || msg.includes("desactiv")) return "inactivo";
      return "credenciales";
    }
  }

  function logout() {
    authApi.logout();
    setSesion(null);
  }

  async function actualizarSesion(nuevosDatos: Partial<Sesion>) {
    const actualizada = await authApi.updateProfile({
      nombre: nuevosDatos.nombre,
      apellidos: nuevosDatos.apellidos,
      fechaNacimiento: nuevosDatos.fechaNacimiento,
      regionId: nuevosDatos.regionId as number | null | undefined,
      comunaId: nuevosDatos.comunaId as number | null | undefined,
      direccion: nuevosDatos.direccion,
    });
    setSesion(actualizada as Sesion);
  }

  function destinoTrasLogin(): string {
    const actual = leerSesion();
    if (!actual) return "/cuenta";
    const rol = (actual.rol ?? "").toUpperCase();
    return actual.rolId === 1 || actual.rolId === 2 || rol === "ADMIN" || rol === "SELLER"
      ? "/admin"
      : "/cuenta";
  }

  const iniciales = (sesion?.nombre ?? "")
    .concat(" ", sesion?.apellidos ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

  const rolUpper = (sesion?.rol ?? "").toUpperCase();
  const nombreRol =
    rolUpper === "ADMIN" ? "Administrador" : rolUpper === "SELLER" ? "Vendedor" : rolUpper === "CUSTOMER" ? "Cliente" : "";

  const esAdmin = sesion?.rolId === 1 || rolUpper === "ADMIN";
  const esVendedor = sesion?.rolId === 2 || rolUpper === "SELLER";

  const valor: AuthContextValue = {
    sesion,
    iniciales,
    nombreRol,
    esAdmin,
    esVendedor,
    esPersonal: esAdmin || esVendedor,
    login,
    logout,
    actualizarSesion,
    destinoTrasLogin,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
