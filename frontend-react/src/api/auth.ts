import { apiGet, apiPost, apiPut, clearToken, setToken } from "./client";
import { CHIC_KEYS } from "../storage/claves";

export interface AuthUser {
  id?: number | string;
  run: string;
  nombre: string;
  apellidos?: string;
  email: string;
  fechaNacimiento?: string;
  roleId?: number;
  roleName?: string;
  regionId?: number | null;
  comunaId?: number | null;
  direccion?: string;
  activo?: boolean;
}

export interface AuthResponse {
  token: string;
  usuario: AuthUser;
  rol: string;
}

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest {
  run: string; email: string; password: string; nombre: string; apellidos?: string;
  fechaNacimiento?: string; regionId?: number | null; comunaId?: number | null; direccion?: string;
}
export interface UpdateProfileRequest {
  nombre?: string; apellidos?: string; fechaNacimiento?: string;
  regionId?: number | null; comunaId?: number | null; direccion?: string;
}
/** AdminRegisterRequest de ms-auth. El rol viaja como texto (ADMIN/SELLER/CUSTOMER). */
export interface AdminRegisterPayload {
  run: string;
  email: string;
  password: string;
  nombre: string;
  apellidos?: string;
  fechaNacimiento?: string;
  rol: string;
  regionId?: number | null;
  comunaId?: number | null;
  direccion?: string;
}

export function mapUsuario(u: AuthUser) {
  const rol = (u.roleName || "").toUpperCase();
  const rolId = u.roleId ?? (rol === "ADMIN" ? 1 : rol === "SELLER" ? 2 : 3);
  return {
    id: u.id,
    run: u.run,
    nombre: u.nombre,
    apellidos: u.apellidos ?? "",
    correo: u.email,
    fechaNacimiento: u.fechaNacimiento,
    rolId,
    rol: rol || (rolId === 1 ? "ADMIN" : rolId === 2 ? "SELLER" : "CUSTOMER"),
    regionId: u.regionId,
    comunaId: u.comunaId,
    direccion: u.direccion ?? "",
    estado: u.activo === false ? "Inactivo" : "Activo",
  } as const;
}

export async function login(req: LoginRequest) {
  const res = await apiPost<AuthResponse>("/api/v1/auth/login", req);
  setToken(res.token);
  const usuario = mapUsuario(res.usuario);
  localStorage.setItem(CHIC_KEYS.sesion, JSON.stringify(usuario));
  return { ...res, usuario };
}

export async function register(req: RegisterRequest) {
  const res = await apiPost<AuthResponse>("/api/v1/auth/register", req);
  setToken(res.token);
  const usuario = mapUsuario(res.usuario);
  localStorage.setItem(CHIC_KEYS.sesion, JSON.stringify(usuario));
  return { ...res, usuario };
}

/** Alta de usuarios hecha por un ADMIN; no reemplaza la sesión actual. */
export function adminRegister(req: AdminRegisterPayload) {
  return apiPost<AuthResponse>("/api/v1/auth/admin/register", req);
}

export async function me() {
  const u = await apiGet<AuthUser>("/api/v1/auth/me");
  const usuario = mapUsuario(u);
  localStorage.setItem(CHIC_KEYS.sesion, JSON.stringify(usuario));
  return usuario;
}

export async function updateProfile(req: UpdateProfileRequest) {
  const u = await apiPut<AuthUser>("/api/v1/auth/me", req);
  const usuario = mapUsuario(u);
  localStorage.setItem(CHIC_KEYS.sesion, JSON.stringify(usuario));
  return usuario;
}

export function logout() {
  clearToken();
}
