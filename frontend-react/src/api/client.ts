import { CHIC_KEYS } from "../storage/claves";
import type { ApiResponse } from "../types";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:9000";

export function getToken(): string | null {
  return localStorage.getItem(CHIC_KEYS.token);
}

export function setToken(token: string) {
  localStorage.setItem(CHIC_KEYS.token, token);
}

export function clearToken() {
  localStorage.removeItem(CHIC_KEYS.token);
  localStorage.removeItem(CHIC_KEYS.sesion);
}

type CuerpoRespuesta = {
  text?: () => Promise<string>;
  json?: () => Promise<unknown>;
};

async function parseJson<T>(response: Response): Promise<T | null> {
  const cuerpo = response as unknown as CuerpoRespuesta;
  if (typeof cuerpo.text === "function") {
    const text = await cuerpo.text();
    if (!text) return null;
    try { return JSON.parse(text) as T; } catch { return null; }
  }
  if (typeof cuerpo.json === "function") {
    try { return (await cuerpo.json()) as T; } catch { return null; }
  }
  return null;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers ?? {});
  if (!headers.has("Content-Type") && init.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  const payload = await parseJson<ApiResponse<T> | { message?: string; mensaje?: string }>(response);

  if (!response.ok) {
    if (response.status === 401) clearToken();
    const message =
      (payload as ApiResponse<T> | undefined)?.mensaje ||
      (payload as { message?: string } | undefined)?.message ||
      `Error HTTP ${response.status}`;
    throw new ApiError(response.status, message);
  }

  if (payload && typeof payload === "object" && "exitoso" in payload) {
    const api = payload as ApiResponse<T>;
    if (!api.exitoso) {
      throw new ApiError(response.status, api.mensaje || "Error de negocio");
    }
    return api.datos;
  }
  return payload as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: "PUT", body: body === undefined ? undefined : JSON.stringify(body) });
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}
